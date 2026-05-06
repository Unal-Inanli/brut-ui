export const name = 'list_utilities';
export const description =
  'List available utility CSS classes by category (display, flex, spacing, text, color, etc.). ' +
  'Use this to discover layout and styling utilities beyond component classes.';
export const inputSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      description:
        'Filter by category name (e.g. "justify-content", "margin", "gap"). ' +
        'Omit to list all categories with their descriptions.',
    },
  },
};

export async function handler({ category } = {}, manifest) {
  const utilities = manifest.utilities ?? [];

  if (!category) {
    return {
      breakpoints: manifest.breakpoints ?? {},
      categories: utilities.map((u) => ({
        category: u.category,
        description: u.description,
        classCount: u.classes.length,
        responsive: u.responsive ?? false,
      })),
    };
  }

  const match = utilities.find(
    (u) => u.category === category || u.category.includes(category),
  );
  if (!match) {
    const available = utilities.map((u) => u.category).join(', ');
    throw new Error(
      `Unknown utility category: "${category}". Available: ${available}`,
    );
  }
  return {
    ...match,
    breakpoints: match.responsive ? (manifest.breakpoints ?? {}) : undefined,
  };
}
