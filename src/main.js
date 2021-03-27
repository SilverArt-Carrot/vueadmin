import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式
import './assets/css/global.css'
//导入图标样式
import './assets/icon/UserAndPassword/iconfont.css'
import './assets/icon/menuicon/iconfont.css'
//使用axios框架
import axios from "axios";
//导入第三方插件表格树
import TreeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
