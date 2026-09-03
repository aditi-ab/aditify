import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import RoleSelector from './RoleSelector.vue';

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('role selector', () => {
  it('renders selected roles as removable chips and exposes available roles', async () => {
    const updates: string[][] = [];
    const wrapper = mount(RoleSelector, {
      attachTo: document.body,
      props: {
        'modelValue': ['Administrator'],
        'roles': ['Administrator', 'Reader'],
        'placeholder': 'Select roles…',
        'emptyLabel': 'No roles found.',
        'toggleLabel': 'Show role options',
        'onUpdate:modelValue': value => updates.push(value),
      },
      global: { stubs: { teleport: true } },
    });

    expect(wrapper.text()).toContain('Administrator');

    await wrapper.get('input').trigger('focus');
    await nextTick();

    expect(wrapper.get('[aria-label="Show role options"]').attributes('aria-expanded')).toBe('true');

    await wrapper.get('button[aria-labelledby]').trigger('click');
    expect(updates).toContainEqual([]);
    wrapper.unmount();
  });
});
