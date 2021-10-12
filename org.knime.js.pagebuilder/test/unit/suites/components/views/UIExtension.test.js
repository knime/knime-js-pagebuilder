import { shallowMount } from '@vue/test-utils';

import UIExtension from '@/components/views/UIExtension';
import UIExtComponent from '@/components/views/UIExtComponent';
import UIExtIFrame from '@/components/views/UIExtIFrame';

describe('UIExtension.vue', () => {
    const getMockIFrameProps = () => {
        let nodeId = '0:0:7';
        let nodeInfo = {
            projectId: '1985',
            workflowId: '01.04',
            initData: '{}',
            url: 'local',
            remoteDebugPort: null
        };
        return { nodeId, nodeInfo };
    };

    const getMockComponentProps = () => {
        let baseProps = getMockIFrameProps();
        baseProps.nodeInfo.uicomponent = 'SomeVueComponent';
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
        expect(wrapper.vm.nodeInfoKey).toBe(0);
        let { nodeInfo } = getMockIFrameProps();
        nodeInfo.url = 'remote';
        wrapper.setProps({ nodeInfo });
        expect(wrapper.vm.nodeInfoKey).toBe(1);
    });
});
