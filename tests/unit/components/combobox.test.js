import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const HTML = `
  <div class="brut-combobox" data-brut="combobox" data-brut-name="city">
    <input class="brut-input" type="text" placeholder="City…">
    <input type="hidden" name="city">
    <ul class="brut-combobox__list">
      <li class="brut-combobox__opt" data-value="nyc">New York</li>
      <li class="brut-combobox__opt" data-value="ber">Berlin</li>
      <li class="brut-combobox__opt" data-value="tok">Tokyo</li>
      <li class="brut-combobox__empty">No matches.</li>
    </ul>
  </div>
`;

describe('combobox', () => {
  it('initializes with role and aria contracts', () => {
    const el = mount(HTML);
    const input = el.querySelector('input[type="text"]');
    const list = el.querySelector('.brut-combobox__list');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('filtering hides non-matching options and shows the empty state', () => {
    const el = mount(HTML);
    const input = el.querySelector('input[type="text"]');
    const opts = el.querySelectorAll('.brut-combobox__opt');
    const emptyEl = el.querySelector('.brut-combobox__empty');

    input.value = 'New';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(opts[0].style.display).toBe('');
    expect(opts[1].style.display).toBe('none');
    expect(opts[2].style.display).toBe('none');
    expect(emptyEl.style.display).toBe('none');

    input.value = 'zzz';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(emptyEl.style.display).toBe('block');
  });

  it('selects an option on mousedown and updates the hidden input', () => {
    const el = mount(HTML);
    const input = el.querySelector('input[type="text"]');
    const hidden = el.querySelector('input[type="hidden"]');
    const events = captureEvent(el, 'brut:change');

    const berlin = el.querySelectorAll('.brut-combobox__opt')[1];
    berlin.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));

    expect(hidden.value).toBe('ber');
    expect(input.value).toBe('Berlin');
    const lastChange = events[events.length - 1];
    expect(lastChange.detail.value).toBe('ber');
    expect(lastChange.detail.label).toBe('Berlin');
  });

  it('ArrowDown highlights the first visible option via aria-selected', () => {
    const el = mount(HTML);
    const input = el.querySelector('input[type="text"]');
    const opts = el.querySelectorAll('.brut-combobox__opt');

    input.dispatchEvent(new window.Event('focus', { bubbles: true }));
    fireKey(input, 'ArrowDown');
    expect(opts[0].getAttribute('aria-selected')).toBe('true');

    fireKey(input, 'ArrowDown');
    expect(opts[1].getAttribute('aria-selected')).toBe('true');
    expect(opts[0].getAttribute('aria-selected')).toBe('false');
  });

  it('Enter on an open list with a highlight commits the selection', () => {
    const el = mount(HTML);
    const input = el.querySelector('input[type="text"]');
    const hidden = el.querySelector('input[type="hidden"]');

    input.dispatchEvent(new window.Event('focus', { bubbles: true }));
    fireKey(input, 'ArrowDown');
    fireKey(input, 'Enter');
    expect(hidden.value).toBe('nyc');
    expect(input.value).toBe('New York');
  });
});
