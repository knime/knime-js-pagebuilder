import { shallowMount } from '@vue/test-utils';

import WebNode from '@/components/views/WebNode';
import WebNodeIFrame from '@/components/views/WebNodeIFrame';
import Widget from '@/components/widgets/Widget';

describe('WebNode.vue', () => {
    const getMockIFrameProps = () => {
        let nodeId = '0:0:7';
        let nodeConfig = {
            foo: 'bar',
            viewRepresentation: {
                '@class': 'testing.notWidget'
            },
            nodeInfo: {
                displayPossible: true
            }
        };
        let viewConfig = {
            nodeID: nodeId,
            resizeMethod: 'aspectRatio1by1'
        };
        return { nodeId, nodeConfig, viewConfig };
    };

    const getMockWidgetProps = (useLegacyMode = false) => {
        let baseProps = getMockIFrameProps();
        baseProps.viewConfig.useLegacyMode = useLegacyMode;
        baseProps.nodeConfig.viewRepresentation['@class'] =
            'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation';
        return baseProps;
    };

    it('renders views as iframes', () => {
        let wrapper = shallowMount(WebNode, {
            propsData: getMockIFrameProps()
        });
        expect(wrapper.find(WebNodeIFrame).exists()).toBeTruthy();
        expect(wrapper.find(Widget).exists()).toBeFalsy();
    });

    it('renders views as widgets', () => {
        let wrapper = shallowMount(WebNode, {
            propsData: getMockWidgetProps()
        });
        expect(wrapper.find(Widget).exists()).toBeTruthy();
        expect(wrapper.find(WebNodeIFrame).exists()).toBeFalsy();
    });

    it('increments key when nodeConfig updates', () => {
        let wrapper = shallowMount(WebNode, {
            propsData: getMockIFrameProps()
        });
        expect(wrapper.vm.nodeViewIFrameKey).toBe(0);
        let { nodeConfig } = getMockIFrameProps();
        nodeConfig.foo = 'baz';
        wrapper.setProps({ nodeConfig });
        expect(wrapper.vm.nodeViewIFrameKey).toBe(1);
    });

    describe('styling', () => {
        it('respects resize classes', () => {
            let mockProps = getMockIFrameProps();
            let wrapper = shallowMount(WebNode, {
                propsData: mockProps
            });
            expect(wrapper.find('div').attributes('class')).toEqual('aspectRatio1by1');
            mockProps.viewConfig.resizeMethod = 'aspectRatio16by9';
            wrapper = shallowMount(WebNode, {
                propsData: mockProps
            });
            expect(wrapper.find('div').attributes('class')).toEqual('aspectRatio16by9');
        });

        it('renders with classes and styles', () => {
            let mockProps = getMockIFrameProps();
            let wrapper = shallowMount(WebNode, {
                propsData: {
                    ...mockProps,
                    viewConfig: {
                        ...mockProps.viewConfig,
                        additionalClasses: ['class1', 'class2'],
                        additionalStyles: ['color: red;', 'border: 1px solid green;']
                    }
                }
            });
            expect(wrapper.attributes('class')).toEqual('aspectRatio1by1 class1 class2');
            expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
        });
    
        it('adds classes for min/max height & width', () => {
            let mockProps = getMockWidgetProps();
            let wrapper = shallowMount(WebNode, {
                propsData: {
                    ...mockProps,
                    viewConfig: {
                        ...mockProps.viewConfig,
                        resizeMethod: 'viewLowestElement',
                        additionalClasses: ['class1', 'class2'],
                        additionalStyles: ['color: red;', 'border: 1px solid green;'],
                        minHeight: 100,
                        maxHeight: 200,
                        minWidth: 100,
                        maxWidth: 200
                    }
                }
            });
            expect(wrapper.attributes('class')).toEqual('class1 class2');
            expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green; max-height: 200px;' +
                ' max-width: 200px; min-height: 100px; min-width: 100px;');
        });
    });

    describe('widget type handling', () => {
        it('can detect widgets using the representation class', () => {
            let wrapper = shallowMount(WebNode, {
                propsData: getMockWidgetProps()
            });
    
            expect(wrapper.vm.isWidget).toBeTruthy();
        });
    
        it('does not detect widgets using the nodeName', () => {
            let wrapper = shallowMount(WebNode, {
                propsData: {
                    ...getMockWidgetProps(),
                    nodeConfig: {
                        baz: 'qux',
                        viewRepresentation: {
                            '@class': 'not a defined widget class'
                        },
                        nodeInfo: {
                            displayPossible: true,
                            nodeName: 'Interactive Value Filter Widget'
                        }
                    }
                }
            });
    
            expect(wrapper.vm.widgetComponentName).not.toBeDefined();
            expect(wrapper.vm.isWidget).toBeFalsy();
        });
    
        it('treats widgets missing "useLegacyMode" flag as legacy', () => {
            let mockWidgetProps = getMockWidgetProps();
            let wrapper = shallowMount(WebNode, {
                propsData: {
                    ...mockWidgetProps,
                    viewConfig: {
                        nodeID: mockWidgetProps.viewConfig.nodeID
                    }
                }
            });
            expect(wrapper.vm.isWidget).toBeFalsy();
        });
    
        it('can detect legacy flags', () => {
            let wrapper = shallowMount(WebNode, {
                propsData: getMockWidgetProps(true)
            });
    
            expect(wrapper.vm.isWidget).toBeFalsy();
            
            wrapper = shallowMount(WebNode, {
                propsData: getMockWidgetProps()
            });
            expect(wrapper.vm.isWidget).toBeTruthy();
        });
    
        it('renders widgets in non-legacy mode when they are excluded from legacy rendering', () => {
            let mockWidgetProps = getMockWidgetProps(true);
            mockWidgetProps.nodeConfig.viewRepresentation['@class'] =
                'org.knime.js.base.node.widget.reexecution.refresh.RefreshButtonWidgetViewRepresentation';
            let wrapper = shallowMount(WebNode, {
                propsData: mockWidgetProps
            });
    
            expect(wrapper.vm.widgetComponentName).toBeTruthy();
            expect(wrapper.vm.legacyModeDisabled).toBeFalsy();
            expect(wrapper.vm.isWidget).toBeTruthy();
        });
    });
});
