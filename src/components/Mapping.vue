<template>
  <div style="height: 100%; width: 100%">
    <Toast position="top-center" />
    <!-- Карта -->
    <l-map v-if="showMap" :zoom="zoom" :center="center" :options="mapOptions" style="height: 100%" @click="addMarker" @update:center="centerUpdate" @update:zoom="zoomUpdate">
      <l-tile-layer :url="url" :attribution="attribution" />

      <!-- Маркеры -->
      <l-marker v-for="(marker, idx) in markers" :key="marker[idx]" :lat-lng="marker" :icon="icon" />

      <!-- Маршрут  -->
      <div v-for="(line, idx) in polyline" :key="line[idx]" class>
        <!-- Скрыть маршруты по клику -->
        <div v-if="actualPolyline == idx">
          <div v-for="(point, idx) in line.points" :key="point[idx]" class>
            <!-- Иконки -->
            <!-- <l-marker :lat-lng="point"  icon-url="bike.svg"></l-marker> -->
            <l-marker :lat-lng="point">
              <l-icon :icon-size="[40, 40]" :icon-url="require('../../public/' + point.type + '.svg')"></l-icon>
            </l-marker>
          </div>
          <l-polyline v-for="(waypoints, idx) in line.waypoints" :key="waypoints[idx]" :lat-lngs="waypoints.waypoint" :color="waypoints.color" :weight="6"></l-polyline>
        </div>
      </div>

      <!-- Управление на карте -->
      <l-control position="bottomleft" class="control">
        <div class="p-grid p-nogutter p-ai-center p-mt-2 p-jc-start">
          <div class="p-col-2">
            <Button @click="zoom = currentZoom + mapOptions.zoomSnap" icon="pi pi-plus" class="map-control" :disabled="currentZoom === mapOptions.maxZoom" />
          </div>
        </div>
        <div class="p-grid p-nogutter p-ai-center p-mt-2 p-mb-4 p-jc-start">
          <div class="p-col-2">
            <Button @click="zoom = currentZoom - mapOptions.zoomSnap" icon="pi pi-minus" class="map-control" :disabled="currentZoom === mapOptions.minZoom" />
          </div>
        </div>
        <div class="p-grid p-nogutter p-ai-center p-mt-2 p-jc-start">
          <div class="p-col-2">
            <Button @click="finishRoute()" icon="pi pi-trash" class="map-control" :disabled="markers.length == 0" />
          </div>
        </div>
        <div class="p-grid p-nogutter p-ai-center p-mt-2 p-mt-2 p-jc-start"></div>
        <div class="p-grid p-nogutter p-ai-center p-mt-6">
          <div class="p-col-12">
            <Button @click="openControl()" label="Речной маршрут" icon="pi pi-map" class="map-control" style="font-size:1.2rem; font-weight:bold;" />
          </div>
        </div>
      </l-control>
    </l-map>

    <!-- Окно выбора маршрута -->
    <Dialog :visible.sync="display" position="topleft" @click.stop>
      <template #header>
        <h3>Маршрут</h3>
      </template>
      <div class="routeControl" style="display: flex; justify-content: space-between;">
        <Button disabled ref="focusButton" @click="active = 0" icon="pi pi-map" class="p-button-text" label="Из А в Б" />
      </div>
      <TabView :activeIndex="active">
        <TabPanel header="Из А в Б">
          <div class="p-grid p-nogutter p-ai-center p-mt-2">
            <div class="p-col-12">
              <AutoComplete :disabled="true" @click.stop v-model="countryFrom" :field="(item) => item.name + ' ' + item.code" />
            </div>
          </div>
          <div class="p-grid p-nogutter p-ai-center p-mt-2">
            <div class="p-col-12">
              <AutoComplete :disabled="true" v-model="countryTo" :field="(item) => item.name + ' ' + item.code" />
            </div>
          </div>
        </TabPanel>
      </TabView>

      <SelectButton style="display: flex;justify-content: space-between;" v-model="selectedType" :options="types" optionLabel="name" />

      <template #footer>
        <Button v-if="markers.length >= 2" @click="finishRoute" label="Завершить" icon="pi pi-times" class="p-button-text" :disabled="loadRoute" style="color: white;" />
        <Button v-if="loadRoute" label="Строим" icon="pi pi-spin pi-spinner" disabled />
        <Button
          v-if="!loadRoute && active == 0"
          @click="findRoutes"
          label="Поиск"
          icon="pi pi-map"
          :disabled="polyline.length > 0 || (countryFrom == null || countryTo == null) || selectedType == null"
        />
      </template>
    </Dialog>

    <!-- Подробнее о маршрутах -->
    <Dialog :visible.sync="displayRoutes" position="topleft" @hide="display = true">
      <template #header>
        <h3>Варианты маршрутов</h3>
      </template>
      <div style="font-weight:800;" v-if="polyline.length == 0">
        Мы не нашли маршрут по данным точкам. <br> Попробуйте другую местность.
      </div>
      <div
        class="routeCard"
        @click="showRoute(index)"
        v-for="(line, index) in polyline"
        :key="line[index]"
        :style="actualPolyline == index ? {'background-color' : '#1164C0'} : {'background-color':'#1164C0','opacity':'0.5'}"
      >
        <div class="header">
          Маршрут {{index+ 1}}
        </div>
        <div class="content">
          Дистанция - {{line.dist}} (м)
          <br />
          Время - {{findRoutesObj[index].time}}
        </div>
      </div>

      <template #footer>
        <Button v-if="markers.length >= 2" @click="finishRoute" label="Завершить" icon="pi pi-times" class="p-button-text" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { latLng, Polyline } from 'leaflet'
