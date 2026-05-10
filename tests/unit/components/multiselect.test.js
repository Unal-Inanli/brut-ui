import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const HTML = `
  <div class="brut-multiselect" data-brut="multiselect" data-brut-name="skills">
    <div class="brut-multiselect__field">
      <input class="brut-multiselect__input" placeholder="Pick skills…">
    </div>
    <ul class="brut-multiselect__list">
      <li class="brut-multiselect__opt" data-value="ux">UX</li>
      <li class="brut-multiselect__opt" data-value="css">CSS</li>
      <li class="brut-multiselect__opt" data-value="js">JS</li>
      <li class="brut-multiselect__empty">No matches.</li>
    </ul>
  </div>
`;

describe('multiselect', () => {
  it('initializes with role and aria contracts', () => {
    const el = mount(HTML);
    const input = el.querySelector('.brut-multiselect__input');
    const list = el.querySelector('.brut-multiselect__list');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(list.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('selecting two options creates two hidden inputs and emits an array', () => {
    const el = mount(HTML);
    const events = captureEvent(el, 'brut:change');
    const opts = el.querySelectorAll('.brut-multiselect__opt');

    opts[0].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    opts[1].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));

    const hiddens = el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]');
    expect(hiddens.length).toBe(2);
    expect(Array.from(hiddens).map((h) => h.value).sort()).toEqual(['css', 'ux']);

    const last = events[events.length - 1];
    expect(Array.isArray(last.detail.value)).toBe(true);
    expect(last.detail.value.slice().sort()).toEqual(['css', 'ux']);
  });

  it('renders chips in the field shell for selected options', () => {
    const el = mount(HTML);
    const opts = el.querySelectorAll('.brut-multiselect__opt');

    opts[0].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    opts[1].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));

    const chips = el.querySelectorAll('.brut-multiselect__chip');
    expect(chips.length).toBe(2);
    expect(Array.from(chips).map((c) => c.getAttribute('data-value')).sort()).toEqual(['css', 'ux']);
  });

  it('removing a chip via the × button updates hidden inputs and emits brut:change', () => {
    const el = mount(HTML);
    const opts = el.querySelectorAll('.brut-multiselect__opt');

    opts[0].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    opts[1].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));

    const events = captureEvent(el, 'brut:change');
    const closeBtn = el.querySelector('.brut-multiselect__chip .brut-tag__x');
    closeBtn.click();

    const remaining = el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]');
    expect(remaining.length).toBe(1);
    expect(events.length).toBeGreaterThanOrEqual(1);
    const last = events[events.length - 1];
    expect(Array.isArray(last.detail.value)).toBe(true);
    expect(last.detail.value.length).toBe(1);
  });

  it('Backspace on empty input removes the last selected option', () => {
    const el = mount(HTML);
    const input = el.querySelector('.brut-multiselect__input');
    el.querySelectorAll('.brut-multiselect__opt')[0].dispatchEvent(
      new window.MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );
    expect(el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]').length).toBe(1);

    input.value = '';
    fireKey(input, 'Backspace');
    expect(el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]').length).toBe(0);
  });

  it('Enter selects the first visible option after typing', () => {
    const el = mount(HTML);
    const input = el.querySelector('.brut-multiselect__input');

    input.value = 'css';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    fireKey(input, 'Enter');

    const hiddens = el.querySelectorAll('input[type="hidden"][data-brut-mirror="1"]');
    expect(hiddens.length).toBe(1);
    expect(hiddens[0].value).toBe('css');
  });
});
