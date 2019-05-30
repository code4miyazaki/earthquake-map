import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import * as am4maps from '@amcharts/amcharts4/maps'
import am4themesAnimated from '@amcharts/amcharts4/themes/animated'

am4core.useTheme(am4themesAnimated)

export default {
  beforeDestroy () {
    if (this.map) {
      this.map.dispose()
    }
  },
  methods: {
    /**
     * 地図を描画する関数
     * polygonSeriesへのアクセス: 「map.series.values[0]」
     * FIXME: polygonSeriesへのアクセスクソダサい
     * @param {String} elementId amChartsを描画するエレメントのID
     * @param {Object} geodata GeoJSON形式の地図データ amcharts4-geodataとか
     * @return {Object} am4core.create()で作成したmap
     */
    setMap: function (elementId, geodata) {
      let map = am4core.create(elementId, am4maps.MapChart)
      map.geodata = geodata
      var polygonSeries = map.series.push(new am4maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.mapPolygons.template.events.on('hit', function (ev) {
        map.zoomToMapObject(ev.target)
      })
      return map
    },
    /**
     * 地図にマーカーを設置する関数
     * @param {Object} map setMap()とかam4core.create()を渡す
     * @param {Object} json omitJsonData()でパースした値を渡す
     * @return {Object} MapImageSeries
     */
    setMarker: function (map, json) {
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

      imageSeries.data = this.omitJsonData(json)
      return imageSeries
    },
    /**
     * mapと連動したスクロールバーを描画する関数
     * @param {Object} map setMap()の戻り値を渡す
     * @param {Object} imageSeries setMarker()の戻り値を渡す
     * @param {Object} json mapに渡したデータと同じものを渡す
     * @param {String} format amChartsの使用にそったタイムスタンプのフォーマットを指定
     * @return {Object} XYChart
     */
    setScrollbar: function (map, imageSeries, json, format = 'HH:mm:ss') {
      let chart = map.chartContainer.createChild(am4charts.XYChart)
      chart.data = this.omitJsonData(json)
      chart.dateFormatter.inputDateFormat = format

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
        imageSeries.data = this.omitJsonData(json.slice(this.startIndex, this.endIndex))
      })

      return chart
    },
    /**
     * jsonDataをsetmarker()やsetScrollbar()で使える形に整形する
     * @param {Object} array jsonData
     * @return {Object} data
     */
    omitJsonData: function (array) {
      return array.map(item => (this.dataFormat(item)))
    },
    /**
     * jsonDataと各項目の紐付けを行う
     * omitJsonData()から呼び出される
     * @param {Object} d jsonDataの子要素
     * @return {Object} data
     */
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
    /**
     * マグニチュードをマーカーのサイズに変換する
     * @param {Number} mag マグニチュード
     */
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
    /**
     * 深度を色に変換する
     * @param {int} depth 深度
     */
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
    /**
     * Scrollbarのstartの位置から有効なdataの最小Indexを返す
     * @param {Object} array chart.data
     * @param {Number} startPoint Scrollbarのstartのポジション
     */
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
    /**
     * Scrollbarのendの位置から有効なdataの最大Indexを返す
     * @param {Object} array chart.data
     * @param {Number} endPoint Scrollbarのendのポジション
     */
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
