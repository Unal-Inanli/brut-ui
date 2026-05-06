import {
  TOKEN_LAYERS,
  parseTokenFile,
  readTokenLayer,
  writeTokenLayer,
  serializeTokenInsert,
} from '../parse-tokens.js';

export const name = 'add_token';
export const description =
  'Add a new design token to a specific layer and category in the BRUT token files. ' +
  'The token is inserted at the end of the specified category section.';
export const inputSchema = {
  type: 'object',
  required: ['token', 'value', 'layer'],
  properties: {
    token: {
      type: 'string',
      description: 'The CSS custom property name including -- prefix (e.g. "--pop-teal").',
    },
    value: {
      type: 'string',
      description: 'The CSS value (e.g. "#2EE0C8", "var(--ink)").',
    },
    layer: {
      type: 'string',
      enum: ['primitives', 'semantic', 'intent'],
      description: 'Which token layer to add to.',
    },
    category: {
      type: 'string',
      description: 'The section category (e.g. "COLOR", "SPACING"). Must match an existing section header in the target layer.',
    },
    comment: {
      type: 'string',
      description: 'Optional inline comment to add after the value.',
    },
  },
};

const TOKEN_NAME_RE = /^--[\w-]+$/;

export async function handler({ token, value, layer, category, comment } = {}, { root }) {
  if (!token || !TOKEN_NAME_RE.test(token)) {
    throw new Error(`Invalid token name: "${token}". Must start with -- and contain only word characters and hyphens.`);
  }
  if (!value || !value.trim()) {
    throw new Error('The "value" parameter is required and must not be empty.');
  }

  const layerEntry = TOKEN_LAYERS.find((l) => l.layer === layer);
  if (!layerEntry) {
    throw new Error(`Unknown layer: "${layer}". Must be one of: primitives, semantic, intent.`);
  }

  for (const entry of TOKEN_LAYERS) {
    const css = await readTokenLayer(root, entry.file);
    const tokens = parseTokenFile(css);
    if (tokens.some((t) => t.name === token)) {
      throw new Error(`Token "${token}" already exists in ${entry.layer} layer (${entry.file}).`);
    }
  }

  const css = await readTokenLayer(root, layerEntry.file);

  if (!category) {
    const tokens = parseTokenFile(css);
    const categories = [...new Set(tokens.map((t) => t.category))];
    throw new Error(`The "category" parameter is required. Available categories in ${layer}: ${categories.join(', ')}`);
  }

  const updated = serializeTokenInsert(css, token, value, category, comment);
  await writeTokenLayer(root, layerEntry.file, updated);

  return {
    token,
    value,
    layer,
    category,
    file: layerEntry.file,
    comment: comment ?? null,
  };
}
