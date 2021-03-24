<template>
  <el-container class="home_container">
    <!--    头部区域-->
    <el-header>
      <div>
        <img src="../assets/icon/logo2.svg" alt="">
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--    页面主体区域-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
<!--        侧边栏按钮-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--        侧边菜单栏区-->
        <!--            设置router属性为true，将以index属性为跳转链接-->
        <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath">
          <!--          一级菜单-->
          <el-submenu :index="index + 1 + ''" v-for="(item, index) in menuList" :key="item.id">
            <!--            一级菜单模板区-->
            <template slot="title">
              <!--              图标-->
              <i :class="iconList[item.id]"></i>
              <!--              文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <!--              图标-->
              <i class="el-icon-menu"></i>
              <!--              文本-->
              <span>{{subItem.authName}}</span>
            </el-menu-item>

          </el-submenu>

        </el-menu>
      </el-aside>
      <!--      右侧区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  created() {
    //在生命周期created中请求菜单列表
    this.getMenuList()
    //页面重新加载之后取出，用于设置高亮，第一次加载是没有的
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      iconList: {
        '125': 'iconfont icon-user1',
        '103': 'iconfont icon-quanxian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-dingdan',
        '145': 'iconfont icon-shuju'
      },
      isCollapse: false,
      //保存了被激活的路径，将其设置为default-active属性值，用于设置菜单选项高亮
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      //请求菜单失败
      if( res.meta.status !== 200 ) return this.$message.error(res.meta.meg)
      //将请求成功的数据赋值给menuList
      this.menuList = res.data
      console.log(res)
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      //将每次点击的activePath保存，用于设置动态的菜单高亮
      this.activePath = activePath
      //保存进sessionStorage是为了页面刷新重新加载之后，也拥有上次点击的高亮
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style scoped>
.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

.el-header div {
  display: flex;
  align-items: center;
}

.el-header div span {
  margin-left: 12px;
}

.el-header div img {
  margin-left: 10px;
  margin-top: 6px;
}

.el-menu {
  border-right: none;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 6px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
