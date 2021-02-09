import { mount } from '@vue/test-utils';

import RefreshButtonWidget from '@/components/widgets/reactive/RefreshButtonWidget.vue';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

describe('RefreshButtonWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: ['js-lib/font-awesome/4_7_0/css/font-awesome.min.css', 'js-lib/knime/service/knime.css'],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewRepresentation',
                    text: 'Imma button!',
                    description: 'Imma description!',
                    label: 'Imma label!'
                },
                viewValue: { '@class': 'org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewValue' },
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                javascriptLibraries: ['js-lib/knime/service/knime_service_1_0_0.js', 'org/knime/js/base/node/widget/reactive/refresh/refreshButtonWidget.js'],
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: null,
                    nodeState: null,
                    nodeName: 'Single Node Page',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null
                },
                namespace: 'knimeRefreshButtonWidget'
            },
            nodeId: '13:0:12'
        };
    });

    it('renders', () => {
        let wrapper = mount(RefreshButtonWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(Label).text()).toContain('Imma label!');
        expect(wrapper.find(Label).attributes('title')).toBe('Imma description!');
        expect(wrapper.find(Button).text()).toBe('Imma button!');
    });

    it('has no error message when valid', () => {
        let wrapper = mount(RefreshButtonWidget, {
            propsData
        });
        expect(wrapper.find(ErrorMessage).text()).toBe('');
    });

    it('has default error message', () => {
        const errorMessage = 'Something went wrong.';
        let wrapper = mount(RefreshButtonWidget, {
            propsData: {
                ...propsData,
                errorMessage
            }
        });
        expect(wrapper.find(ErrorMessage).text()).toBe(errorMessage);
    });
});
