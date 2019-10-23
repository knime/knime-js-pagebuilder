import { shallowMount } from '@vue/test-utils';

import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

describe('ErrorMessage.vue', () => {
    let context, propsData;

    beforeEach(() => {
        propsData = {
            error: 'Widget is broken'
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(ErrorMessage, {
            ...context,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('has default props', () => {
        let wrapper = shallowMount(ErrorMessage, {
            ...context
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });
});
