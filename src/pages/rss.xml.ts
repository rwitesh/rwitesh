import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site.ts';

export async function GET(context: { site: URL }) {
  const blog = await getCollection('blog');
  const posts = blog
    .filter((post) => import.meta.env.PROD ? post.data.draft !== true : true)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}