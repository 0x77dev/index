<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useSchemaOrg } from '#imports'
import { findPageHeadline } from '#ui-pro/utils/content'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
//   return queryCollectionItemSurroundings('docs', route.path, {
//     fields: ['description']
//   })
// })

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ...(page.value.ogImage && {
    ogImage: page.value.ogImage,
    twitterImage: page.value.ogImage,
    twitterImageAlt: page.value.title
  })
})

// Add Schema.org structured data if it exists in the frontmatter
if (page.value.schemaOrg) {
  useSchemaOrg([page.value.schemaOrg])
}

const headline = computed(() => findPageHeadline(navigation?.value, page.value))

if (!page.value.ogImage) {
  defineOgImageComponent('Docs', {
    headline: headline.value
  })
}

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  // Cast to acceptable variant types
  const bottomLinks = (toc?.bottom?.links || []).map((link) => {
    if (link.variant && !['link', 'solid', 'outline', 'soft', 'subtle', 'ghost'].includes(link.variant)) {
      return { ...link, variant: 'link' as const }
    }
    return { ...link, variant: link.variant as 'link' | 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | undefined }
  })

  return [...links, ...bottomLinks].filter(Boolean)
})
</script>

<template>
  <UPage v-if="page">
    <div class="border-b border-default py-8">
      <div v-if="headline" class="mb-2.5 text-sm font-semibold text-primary flex items-center gap-1.5">
        {{ headline }}
      </div>
      <div>
        <h1 class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted mb-4">
          {{ page.title }}
        </h1>
        <div class="links w-full">
          <div v-if="page.links" class="flex flex-wrap items-center gap-1.5">
            <slot v-for="(link, i) in page.links" :key="i" name="link" :link="link">
              <UButton v-bind="link" />
            </slot>
          </div>
        </div>
        <div v-if="page.description" class="text-lg text-pretty text-muted mt-4">
          {{ page.description }}
        </div>
      </div>
    </div>

    <UPageBody>
      <ContentRenderer v-if="page" :value="page" />

      <!-- <USeparator v-if="surround?.length" /> -->

      <!-- <UContentSurround :surround="surround" /> -->
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :title="toc?.title" :links="page.body?.toc?.links">
        <template v-if="toc?.bottom" #bottom>
          <div class="hidden lg:block space-y-6" :class="{ '!mt-6': page.body?.toc?.links?.length }">
            <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

            <UPageLinks :title="toc.bottom.title" :links="links" />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
