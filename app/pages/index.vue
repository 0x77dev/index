<script setup lang="ts">
const route = useRoute()

const { data: posts } = await useAsyncData(route.path, () => queryCollection('docs').where('extension', '=', 'md').where('hide', 'IS NULL').limit(25).all())

const title = 'Index'
const description = 'Index is my personal knowledge repository where I document technical findings, research, my work, the work of others, and other useful information. This project serves two purposes: to organize my own learning and to share practical knowledge with the broader community.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Docs')
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
      class="py-[50px]"
    />

    <UPageBody>
      <UBlogPosts>
        <UBlogPost
          v-for="(post, index) in posts"
          :key="index"
          :to="post.path"
          :title="post.title"
          :description="post.description"
          :image="post.image || { src: `/__og-image__/image${post.path}/og.png?gen=1`, provider: null }"
          :date="new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })"
          :authors="post.authors"
          :badge="post.badge"
          orientation="horizontal"
          class="col-span-full"
          variant="naked"
          :ui="{
            description: 'line-clamp-2'
          }"
        />
      </UBlogPosts>
    </UPageBody>
  </UPage>
</template>
