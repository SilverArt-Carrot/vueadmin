<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区域-->
    <el-card>
      <!--      搜索框区域-->
      <el-row :gutter="30">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--        表格区域-->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!--          由于状态列需要一个Switch按钮展示，则需要拿到真实的确定行的数据，所有可以使用插槽-->
          <template v-slot:default="props">
            <el-switch
                @change="userStateChanged(props.row)"
                v-model="props.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="props">
            <!--            编辑按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(props.row.id)"></el-button>
            <!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(props.row.id)"></el-button>
            <!--            分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAllotRoleDialog(props.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <!--    添加用户对话框区域-->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <!--   对话框顶部区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">

        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
<!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改用户对话框-->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
<!--      对话框顶部区域-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">

        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
<!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--    分配角色对话框-->
    <el-dialog title="分配角色" :visible.sync="allotRoleDialogVisible" width="50%" @close="allotRoleDialogClosed">
      <!--      对话框顶部区域-->
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
      </div>
<!--      下拉菜单-->
      <p>请选择角色：
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
          </el-option>
        </el-select>
      </p>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "users",
  created() {
    this.getUserList()
  },
  data() {
    //email校验
    let checkEmail = (rule, value, callback) => {
      //email校验正则表达式
      const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if(emailReg.test(value)){
        callback()
      }else{
        callback(new Error('请输入合法的邮箱地址'))
      }
    };
    //手机号校验
    let checkMobile = (rule, value, callback) => {
      //手机号正则表达式精简版
      const mobileReg = /^[1]([3-9])[0-9]{9}$/
      if(mobileReg.test(value)){
        callback()
      }else {
        callback(new Error('请输入合法的手机号'))
      }
    };
    return {
      //获取用户列表的请求参数
      queryInfo: {
        //请求参数，用于过滤用户
        query: '',
        //页码
        pagenum: 1,
        //每页的数据大小
        pagesize: 5
      },
      //用户列表
      userList: [],
      //用户总数
      total: 0,
      //用于设置添加用户的对话框是否显示
      dialogVisible: false,
      //用于设置修改用户的对话框是否显示
      editDialogVisible: false,
      //用于设置分配角色的对话框是否显示
      allotRoleDialogVisible: false,
      //添加用户表单数据源
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //保存一行的用户信息，用于分配角色
      userInfo: {},
      //修改用户表单数据源
      editForm: {},
      //获取所有角色列表
      roleList: {},
      //被下拉菜单选择的角色id
      selectRoleId: '',
      //添加用户表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
            //自定义校验规则写法
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //修改用户表单验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getUserList()
    },
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getUserList()
    },
    async userStateChanged(userInfo) {
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        //如果同步服务器失败，需要将本地的状态改回
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更改用户状态失败')
      } else {
        return this.$message.success('更改用户状态成功')
      }
    },
    //监听对话框的关闭，重置表单
    addDialogClosed() {
      this.$refs['addFormRef'].resetFields()
    },
    editDialogClosed() {
      this.$refs['editFormRef'].resetFields()
    },
    allotRoleDialogClosed() {
      // 重置下拉菜单
      this.selectRoleId = ''
    },
    //添加用户
    addUser() {
      this.$refs['addFormRef'].validate(async valid => {
        if (valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if(res.meta.status !== 201) {
            //请求失败
            return this.$message.error('向服务器添加用户失败')
          } else {
            this.$message.success('向服务器添加用户成功')
            //将对话框关闭
            this.dialogVisible = false
            //重新请求数据
            await this.getUserList()
          }
        } else {
          return false
        }
      })
    },
    async showEditDialog(id) {
      //以对应id进行查询
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      } else {
        this.editForm = res.data
      }
      this.editDialogVisible = !this.editDialogVisible
    },
    editUser() {
      this.$refs['editFormRef'].validate(async valid => {
        if(valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if(res.meta.status !== 200) {
            //请求失败
            return this.$message.error('向服务器修改用户失败')
          } else {
            this.$message.success('向服务器修改用户成功')
            //将对话框关闭
            this.editDialogVisible = false
            //重新请求数据
            await this.getUserList()
          }
        } else {
          return false
        }
      })
    },
    //根据id删除用户信息
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${id}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          await this.getUserList()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 展示分配角色的对话框
    async showAllotRoleDialog(userInfo) {
      //保存当前需要分配角色的用户信息
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有角色列表失败')
      } else {
        this.roleList = res.data
      }
      this.allotRoleDialogVisible = !this.allotRoleDialogVisible
      console.log(this.userList)
    },
    // 分配角色
    async allotRole() {
      console.log(this.selectRoleId)
      //如果用户没有选择角色
      if(!this.selectRoleId) {
        return this.$message.error('请选择对应的角色')
      } else {
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectRoleId
        })
        if (res.meta.status !== 200) {
          return this.$message.error('设置用户角色失败')
        } else {
          await this.getUserList()
          this.$message.success('更新用户角色成功')
          this.allotRoleDialogVisible = false
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
