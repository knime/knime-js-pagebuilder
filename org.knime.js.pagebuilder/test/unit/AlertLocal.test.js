import { mount } from '@vue/test-utils';

import AlertLocal from '@/components/layout/AlertLocal';
import Popover from '@/components/layout/Popover';

describe('AlertLocal', () => {

    it('renders default inactive', () => {
        let wrapper = mount(AlertLocal);
        expect(wrapper.find(AlertLocal).exists()).toBe(true);
        expect(wrapper.find(Popover).exists()).toBe(true);
        expect(wrapper.find(Popover).classes('active')).toBe(false);
        expect(wrapper.find(Popover).props('active')).toBe(false);
    });

    it('renders active', () => {
        let wrapper = mount(AlertLocal, {
            propsData: {
                active: true
            }
        });
        expect(wrapper.find(AlertLocal).exists()).toBe(true);
        expect(wrapper.find(Popover).exists()).toBe(true);
        expect(wrapper.find(Popover).classes('active')).toBe(true);
        expect(wrapper.find(Popover).props('active')).toBe(true);
    });

    it('emits events to show the global alert', async () => {
        let wrapper = mount(AlertLocal, {
            propsData: {
                active: true
            }
        });
        expect(wrapper.emitted().showAlert).toBeFalsy();
        wrapper.find('.error-wrapper').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().showAlert).toBeTruthy();
    });
});
