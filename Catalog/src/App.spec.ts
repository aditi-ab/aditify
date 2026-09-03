import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

describe('native component catalog', () => {
  it('documents the Nova theme and native component surface', () => {
    const wrapper = mount(App);

    expect(wrapper.text()).toContain('Native component catalog');
    expect(wrapper.text()).toContain('Nova');
    expect(wrapper.text()).toContain('legacy blue-slate dark surfaces');
    expect(wrapper.text()).toContain('api.example.com');
    expect(wrapper.text()).toContain('No routes match the current filters.');
    expect(wrapper.find('input[placeholder="Add a host"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="navigation-menu"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ConfigProvider' }).props('scrollBody')).toBe(false);
  });
});
