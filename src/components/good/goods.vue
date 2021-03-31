<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
    <el-card>
      <!--      搜索框区域-->
      <el-row :gutter="30">
        <el-col :span="10">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query"  @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--        表格区域-->
      <el-table style="width: 100%" border stripe :data="goodList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="600px"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column label="创建时间" width="180px">
          <template v-slot:default="props">
            {{props.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="props">
            <!--            编辑按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditPage(props.row.goods_id)"></el-button>
            <!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodById(props.row.goods_id)"></el-button>
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
  </div>
</template>

<script>
export default {
  name: "goods",
  created() {
    this.getGoodList()
  },
  data() {
    return {
      //商品数据
      goodList: [],
      //请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品总数
      total: 0
    }
  },
  methods: {
    async getGoodList() {
      const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getGoodList()
    },
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getGoodList()
    },
    removeGoodById(id) {
      this.$confirm('此操作将永久删除该商品，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          await this.getGoodList()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    goAddPage() {
      this.$router.push('/goods/addgood')
    },
    goEditPage(id) {
      this.$router.push(`goods/editgood?id=${id}`)
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

</style>
