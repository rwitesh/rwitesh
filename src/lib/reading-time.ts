import getReadingTime, { type ReadTimeResults } from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime(): import('unified').Transformer {
  return function (tree, file) {
    const text = toString(tree as any);
    const stats = getReadingTime(text);
    const data = file.data as { astro?: { frontmatter?: Record<string, any> } };
    if (!data.astro) {
      data.astro = {};
    }
    if (!data.astro.frontmatter) {
      data.astro.frontmatter = {};
    }
    data.astro.frontmatter.minutesRead = stats.text;
  };
}

export function getReadingTimeFromText(text: string): string {
  const stats: ReadTimeResults = getReadingTime(text);
  return stats.text;
}