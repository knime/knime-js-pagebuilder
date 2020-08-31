import { shallowMount } from '@vue/test-utils';

import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

describe('ErrorMessage.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            error: 'Widget is broken'
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(ErrorMessage, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('has default props', () => {
        let wrapper = shallowMount(ErrorMessage);
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders empty wrapper when there is no error message', () => {
        let wrapper = shallowMount(ErrorMessage, {
            propsData: {
                error: null
            }
        });
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.text()).toBe('');
    });
});
