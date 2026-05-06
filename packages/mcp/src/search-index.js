// Inverted keyword index over components and utilities.
// Built lazily on first `suggest_component` call, then cached in memory.

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'be', 'to', 'of', 'and', 'in',
  'that', 'it', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'or',
  'this', 'which', 'but', 'not', 'its', 'can', 'has', 'had', 'do', 'does',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function buildIndex(manifest) {
  const index = new Map();

  function addEntry(words, entry) {
    for (const word of words) {
      if (!index.has(word)) index.set(word, []);
      index.get(word).push(entry);
    }
  }

  for (const comp of manifest.components ?? []) {
    const texts = [
      comp.description || '',
      ...(comp.useCases || []),
      comp.notes || '',
      comp.name || '',
    ];
    const words = tokenize(texts.join(' '));
    addEntry(words, {
      type: 'component',
      name: comp.name,
      class: comp.class,
      kind: comp.kind,
      description: comp.description || null,
      htmlElements: comp.htmlElements || null,
      modifiers: comp.modifiers || null,
      notes: comp.notes || null,
      examples: comp.examples || null,
    });
  }

  for (const util of manifest.utilities ?? []) {
    const words = tokenize(
      [util.category, util.description, util.notes || ''].join(' '),
    );
    addEntry(words, {
      type: 'utility',
      category: util.category,
      description: util.description,
      classes: util.classes,
      responsive: util.responsive,
      pattern: util.pattern || null,
    });
  }

  return index;
}

export function search(index, intent, maxResults = 5) {
  const queryWords = tokenize(intent);
  if (queryWords.length === 0) return [];

  const scores = new Map();

  for (const word of queryWords) {
    const entries = index.get(word);
    if (!entries) continue;
    for (const entry of entries) {
      const key = entry.type === 'component' ? `c:${entry.name}` : `u:${entry.category}`;
      scores.set(key, (scores.get(key) || 0) + 1);
      if (!scores.has(key + ':entry')) scores.set(key + ':entry', entry);
    }
  }

  const results = [];
  for (const [key, score] of scores) {
    if (key.endsWith(':entry')) continue;
    results.push({ score, entry: scores.get(key + ':entry') });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults).map((r) => r.entry);
}