const axios = require('axios')
const host = '62.113.98.138:5000'
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LPolygon,
  LCircle,
  LIcon,
  LControl,
  LPolyline
} from 'vue2-leaflet'
import LRoutingMachine from './LRoutingMachine.vue'
import { Icon } from 'leaflet'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'Example',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LPolygon,
    LCircle,
    LIcon,
    LRoutingMachine,
    LControl,
    LPolyline
  },
  data() {
    return {
      display: false,
      displayRoutes: false,
      checked: true,
      active: 0,
      countryTo: null,
      countryFrom: null,
      distance: null,
      time: null,
      loadRoute: false,
      findRoutesObj: [],
      types: [
        { name: 'Пешком', value: 'foot' },
        { name: 'Самокат или велосипед', value: 'bike' }
      ],
      selectedType: null,
      zoom: 13,
      center: latLng(55.7504461, 37.6174943),
      polyline: [],
      actualPolyline: 0,
      circle: [],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 13,
      currentCenter: latLng(55.7504461, 37.6174943),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
        minZoom: 4,
        maxZoom: 18
      },
      showMap: true,
      icon: L.icon({
        iconUrl: 'path.svg',
        iconSize: [32, 80]
      }),
      bike: L.icon({
        iconUrl: 'bike.svg',
        iconSize: [52, 100]
      }),
      intres: L.icon({
        iconUrl: 'anchor.svg',
        iconSize: [52, 100]
      }),
      markers: []
    }
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom
      this.zoom = this.currentZoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
    addMarker(event) {
      if (this.displayRoutes == false) {
        this.display = true
      }

      if (this.markers.length < 2) {
        this.markers.push(event.latlng)
        if (this.countryFrom == null) {
          this.countryFrom =
            event.latlng.lng.toFixed(6) + ',' + event.latlng.lat.toFixed(6)
        } else if (this.countryTo == null) {
          this.countryTo =
            event.latlng.lng.toFixed(6) + ',' + event.latlng.lat.toFixed(6)
        }
      }
    },
    openControl() {
      this.display = !this.display
    },
    finishRoute() {
      this.countryTo = null
      this.countryFrom = null
      this.countryWalk = null
      this.walkTime = 0
      this.polyline = []
      this.actualPolyline = 0
      this.displayRoutes = false
      this.walkRoute = []
      this.markers = []
      this.findRoutesObj = []
    },
    findRoutes() {
      this.loadRoute = true
      axios
        .get(
          'http://' +
            host +
            '/route?from=' +
            this.countryFrom +
            '&to=' +
            this.countryTo +
            '&vehicle=' +
            this.selectedType.value
        )
        .then(response => {
          this.polyline = response.data
          console.log(this.polyline)
          for (let index = 0; index < response.data.length; index++) {
            let vehicle = ''
            if (this.selectedType.value == 'foot') {
              vehicle = 'Пешком'
            }
            if (this.selectedType.value == 'bike') {
              vehicle = 'Самокат или велосипед'
            }
            let timestamp = Math.floor(response.data[index].time / 1000)
            let hours = Math.floor(timestamp / 60 / 60)
            let minutes = Math.floor(timestamp / 60) - hours * 60
            let seconds = timestamp % 60
            let formatted = [
              hours.toString().padStart(2, '0'),
              minutes.toString().padStart(2, '0'),
              seconds.toString().padStart(2, '0')
            ].join(':')
            let obj = {
              time: formatted,
              vehicle: vehicle
            }
            this.findRoutesObj.push(obj)
          }

          this.displayRoutes = true
          this.display = false
          this.loadRoute = false
        })
        .catch(error => {
          this.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Что-то пошло не так',
            life: 3000
          })
          this.loadRoute = false
        })
    },
    showRoute(routeIndex) {
      this.actualPolyline = routeIndex
    }
  },
  mounted() {}
}
</script>

