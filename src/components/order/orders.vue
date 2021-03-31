<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
    <el-card>
      <!--      搜索框区域-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query"  @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--        表格区域-->
      <el-table style="width: 100%" border stripe :data="orderList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" width="300px" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template v-slot:default="props">
            <el-tag type="success" v-if="props.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template v-slot:default="props">
            {{props.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="props">
            <!--            编辑按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditAddrDialog"></el-button>
            <!--            位置按钮-->
            <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background>
      </el-pagination>
    </el-card>
    <!--    修改地址对话框-->
    <el-dialog title="修改地址" :visible.sync="editAddrDialogVisible" width="50%" @close="editAddrDialogClosed">
      <!--      对话框顶部区域-->
      <el-form :model="editAddrForm" :rules="editAddrFormRules" ref="editAddrDialogRef" label-width="100px">
        <el-form-item label="省市县/区" prop="address">
          <el-cascader
              v-model="editAddrForm.address"
              :options="cityData"
              placeholder="请选择省市区/县"
              clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model="editAddrForm.addressDetail"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddr">确 定</el-button>
      </span>
    </el-dialog>
    <!--    展示物流进度对话框-->
    <el-dialog title="查看物流进度" :visible.sync="progressDialogVisible" width="60%" @close="progressDialogClosed">
      <!--      时间线区域-->
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressList"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";
import progressList from "./progressList.js";

export default {
  name: "orders",
  created() {
    this.getOrderList()
  },
  data() {
    return {
      orderList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editAddrDialogVisible: false,
      editAddrForm: {
        address: [],
        addressDetail: ''
      },
      editAddrFormRules: {
        address: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        addressDetail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      //城市数据
      cityData: cityData,
      progressDialogVisible: false,
      //物流信息列表
      progressList: progressList
    }
  },
  methods: {
    async getOrderList() {
      const {data: res} = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },
    //此接口已经不可使用了
    async getProgressList() {
      const {data: res} = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) return this.$message.error('获取物流进度列表失败')
      this.progressList = res.data
      console.log(this.progressList)
    },
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getOrderList()
    },
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getOrderList()
    },
    //展示修改地址的对话框
    showEditAddrDialog() {
      this.editAddrDialogVisible = true
    },
    editAddrDialogClosed() {
      this.editAddrForm.address = []
      this.$refs['editAddrFormRules'].resetFields()
    },
    editAddr() {
      this.editAddrDialogVisible = false
    },
    showProgressDialog() {
      this.progressDialogVisible = true
    }
  },
  filters: {
    dateFormat(origin) {
      const date = new Date(origin)

      const year = date.getFullYear()
      const month = (date.getMonth() + 1 + '').padStart(2, '0')
      const day = (date.getDate() + '').padStart(2, '0')
      const hour = (date.getHours() + '').padStart(2, '0')
      const minute = (date.getMinutes() + '').padStart(2, '0')
      const second = (date.getSeconds() + '').padStart(2, '0')

      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
