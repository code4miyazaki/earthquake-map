import Vue from 'vue'
import Router from 'vue-router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import EarthquakeJapanMap from '@/components/EarthquakeJapanMap'
import USGSEarthquakeMap from '@/components/USGSEarthquakeMap'

Vue.use(Router)
Vue.use(Buefy)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'EarthquakeJapanMap',
      component: EarthquakeJapanMap
    },
    {
      path: '/usgs',
      name: 'USGSEarthquakeMap',
      component: USGSEarthquakeMap
    }
  ]
})
