<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <!--      添加分类按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialogVisible = true">添加分类</el-button>
        </el-col>
      </el-row>
      <!--        表格区域-->
      <tree-table class="tree_table"
                  :data="pageCateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  :show-index="true"
                  index-text="#"
                  border
                  :show-row-hover="false">
<!--        是否有效列-->
        <template v-slot:isOk="props">
          <i class="el-icon-success" v-if="props.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
<!--        排序列-->
        <template v-slot:order="props">
          <el-tag v-if="props.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="props.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
<!--        操作列-->
        <template v-slot:opt="props">
          <!--            编辑按钮-->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(props.row.cat_id)">编辑</el-button>
          <!--            删除按钮-->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(props.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--      分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[2, 5, 10]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <!--    添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!--      对话框顶部区域-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">

        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：">
          <!--        级联选择器-->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              placeholder="请选择父级分类"
              clearable
              change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改分类对话框-->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <!--      对话框顶部区域-->
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "categories",
  created() {
    this.getCateList()
  },
  data() {
    return {
      //用于保存所有分类列表
      cateList: [],
      //分页后的每一页所拥有的分类列表
      pageCateList: [],
      //页码
      pageNum: 1,
      //每页大小
      pageSize: 5,
      //总的分类数
      total: 30,
      //定义每一列需要展示的方式
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //表示要使用自定义template
          type: 'template',
          //template的名字
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      //设置添加分类对话框是否显示
      addCateDialogVisible: false,
      //设置修改分类对话框是否显示
      editCateDialogVisible: false,
      //添加分类表单源数据
      addCateForm: {
        //分类名称
        cat_name: '',
        //默认父级分类等级
        cat_pid: 0,
        //默认分类等级
        cat_level: 0
      },
      //添加分类对话框表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //包含一级和二级的分类
      parentCateList: [],
      //级联选择器的配置项
      cascaderProps: {
        //展开方式，鼠标上移
        expandTrigger: 'hover',
        //显示的值
        label: 'cat_name',
        //真正选中的值
        value: 'cat_id',
        children: 'children'
      },
      //级联选择器选中的值
      selectedKeys: [],
      //保存了修改分类的表单行数据
      editCateForm: {},
      //保存了一行的分类信息
      rowCateInfo: {}
    }
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      //获取所有的分类列表
      this.cateList = res.data
      this.total = res.data.length
      //初始化展示的页的列分类列表
      this.changePageCateList()
      //初始化对话框需要的一级和二级分类的数据
      await this.getParentCateList()
    },
    //实现前端分页
    changePageCateList() {
      let start = (this.pageNum - 1) * this.pageSize //初始页码
      //需要判断end是否会大于总的条数
      let end = start + this.pageSize > this.total ? this.total : start + this.pageSize
      //每次需重置一边之前的列表
      this.pageCateList = []
      for (let i=start; i<end; i++){
        this.pageCateList.push(this.cateList[i])
      }
    },
    //监听分页大小的改变
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      //改变后需要重新获取一次每页数据
      this.changePageCateList()
    },
    //监听页面的改变
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum
      this.changePageCateList()
    },
    //添加分类对话框关闭后重置
    addCateDialogClosed() {
      this.$refs['addCateFormRef'].resetFields()
      //重置
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedKeys = []
    },
    //删除三级分类的分类
    async getParentCateList() {
      //由于目前本人实力有限
      //暂时无法实现数组、对象相互嵌套的深拷贝，所以被迫再次向服务器请求数据
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      } else {
        this.parentCateList = res.data
        // 先遍历到二级分类，删除children属性
        for(let item1 of this.parentCateList){
          //判断是否有children
          if(item1['children']){
            for(let item2 of item1['children']){
              //Vue响应式删除
              if(item2['children']){
                this.$delete(item2, 'children')
              }
            }
          }
        }
      }
    },
    parentCateChanged() {
      //判断是否有分类被选中
      if (this.selectedKeys.length > 0) {
        //父级分类的id永远都是数组的最后一项
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //设置分类等级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        //重置
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //添加分类
    addCate() {
      this.$refs['addCateFormRef'].validate(async valid => {
        if(valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if(res.meta.status !== 201) {
            //请求失败
            return this.$message.error('向服务器添加分类失败')
          } else {
            this.$message.success('向服务器添加分类成功')
            //将对话框关闭
            this.addCateDialogVisible = false
            //重新请求数据
            await this.getCateList()
          }
        } else {
          return false
        }
      })
    },
    //展示修改分类对话框
    async showEditCateDialog(id) {
      //以对应id进行查询
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      } else {
        this.editCateForm = res.data
      }
      this.editCateDialogVisible = !this.editCateDialogVisible
    },
    editCate() {
      this.$refs['editCateFormRef'].validate(async valid => {
        if(valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
            cat_name: this.editCateForm.cat_name
          })
          if(res.meta.status !== 200) {
            //请求失败
            return this.$message.error('向服务器修改分类失败')
          } else {
            this.$message.success('向服务器修改分类成功')
            //将对话框关闭
            this.editCateDialogVisible = false
            //重新请求数据
            await this.getCateList()
          }
        } else {
          return false
        }
      })
    },
    editCateDialogClosed() {
      this.$refs['editCateFormRef'].resetFields()
    },
    removeCateById(id) {
      this.$confirm('此操作将永久删除该分类，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          await this.getCateList()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.tree_table {
  margin-top: 17px;
}

.el-cascader {
  width: 100%;
}
</style>
