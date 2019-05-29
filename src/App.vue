<template>
  <div id="app" class="columns">
    <Menu class="column is-one-quarter"></Menu>
    <router-view class="column"></router-view>
  </div>
</template>

<script>
import Menu from '@/components/Menu'

export default {
  name: 'App',
  components: { Menu }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#chartdiv {
  width: 100%;
  height: 600px;
}
</style>
