import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const SWITCH_HTML = `
  <label class="brut-switch" data-brut="switch">
    <input type="checkbox" hidden>
    <span class="brut-switch__knob"></span>
  </label>
`;

describe('switch', () => {
  it('initializes with role and tabindex', () => {
    const el = mount(SWITCH_HTML);
    expect(el.getAttribute('role')).toBe('switch');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles aria-checked and class on click', () => {
    const el = mount(SWITCH_HTML);
    el.click();
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(el.classList.contains('brut-switch--on')).toBe(true);
    expect(el.querySelector('input').checked).toBe(true);
  });

  it('emits brut:change with detail.value on toggle', () => {
    const el = mount(SWITCH_HTML);
    const events = captureEvent(el, 'brut:change');
    el.click();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ value: true });
    el.click();
    expect(events).toHaveLength(2);
    expect(events[1].detail).toEqual({ value: false });
  });

  it('responds to Space and Enter', () => {
    const el = mount(SWITCH_HTML);
    fireKey(el, ' ');
    expect(el.getAttribute('aria-checked')).toBe('true');
    fireKey(el, 'Enter');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('keyboard handler calls preventDefault', () => {
    const el = mount(SWITCH_HTML);
    const ev = fireKey(el, ' ');
    expect(ev.defaultPrevented).toBe(true);
  });

  it('honors initial checked state on the hidden input', () => {
    const el = mount(`
      <label class="brut-switch" data-brut="switch">
        <input type="checkbox" hidden checked>
        <span class="brut-switch__knob"></span>
      </label>
    `);
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(el.classList.contains('brut-switch--on')).toBe(true);
  });
});
