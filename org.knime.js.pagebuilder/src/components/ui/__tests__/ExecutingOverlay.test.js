import { expect, describe, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ExecutingOverlay from '@/components/ui/ExecutingOverlay.vue';

describe('ExecutingOverlay.vue', () => {
    it('renders nothing by default', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            props: {
                nodeId: '007'
            }
        });
        expect(wrapper.find('div').exists()).toBeFalsy();
    });

    it('renders overlay via prop', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            props: {
                nodeId: '007',
                show: true
            }
        });
        expect(wrapper.find('div').exists()).toBeTruthy();
        expect(wrapper.find('svg').exists()).toBeFalsy();
    });

    it('renders loading svg via prop after transition ending', async () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            props: {
                nodeId: '007',
                show: true,
                showSpinner: true
            }
        });
        await wrapper.setData({ overlayRefAvailable: true });
        expect(wrapper.find('div').exists()).toBeTruthy();
        expect(wrapper.find('svg').exists()).toBeTruthy();
    });

    it('respects a maximum calculated height for spinner', () => {
        let wrapper = shallowMount(ExecutingOverlay, {
            props: {
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
