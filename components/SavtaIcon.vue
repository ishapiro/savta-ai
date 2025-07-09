<template>
  <span :class="iconClass">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#FFF0F6" stroke="#E75480" stroke-width="3"/>
      <!-- Curly Hair (series of small circles above the face) -->
      <circle cx="16" cy="12" r="3" fill="#F8BBD0" stroke="#E75480" stroke-width="1.2"/>
      <circle cx="24" cy="10" r="3.2" fill="#F8BBD0" stroke="#E75480" stroke-width="1.2"/>
      <circle cx="32" cy="12" r="3" fill="#F8BBD0" stroke="#E75480" stroke-width="1.2"/>
      <circle cx="20" cy="14" r="2.2" fill="#F8BBD0" stroke="#E75480" stroke-width="1.2"/>
      <circle cx="28" cy="14" r="2.2" fill="#F8BBD0" stroke="#E75480" stroke-width="1.2"/>
      <!-- Face -->
      <ellipse cx="24" cy="26" rx="12" ry="11" fill="#FFF" stroke="#E75480" stroke-width="2"/>
      <!-- Glasses -->
      <circle cx="17" cy="27" r="4" fill="none" stroke="#E75480" stroke-width="2"/>
      <circle cx="31" cy="27" r="4" fill="none" stroke="#E75480" stroke-width="2"/>
      <rect x="21" y="26" width="6" height="2" fill="#E75480"/>
      <!-- Eyes -->
      <circle cx="17" cy="27" r="1.2" fill="#E75480"/>
      <circle cx="31" cy="27" r="1.2" fill="#E75480"/>
      <!-- Smile -->
      <path d="M19 32 Q24 36 29 32" stroke="#E75480" stroke-width="2" fill="none"/>
    </svg>
  </span>
</template>

<script setup>
defineProps({
  iconClass: {
    type: String,
    default: ''
  }
})
</script> 