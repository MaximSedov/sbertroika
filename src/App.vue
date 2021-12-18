<template>
  <div id="app">
    <div v-if="loading" class="progress">
      <ProgressSpinner />
    </div>
    <router-view />
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: true
    }
  },
  mounted() {
    this.loading = false
  }
}
</script>
<style lang="scss">
* {
  padding: 0;
  margin: 0;
  font-family: MoscowSans, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body::-webkit-scrollbar {
  width: 0;
}
@font-face {
  font-family: 'MoscowSans';
  src: url('../src/assets/fonts/MoscowSans-Regular.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}
@font-face {
  font-family: 'MoscowSans';
  src: url('../src/assets/fonts/MoscowSans-Bold.otf') format('truetype');
  font-style: normal;
  font-weight: 700;
}
@font-face {
  font-family: 'MoscowSans';
  src: url('../src/assets/fonts/MoscowSans-Extrabold.otf') format('truetype');
  font-style: normal;
  font-weight: 800;
}
@font-face {
  font-family: 'MoscowSans';
  src: url('../src/assets/fonts/MoscowSans-Light.otf') format('truetype');
  font-style: normal;
  font-weight: 300;
}
@font-face {
  font-family: 'MoscowSans';
  src: url('../src/assets/fonts/MoscowSans-Medium.otf') format('truetype');
  font-style: normal;
  font-weight: 500;
}
#app {
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

.progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 10000;
  background-color: rgba(0, 123, 255, 0.178);
  width: 100vw;
  height: 100vh;
  .p-progress-spinner {
    top: 50%;
    transform: translateY(-50%);
  }
}
button {
  box-shadow: none !important;
}
</style>
