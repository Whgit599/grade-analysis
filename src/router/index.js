import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScoresView from '../views/ScoresView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/', name: 'Home', component: HomeView },
  { path: '/scores', name: 'Scores', component: ScoresView },
  { path: '/analysis', name: 'Analysis', component: AnalysisView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (to.path !== '/login' && !user) return '/login'
  if (to.path === '/login' && user) return '/'
})

export default router
