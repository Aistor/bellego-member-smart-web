<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">B</div>
        <div>
          <div class="brand-title">Bellego Admin</div>
          <div class="brand-subtitle">会员运营后台</div>
        </div>
      </div>

      <el-scrollbar class="menu-scroll">
        <div v-for="group in navigationGroups" :key="group.title" class="menu-group">
          <div class="group-title">{{ group.title }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="menu-link"
            :class="{ active: route.path === item.path }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </router-link>
        </div>
      </el-scrollbar>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <div class="topbar-title">{{ route.meta.title || '后台管理' }}</div>
        </div>
        <div class="topbar-actions">
          <el-tag type="info" effect="plain">{{ userStore.displayName }}</el-tag>
          <el-dropdown @command="handleCommand">
            <span class="dropdown-trigger">
              账号操作
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <section class="page-body">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { navigationGroups } from '../config/navigation'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command) => {
  if (command !== 'logout') return
  await userStore.logoutAction()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  color: #e2eef8;
  background:
    radial-gradient(circle at top, rgba(45, 212, 191, 0.25), transparent 26%),
    linear-gradient(180deg, #0f172a 0%, #16243f 100%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 10px 22px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  font-weight: 800;
  color: #082f49;
  background: linear-gradient(135deg, #fef08a, #67e8f9);
  border-radius: 16px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(226, 238, 248, 0.72);
}

.menu-scroll {
  flex: 1;
}

.menu-group + .menu-group {
  margin-top: 18px;
}

.group-title {
  padding: 0 10px 10px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: rgba(226, 238, 248, 0.55);
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 12px 14px;
  color: inherit;
  border-radius: 14px;
  transition: 0.2s ease;
}

.menu-link:hover,
.menu-link.active {
  color: #fff;
  background: rgba(148, 163, 184, 0.16);
}

.content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 32px 10px;
}

.topbar-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.topbar-subtitle {
  margin-top: 6px;
  color: #64748b;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #0f172a;
}

.page-body {
  padding: 18px 32px 32px;
}

@media (max-width: 980px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 12px;
  }
}
</style>
