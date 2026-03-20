import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/index.vue'), meta: { title: '概览' } },
      { path: 'member/list', name: 'MemberList', component: () => import('../views/member/list.vue'), meta: { title: '会员列表' } },
      { path: 'member/level', name: 'MemberLevel', component: () => import('../views/member/level.vue'), meta: { title: '会员等级' } },
      { path: 'member/record', name: 'MemberRecord', component: () => import('../views/member/record.vue'), meta: { title: '消费记录' } },
      { path: 'marketing/coupon', name: 'Coupon', component: () => import('../views/marketing/coupon.vue'), meta: { title: '优惠券' } },
      { path: 'marketing/member-coupon', name: 'MemberCoupon', component: () => import('../views/marketing/member-coupon.vue'), meta: { title: '会员优惠券' } },
      { path: 'marketing/point-rule', name: 'PointRule', component: () => import('../views/marketing/point-rule.vue'), meta: { title: '积分规则' } },
      { path: 'marketing/point-detail', name: 'PointDetail', component: () => import('../views/marketing/point-detail.vue'), meta: { title: '积分明细' } },
      { path: 'analysis/rfm', name: 'AnalysisRfm', component: () => import('../views/analysis/rfm.vue'), meta: { title: 'RFM 分析' } },
      { path: 'analysis/lifecycle', name: 'AnalysisLifecycle', component: () => import('../views/analysis/lifecycle.vue'), meta: { title: '生命周期分析' } },
      { path: 'analysis/behavior', name: 'AnalysisBehavior', component: () => import('../views/analysis/behavior.vue'), meta: { title: '消费行为分析' } },
      { path: 'system/store', name: 'SystemStore', component: () => import('../views/system/store.vue'), meta: { title: '门店管理' } },
      { path: 'system/log', name: 'SystemLog', component: () => import('../views/system/log.vue'), meta: { title: '操作日志' } },
      { path: 'system/admin', name: 'SystemAdmin', component: () => import('../views/system/admin.vue'), meta: { title: '管理员' } },
      { path: 'system/role', name: 'SystemRole', component: () => import('../views/system/role.vue'), meta: { title: '角色管理' } },
      { path: 'system/permission', name: 'SystemPermission', component: () => import('../views/system/permission.vue'), meta: { title: '权限管理' } }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }
  if (token && to.path === '/login') {
    next('/dashboard')
    return
  }
  next()
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '后台管理'} - Bellego 管理后台`
})

export default router
