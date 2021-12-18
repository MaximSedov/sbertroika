import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

/* PrimeVue */
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Sidebar from 'primevue/sidebar';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import ToggleButton from 'primevue/togglebutton';
import Slider from 'primevue/slider';
import AutoComplete from 'primevue/autocomplete';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import SelectButton from 'primevue/selectbutton';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import Rating from 'primevue/rating';
import Card from 'primevue/card';
import InputNumber from 'primevue/inputnumber';

/* Leaflet */
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'

import 'leaflet/dist/leaflet.css'
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import 'primeflex/primeflex.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

Vue.config.productionTip = false

Vue.use(PrimeVue)
Vue.use(ToastService)
Vue.use(ConfirmationService);
Vue.component('Button', Button)
Vue.component('Sidebar', Sidebar)
Vue.component('ProgressSpinner', ProgressSpinner)
Vue.component('Dialog', Dialog)
Vue.component('Slider', Slider)
Vue.component('ToggleButton', ToggleButton)
Vue.component('AutoComplete', AutoComplete)
Vue.component('TabView', TabView)
Vue.component('TabPanel', TabPanel)
Vue.component('SelectButton', SelectButton)
Vue.component('Toast', Toast)
Vue.component('ConfirmDialog', ConfirmDialog)
Vue.component('Rating', Rating)
Vue.component('Card', Card)
Vue.component('InputNumber', InputNumber)

Vue.component('LMap', LMap)
Vue.component('LTileLayer', LTileLayer)
Vue.component('LMarker', LMarker)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
