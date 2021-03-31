<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片区域-->
    <el-card>
      <!--      提示区域-->
      <el-alert title="修改商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--      步骤条区域-->
      <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--      标签页区域-->
      <el-form :model="editForm" :rules="editGoodFormRules" ref="editGoodFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--            级联选择器-->
              <el-cascader
                  v-model="selectedKeys"
                  :options="cateList"
                  :props="cascaderProps"
                  disabled></el-cascader>
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

          <el-tab-pane label="商品内容" name="3">
            <!--            富文本框区域-->
            <quill-editor
                ref="myQuillEditor"
                v-model="editForm.goods_introduce"/>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="4">
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
            <el-button @click="editGood" type="primary" class="btn_add">修改商品</el-button>
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
export default {
  name: "edit",
  created() {
    this.getGoodInfo()
  },
  data() {
    return {
      //保存请求到的商品信息
      goodInfo: {},
      //tab标签页的名字
      activeIndex: '0',
      editGoodFormRules: {
        goods_name: [ { required: true, message: '请输入商品名称', trigger: 'blur' } ],
        goods_price: [ { required: true, message: '请输入商品价格', trigger: 'blur' } ],
        goods_number: [ { required: true, message: '请输入商品数量', trigger: 'blur' } ],
        goods_weight: [ { required: true, message: '请输入商品重量', trigger: 'blur' } ],
      },
      //要提交的编辑表单
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_introduce: '',
        goods_cat: '',
        pics: [],
        attrs: []
      },
      //被选择的级联选择器key，不可更改
      selectedKeys: [],
      cateList: [],
      cascaderProps: {
        //显示的值
        label: 'cat_name',
        //真正选中的值
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表
      paramsList: [],
      //静态属性列表
      attrsList: [],
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
    async getGoodInfo() {
      const {data: res} = await this.$http.get(`goods/${this.$route.query.id}`)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败')
      this.goodInfo = res.data
      console.log(this.goodInfo)
      await this.getCateList()
      this.initialEditForm()
      this.initialTabData()
    },
    //获取所有分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      //获取所有的分类列表
      this.cateList = res.data
    },
    //初始化提交表单的部分数据
    initialEditForm(){
      this.editForm.goods_name = this.goodInfo.goods_name
      this.editForm.goods_price = this.goodInfo.goods_price
      this.editForm.goods_weight = this.goodInfo.goods_weight
      this.editForm.goods_number = this.goodInfo.goods_number
      this.editForm.goods_cat = this.goodInfo.goods_cat
      this.editForm.goods_introduce = this.goodInfo.goods_introduce
    },
    //初始化标签页数据
    initialTabData() {
      this.goodInfo.attrs.forEach(item => {
        if(item.attr_sel === 'many'){
          this.paramsList.push({
            attr_id: item.attr_id,
            attr_name: item.attr_name,
            attr_vals: item.attr_value ? item.attr_value.split(',') : []
          })
        } else {
          this.attrsList.push({
            attr_id: item.attr_id,
            attr_name: item.attr_name,
            attr_vals: item.attr_value
          })
        }
      })
      this.selectedKeys.push(
          this.goodInfo.cat_one_id,
          this.goodInfo.cat_two_id,
          this.goodInfo.cat_three_id )
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
      const index = this.editForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.editForm.pics.splice(index, 1)
    },
    //图片上传成功触发
    handleSuccess(response, file, fileList) {
      this.editForm.pics.push(
          { pic: response.data.tmp_path }
      )
    },
    editGood() {
      this.$refs['editGoodFormRef'].validate(async valid => {
        if (valid) {
          //处理动态参数
          this.paramsList.forEach(item => {
            this.editForm.attrs.push({
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(',')
            })
          })
          //处理静态属性
          this.attrsList.forEach(item => {
            this.editForm.attrs.push({
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            })
          })
          console.log(this.editForm)
          const { data: res } = await this.$http.put(`goods/${this.goodInfo.goods_id}`, this.editForm)
          console.log(`goods/${this.goodInfo.goods_id}`)
          console.log(res)
          if(res.meta.status !== 200) {
            //请求失败
            return this.$message.error('向服务器修改商品失败')
          } else {
            this.$message.success('向服务器修改商品成功')
            //跳转会goods页面
            await this.$router.push('/goods')
          }
        }else{
          this.$message.error('请填写必要的表单项')
          return false
        }
      })
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
  margin-top: 40px;
}
</style>
