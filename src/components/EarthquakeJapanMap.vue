<template>
  <div>
    <div id='chartdiv'></div>
    <p>気象庁「2018年05月20日の震源リスト」 （https://www.data.jma.go.jp/svd/eqev/data/daily_map/20180520.html）を加工して作成</p>
  </div>
</template>

<script>
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import * as am4maps from '@amcharts/amcharts4/maps'
import am4geodataJapanLow from '@amcharts/amcharts4-geodata/japanLow'
import am4themesAnimated from '@amcharts/amcharts4/themes/animated'

import jsonData from '../../data/coordinate20180520.json'

am4core.useTheme(am4themesAnimated)

export default {
  mounted () {
    let map = am4core.create('chartdiv', am4maps.MapChart)
    map.geodata = am4geodataJapanLow
    map.projection = new am4maps.projections.Miller()
    var polygonSeries = map.series.push(new am4maps.MapPolygonSeries())
    polygonSeries.useGeodata = true
    polygonSeries.mapPolygons.template.events.on('hit', function (ev) {
      map.zoomToMapObject(ev.target)
    })

    // マーカー用のインスタンス作成
    // https://www.amcharts.com/docs/v4/chart-types/map/#Image_series
    let imageSeries = map.series.push(new am4maps.MapImageSeries())
    imageSeries.sequencedInterpolation = true

    let imageSeriesTemplate = imageSeries.mapImages.template
    let circle = imageSeriesTemplate.createChild(am4core.Circle)
    circle.fill = am4core.color('rgba(0, 0, 0, 0)')
    circle.strokeWidth = 1
    circle.nonScaling = true
    circle.tooltipText = '{title}'
    circle.propertyFields.radius = 'radius'
    circle.propertyFields.stroke = 'stroke'

    imageSeriesTemplate.propertyFields.latitude = 'latitude'
    imageSeriesTemplate.propertyFields.longitude = 'longitude'

    imageSeries.data = this.omitJsonData(jsonData)
    console.log(this.omitJsonData(jsonData))

    let chart = map.chartContainer.createChild(am4charts.XYChart)
    chart.data = this.omitJsonData(jsonData)
    chart.dateFormatter.inputDateFormat = 'HH:mm:ss'

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.baseInterval = {
      timeUnit: 'second',
      count: 1
    }
    // let valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    chart.yAxes.push(new am4charts.ValueAxis())

    // Create series
    let series = chart.series.push(new am4charts.LineSeries())
    series.dataFields.valueY = 'radius'
    series.dataFields.dateX = 'time'

    chart.scrollbarX = new am4charts.XYChartScrollbar()
    chart.scrollbarX.series.push(series)
    chart.scrollbarX.parent = chart.bottomAxesContainer
    chart.plotContainer.disabled = true

    chart.scrollbarX.events.on('rangechanged', (e) => {
      if (e.target.range.priority === undefined) {
        this.startIndex = this.dragStartBar(chart.data, e.target.range.start)
        this.endIndex = this.dragEndBar(chart.data, e.target.range.end)
      } else if (e.target.range.priority === 'start') {
        this.startIndex = this.dragStartBar(chart.data, e.target.range.start)
      } else if (e.target.range.priority === 'end') {
        this.endIndex = this.dragEndBar(chart.data, e.target.range.end)
      }
      imageSeries.data = this.omitJsonData(jsonData.slice(this.startIndex, this.endIndex))
    })
  },
  beforeDestroy () {
    if (this.map) {
      this.map.dispose()
    }
  },
  methods: {
    omitJsonData: function (array) {
      return array.map(item => (this.dataFormat(item)))
    },
    dataFormat: function (d) {
      return {
        'title': d[8],
        'latitude': d[4],
        'longitude': d[5],
        'radius': this.circleSize(d[7]),
        'stroke': am4core.color(this.depthColor(d[6])),
        'time': d[3],
        'percent': d[9]
      }
    },
    circleSize: function (mag) {
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
    depthColor: function (depth) {
      let color = 'blue'
      if (depth < 30) {
        color = 'red'
      } else if (depth < 100) {
        color = 'orange'
      } else if (depth < 300) {
        color = 'yellow'
      }
      return color
    },
    dragStartBar: function (array, startPoint) {
      let index = 0
      array.some((d, i) => {
        if (d.percent > startPoint) {
          index = i
          return true
        }
      })
      return index
    },
    dragEndBar: function (array, endPoint) {
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
