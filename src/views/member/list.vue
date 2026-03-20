<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>会员列表</span>
        <el-button type="primary" @click="handleAdd">新增会员</el-button>
      </div>
    </template>
    
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="会员卡号">
        <el-input v-model="searchForm.card_number" placeholder="请输入会员卡号" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 会员列表表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="card_number" label="会员卡号" width="150" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column label="性别" width="80">
        <template #default="scope">
          {{ scope.row.gender === 1 ? '男' : (scope.row.gender === 2 ? '女' : '未知') }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column label="会员等级" width="100">
        <template #default="scope">
          <el-tag :type="getLevelTagType(scope.row.level_id)">
            {{ getLevelName(scope.row.level_id) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="total_points" label="总积分" width="80" />
      <el-table-column prop="total_consumption" label="总消费(元)" width="100" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page.currentPage"
        v-model:page-size="page.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="会员卡号" prop="card_number">
          <el-input v-model="form.card_number" :disabled="isEdit" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="会员等级" prop="level_id">
          <el-select v-model="form.level_id" placeholder="请选择等级" style="width: 100%">
            <el-option
              v-for="item in levelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="form.birthday" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMembers, addMember, updateMember, updateMemberStatus } from '../../api/member'
import { getLevels } from '../../api/member'

// State
const loading = ref(false)
const tableData = ref([])
const levelOptions = ref([])

const searchForm = reactive({
  card_number: '',
  phone: ''
})

const page = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// Dialog Form
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = reactive({
  id: undefined,
  card_number: '',
  name: '',
  phone: '',
  gender: 1,
  level_id: 1,
  birthday: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  level_id: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
}

// Methods
const getLevelName = (levelId) => {
  const level = levelOptions.value.find(l => l.id === levelId)
  return level ? level.name : '未知'
}

const getLevelTagType = (levelId) => {
  const map = { 1: 'info', 2: 'warning', 3: 'danger' }
  return map[levelId] || ''
}

const loadLevels = async () => {
  try {
    const res = await getLevels()
    if (res.code === 200) {
      levelOptions.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取会员等级失败')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMembers({
      page: page.currentPage,
      pageSize: page.pageSize,
      card_number: searchForm.card_number,
      phone: searchForm.phone
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      page.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.currentPage = 1
  loadData()
}

const resetSearch = () => {
  searchForm.card_number = ''
  searchForm.phone = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  page.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  page.currentPage = val
  loadData()
}

const handleStatusChange = async (row) => {
  try {
    await updateMemberStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}会员: ${row.name}`)
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1 // 恢复原始状态
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增会员'
  Object.assign(form, {
    id: undefined,
    card_number: 'VIP' + Date.now().toString().slice(-8),
    name: '',
    phone: '',
    gender: 1,
    level_id: 1,
    birthday: ''
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑会员'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateMember(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addMember(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  loadLevels()
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
