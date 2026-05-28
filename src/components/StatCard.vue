<template>
  <div class="stat-card">
    <div class="label">{{ title }}</div>
    <div class="value">{{ value }}</div>
    <div class="sub">{{ subText }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  subText: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.label {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.value {
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.sub {
  color: #94a3b8;
  font-size: 13px;
}
</style>