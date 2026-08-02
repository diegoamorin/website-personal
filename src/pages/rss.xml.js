import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByPublishedAt } from '../lib/format';

export async function GET(context) {
  const posts = sortByPublishedAt(await getCollection('blog'));
  return rss({
    title: 'Blog de Diego Amorin',
    description: 'Artículos sobre desarrollo web, diseño UX/UI, Astro, JavaScript y WordPress.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/${post.id}/`,
      categories: post.data.categories,
    })),
  });
}
