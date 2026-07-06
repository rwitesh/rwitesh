import getReadingTime, { type ReadTimeStats } from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime(): import('unified').Transformer {
  return function (tree, file) {
    const text = toString(tree as any);
    const stats = getReadingTime(text);
    file.data.astro.frontmatter.minutesRead = stats.text;
  };
}

export function getReadingTimeFromText(text: string): string {
  const stats: ReadTimeStats = getReadingTime(text);
  return stats.text;
}