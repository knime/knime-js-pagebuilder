import { expect, describe, it } from 'vitest';
import { mount } from '@vue/test-utils';

import AlertLocal from '@/components/ui/AlertLocal.vue';
import Popover from '@/components/ui/Popover.vue';

describe('AlertLocal', () => {
    it('renders default inactive', () => {
        let wrapper = mount(AlertLocal);
        expect(wrapper.findComponent(AlertLocal).exists()).toBe(true);
        expect(wrapper.findComponent(Popover).exists()).toBe(true);
        expect(wrapper.findComponent(Popover).classes('active')).toBe(false);
        expect(wrapper.findComponent(Popover).props('active')).toBe(false);
    });

    it('renders active', () => {
        let wrapper = mount(AlertLocal, {
            props: {
                active: true
            }
        });
        expect(wrapper.findComponent(AlertLocal).exists()).toBe(true);
        expect(wrapper.findComponent(Popover).exists()).toBe(true);
        expect(wrapper.findComponent(Popover).classes('active')).toBe(true);
        expect(wrapper.findComponent(Popover).props('active')).toBe(true);
    });

    it('emits events to show the global alert', async () => {
        let wrapper = mount(AlertLocal, {
            props: {
                active: true
            }
        });
        expect(wrapper.emitted('showAlert')).toBeFalsy();
        wrapper.find('.error-wrapper').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('showAlert')).toBeTruthy();
    });
});
