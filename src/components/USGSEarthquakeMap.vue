<template>
  <div>
    <div id='chartdiv'></div>
    <div>Credit: U.S. Geological Survey</div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as am4core from '@amcharts/amcharts4/core'
import am4geodata from '@amcharts/amcharts4-geodata/worldLow'
import axios from 'axios'
import mixin from '@/components/mixin/earthquake'

export default {
  mixins: [mixin],
  mounted () {
    axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2019-04-29%2000:00:00&endtime=2019-05-29%2023:59:59&minmagnitude=5&orderby=time-asc')
      .then(res => {
        console.log(res.data.features)
        const data = this.addPercent(res.data.features)
        console.log(data)
        let map = this.setMap('chartdiv', am4geodata)
        let imageSeries = this.setMarker(map, data)
        this.setScrollbar(map, imageSeries, data, 'x')
      })
  },
  methods: {
    dataFormat: function (d) {
      return {
        'title': d.properties.place,
        'latitude': d.geometry.coordinates[1],
        'longitude': d.geometry.coordinates[0],
        'radius': this.circleSize(d.properties.mag),
        'stroke': am4core.color(
          this.depthColor(d.geometry.coordinates[2])
        ),
        'time': d.properties.time,
        'percent': null
      }
    },
    addPercent: function (json) {
      const data = Vue.util.extend([], json)
      const minTime = data[0].properties.time
      const maxTime = data[data.length - 1].properties.time
      const denominator = maxTime - minTime

      data.forEach((d, i) => {
        const time = d.properties.time - minTime
        this.$set(
          d,
          'percent',
          time / denominator
        )
      })
      return data
    }
  }
}
</script>
