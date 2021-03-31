import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../components/login')
  },
  {
    path: '/home',
    component: () => import('../components/home'),
    redirect: '/welcome',
    children: [
        //本来子路由是前面不加/的，加了斜杠会被拼接到根，而不是从父路由开始，这里是因为服务器接口需要这样做，路由就是这样子
        //但是又不能绕过/home路由
      { path: '/welcome', component: () => import('../components/welcome') },
      { path: "/users", component: () => import('../components/user/users') },
      { path: "/rights", component: () => import('../components/right/rights') },
      { path: "/roles", component: () => import('../components/right/roles') },
      { path: "/goods", component: () => import('../components/good/goods') },
      { path: "/params", component: () => import('../components/good/params') },
      { path: "/categories", component: () => import('../components/good/categories') },
      { path: "/orders", component: () => import('../components/order/orders') },
      { path: "/reports", component: () => import('../components/report/reports') },
      { path: '/goods/addgood', component: () => import('../components/good/add') },
      { path: '/goods/editgood', component: () => import('../components/good/edit') }
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
