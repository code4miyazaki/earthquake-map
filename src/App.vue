<template>
  <div>
    <div id="chartdiv"></div>
    <p>気象庁「2019年05月17日の震源リスト」 （https://www.data.jma.go.jp/svd/eqev/data/daily_map/20190517.html）を加工して作成</p>
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4maps from "@amcharts/amcharts4/maps"
import am4geodata_japanLow from "@amcharts/amcharts4-geodata/japanLow"
import json_data from "../data/coordinate20190517.json"

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

    imageSeries.data = []
    json_data.forEach((d, i) => {
      if (d.length != 10) {return}
      imageSeries.data.push(this.dataFormat(d, i))
    })
  },
  beforeDestroy() {
    if (this.map) {
      this.map.dispose()
    }
  },
  methods: {
    dataFormat: function(d, i) {
      return {
        "title": d[9],
        "latitude": this.dmm2deg(d[5]),
        "longitude": this.dmm2deg(d[6]),
        "radius": this.circleSize(d[8]),
        "stroke": am4core.color(this.depthColor(d[7])),
      }
    },
    /**
     * DMM形式の軽度・緯度をDEG方式(10進)に変換
     */
    dmm2deg: function(str) {
      // console.log(str)
      let tmp = str.split("°");
      const d = Number(tmp[0]);

      tmp = tmp[1].split(".");
      const m = Number(tmp[0]);

      tmp = tmp[1].split("'");
      const s = Number(tmp[0]);

      return d + (m * 60 + s) / 3600
    },
    circleSize: function(mag) {
      let size = 8;
      if (mag < 3) {
        size = 2;
      } else if (mag < 5) {
        size = 4;
      } else if (mag < 7) {
        size = 6;
      }
      return size;
    },
    depthColor: function(depth) {
      let color = "blue";
      if (depth < 30) {
        color = "red";
      } else if (depth < 100) {
        color = "orange";
      } else if (depth < 300) {
        color = "yellow";
      }
      return color;
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
