<template>
  <div>
    <!--    顶部导航记录区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片区域-->
    <el-card>
      <!--      添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
<!--      表格区域-->
      <el-table :data="roleList" style="width: 100%" border stripe>
<!--        表格展开列-->
        <el-table-column type="expand">
          <template v-slot:default="props">
<!--            循环将每个一级权限先渲染出来-->
            <el-row :class="['dbbuttom', index1 === 0 ? 'dbtop' : '', 'vcenter']"
                    v-for="(item1, index1) in props.row.children"
                    :key="item1.id">
<!--              一级权限-->
              <el-col :span="5">
                <el-tag @close="removeRightById(props.row, item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              二级权限与三级权限-->
              <el-col :span="19">
<!--                嵌套循环将每一个二级权限渲染出-->
                <el-row :class="[index2 !== 0 ? 'dbtop' : '', 'vcenter']"
                        v-for="(item2, index2) in item1.children"
                        :key="item2.id">
<!--                    二级权限-->
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightById(props.row, item2.id)" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
<!--                    三级权限-->
                    <el-tag v-for="(item3, index3) in item2.children"
                            :key="item3.id"
                            type="warning"
                            @close="removeRightById(props.row, item3.id)"
                            closable>{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template v-slot:default="props">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(props.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(props.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(props.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--    添加角色对话框区域-->
    <el-dialog title="添加用户" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
      <!--   对话框顶部区域-->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">

        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改角色对话框-->
    <el-dialog title="修改角色信息" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
      <!--      对话框顶部区域-->
      <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
<!--    分配权限对话框-->
    <el-dialog
        title="提示"
        :visible.sync="setRightDialogVisible"
        width="50%">
<!--      树形控件-->
      <el-tree :data="rightsTree"
               :props="defaultProps"
               show-checkbox
               node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRight">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roles",
  created() {
    this.getRolesList()
  },
  data() {
    return {
      //保存角色列表
      roleList: [],
      //管理添加角色对话框是否显示
      addRoleDialogVisible: false,
      //添加角色的数据源
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加角色表单校验规则，同时也用于修改角色的表单校验
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //管理修改角色对话框是否显示
      editRoleDialogVisible: false,
      //编辑角色表单数据源
      editRoleForm: {},
      //管理分配角色权限对话框是否显示
      setRightDialogVisible: false,
      //以树形结构保存所有权限数据
      rightsTree: [],
      //设置以authName来展示树，和以children来遍历子树
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      //保存了展开树后默认被勾选的key，都是3级节点，3级节点被勾选后，对应
      //的1级节点和2级节点会被半勾选
      defKeys: [],
      //保存了要被分配角色的id
      roleId: ''
    }
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      } else {
        this.roleList = res.data
      }
    },
    //添加角色操作
    addRole() {
      this.$refs['addRoleFormRef'].validate(async valid => {
        if (valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.post('roles', this.addRoleForm)
          if(res.meta.status !== 201) {
            //请求失败
            return this.$message.error('向服务器添加角色失败')
          } else {
            this.$message.success('向服务器添加角色成功')
            //将对话框关闭
            this.addRoleDialogVisible = false
            //重新请求数据
            await this.getRolesList()
          }
        } else {
          return false
        }
      })
    },
    //添加角色对话框关闭后重置
    addRoleDialogClosed() {
      this.$refs['addRoleFormRef'].resetFields()
    },
    //修改角色对话框关闭后重置
    editRoleDialogClosed() {
      this.$refs['editRoleFormRef'].resetFields()
    },
    //展示修改角色对话框
    async showEditRoleDialog(id) {
      // 以对应id进行查询
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      } else {
        this.editRoleForm = res.data
        this.editRoleDialogVisible = !this.editRoleDialogVisible
      }
    },
    //修改角色操作
    editRole() {
      this.$refs['editRoleFormRef'].validate(async valid => {
        if(valid) {
          //发起添加用户网络请求
          const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, this.editRoleForm)
          if(res.meta.status !== 200) {
            //请求失败
            return this.$message.error('向服务器修改角色失败')
          } else {
            this.$message.success('向服务器修改角色成功')
            //将对话框关闭
            this.editRoleDialogVisible = false
            //重新请求数据
            await this.getRolesList()
          }
        } else {
          return false
        }
      })
    },
    //根据用户id删除角色
    removeRoleById(id) {
      this.$confirm('此操作将永久删除该角色，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          await this.getRolesList()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    //根据权限id移除权限
    removeRightById(role, rightId) {
      this.$confirm('此操作将永久移除该权限，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if( res.meta.status !== 200 ) {
          this.$message.error('删除失败')
        }else{
          // await this.getRolesList() 这样调用是会关闭整个展开行的
          //请求返回最新的角色权限
          role.children = res.data
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    //获取权限树的三级节点id，遍历获取
    getKeys(role) {
      for(let item1 of role['children']) {
        for(let item2 of item1['children']) {
          for(let item3 of item2['children']) {
            this.defKeys.push(item3['id'])
          }
        }
      }
    },
    //获取权限树的三级节点id，递归获取
    getKeys2(node, array){
      if(!node.children){
        return array.push(node['id'])
      }else{
        node.children.forEach(item => {
          this.getKeys2(item, array)
        })
      }
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有权限列表失败')
      } else {
        //将角色的id保存起来为了分配角色用
        this.roleId = role.id
        //将权限树保存
        this.rightsTree = res.data
        //获取所有的三级权限
        //每次打开对话框前需重置，不然会覆盖之前的数组
        this.defKeys = []
        //递归调用将三级权限加入defKeys
        this.getKeys2(role, this.defKeys)
        //循环调用将三级权限加入defKeys
        // this.getKeys(role)
        this.setRightDialogVisible = !this.setRightDialogVisible
      }
    },
    //分配权限
    async allotRight() {
      //获取所有被权限和半选的key，通过...展开数组
      const keys = [
          ...this.$refs['treeRef'].getCheckedKeys(),
          ...this.$refs['treeRef'].getHalfCheckedKeys()
      ]
      console.log(keys)
      const keyStr =  keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: keyStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权限成功')
        await this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>

<style scoped>
.el-tag{
  margin: 8px;
}

.dbtop {
 border-top: 1px solid #eee;
}

.dbbuttom{
  border-bottom: 1px solid #eee;
}

.vcenter{
  display: flex;
  align-items: center;
}
</style>
