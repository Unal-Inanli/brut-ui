export const name = 'get_component';
export const description = 'Return the full manifest entry for a single BRUT component.';
export const inputSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
  },
};

export async function handler({ name } = {}, { manifest }) {
  const entry = (manifest.components ?? []).find((c) => c.name === name);
  if (!entry) throw new Error(`Unknown component: ${name}`);
  return entry;
}
