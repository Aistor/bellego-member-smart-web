<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">优惠券管理</h2>
        <p class="page-subtitle">维护优惠券模板并支持定向发放或全量发放。</p>
      </div>
      <el-button type="primary" @click="openDialog()">新增优惠券</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="优惠券名称" clearable style="width: 220px" />
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 140px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border>
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="type" label="类型" min-width="90" />
      <el-table-column prop="couponValue" label="优惠值" min-width="100" />
      <el-table-column prop="useCondition" label="使用门槛" min-width="100" />
      <el-table-column prop="stock" label="库存" min-width="90" />
      <el-table-column prop="totalIssued" label="已发放" min-width="90" />
      <el-table-column prop="startTime" label="开始时间" min-width="180" />
      <el-table-column prop="endTime" label="结束时间" min-width="180" />
      <el-table-column label="状态" min-width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="(value) => changeStatus(row, value)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="190">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="success" @click="openIssueDialog(row)">发放</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑优惠券' : '新增优惠券'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型" prop="type"><el-input-number v-model="form.type" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="优惠值" prop="couponValue"><el-input-number v-model="form.couponValue" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="使用门槛"><el-input-number v-model="form.useCondition" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="库存" prop="stock"><el-input-number v-model="form.stock" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="issueDialogVisible" title="发放优惠券" width="520px">
      <el-form :model="issueForm" label-width="110px">
        <el-form-item label="发放方式">
          <el-radio-group v-model="issueForm.issueAll">
            <el-radio :value="true">全部启用会员</el-radio>
            <el-radio :value="false">指定会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="会员 ID 列表" v-if="!issueForm.issueAll">
          <el-select v-model="issueForm.memberIds" multiple filterable allow-create default-first-option style="width: 100%" placeholder="输入会员 ID 后回车">
            <el-option v-for="id in issueForm.memberIds" :key="id" :label="id" :value="id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="issuing" @click="submitIssue">确认发放</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  issueCoupon,
  updateCoupon,
  updateCouponStatus
} from '../../api/marketing'
import { normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const issuing = ref(false)
const dialogVisible = ref(false)
const issueDialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const issueId = ref('')
const rows = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const createDefaultForm = () => ({
  name: '',
  type: 1,
  couponValue: 0,
  useCondition: 0,
  stock: 1,
  startTime: '',
  endTime: '',
  status: 1
})

const form = reactive(createDefaultForm())
const issueForm = reactive({
  issueAll: true,
  memberIds: []
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入类型', trigger: 'change' }],
  couponValue: [{ required: true, message: '请输入优惠值', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getCoupons(query)
    const page = normalizePageData(response.data)
    rows.value = page.records
    total.value = page.total
  } finally {
    loading.value = false
  }
}

const search = () => {
  query.pageNum = 1
  loadData()
}

const reset = () => {
  Object.assign(query, { pageNum: 1, pageSize: 10, keyword: '', status: undefined })
  loadData()
}

const openDialog = (row) => {
  editingId.value = row?.id || ''
  Object.assign(form, createDefaultForm(), row || {})
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateCoupon(editingId.value, form)
      ElMessage.success('优惠券已更新')
    } else {
      await createCoupon(form)
      ElMessage.success('优惠券已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const openIssueDialog = (row) => {
  issueId.value = row.id
  issueForm.issueAll = true
  issueForm.memberIds = []
  issueDialogVisible.value = true
}

const submitIssue = async () => {
  issuing.value = true
  try {
    await issueCoupon(issueId.value, {
      issueAll: issueForm.issueAll,
      memberIds: issueForm.issueAll ? [] : issueForm.memberIds
    })
    ElMessage.success('发放成功')
    issueDialogVisible.value = false
    loadData()
  } finally {
    issuing.value = false
  }
}

const changeStatus = async (row, status) => {
  await updateCouponStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除优惠券', { type: 'warning' })
  await deleteCoupon(id)
  ElMessage.success('优惠券已删除')
  loadData()
}

onMounted(loadData)
</script>
