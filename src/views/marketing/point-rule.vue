<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>积分规则配置</span>
        <el-button type="primary" @click="handleAdd">新增规则</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="rule_name" label="规则名称" min-width="120" />
      <el-table-column label="规则类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.rule_type === 1 ? 'primary' : 'success'">
            {{ scope.row.rule_type === 1 ? '消费积分' : '签到积卷' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用等级" width="120">
        <template #default="scope">
          {{ getLevelName(scope.row.applicable_level_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="points_per_unit" label="获得积分" width="100">
        <template #default="scope">
          <span style="color: #67c23a;">+{{ scope.row.points_per_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="min_amount" label="门槛条件(元)" width="120" />
      <el-table-column prop="max_points" label="单次积分上限" width="120" />
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="rule_name">
          <el-input v-model="form.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="rule_type">
          <el-radio-group v-model="form.rule_type">
            <el-radio :label="1">消费积分</el-radio>
            <el-radio :label="2">签到积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="适用等级" prop="applicable_level_id">
          <el-select v-model="form.applicable_level_id" clearable placeholder="不选则表示通用" style="width: 100%">
            <el-option
              v-for="item in memberLevelListOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="获取积分数" prop="points_per_unit">
          <el-input-number v-model="form.points_per_unit" :min="1" />
          <div class="form-tip">消费或签到触发时单次获得的积分</div>
        </el-form-item>
        <el-form-item label="最低门槛(元)" prop="min_amount" v-if="form.rule_type === 1">
          <el-input-number v-model="form.min_amount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="最大积分上限" prop="max_points">
          <el-input-number v-model="form.max_points" :min="0" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPointRules, addPointRule, updatePointRule, deletePointRule, updatePointRuleStatus } from '../../api/marketing'
import { getLevels } from '../../api/member'

const loading = ref(false)
const tableData = ref([])
const memberLevelListOptions = ref([])

const getLevelName = (levelId) => {
  if (!levelId) return '所有等级通用'
  const level = memberLevelListOptions.value.find(l => l.id === levelId)
  return level ? level.name : '未知等级'
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const typeMap = {
  1: '消费送积分',
  2: '签到送积分',
  3: '充值送积分'
}

const form = reactive({
  id: undefined,
  rule_name: '',
  rule_type: 1,
  applicable_level_id: undefined,
  points_per_unit: 1,
  min_amount: 0,
  max_points: 0
})

const rules = {
  rule_name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  points_per_unit: [{ required: true, message: '请输入赠送积分数值', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const [rulesRes, levelsRes] = await Promise.all([
      getPointRules(),
      getLevels()
    ])
    if (rulesRes.code === 200) {
      tableData.value = rulesRes.data
    }
    if (levelsRes.code === 200) {
      memberLevelListOptions.value = levelsRes.data
    }
  } catch (error) {
    ElMessage.error('获取规则列表失败')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updatePointRuleStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '停用'}规则: ${row.name}`)
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增规则'
  Object.assign(form, {
    id: undefined,
    rule_name: '',
    rule_type: 1,
    applicable_level_id: undefined,
    points_per_unit: 1,
    min_amount: 0,
    max_points: 0
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑规则'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除规则 [${row.name}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deletePointRule(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updatePointRule(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addPointRule(form)
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
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
