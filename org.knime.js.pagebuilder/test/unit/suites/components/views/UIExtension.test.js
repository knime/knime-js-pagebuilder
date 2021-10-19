import { shallowMount } from '@vue/test-utils';

import UIExtension from '@/components/views/UIExtension';
import UIExtComponent from '@/components/views/UIExtComponent';
import UIExtIFrame from '@/components/views/UIExtIFrame';

describe('UIExtension.vue', () => {
    const getMockIFrameProps = () => {
        let extensionConfig = {
            nodeId: '0:0:7',
            projectId: 'knime workflow',
            workflowId: 'root:10',
            resourceInfo: {
                id: 'org.knime.base.views.scatterplot.ScatterPlotNodeFactory',
                type: 'HTML',
                path: null,
                url: 'http://localhost:8080/my_widget.html'
            },
            nodeInfo: {
                nodeAnnotation: '',
                nodeState: 'executed',
                nodeErrorMessage: null,
                nodeWarnMessage: null,
                nodeName: 'Scatter Plot'
            }
        };
        return { extensionConfig };
    };

    const getMockComponentProps = () => {
        let baseProps = getMockIFrameProps();
        baseProps.extensionConfig.resourceInfo.type = 'VUE_COMPONENT_LIB';
        return baseProps;
    };

    it('renders ui extensions as Vue components', () => {
        let wrapper = shallowMount(UIExtension, {
            propsData: getMockComponentProps()
        });
        expect(wrapper.find(UIExtComponent).exists()).toBeTruthy();
        expect(wrapper.find(UIExtIFrame).exists()).toBeFalsy();
    });

    it('renders ui extensions as iframes', () => {
        let wrapper = shallowMount(UIExtension, {
            propsData: getMockIFrameProps()
        });
        expect(wrapper.find(UIExtIFrame).exists()).toBeTruthy();
        expect(wrapper.find(UIExtComponent).exists()).toBeFalsy();
    });

    it('increments key when node info updates', () => {
        let wrapper = shallowMount(UIExtension, {
            propsData: getMockIFrameProps()
        });
        expect(wrapper.vm.configKey).toBe(0);
        let { extensionConfig } = getMockIFrameProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_widget.html';
        wrapper.setProps({ extensionConfig });
        expect(wrapper.vm.configKey).toBe(1);
    });
});
