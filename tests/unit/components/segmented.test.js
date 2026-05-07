import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadBrut, mount, fireKey, captureEvent } from '../harness.js';

beforeAll(loadBrut);
beforeEach(() => { document.body.innerHTML = ''; });

const HTML = `
  <div class="brut-segmented" data-brut="segmented" data-brut-name="period">
    <button class="brut-segmented__btn brut-segmented__btn--on" data-value="day">DAY</button>
    <button class="brut-segmented__btn" data-value="week">WEEK</button>
    <button class="brut-segmented__btn" data-value="month">MONTH</button>
  </div>
`;

describe('segmented', () => {
  it('sets role=tablist and roving tabindex', () => {
    const el = mount(HTML);
    expect(el.getAttribute('role')).toBe('tablist');
    const btns = el.querySelectorAll('.brut-segmented__btn');
    expect(btns[0].getAttribute('tabindex')).toBe('0');
    expect(btns[1].getAttribute('tabindex')).toBe('-1');
    expect(btns[0].getAttribute('aria-selected')).toBe('true');
  });

  it('creates a hidden input when data-brut-name is set', () => {
    const el = mount(HTML);
    const hidden = el.querySelector('input[type="hidden"]');
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('period');
    expect(hidden.value).toBe('day');
  });

  it('selects on click and emits brut:change with detail.value', () => {
    const el = mount(HTML);
    const events = captureEvent(el, 'brut:change');
    el.querySelectorAll('.brut-segmented__btn')[1].click();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ value: 'week' });
    expect(el.querySelector('input[type="hidden"]').value).toBe('week');
  });

  it('ArrowRight moves selection forward and wraps', () => {
    const el = mount(HTML);
    const btns = el.querySelectorAll('.brut-segmented__btn');
    btns[0].focus();
    fireKey(btns[0], 'ArrowRight');
    expect(btns[1].getAttribute('aria-selected')).toBe('true');
    fireKey(btns[1], 'ArrowRight');
    expect(btns[2].getAttribute('aria-selected')).toBe('true');
    fireKey(btns[2], 'ArrowRight');
    expect(btns[0].getAttribute('aria-selected')).toBe('true');
  });

  it('Home/End jump to first/last', () => {
    const el = mount(HTML);
    const btns = el.querySelectorAll('.brut-segmented__btn');
    btns[0].focus();
    fireKey(btns[0], 'End');
    expect(btns[2].getAttribute('aria-selected')).toBe('true');
    fireKey(btns[2], 'Home');
    expect(btns[0].getAttribute('aria-selected')).toBe('true');
  });

  it('arrow key calls preventDefault', () => {
    const el = mount(HTML);
    const btn = el.querySelector('.brut-segmented__btn');
    btn.focus();
    const ev = fireKey(btn, 'ArrowRight');
    expect(ev.defaultPrevented).toBe(true);
  });
});