<style lang="scss">
@import '../colors.scss';
.leaflet {
  &-top {
    margin-top: 8rem !important;
  }
  &-control-zoom {
    display: none;
  }
  &-routing-container {
    display: none;
  }
  &-bottom {
    z-index: 999 !important;
  }
}
.routes {
  z-index: 1004 !important;
}
.map-control {
  width: 100%;
}

.p {
  &-button {
    background: $blue !important;
    border: none !important;
    border-radius: 1rem !important;
    padding: 8px 16px !important;
    color: $white !important;
    &:hover,
    &:active {
      background: #174aad !important;
    }
  }
  &-dialog {
    margin-top: 8rem !important;
    border: none !important;
    z-index: 999999 !important;
    &-footer {
      display: flex;
      justify-content: space-between;
    }
    &-footer button {
      margin: 0 !important;
    }
  }
  &-togglebutton {
    &.p-button {
      &.p-highlight {
        background: #1164c0 !important;
        border: 1px solid #1164c0 !important;
        box-shadow: none !important;
      }
      &:not(.p-disabled):not(.p-highlight):hover {
        background: #0062cc !important;
        border: 1px solid #0062cc !important;
        box-shadow: none !important;
      }
    }
  }
  &-tabview {
    &-nav {
      display: none !important;
    }
    &-panels {
      padding: 0 !important;
    }
  }
  &-autocomplete {
    width: 100% !important;
    flex-direction: column !important;
  }
  &-selectbutton {
    padding-top: 1rem;
    div:nth-child(1) {
      margin-right: 1rem;
    }
    .p-button {
      background: #ffffff !important;
      border: 1px solid #ced4da !important;
      color: #1164c0 !important;
      box-shadow: none !important;
      font-weight: 500 !important;
      &:hover {
        background: #1164c0 !important;
        border: 1px solid #1164c0 !important;
        color: #ffffff !important;
        box-shadow: none !important;
      }
      &.p-highlight {
        background: #1164c0 !important;
        border: 1px solid #1164c0 !important;
        color: #ffffff !important;
        box-shadow: none !important;
      }
    }
  }
  &-card {
    margin-bottom: 0.5rem !important;
    color: $white !important;
    box-shadow: none !important;
    &-title {
      font-size: 1.2rem !important;
      text-align: left !important;
    }
    &-body {
      padding: 0.5rem !important;
    }
    &-content {
      padding: 0 !important;
    }
  }
}

.routeControl {
  .p-button.p-button-text {
    color: $white !important;
    &:enabled:focus {
      color: $white !important;
      border-color: transparent;
    }
  }
}

.routeCard {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  color: $white;
  .header {
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
  .content {
    font-weight: 400;
  }
  &:hover {
    cursor: pointer;
    background: #174aad !important;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 767px) {
  .p-dialog {
    margin-top: 0 !important;
    width: 100%;
    border: none !important;
    margin: 0 !important;
  }
  .control {
    margin-bottom: 6rem !important;
  }
}
</style>