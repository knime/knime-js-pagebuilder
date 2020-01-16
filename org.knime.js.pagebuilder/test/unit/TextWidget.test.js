import { mount, shallowMount } from '@vue/test-utils';

import TextWidget from '@/components/widgets/output/TextWidget.vue';

describe('TextWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                viewValue: {
                    '@class': 'org.knime.js.base.node.output.text.TextOutputValue'
                },
                customCSS: '',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.output.text.TextOutputRepresentation',
                    text: 'This is the default text output.',
                    textFormat: 'Text',
                    description: 'This is the description',
                    label: 'This is the label'
                },
                initMethodName: 'init',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                validateMethodName: 'validate',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeName: 'Text Output Widget',
                    nodeState: 'executed',
                    nodeAnnotation: '',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                namespace: 'org_knime_js_base_node_output_text',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/output/text/TextOutput.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '13:0:12',
            isValid: true
        };
    });

    it('renders', () => {
        let wrapper = mount(TextWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('recognizes the Text element type', () => {
        let wrapper = mount(TextWidget, {
            propsData
        });
        expect(wrapper.vm.elementType).toBe('p');
    });

    it('recognizes the Preformatted element type', () => {
        propsData.nodeConfig.viewRepresentation.textFormat = 'Preformatted';
        let wrapper = mount(TextWidget, {
            propsData
        });
        expect(wrapper.vm.elementType).toBe('pre');
    });

    it('recognizes the HTML element type', () => {
        propsData.nodeConfig.viewRepresentation.textFormat = 'Html';
        let wrapper = mount(TextWidget, {
            propsData
        });
        expect(wrapper.vm.elementType).toBe(false);
    });

    it('has no error message when valid', () => {
        let wrapper = shallowMount(TextWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe(null);
    });

    it('has default error message', () => {
        propsData.isValid = false;
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        let wrapper = shallowMount(TextWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Current text output value is invalid');
    });

    it('has warning message', () => {
        propsData.isValid = false;
        propsData.nodeConfig.viewRepresentation.errorMessage = false;
        propsData.nodeConfig.nodeInfo.nodeWarnMessage = 'Testing warning message';
        let wrapper = shallowMount(TextWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing warning message');
    });

    it('has error message', () => {
        propsData.isValid = false;
        propsData.nodeConfig.viewRepresentation.errorMessage = 'Testing error message';
        let wrapper = shallowMount(TextWidget, {
            propsData
        });

        expect(wrapper.vm.errorMessage).toBe('Testing error message');
    });
});
