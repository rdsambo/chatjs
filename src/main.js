import Vue from 'vue'
import App from './App.vue'
import axios from "axios";
Vue.prototype.$http = axios;
import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

import './assets/main.css'

new Vue({
  render: (h) => h(App)
}).$mount('#app')
