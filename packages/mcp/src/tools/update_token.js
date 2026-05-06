import {
  TOKEN_LAYERS,
  parseTokenFile,
  readTokenLayer,
  writeTokenLayer,
  serializeTokenUpdate,
} from '../parse-tokens.js';

export const name = 'update_token';
export const description =
  'Update the value of an existing BRUT design token in its source CSS file. ' +
  'Returns the old and new values for confirmation. The change takes effect after rebuild.';
export const inputSchema = {
  type: 'object',
  required: ['token', 'value'],
  properties: {
    token: {
      type: 'string',
      description: 'The CSS custom property name including the -- prefix (e.g. "--primary", "--sp-4", "--shadow-sm").',
    },
    value: {
      type: 'string',
      description: 'The new CSS value (e.g. "#FF0000", "20px", "var(--ink)").',
    },
  },
};

const TOKEN_NAME_RE = /^--[\w-]+$/;

export async function handler({ token, value } = {}, { root }) {
  if (!token || !TOKEN_NAME_RE.test(token)) {
    throw new Error(`Invalid token name: "${token}". Must start with -- and contain only word characters and hyphens.`);
  }
  if (!value || !value.trim()) {
    throw new Error('The "value" parameter is required and must not be empty.');
  }

  for (const entry of TOKEN_LAYERS) {
    const css = await readTokenLayer(root, entry.file);
    const tokens = parseTokenFile(css);
    const match = tokens.find((t) => t.name === token);

    if (!match) continue;

    let warning = null;
    if (entry.layer === 'primitives' && value.includes('var(')) {
      warning = 'Primitive tokens should be raw values, not var() references. Consider placing this in the semantic layer instead.';
    }
    if (entry.layer === 'semantic' && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())) {
      warning = 'Semantic tokens should reference primitives via var(). Consider adding a primitive first, then referencing it here.';
    }

    const updated = serializeTokenUpdate(css, token, value);
    await writeTokenLayer(root, entry.file, updated);

    return {
      token,
      layer: entry.layer,
      category: match.category,
      file: entry.file,
      oldValue: match.value,
      newValue: value,
      warning,
    };
  }

  throw new Error(`Unknown token: "${token}". Use list_tokens to discover available tokens.`);
}
