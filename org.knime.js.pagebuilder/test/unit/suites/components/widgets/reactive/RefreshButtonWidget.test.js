import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils';

import RefreshButtonWidget from '@/components/widgets/reactive/RefreshButtonWidget.vue';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage.vue';
import Label from 'webapps-common/ui/components/forms/Label.vue';
import Button from 'webapps-common/ui/components/Button.vue';

import * as storeConfig from '@/store/pagebuilder';

describe('RefreshButtonWidget.vue', () => {
    let propsData, store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });

        context = {
            store,
            localVue
        };
    });

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                stylesheets: ['js-lib/font-awesome/4_7_0/css/font-awesome.min.css', 'js-lib/knime/service/knime.css'],
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewRepresentation',
                    buttonText: 'Imma button!',
                    description: 'Imma description!',
                    label: 'Imma label!'
                },
                viewValue: { '@class': 'org.knime.js.base.node.widget.reactive.refresh.RefreshButtonWidgetViewValue' },
                customCSS: '',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                javascriptLibraries: [
                    'js-lib/knime/service/knime_service_1_0_0.js',
                    'org/knime/js/base/node/widget/reactive/refresh/refreshButtonWidget.js'
                ],
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
            ...context,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findComponent(Label).text()).toContain('Imma label!');
        expect(wrapper.findComponent(Label).attributes('title')).toBe('Imma description!');
        expect(wrapper.findComponent(Button).text()).toBe('Imma button!');
    });

    it('has no error message when valid', () => {
        let wrapper = mount(RefreshButtonWidget, {
            ...context,
            propsData
        });
        expect(wrapper.findComponent(ErrorMessage).text()).toBe('');
    });

    it('has default error message', () => {
        const errorMessage = 'Something went wrong.';
        let wrapper = mount(RefreshButtonWidget, {
            ...context,
            propsData: {
                ...propsData,
                errorMessage
            }
        });
        expect(wrapper.findComponent(ErrorMessage).text()).toBe(errorMessage);
    });

    it('emits an updateWidget event on click', () => {
        let wrapper = mount(RefreshButtonWidget, { ...context, propsData });
        wrapper.findComponent(Button).trigger('click');
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({ nodeId: '13:0:12' });
    });

    it('disables the button when nodes are re-executing', () => {
        let wrapper = mount(RefreshButtonWidget, { ...context, propsData });
        wrapper.vm.$store.dispatch('pagebuilder/setNodesReExecuting', ['13:0:12']);
        expect(wrapper.vm.isExecuting).toBeTruthy();
        expect(wrapper.findComponent(Button).attributes().disabled).toBeTruthy();
    });
});
