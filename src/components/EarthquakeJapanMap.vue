<template>
  <div>
    <div id='chartdiv'></div>
    <p>気象庁「2018年05月20日の震源リスト」 （https://www.data.jma.go.jp/svd/eqev/data/daily_map/20180520.html）を加工して作成</p>
  </div>
</template>

<script>
import am4geodataJapanLow from '@amcharts/amcharts4-geodata/japanLow'
import mixin from '@/components/mixin/earthquake'
import jsonData from '../../data/coordinate20180520.json'

export default {
  mixins: [mixin],
  mounted () {
    let map = this.setMap('chartdiv', am4geodataJapanLow)
    let imageSeries = this.setMarker(map, jsonData)
    this.setScrollbar(map, imageSeries, jsonData)
  }
}
</script>
