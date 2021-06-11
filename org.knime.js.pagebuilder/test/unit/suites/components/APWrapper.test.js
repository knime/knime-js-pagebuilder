import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';

import APWrapper from '@/components/APWrapper';
import PageBuilder from '@/components/PageBuilder';

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
});
