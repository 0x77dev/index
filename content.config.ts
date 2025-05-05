import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.md']
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
          variant: z.enum(['link', 'solid', 'outline', 'soft', 'subtle', 'ghost']).optional(),
          alt: z.string().optional()
        })).optional(),
        image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
        authors: z.array(
          z.object({
            name: z.string().nonempty(),
            to: z.string().nonempty(),
            avatar: z.object({ src: z.string().nonempty().editor({ input: 'media' }) })
          })
        ),
        hide: z.boolean().optional(),
        date: z.date(),
        badge: z.object({ label: z.string().nonempty() }),
        // Schema.org structured data - universal approach
        schemaOrg: z.union([
          // ScholarlyArticle
          z.object({
            type: z.literal('ScholarlyArticle'),
            headline: z.string().optional(),
            datePublished: z.string().optional(),
            abstract: z.string().optional(),
            image: z.string().optional(),
            publisher: z.union([
              z.object({
                type: z.literal('Organization'),
                name: z.string()
              }),
              z.string()
            ]).optional(),
            author: z.array(z.object({
              name: z.string(),
              identifier: z.string().optional(),
              type: z.literal('Person').optional(),
              affiliation: z.string().optional(),
              url: z.string().optional()
            })).optional(),
            keywords: z.array(z.string()).optional(),
            mainEntityOfPage: z.string().optional(),
            sameAs: z.string().optional(),
            citation: z.object({
              type: z.string().optional(),
              name: z.string().optional()
            }).optional()
          }),
          // WebPage (default)
          z.object({
            type: z.literal('WebPage'),
            headline: z.string().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
            datePublished: z.string().optional(),
            dateModified: z.string().optional()
          }),
          // BlogPosting
          z.object({
            type: z.literal('BlogPosting'),
            headline: z.string().optional(),
            author: z.union([
              z.array(z.object({
                type: z.literal('Person').optional(),
                name: z.string(),
                url: z.string().optional()
              })),
              z.object({
                type: z.literal('Person').optional(),
                name: z.string(),
                url: z.string().optional()
              })
            ]).optional(),
            datePublished: z.string().optional(),
            dateModified: z.string().optional(),
            image: z.string().optional(),
            description: z.string().optional()
          })
        ]).optional()
      })
    })
  }
})
