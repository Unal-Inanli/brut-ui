export const name = 'list_themes';
export const description = 'List built-in BRUT themes.';
export const inputSchema = { type: 'object', properties: {} };

export async function handler(_args, { manifest }) {
  return manifest.themes ?? [];
}
