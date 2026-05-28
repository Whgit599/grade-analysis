<template>
  <div id="app" class="app-container">
    <HeaderNav v-if="showHeader" />
    <main class="main-content" :class="{ 'main-content-login': !showHeader }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import HeaderNav from './components/HeaderNav.vue'

const route = useRoute()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const showHeader = computed(() => route.path !== '/login')

provide('user', user)
</script>

<style>
.main-content-login {
  width: 100%;
  max-width: none;
  padding: 0;
}
</style>
