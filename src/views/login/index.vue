<template>
  <div class="login-page">
    <div class="hero">
      <p class="eyebrow">Bellego Membership System</p>
      <h1>管理端登录</h1>
      <p class="hero-text">
        已按接口文档切换为真实后端登录流程，登录成功后会写入 token、管理员信息和权限列表。
      </p>
    </div>

    <el-card class="login-card">
      <template #header>
        <div>
          <div class="card-title">欢迎回来</div>
          <div class="card-subtitle">请输入管理员账号密码</div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="例如：admin" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" class="submit" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.loginAction(form)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1.2fr 420px;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
  gap: 40px;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.2), transparent 26%),
    linear-gradient(135deg, #0f172a 0%, #14324b 45%, #f8fafc 45%, #f8fafc 100%);
}

.hero {
  padding: 20px;
  color: white;
}

.eyebrow {
  margin: 0 0 14px;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}

.hero h1 {
  margin: 0;
  font-size: 56px;
  line-height: 1.05;
}

.hero-text {
  max-width: 520px;
  margin-top: 18px;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.login-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.card-title {
  font-size: 24px;
  font-weight: 700;
}

.card-subtitle {
  margin-top: 6px;
  color: #64748b;
}

.submit {
  width: 100%;
  margin-top: 10px;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
    background: linear-gradient(180deg, #0f172a 0%, #14324b 38%, #f8fafc 38%, #f8fafc 100%);
  }

  .hero h1 {
    font-size: 40px;
  }
}
</style>
