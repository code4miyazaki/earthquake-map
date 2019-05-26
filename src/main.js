import firebase from 'firebase'
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: "AIzaSyCvIJZcPmWQlngEWpZVcfWt7-HqtRQpz_U",
  authDomain: "earthquake-map-2c82e.firebaseapp.com",
  databaseURL: "https://earthquake-map-2c82e.firebaseio.com",
  projectId: "earthquake-map-2c82e",
  storageBucket: "earthquake-map-2c82e.appspot.com",
  messagingSenderId: "501335854320",
  appId: "1:501335854320:web:1913a891d30baa82"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

new Vue({
  el: "#app",
  render: h => h(App),
})
