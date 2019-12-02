/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';

import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import BooleanWidget from '@/components/widgets/input/BooleanWidget.vue';

describe('BooleanWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                viewValue: null,
                customCSS: '',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.bool.BooleanNodeRepresentation',
                    label: 'This is the label (default true)',
                    description: 'This is the description.',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.bool.BooleanNodeValue',
                        boolean: true
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.bool.BooleanNodeValue',
                        boolean: true
                    }
                },
                initMethodName: 'init',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                validateMethodName: 'validate',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeName: 'Boolean Widget',
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
                namespace: 'knimeBooleanWidget',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/bool/booleanWidget.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '15:0:19',
            isValid: true
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(BooleanWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('emits updateWidget events', () => {
        let mockChild = document.createElement('div');
        mockChild.setAttribute('class', 'knime-boolean');
        let wrapper = shallowMount(BooleanWidget, {
            propsData,
            mocks: {
                $el: mockChild
            }
        });
        expect(typeof wrapper.emitted().updateWidget).toBe('undefined');
        wrapper.find(Checkbox).vm.$emit('updateValue', false);
        expect(wrapper.emitted().updateWidget).toBeTruthy();
    });
});
