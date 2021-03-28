<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区域-->
    <el-card>
<!--      头部警告区域-->
      <el-alert
          title="注意：只允许为第三级分类添加参数"
          type="warning"
          :closable="false"
          show-icon>
      </el-alert>
<!--      选择商品分类区域-->
      <el-row>
        <el-col class="cat_opt">
<!--          级联选择器-->
          <span>请选择商品分类：</span>
          <el-cascader
              v-model="selectedKeys"
              :options="cateList"
              :props="cascaderProps"
              @change="handleChanged"
              placeholder="请选择三级分类"
              clearable
              size="small"></el-cascader>
        </el-col>
      </el-row>
<!--      tabs标签页区域-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
<!--          按钮区域-->
          <el-button type="primary" :disabled="selectedKeys.length !== 3" size="medium"
                     @click="addParamsDialogVisible = true">添加参数</el-button>
<!--          动态参数表格区域-->
          <el-table :data="manyParamsList" style="width: 100%" border stripe>
<!--            展开行区域-->
            <el-table-column type="expand">
              <template v-slot:default="props">
                <el-tag v-for="(item, index) in props.row.attr_vals" :key="index"
                        closable
                        @close="handleClosed(props.row, index)">{{item}}</el-tag>
<!--                渲染是否是按钮或者输入框-->
                <el-input
                    class="input-new-tag"
                    v-if="props.row.inputVisible"
                    v-model="props.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(props.row)"
                    @blur="handleInputConfirm(props.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="props">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(props.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsById(props.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <!--          按钮区域-->
          <el-button type="primary" :disabled="selectedKeys.length !== 3" size="medium"
                     @click="addParamsDialogVisible = true">添加属性</el-button>
          <!--          静态参数表格区域-->
          <el-table :data="onlyParamsList" style="width: 100%" border stripe>
            <el-table-column type="expand">
