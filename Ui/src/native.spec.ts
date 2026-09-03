import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, TagsInput, TagsInputInput, TagsInputItem, TagsInputItemText } from './components/ui';
import { dialogOverlayPositionClasses, dialogPositionClasses } from './lib/dialogPosition';

describe('native Nova components', () => {
  it('keeps the legacy blue-slate dark palette in semantic theme tokens', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

    expect(styles).toContain('--background: #080d18;');
    expect(styles).toContain('--card: #111827;');
    expect(styles).toContain('--muted: #182235;');
    expect(styles).toContain('--accent: #182235;');
    expect(styles).toContain('--border: #334155;');
    expect(styles).toContain('--primary: #818cf8;');
  });

  it('renders the generated button primitive', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } });

    expect(wrapper.get('[data-slot="button"]').text()).toBe('Save');
  });

  it('renders the native tags input composition', () => {
    const wrapper = mount({
      components: { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemText },
      template: '<TagsInput :model-value="[\'api.example.com\']"><TagsInputItem value="api.example.com"><TagsInputItemText /></TagsInputItem><TagsInputInput /></TagsInput>',
    });

    expect(wrapper.text()).toContain('api.example.com');
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('positions dialogs at the top by default and supports explicit placements', () => {
    expect(dialogPositionClasses.top).toBe('top-4');
    expect(dialogPositionClasses.center).toContain('top-1/2');
    expect(dialogPositionClasses.bottom).toBe('bottom-4');
    expect(dialogOverlayPositionClasses.top).toContain('items-start');
    expect(dialogOverlayPositionClasses.center).toBe('place-items-center');
    expect(dialogOverlayPositionClasses.bottom).toContain('items-end');
  });

  it('uses top placement when DialogContent has no position prop', async () => {
    const wrapper = mount({
      components: { Dialog, DialogContent, DialogDescription, DialogTitle },
      template: '<Dialog :open="true"><DialogContent :show-close-button="false"><DialogTitle>Example dialog</DialogTitle><DialogDescription>Dialog placement example.</DialogDescription></DialogContent></Dialog>',
    }, { attachTo: document.body });

    await nextTick();

    expect(document.body.querySelector('[data-slot="dialog-content"]')?.getAttribute('data-position')).toBe('top');
    wrapper.unmount();
  });
});
