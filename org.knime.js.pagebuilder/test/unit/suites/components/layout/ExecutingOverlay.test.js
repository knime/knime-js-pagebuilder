import { shallowMount } from '@vue/test-utils';

import ExecutingOverlay from '@/components/layout/ExecutingOverlay';

describe('ExecutingOverlay.vue', () => {
    it('renders nothing by default', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            propsData: {
                nodeId: '007'
            }
        });
        expect(wrapper.html()).toBeFalsy();
    });

    it('renders overlay via prop', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            propsData: {
                nodeId: '007',
                show: true
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.find('svg').exists()).toBeFalsy();
    });

    it('renders loading svg via prop', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            propsData: {
                nodeId: '007',
                show: true,
                showSpinner: true
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.find('svg').exists()).toBeTruthy();
    });
});