<!--              展开行区域-->
                <template v-slot:default="props">
                  <el-tag v-for="(item, index) in props.row.attr_vals" :key="index"
                          closable
                          @close="handleClosed(props.row, index)">{{item}}</el-tag>
                  <!--                渲染是否是按钮或者输入框-->
                  <el-input
                      class="input-new-tag"
                      v-if="props.row.inputVisible"
                      v-model="props.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(props.row)"
                      @blur="handleInputConfirm(props.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="props">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(props.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsById(props.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加动态参数或静态属性对话框区域-->
    <el-dialog :title="'添加' + paramsDialogLabelName" :visible.sync="addParamsDialogVisible" width="50%" @close="addRoleDialogClosed">
      <!--   对话框顶部区域-->
      <el-form :model="addParamsForm" :rules="paramsFormRules" ref="addParamsFormRef" label-width="80px">

        <el-form-item :label="paramsDialogLabelName" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改动态参数或静态属性对话框区域-->
    <el-dialog :title="'修改' + paramsDialogLabelName" :visible.sync="editParamsDialogVisible" width="50%" @close="editRoleDialogClosed">
      <!--   对话框顶部区域-->
      <el-form :model="editParamsForm" :rules="paramsFormRules" ref="editParamsFormRef" label-width="80px">

        <el-form-item :label="paramsDialogLabelName" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  created() {
    this.getCateList()
  },
  data() {
    return {
      //所有的分类数据
      cateList: [],
      //被级联选择器选中的key
      selectedKeys: [],
      //配置级联选择器
      cascaderProps: {
        //展开方式，鼠标上移
        expandTrigger: 'hover',
        //显示的值
        label: 'cat_name',
        //真正选中的值
        value: 'cat_id',
        children: 'children'
      },
      //被激活的tab页
      activeName: 'many',
      //动态参数列表
      manyParamsList: [],
      //静态参数列表
      onlyParamsList: [],
      //管理添加参数对话框是否显示
      addParamsDialogVisible: false,
      //添加参数表单验证规则
      paramsFormRules: {
        attr_name: [
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      },
      //添加参数表单数据源
      addParamsForm: {
        attr_name: ''
      },
      //管理修改参数对话框是否显示
      editParamsDialogVisible: false,
      //修改参数表单数据源
      editParamsForm: {
        attr_name: ''
      },
      //控制按钮与文本框的双向显示
      inputVisible: false,
      //tag文本框里的内容
      inputValue: ''
    }
  },
  methods: {
    //获取所有分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      //获取所有的分类列表
      this.cateList = res.data
    },
    //获取动态参数列表
    async getParamsList() {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取动态列表失败')
      //判断获取的是动态参数还是静态参数
      res.data.forEach(item => {
        //将请求的数据的可选项切分为数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        //添加属性为了tag文本框的显示
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyParamsList = res.data
      } else {
        this.onlyParamsList = res.data
      }
    },
    //级联选择框内容被改变触发
    handleChanged() {
      if(this.selectedKeys.length !== 3) {
        //选中的分类不是三级，将选中的列表重置
        this.selectedKeys = []
        this.manyParamsList = []
        this.onlyParamsList = []
      } else {
        this.getParamsList()
      }
    },
    //tab标签被改变触发
    handleClick() {
      if(this.selectedKeys.length === 3) {
        this.getParamsList()
      }
    },
    addRoleDialogClosed() {
      this.$refs['addParamsFormRef'].resetFields()
    },
    editRoleDialogClosed() {
      this.$refs['editParamsFormRef'].resetFields()
    },
    //添加参数
    addParams() {
      this.$refs['addParamsFormRef'].validate(async valid => {
        if (valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          })
          if(res.meta.status !== 201) {
            //请求失败
            return this.$message.error(`向服务器添加${this.paramsDialogLabelName}失败`)
          } else {
            this.$message.success(`向服务器添加${this.paramsDialogLabelName}成功`)
            //将对话框关闭
            this.addParamsDialogVisible = false
            //重新请求数据
            await this.getParamsList()
          }
        } else {
          return false
        }
      })
    },
    //展示修改参数对话框
    async showEditParamsDialog(id) {
      //以对应id进行查询
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      } else {
        this.editParamsForm = res.data
      }
      this.editParamsDialogVisible = true
    },
    //编辑参数
    editParams() {
      this.$refs['editParamsFormRef'].validate(async valid => {
        if(valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editParamsForm.attr_vals
          })
          if(res.meta.status !== 200) {
            //请求失败
            return this.$message.error(`向服务器修改${this.paramsDialogLabelName}失败`)
          } else {
            this.$message.success(`向服务器修改${this.paramsDialogLabelName}成功`)
            //将对话框关闭
            this.editParamsDialogVisible = false
            //重新请求数据
            await this.getParamsList()
          }
        } else {
          return false
        }
      })
    },
    //根据id删除对应分类
    removeParamsById(id) {
      this.$confirm('此操作将永久删除该参数，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          await this.getParamsList()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    //当tag文本框的键盘输入和失去焦点触发
    handleInputConfirm(row) {
      //输入无意义，重置
      if (row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      } else {
        //输入有意义，将其加入数组
        row.attr_vals.push(row.inputValue.trim())
        //加入完毕后重置
        row.inputValue = ''
        row.inputVisible = false
        // 将前端修改的数据同步到后端
        this.addAttrForManyParams(row)
      }
    },
    //展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //$nextTick:当页面重新渲染的时候，执行的回调代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    //添加动态参数的属性
    async addAttrForManyParams(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(',')
      })
      if(res.meta.status !== 200) {
        //请求失败
        return this.$message.error(`向服务器修改参数失败`)
      }
    },
    //监听删除标签
    handleClosed(row, index) {
      row.attr_vals.splice(index, 1)
      this.addAttrForManyParams(row)
    }
  },
  computed: {
    //被选中的分类id
    cateId() {
      if(this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }else{
        return null
      }
    },
    paramsDialogLabelName() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}

.cat_opt span {
  font-size: 15px;
}

.el-cascader {
  width: 280px;
}

.el-tag {
  margin: 7px;
}

.input-new-tag {
  width: 130px;
}
</style>
