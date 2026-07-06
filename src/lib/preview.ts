const FRONTMATTER_RE = /^---[\s\S]*?---\s*/;

export function generatePreview(body: string, maxLen = 150): string {
  const withoutFm = body.replace(FRONTMATTER_RE, '');

  let text = withoutFm
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLen) return text;

  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace < maxLen * 0.6) {
    return text.slice(0, maxLen).trim() + '\u2026';
  }
  return slice.slice(0, lastSpace).trim() + '\u2026';
}