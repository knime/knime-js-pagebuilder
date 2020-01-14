import { shallowMount } from '@vue/test-utils';

import DoubleWidget from '@/components/widgets/input/DoubleWidget';

describe('DoubleWidget.vue', () => {
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
        let wrapper = shallowMount(DoubleWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });
});
