<template>
  <header class="header">
    <div class="nav-wrapper">
      <div class="logo">成绩分析系统</div>

      <div class="nav-actions" v-if="user">
        <nav class="nav-links">
          <RouterLink to="/" class="nav-item">首页</RouterLink>
          <RouterLink to="/scores" class="nav-item">成绩管理</RouterLink>
          <RouterLink to="/analysis" class="nav-item">分析页面</RouterLink>
          <div class="settings-container" @mouseenter="openMenu" @mouseleave="scheduleClose">
            <button class="nav-item settings-btn" aria-label="设置">
              <span class="gear">⚙</span>
            </button>
            <div class="settings-menu" v-if="menuOpen" @mouseenter="openMenu" @mouseleave="scheduleClose">
              <div class="settings-item">
                <span class="label">当前用户</span>
                <span>{{ user.username }} ({{ user.role === 'manager' ? '管理者' : '普通用户' }})</span>
              </div>
              <button @click="logout" class="logout-btn">登出</button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { inject, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const user = inject('user', ref(null))
const router = useRouter()
const menuOpen = ref(false)
let closeTimer = null

const openMenu = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  menuOpen.value = true
}

const closeMenu = () => {
  menuOpen.value = false
  closeTimer = null
}

const scheduleClose = () => {
  if (closeTimer) return
  closeTimer = setTimeout(closeMenu, 120)
}

const logout = () => {
  closeMenu()
  user.value = null
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: #ffffff;
  color: #0f172a;
  padding: 16px 0;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(12px);
}

.nav-wrapper {
  width: 1100px;
  max-width: 92%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: #102a43;
}

.nav-links {
  display: flex;
  gap: 14px;
  align-items: center;
}

.nav-item {
  color: #475569;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.08);
  transition: transform 0.22s ease, background-color 0.22s ease, color 0.22s ease,
    box-shadow 0.22s ease;
}

.nav-item:hover,
.router-link-active {
  color: #0f172a;
  background: rgba(59, 130, 246, 0.16);
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.nav-actions {
  position: relative;
}

.settings-btn {
  width: 40px;
  height: 40px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.gear {
  font-size: 1rem;
  line-height: 1;
}

.settings-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 220px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
  z-index: 10;
}

.settings-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
  color: #e2e8f0;
}

.settings-item .label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.logout-btn {
  width: 100%;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.6rem 0;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
