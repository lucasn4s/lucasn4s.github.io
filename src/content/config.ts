import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEm: z.string().optional(),
    locale: z.enum(['en', 'pt']),
    image: z.string().url().optional(),
    stack: z.array(z.string()),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.string().optional(),
        type: z.enum(['live', 'repo', 'article', 'confidential']),
      })
    ),
    order: z.number(),
  }),
});

export const collections = { projects };
