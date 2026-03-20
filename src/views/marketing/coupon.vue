<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>卡券管理</span>
        <el-button type="primary" @click="handleAdd">新增卡券</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="卡券名称" min-width="150" />
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'">
            {{ scope.row.type === 1 ? '折扣券' : '满减券' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="面值/折扣" width="120">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">
            {{ scope.row.type === 1 ? (scope.row.value * 10).toFixed(1) + '折' : '￥' + scope.row.value }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="使用门槛" width="120">
        <template #default="scope">
          {{ scope.row.condition > 0 ? `满${scope.row.condition}元可用` : '无门槛' }}
        </template>
      </el-table-column>
      <el-table-column label="库存(发放/总数)" width="150">
        <template #default="scope">
          {{ scope.row.total_issued }} / {{ scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="300">
        <template #default="scope">
          {{ scope.row.start_time }} 至 {{ scope.row.end_time }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleIssue(scope.row)">发放</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 发放卡券弹窗 -->
    <el-dialog title="发放卡券" v-model="issueDialogVisible" width="500px">
      <el-form :model="issueForm" label-width="100px">
        <el-form-item label="卡券名称">
          <span>{{ currentCoupon.name }}</span>
        </el-form-item>
        <el-form-item label="发放对象">
          <el-radio-group v-model="issueForm.targetType">
            <el-radio :label="1">指定会员</el-radio>
            <el-radio :label="2">全体会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择会员" v-if="issueForm.targetType === 1">
          <el-select v-model="issueForm.member_id" placeholder="请选择会员" filterable style="width: 100%">
            <el-option
              v-for="item in memberListOptions"
              :key="item.id"
              :label="`${item.name} (${item.phone})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="issueDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitIssue">确认发放</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCoupons, deleteCoupon, issueCoupon } from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])

const issueDialogVisible = ref(false)
const issueFormRef = ref(null)

const typeMap = {
  1: '满减券',
  2: '折扣券',
  3: '兑换券'
}

const issueForm = reactive({
  coupon_id: null,
  targetType: 1, // 1: 指定会员 2: 全体发 (由于目前发券需对应具体会员ID，选择全部发送后端应异步处理，这里为了简化演示，限制指定会员或者仅演示过程)
  member_id: ''
})

const issueRules = {
  targetType: [{ required: true, message: '请选择发放对象', trigger: 'change' }],
  member_id: [{ required: true, message: '请输入会员ID', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCoupons()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取卡券列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  ElMessage.info('新增卡券功能仅展示列表数据流，表单开发中...')
}

const handleStatusChange = (row) => {
  ElMessage.success(`已${row.status === 1 ? '启用' : '停用'}卡券: ${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除卡券 [${row.name}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCoupon(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const handleIssue = (row) => {
  if (row.stock <= row.total_issued) {
    ElMessage.warning('该卡券库存不足！')
    return
  }
  issueForm.coupon_id = row.id
  issueForm.targetType = 1
  issueForm.member_id = ''
  issueDialogVisible.value = true
  if (issueFormRef.value) issueFormRef.value.clearValidate()
}

const submitIssue = () => {
  issueFormRef.value.validate(async valid => {
    if (valid) {
      try {
        await issueCoupon(issueForm)
        ElMessage.success('卡券发放成功')
        issueDialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '发券失败')
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
</style>
