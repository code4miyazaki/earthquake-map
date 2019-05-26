<template>
  <div id="chartdiv"></div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4maps from "@amcharts/amcharts4/maps"
import am4geodata_japanLow from "@amcharts/amcharts4-geodata/japanLow"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

import json_data from "../../data/coordinate20180520.json"

am4core.useTheme(am4themes_animated)

// times of events
let startTime  = new Date(2018, 0, 1, 0, 0).getTime()
let cancelTime = new Date(2018, 0, 1, 23, 59, 59).getTime()

export default {
  mounted() {
    let map = am4core.create("chartdiv", am4maps.MapChart)
    map.geodata = am4geodata_japanLow
    map.projection = new am4maps.projections.Miller()
    var polygonSeries = map.series.push(new am4maps.MapPolygonSeries())
    polygonSeries.useGeodata = true
    polygonSeries.mapPolygons.template.events.on("hit", function(ev) {
      map.zoomToMapObject(ev.target)
    })

    // マーカー用のインスタンス作成
    // https://www.amcharts.com/docs/v4/chart-types/map/#Image_series
    let imageSeries = map.series.push(new am4maps.MapImageSeries())
    imageSeries.sequencedInterpolation = true

    let imageSeriesTemplate = imageSeries.mapImages.template
    let circle = imageSeriesTemplate.createChild(am4core.Circle)
    circle.fill = am4core.color("rgba(0, 0, 0, 0)")
    circle.strokeWidth = 1
    circle.nonScaling = true
    circle.tooltipText = "{title}"
    circle.propertyFields.radius = "radius"
    circle.propertyFields.stroke = "stroke"

    imageSeriesTemplate.propertyFields.latitude = "latitude"
    imageSeriesTemplate.propertyFields.longitude = "longitude"

    imageSeries.data = this.omitJsonData(json_data)
    console.log(this.omitJsonData(json_data))

    let chart = map.chartContainer.createChild(am4charts.XYChart)
    chart.data = this.omitJsonData(json_data)
    chart.dateFormatter.inputDateFormat = "HH:mm:ss"

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.baseInterval = {
      timeUnit: "second",
      count: 1
    }
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis())

    // Create series
    let series = chart.series.push(new am4charts.LineSeries())
    series.dataFields.valueY = "radius"
    series.dataFields.dateX = "time"

    chart.scrollbarX = new am4charts.XYChartScrollbar()
    chart.scrollbarX.series.push(series)
    chart.scrollbarX.parent = chart.bottomAxesContainer
    chart.plotContainer.disabled = true

    chart.scrollbarX.events.on("rangechanged", (e) => {
      if (e.target.range.priority === undefined) {
        this.startIndex = this.dragStartBar(chart.data, e.target.range.start)
        this.endIndex   = this.dragEndBar(chart.data, e.target.range.end)
      } else if (e.target.range.priority === "start") {
        this.startIndex = this.dragStartBar(chart.data, e.target.range.start)
      } else if (e.target.range.priority === "end") {
        this.endIndex   = this.dragEndBar(chart.data, e.target.range.end)
      }
      imageSeries.data = this.omitJsonData(json_data.slice(this.startIndex, this.endIndex))
    })
  },
  beforeDestroy() {
    if (this.map) {
      this.map.dispose()
    }
  },
  methods: {
    omitJsonData: function(array) {
      return array.map(item => (this.dataFormat(item)))
    },
    dataFormat: function(d) {
      return {
        "title": d[8],
        "latitude": d[4],
        "longitude": d[5],
        "radius": this.circleSize(d[7]),
        "stroke": am4core.color(this.depthColor(d[6])),
        "time": d[3],
        "percent": d[9],
      }
    },
    circleSize: function(mag) {
      let size = 8
      if (mag < 3) {
        size = 2
      } else if (mag < 5) {
        size = 4
      } else if (mag < 7) {
        size = 6
      }
      return size
    },
    depthColor: function(depth) {
      let color = "blue"
      if (depth < 30) {
        color = "red"
      } else if (depth < 100) {
        color = "orange"
      } else if (depth < 300) {
        color = "yellow"
      }
      return color
    },
    dragStartBar: function(array, startPoint) {
      let index = 0
      array.some((d, i) => {
        if (d.percent > startPoint) {
          index = i
          return true
        }
      })
      return index
    },
    dragEndBar: function(array, endPoint) {
      let index = array.length - 1
      array.some((d, i) => {
        if (d.percent > endPoint) {
          index = i - 1
          return true
        }
      })
      return index
    }
  }
}
</script>

<style scoped>
#chartdiv {
  width: 100%;
  height: 600px;
}
</style>
