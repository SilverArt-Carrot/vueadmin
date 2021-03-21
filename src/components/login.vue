<template>
  <div class="login_container">
    <div class="login_box">
<!--      头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.png">
      </div>
<!--      表单区域-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
<!--        用户名-->
        <el-form-item prop="username">
          <el-input  v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
<!--      密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-password"></el-input>
        </el-form-item>
<!--        按钮区域-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      loginFormRules: {
        //验证用户名和密码是否合法
        username: [
          { required: true, message: '请输入登录用户', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const {data: res} = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败')
        }else{
          this.$message.success('登录成功')
          //将服务器返回的token保持到sessionStorage中，sessionStorage是window
          //对象的属性，再通过push跳转
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style scoped>
 .login_container {
   background-color: #2b4b6b;
   height: 100%;
 }

 .login_box {
   width: 450px;
   height: 300px;
   background-color: #fff;
   border-radius: 3px;
   position: absolute;
   /*居中，以下三行*/
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);
 }

 .avatar_box {
   height: 80px;
   width: 80px;
   border: 1px solid #eee;
   border-radius: 50%;
   padding: 5px;
   box-shadow: 0 0 10px #ddd;
   position: absolute;
   left: 50%;
   transform: translate(-50%, -20%);
   background-color: #ffffff;
 }

 .avatar_box img{
   width: 100%;
   height: 100%;
   border-radius: 50%;
   background-color: #eee;
 }

 .login_form{
   position: absolute;
   bottom: 0;
   width: 100%;
   padding: 3px 20px;
   box-sizing: border-box;
 }

 .btns{
   display: flex;
   justify-content: flex-end;
 }
</style>
