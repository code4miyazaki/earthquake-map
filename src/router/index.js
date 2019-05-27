import Vue from 'vue'
import Router from 'vue-router'
import EarthquakeJapanMap from '@/components/EarthquakeJapanMap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'EarthquakeJapanMap',
      component: EarthquakeJapanMap
    }
  ]
})
