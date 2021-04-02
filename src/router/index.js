import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/welcome')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/right/rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/right/roles')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/good/categories')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/good/params')

const Goods = () => import(/* webpackChunkName: "Goods_Add_Edit" */ '../components/good/goods')
const AddGood = () => import(/* webpackChunkName: "Goods_Add_Edit" */ '../components/good/add')
const EditGood = () => import(/* webpackChunkName: "Goods_Add_Edit" */ '../components/good/edit')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/orders')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/reports')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
        //本来子路由是前面不加/的，加了斜杠会被拼接到根，而不是从父路由开始，这里是因为服务器接口需要这样做，路由就是这样子
        //但是又不能绕过/home路由
      { path: '/welcome', component: Welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/goods", component: Goods },
      { path: "/params", component: Params },
      { path: "/categories", component: Cate },
      { path: "/orders", component: Order },
      { path: "/reports", component: Report },
      { path: '/goods/addgood', component: AddGood },
      { path: '/goods/editgood', component: EditGood }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  //如果在sessionStorage中没有token则返回login页面
  if (window.sessionStorage.getItem('token')) {
    return next()
  } else {
    return next('/login')
  }
})

export default router
