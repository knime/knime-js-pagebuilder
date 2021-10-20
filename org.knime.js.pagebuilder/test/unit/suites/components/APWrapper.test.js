import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';

import APWrapper from '@/components/APWrapper';
import PageBuilder from '@/components/PageBuilder';
import DebugButton from '@/components/ui/DebugButton';
import RefreshButton from '@/components/ui/RefreshButton';

describe('APWrapper.vue', () => {
    it('renders empty wrapper', () => {
        let wrapper = shallowMount(APWrapper);

        expect(wrapper.find(PageBuilder).exists()).toBeFalsy();
    });

    it('renders PageBuilder if loaded', () => {
        Vue.component('PageBuilder', PageBuilder);
        let wrapper = shallowMount(APWrapper);
        expect(wrapper.find(PageBuilder).exists()).toBeTruthy();
    });

    describe('debug info and tooling', () => {
        it('hides debug/refresh buttons by default (without debug info)', () => {
            expect(window.getDebugInfo).not.toBeDefined();
            let wrapper = shallowMount(APWrapper);
            expect(wrapper.vm.debugInfo).toBe(null);
            expect(wrapper.find(DebugButton).exists()).toBeFalsy();
            expect(wrapper.find(RefreshButton).exists()).toBeFalsy();
        });

        it('conditionally shows debug button', () => {
            let debugInfo = { remoteDebuggingPort: 8888 };
            let debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            let wrapper = shallowMount(APWrapper);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(DebugButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });

        it('conditionally shows refresh button', () => {
            let debugInfo = { refreshRequired: true };
            let debugMock = jest.fn(() => JSON.stringify(debugInfo));
            window.getDebugInfo = debugMock;
            let wrapper = shallowMount(APWrapper);
            expect(wrapper.vm.debugInfo).toStrictEqual(debugInfo);
            expect(wrapper.find(RefreshButton).exists()).toBeTruthy();
            delete window.getDebugInfo;
        });

        it('handles non-critical errors loading debug info', () => {
            let debugMock = jest.fn(() => { throw Error('Something went wrong getting info'); });
            window.getDebugInfo = debugMock;
            let wrapper;
            expect(() => { wrapper = shallowMount(APWrapper); }).not.toThrow();
            expect(wrapper.vm.debugInfo).toBe(null);
            delete window.getDebugInfo;
        });
    });
});
