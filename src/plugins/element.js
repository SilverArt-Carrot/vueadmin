import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  MessageBox,
  Container,
  Header,
  Main,
  Aside,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  Tag,
  Tree,
  Select,
  Option,
  Cascader } from 'element-ui'

//Login
Vue.use(Button).use(Form).use(FormItem).use(Input)
//Home 主体布局
Vue.use(Container).use(Header).use(Main).use(Aside)
//Home 菜单布局
Vue.use(Menu).use(Submenu).use(MenuItem)
//顶部导航记录
Vue.use(BreadcrumbItem).use(Breadcrumb)
//卡片
Vue.use(Card)
//分栏间隔
Vue.use(Row).use(Col)
//表格
Vue.use(Table).use(TableColumn)
//Switch按钮
Vue.use(Switch)
//提示
Vue.use(Tooltip)
//分页
Vue.use(Pagination)
//对话框
Vue.use(Dialog)
//标签，用于表格内部
Vue.use(Tag)
//树形结构
Vue.use(Tree)
//下拉菜单
Vue.use(Select).use(Option)
//级联选择器
Vue.use(Cascader)
//全局消息
Vue.prototype.$message = Message
//全局消息对话框
Vue.prototype.$confirm = MessageBox.confirm

