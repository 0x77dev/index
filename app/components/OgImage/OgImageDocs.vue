<script setup>
defineProps({
  title: { type: String, required: false, default: 'title' },
  logo: { type: String, required: false, default: '/favicon.svg' }
})
</script>

<template>
  <div
    class="h-full w-full flex flex-col justify-between p-16"
    style="background: radial-gradient(ellipse at center -20%, #333333 0%, #0D0D0D 40%, #000000 100%)"
  >
    <!-- Top section with logo -->
    <div class="mx-24 mt-12">
      <img
        :src="logo"
        width="128"
      >
    </div>

    <!-- Bottom section with title -->
    <div class="mx-24">
      <h1
        class="block text-[48px] text-white font-bold text-left"
      >
        {{ title }}
      </h1>
    </div>
  </div>
</template>
