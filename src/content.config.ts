import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\/index\.(?:md|mdx)$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().default(''),
      categories: z.array(z.string()).default([]),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      startedAt: z.coerce.date(),
      category: z.string(),
      technologies: z.array(z.string()).default([]),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().default(''),
      projectUrl: z.url().optional(),
      projectUrlStatus: z.enum(['active', 'inactive']),
      client: z.object({
        name: z.string(),
        role: z.string(),
        image: image().optional(),
        testimonial: z.string().optional(),
      }),
    }),
});

export const collections = { blog, projects };
