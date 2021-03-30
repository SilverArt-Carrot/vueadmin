<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
    <el-card>
<!--      提示区域-->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
<!--      步骤条区域-->
      <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
<!--      标签页区域-->
      <el-form :model="addGoodForm" :rules="addGoodFormRules" ref="addGoodFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--            级联选择器-->
              <el-cascader
                  v-model="addGoodForm.goods_cat"
                  :options="cateList"
                  :props="cascaderProps"
                  @change="handleChanged"
                  placeholder="请选择商品分类"
                  clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in this.paramsList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" v-for="(val, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in this.attrsList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
<!--            图片上传-->
            <el-upload
                action="http://www.ysqorz.top:8888/api/private/v1/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
<!--            富文本框区域-->
            <quill-editor
                ref="myQuillEditor"
                v-model="addGoodForm.goods_introduce"/>
            <el-button @click="addGood" type="primary" class="btn_add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
<!--展示图片的对话框-->
    <el-dialog
        title="图片预览"
        :visible.sync="picDialogVisible"
        width="55%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: "add",
  created() {
    this.getCateList()
  },
  data() {
    return {
      //被激活的步骤条index
      activeIndex: '0',
      addGoodForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        //图片的数组
        pics: [],
        goods_introduce: ''
      },
      addGoodFormRules: {
        goods_name: [ { required: true, message: '请输入商品名称', trigger: 'blur' } ],
        goods_price: [ { required: true, message: '请输入商品价格', trigger: 'blur' } ],
        goods_number: [ { required: true, message: '请输入商品数量', trigger: 'blur' } ],
        goods_weight: [ { required: true, message: '请输入商品重量', trigger: 'blur' } ],
        goods_cat: [ { required: true, message: '请选择商品分类', trigger: 'blur' } ]
      },
      cateList: [],
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
      //动态参数列表
      paramsList: [],
      //静态属性列表
      attrsList: [],
      //动态参数可选值
      paramsCheckList: [],
      //图片上传请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片预览对话框显示与否
      picDialogVisible: false,
      //图片预览的路径
      previewPath: ''
    }
  },
  methods: {
    //级联选择器变化触发
    handleChanged() {
      if(this.addGoodForm.goods_cat.length !== 3) {
        //选中的分类不是三级，将选中的列表重置
        this.addGoodForm.goods_cat = []
      } else {

      }
    },
    //获取所有分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      //获取所有的分类列表
      this.cateList = res.data
    },
    //标签页切换时触发
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    //获取动态参数列表
    async getParamsList(sel) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: sel }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      //判断获取的是动态参数还是静态参数
      res.data.forEach(item => {
        //将请求的数据的可选项切分为数组
        if (sel === 'many'){
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        }
      })
      console.log(res.data)
      if (sel === 'many') {
        this.paramsList = res.data
      } else {
        this.attrsList = res.data
      }
    },
    tabClicked() {
      if (this.activeIndex === '1'){
        this.getParamsList('many')
      }
      if (this.activeIndex === '2') {
        this.getParamsList('only')
      }
    },
    //点击图片名时触发
    handlePreview(file) {
      this.previewPath = 'http://www.ysqorz.top:8888/' + file.response.data.tmp_path;
      this.picDialogVisible = true
    },
    //移除图片时触发
    handleRemove(file, fileList) {
      //获取图片临时路径
      const filePath = file.response.data.tmp_path
      //从数组中找到索引
      const index = this.addGoodForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.addGoodForm.pics.splice(index, 1)
    },
    //图片上传成功触发
    handleSuccess(response, file, fileList) {
      this.addGoodForm.pics.push(
          { pic: response.data.tmp_path }
      )
    },
    //添加商品
    addGood() {
      this.$refs['addGoodFormRef'].validate(async valid => {
        if (valid) {
          //在进行对象操作时为了不印象原对象，进行深拷贝
          const form = _.cloneDeep(this.addGoodForm)
          form.goods_cat = form.goods_cat.join(',')
          //添加参数数组属性
          form.attrs = []
          //处理动态参数
          this.paramsList.forEach(item => {
            form.attrs.push({
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(',')
            })
          })
          //处理静态属性
          this.attrsList.forEach(item => {
            form.attrs.push({
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            })
          })
          const { data: res } = await this.$http.post('goods', form)
          if(res.meta.status !== 201) {
            //请求失败
            return this.$message.error('向服务器添加商品失败')
          } else {
            this.$message.success('向服务器添加商品成功')
            //跳转会goods页面
            await this.$router.push('/goods')
          }
        } else {
          this.$message.error('请填写必要的表单项')
          return false
        }
      })
    }
  },
  computed: {
    //被选中的分类id
    cateId() {
      if(this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2]
      }else{
        return null
      }
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 280px;
}

.el-checkbox {
  margin-right: 8px;
}

.previewImg {
  width: 100%;
}

.btn_add {
  margin-top: 15px;
}
</style>
