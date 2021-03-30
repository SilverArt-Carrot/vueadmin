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
//导入富文本编辑器以及样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.config.productionTip = false

//配置axios默认baseUrl
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
//请求拦截添加请求头token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//以Vue原型的形式挂载axios
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
