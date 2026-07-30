import { visit } from 'unist-util-visit';

const HEADING_TAGS = new Set(['h2', 'h3', 'h4']);

export function rehypeHeadingAnchors() {
  return function (tree: any) {
    visit(tree, 'element', function (node) {
      if (!HEADING_TAGS.has(node.tagName)) return;

      const id = node.properties?.id;
      if (!id || typeof id !== 'string') return;

      node.children.push({
        type: 'element',
        tagName: 'a',
        properties: {
          className: ['heading-anchor'],
          href: `#${id}`,
          ariaLabel: 'Link to section',
        },
        children: [{ type: 'text', value: '#' }],
      });
    });
  };
}
