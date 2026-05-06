import { TOKEN_LAYERS, parseTokenFile, readTokenLayer } from '../parse-tokens.js';

export const name = 'list_tokens';
export const description =
  'List all BRUT design tokens grouped by layer (primitives, semantic, intent) and category. ' +
  'Returns token names, current values, and inline comments. Use this to discover available tokens before updating.';
export const inputSchema = {
  type: 'object',
  properties: {
    layer: {
      type: 'string',
      enum: ['primitives', 'semantic', 'intent'],
      description: 'Filter to a single token layer. Omit to list all layers.',
    },
    category: {
      type: 'string',
      description: 'Filter by category name (e.g. "COLOR", "SPACING", "SHADOW SYSTEM"). Case-insensitive.',
    },
  },
};

export async function handler({ layer, category } = {}, { root }) {
  const layers = layer
    ? TOKEN_LAYERS.filter((l) => l.layer === layer)
    : TOKEN_LAYERS;

  const result = [];

  for (const entry of layers) {
    const css = await readTokenLayer(root, entry.file);
    let tokens = parseTokenFile(css);

    if (category) {
      const needle = category.toLowerCase();
      tokens = tokens.filter((t) => t.category.toLowerCase().includes(needle));
    }

    const categories = new Map();
    for (const t of tokens) {
      if (!categories.has(t.category)) categories.set(t.category, []);
      categories.get(t.category).push({ name: t.name, value: t.value, comment: t.comment });
    }

    result.push({
      layer: entry.layer,
      file: entry.file,
      description: entry.description,
      categories: [...categories.entries()].map(([name, tokens]) => ({ name, tokens })),
    });
  }

  return { layers: result };
}
