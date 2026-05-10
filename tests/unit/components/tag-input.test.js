import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const HTML = `
  <div class="brut-tag-input" data-brut="tag-input" data-brut-name="tags">
    <input class="brut-tag-input__field" placeholder="Add a tag…">
  </div>
`;

describe('tag-input', () => {
  it('creates a hidden input bound to data-brut-name', () => {
    const el = mount(HTML);
    const hidden = el.querySelector('input[type="hidden"]');
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('tags');
  });

  it('adds a tag on Enter and emits brut:change with the tag list', () => {
    const el = mount(HTML);
    const field = el.querySelector('.brut-tag-input__field');
    const events = captureEvent(el, 'brut:change');

    field.value = 'design';
    fireKey(field, 'Enter');

    const chips = el.querySelectorAll('.brut-tag');
    expect(chips.length).toBe(1);
    expect(chips[0].getAttribute('data-value')).toBe('design');

    const last = events[events.length - 1];
    const list = Array.isArray(last.detail.value) ? last.detail.value : last.detail.tags;
    expect(Array.isArray(list)).toBe(true);
    expect(list).toEqual(['design']);
  });

  it('Backspace on empty field removes the last tag', () => {
    const el = mount(HTML);
    const field = el.querySelector('.brut-tag-input__field');

    field.value = 'one';
    fireKey(field, 'Enter');
    field.value = 'two';
    fireKey(field, 'Enter');
    expect(el.querySelectorAll('.brut-tag').length).toBe(2);

    field.value = '';
    fireKey(field, 'Backspace');
    const remaining = el.querySelectorAll('.brut-tag');
    expect(remaining.length).toBe(1);
    expect(remaining[0].getAttribute('data-value')).toBe('one');
  });

  it('does not add a duplicate tag', () => {
    const el = mount(HTML);
    const field = el.querySelector('.brut-tag-input__field');

    field.value = 'design';
    fireKey(field, 'Enter');
    field.value = 'design';
    fireKey(field, 'Enter');
    expect(el.querySelectorAll('.brut-tag').length).toBe(1);
  });

  it('mirrors comma-joined values into the hidden input', () => {
    const el = mount(HTML);
    const field = el.querySelector('.brut-tag-input__field');
    const hidden = el.querySelector('input[type="hidden"]');

    field.value = 'a';
    fireKey(field, 'Enter');
    field.value = 'b';
    fireKey(field, 'Enter');

    expect(hidden.value).toBe('a,b');
  });

  it('comma key also commits a tag', () => {
    const el = mount(HTML);
    const field = el.querySelector('.brut-tag-input__field');

    field.value = 'css';
    fireKey(field, ',');
    expect(el.querySelectorAll('.brut-tag').length).toBe(1);
    expect(el.querySelector('.brut-tag').getAttribute('data-value')).toBe('css');
  });
});
