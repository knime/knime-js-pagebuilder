import { shallowMount } from '@vue/test-utils';

import IntegerWidget from '@/components/widgets/input/IntegerWidget';

describe('IntegerWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                viewRepresentation: {},
                nodeInfo: {}
            },
            nodeId: 'string'
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(IntegerWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });
});
