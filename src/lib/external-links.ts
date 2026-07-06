import { visit } from 'unist-util-visit';

export function rehypeExternalLinks() {
  return function (tree) {
    visit(tree, 'element', function (node) {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (!href || typeof href !== 'string') return;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
}