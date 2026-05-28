<template>
  <div class="panel">
    <h3>{{ title }}</h3>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: String
})
</script>