import { mount } from '@vue/test-utils';

import Popover from '@/components/layout/Popover';

describe('Popover', () => {

    it('renders default inactive', () => {
        let wrapper = mount(Popover);
        expect(wrapper.vm.level).toBe('local');
        expect(wrapper.vm.active).toBe(false);
        expect(wrapper.vm.type).toBe('error');
        expect(wrapper.find('.container').classes('active')).toBe(false);
    });

    it('renders active', () => {
        let wrapper = mount(Popover, {
            propsData: {
                active: true
            }
        });
        expect(wrapper.vm.level).toBe('local');
        expect(wrapper.vm.active).toBe(true);
        expect(wrapper.vm.type).toBe('error');
        expect(wrapper.find('.container').classes('active')).toBe(true);
    });

    it('sets classes on child elements', () => {
        let wrapper = mount(Popover, {
            propsData: {
                active: true
            }
        });
        expect(wrapper.vm.level).toBe('local');
        expect(wrapper.vm.active).toBe(true);
        expect(wrapper.vm.type).toBe('error');
        let container = wrapper.find('.container');
        expect(container.exists()).toBe(true);
        expect(container.classes()).toEqual(expect.arrayContaining(['local', 'error', 'active']));
        let overlay = wrapper.find('.overlay');
        expect(overlay.exists()).toBe(true);
        expect(container.classes()).toEqual(expect.arrayContaining(['local']));
    });
});
