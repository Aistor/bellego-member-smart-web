import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '工作台', group: 'dashboard', icon: 'House' }
      },
      {
        path: 'member/list',
        name: 'MemberList',
        component: () => import('../views/member/list.vue'),
        meta: { title: '会员列表', group: 'member', icon: 'User' }
      },
      {
        path: 'member/level',
        name: 'MemberLevel',
        component: () => import('../views/member/level.vue'),
        meta: { title: '会员等级', group: 'member', icon: 'Medal' }
      },
      {
        path: 'member/record',
        name: 'MemberRecord',
        component: () => import('../views/member/record.vue'),
        meta: { title: '消费记录', group: 'member', icon: 'Wallet' }
      },
      {
        path: 'marketing/coupon',
        name: 'Coupon',
        component: () => import('../views/marketing/coupon.vue'),
        meta: { title: '优惠券管理', group: 'marketing', icon: 'Ticket' }
      },
      {
        path: 'marketing/member-coupon',
        name: 'MemberCoupon',
        component: () => import('../views/marketing/member-coupon.vue'),
        meta: { title: '会员优惠券', group: 'marketing', icon: 'Present' }
      },
      {
        path: 'marketing/point-rule',
        name: 'PointRule',
        component: () => import('../views/marketing/point-rule.vue'),
        meta: { title: '积分规则', group: 'marketing', icon: 'SetUp' }
      },
      {
        path: 'marketing/point-detail',
        name: 'PointDetail',
        component: () => import('../views/marketing/point-detail.vue'),
        meta: { title: '积分明细', group: 'marketing', icon: 'List' }
      },
      {
        path: 'analysis/rfm',
        name: 'AnalysisRFM',
        component: () => import('../views/analysis/rfm.vue'),
        meta: { title: 'RFM 分析', group: 'analysis', icon: 'PieChart' }
      },
      {
        path: 'analysis/lifecycle',
        name: 'AnalysisLifecycle',
        component: () => import('../views/analysis/lifecycle.vue'),
        meta: { title: '生命周期分析', group: 'analysis', icon: 'TrendCharts' }
      },
      {
        path: 'analysis/storeData',
        name: 'AnalysisBehavior',
        component: () => import('../views/analysis/storeData.vue'),
        meta: { title: '门店数据分析', group: 'analysis', icon: 'DataLine' }
      },
      {
        path: 'system/store',
        name: 'SystemStore',
        component: () => import('../views/system/store.vue'),
        meta: { title: '门店管理', group: 'system', icon: 'Shop' }
      },
      {
        path: 'system/log',
        name: 'SystemLog',
        component: () => import('../views/system/log.vue'),
        meta: { title: '操作日志', group: 'system', icon: 'Document' }
      },
      {
        path: 'system/admin',
        name: 'SystemAdmin',
        component: () => import('../views/system/admin.vue'),
        meta: { title: '管理员管理', group: 'system', icon: 'Avatar' }
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('../views/system/role.vue'),
        meta: { title: '角色管理', group: 'system', icon: 'Lock' }
      },
      {
        path: 'system/permission',
        name: 'SystemPermission',
        component: () => import('../views/system/permission.vue'),
        meta: { title: '权限管理', group: 'system', icon: 'Key' }
      }
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  if (token && to.path === '/login') {
    next('/')
    return
  }

  if (to.meta?.title) {
    document.title = `${to.meta.title} - Bellego 管理台`
  }

  next()
})

export default router
