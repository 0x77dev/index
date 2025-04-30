<template>
  <UDropdownMenu
    v-slot="{ open }"
    :modal="false"
    :items="[{
      label: 'Website',
      to: 'https://0x77.dev'
    }, {
      label: 'CV',
      to: 'https://cv.0x77.dev'
    }, {
      label: 'Index',
      to: 'https://docs-template.nuxt.dev/',
      color: 'primary',
      checked: true,
      type: 'checkbox'
    }, {
      label: 'Socials',
      to: 'https://mykhailo.link/'
    }]"
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-0' }"
    size="xs"
  >
    <UButton
      label="Index"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      size="xs"
      class="-mb-[6px] font-semibold rounded-full truncate"
      :class="[open && 'bg-primary/15']"
      :ui="{
        trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
      }"
    />
  </UDropdownMenu>
</template>
