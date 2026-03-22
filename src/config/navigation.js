export const navigationGroups = [
  {
    title: '工作台',
    items: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        title: '概览',
        icon: 'House'
      }
    ]
  },
  {
    title: '会员管理',
    items: [
      {
        path: '/member/list',
        name: 'MemberList',
        title: '会员列表',
        icon: 'User'
      },
      {
        path: '/member/level',
        name: 'MemberLevel',
        title: '会员等级',
        icon: 'Medal'
      },
      {
        path: '/member/record',
        name: 'MemberRecord',
        title: '消费记录',
        icon: 'Tickets'
      }
    ]
  },
  {
    title: '营销中心',
    items: [
      {
        path: '/marketing/coupon',
        name: 'Coupon',
        title: '优惠券',
        icon: 'Ticket'
      },
      {
        path: '/marketing/member-coupon',
        name: 'MemberCoupon',
        title: '会员优惠券',
        icon: 'Present'
      },
      {
        path: '/marketing/point-rule',
        name: 'PointRule',
        title: '积分规则',
        icon: 'Coin'
      },
      {
        path: '/marketing/point-detail',
        name: 'PointDetail',
        title: '积分明细',
        icon: 'List'
      }
    ]
  },
  {
    title: '会员分析',
    items: [
      {
        path: '/analysis/rfm',
        name: 'AnalysisRfm',
        title: 'RFM 分析',
        icon: 'PieChart'
      },
      {
        path: '/analysis/lifecycle',
        name: 'AnalysisLifecycle',
        title: '生命周期',
        icon: 'DataAnalysis'
      },
      {
        path: '/analysis/behavior',
        name: 'AnalysisBehavior',
        title: '消费行为',
        icon: 'TrendCharts'
      }
    ]
  },
  {
    title: '系统管理',
    items: [
      {
        path: '/system/store',
        name: 'SystemStore',
        title: '门店管理',
        icon: 'Shop'
      },
      {
        path: '/system/log',
        name: 'SystemLog',
        title: '操作日志',
        icon: 'Document'
      },
      {
        path: '/system/admin',
        name: 'SystemAdmin',
        title: '管理员',
        icon: 'Avatar'
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        title: '角色管理',
        icon: 'Lock'
      },
      {
        path: '/system/permission',
        name: 'SystemPermission',
        title: '权限管理',
        icon: 'Key'
      }
    ]
  }
]
