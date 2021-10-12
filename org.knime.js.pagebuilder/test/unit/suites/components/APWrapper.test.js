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

    // TODO: NXT-729 enable debug button when port added
    xit('renders debug and refresh button when port present', () => {
        let wrapper;
        expect(wrapper.find(DebugButton).exists()).toBeTruthy();
        expect(wrapper.find(RefreshButton).exists()).toBeTruthy();
    });
});
