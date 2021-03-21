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
    component: () => import('../components/home')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  if (window.sessionStorage.getItem('token')) {
    return next()
  } else {
    return next('/login')
  }
})

export default router
