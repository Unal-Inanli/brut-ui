export const name = 'list_components';
export const description = 'List all BRUT components by name, kind, and one-line description.';
export const inputSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['interactive', 'static'] },
  },
};

export async function handler({ kind } = {}, { manifest }) {
  let components = manifest.components ?? [];
  if (kind) components = components.filter((c) => c.kind === kind);
  return components.map((c) => ({
    name: c.name,
    kind: c.kind,
    description: c.description ?? null,
    class: c.class,
  }));
}
