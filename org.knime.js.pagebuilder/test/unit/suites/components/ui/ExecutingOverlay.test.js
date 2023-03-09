import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ExecutingOverlay from '@/components/ui/ExecutingOverlay.vue';

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

    it('renders loading svg via prop after transition ending', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            propsData: {
                nodeId: '007',
                show: true,
                showSpinner: true
            }
        });
        wrapper.vm.overlayRefAvailable = true;
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.find('svg').exists()).toBeTruthy();
    });

    it('respects a maximum calculated height for spinner', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            propsData: {
                nodeId: '007',
                show: true,
                showSpinner: true
            }
        });
        const overlayHeight1 = 20;
        const expectedSpinnerHeight1 = 10;
        const overlayHeight2 = 100;
        const expectedSpinnerHeight2 = 40;
        Object.defineProperty(wrapper.vm.$refs.overlay, 'offsetHeight', {
            get: vi.fn()
                .mockImplementationOnce(() => overlayHeight1)
                .mockImplementationOnce(() => overlayHeight2)
        });
        expect(wrapper.vm.getSpinnerHeight()).toBe(expectedSpinnerHeight1);
        // without maximum, we would expect height of 50
        expect(wrapper.vm.getSpinnerHeight()).toBe(expectedSpinnerHeight2);
    });
});
