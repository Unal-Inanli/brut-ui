import { buildIndex, search } from '../search-index.js';

export const name = 'suggest_component';
export const description =
  'Given a UI intent (e.g. "center content", "large heading", "body text", "card grid"), ' +
  'return recommended BRUT classes with usage examples. Searches component descriptions, ' +
  'use cases, and utility categories to find the best match.';
export const inputSchema = {
  type: 'object',
  required: ['intent'],
  properties: {
    intent: {
      type: 'string',
      description: 'A short description of what you want to achieve (e.g. "center items horizontally", "hero title", "vertical spacing between elements").',
    },
  },
};

let cachedIndex = null;

export async function handler({ intent } = {}, { manifest }) {
  if (!intent) throw new Error('The "intent" parameter is required.');

  if (!cachedIndex) cachedIndex = buildIndex(manifest);

  const results = search(cachedIndex, intent, 6);

  if (results.length === 0) {
    return {
      suggestions: [],
      hint: 'No matches found. Try different keywords describing the visual/layout result you want.',
    };
  }

  return {
    suggestions: results.map((entry) => {
      if (entry.type === 'component') {
        return {
          type: 'component',
          name: entry.name,
          class: entry.class,
          description: entry.description,
          htmlElements: entry.htmlElements,
          modifiers: entry.modifiers,
          notes: entry.notes,
          examples: entry.examples,
        };
      }
      return {
        type: 'utility',
        category: entry.category,
        description: entry.description,
        classes: entry.classes,
        responsive: entry.responsive,
        pattern: entry.pattern,
      };
    }),
  };
}
