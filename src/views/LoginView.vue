<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="brand-badge">📊</div>
        <div>
          <h1>成绩分析系统</h1>
          <p>欢迎登录，快速查看成绩与分析结果</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="field-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <button type="submit" class="login-btn">登录</button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import apiModule from '../api'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const user = inject('user')

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    // 删掉中间多余的 .api
    const result = await apiModule.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(user.value))
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '网络错误，请稍后重试'
    console.error(error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.login-container::before,
.login-container::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.35;
}

.login-container::before {
  width: 340px;
  height: 340px;
  background: rgba(255, 255, 255, 0.85);
  top: -80px;
  left: -80px;
}

.login-container::after {
  width: 420px;
  height: 420px;
  background: rgba(255, 255, 255, 0.8);
  bottom: -100px;
  right: -90px;
}

.login-card {
  width: clamp(320px, 90vw, 500px);
  padding: 2.2rem;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 90px rgba(32, 41, 71, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 34px 108px rgba(32, 41, 71, 0.16);
}

.login-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand-badge {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3f83ff, #2ab7ff);
  color: white;
  box-shadow: 0 12px 24px rgba(63, 131, 255, 0.2);
}

.login-header h1 {
  margin: 0;
  font-size: 1.55rem;
  color: #1f2a47;
}

.login-header p {
  margin: 0.35rem 0 0;
  color: #5d6d8d;
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: 1rem;
}

.field-group {
  display: grid;
  gap: 0.5rem;
}

label {
  color: #4c5b77;
  font-size: 0.95rem;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  border: 1px solid #e3e9f6;
  background: #f7f8fc;
  color: #2b3754;
  font-size: 0.98rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #6e9dfa;
  box-shadow: 0 0 0 4px rgba(110, 157, 250, 0.15);
  background: #ffffff;
}

.login-btn {
  width: 100%;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #3f83ff, #2ab7ff);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 14px 28px rgba(63, 131, 255, 0.18);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(63, 131, 255, 0.22);
}

.error {
  margin: 0;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  background: #fff0f0;
  color: #d83939;
  font-size: 0.95rem;
  text-align: center;
}
</style>