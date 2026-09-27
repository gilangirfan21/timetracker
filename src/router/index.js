import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    { path: '/', name: 'records', component: () => import('@/views/RecordsView.vue') },
    { path: '/timer', name: 'timer', component: () => import('@/views/HomeView.vue') },
    { path: '/records', redirect: '/' },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/activities', name: 'activities', component: () => import('@/views/ActivitiesView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'records' }
  }
})

export default router
