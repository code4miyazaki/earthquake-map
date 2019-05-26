<template>
  <div class="app">
    <EarthquakeJapanMap></EarthquakeJapanMap>
    <p>気象庁「2019年05月17日の震源リスト」 （https://www.data.jma.go.jp/svd/eqev/data/daily_map/20190517.html）を加工して作成</p>
  </div>
</template>

<script>
import EarthquakeJapanMap from './components/EarthquakeJapanMap'

export default {
  components: {
    EarthquakeJapanMap,
  },
}
</script>

<style scoped>
#chartdiv {
  width: 100%;
  height: 600px;
}
</style>
