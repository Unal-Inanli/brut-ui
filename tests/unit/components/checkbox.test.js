import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const HTML = `
  <label class="brut-checkbox" data-brut="checkbox">
    <input type="checkbox" hidden>
  </label>
`;

describe('checkbox', () => {
  it('initializes with role and tabindex', () => {
    const el = mount(HTML);
    expect(el.getAttribute('role')).toBe('checkbox');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles class, aria, and hidden input on click', () => {
    const el = mount(HTML);
    el.click();
    expect(el.classList.contains('brut-checkbox--on')).toBe(true);
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(el.querySelector('input').checked).toBe(true);
  });

  it('emits brut:change with detail.checked', () => {
    const el = mount(HTML);
    const events = captureEvent(el, 'brut:change');
    el.click();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ value: true, checked: true });
  });

  it('responds to Space and Enter', () => {
    const el = mount(HTML);
    fireKey(el, ' ');
    expect(el.getAttribute('aria-checked')).toBe('true');
    fireKey(el, 'Enter');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });
});
