import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import { createLocalVue, mount } from '@vue/test-utils';

import FileDownloadWidget from '@/components/widgets/output/FileDownloadWidget.vue';
import FileLink from 'webapps-common/ui/components/FileLink.vue';
import Vuex from 'vuex';

const downloadResourceLinkMock = vi.fn();

let storeConfig = {
    getters: {
        'api/downloadResourceLink': downloadResourceLinkMock
    }
};

describe('FileDownloadWidget.vue', () => {
    let propsData, store, localVue;

    beforeEach(() => {
        // we do this before each as beforeAll the mockReturn value is always the first set and cannot be changed
        localVue = createLocalVue();
        localVue.use(Vuex);
        store = new Vuex.Store({
            modules: {
                api: storeConfig
            }
        });

        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                customCSS: '',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    displayPossible: true,
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'File Download Widget'
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/output/filedownload/FileDownload.js'
                ],
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                getViewValueMethodName: 'value',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.output.filedownload.FileDownloadRepresentation',
                    linkTitle: 'SVG',
                    resourceName: 'file-download',
                    path: '/home/knime-server/server-repos/runtime/runtime_knime-rmi-30721',
                    description: 'Generated content\t\t\t',
                    label: 'SVG'
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.output.filedownload.FileDownloadValue'
                },
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                namespace: 'org_knime_js_base_node_output_filedownload'
            },
            nodeId: '5:0:22',
            isValid: true
        };
    });

    it('renders', () => {
        const link = 'https://example.com/myfile';
        downloadResourceLinkMock.mockReturnValue(() => link);
        let wrapper = mount(FileDownloadWidget, {
            store,
            localVue,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.vm.$store.getters['api/downloadResourceLink']).toBeDefined();
        expect(downloadResourceLinkMock).toBeCalled();
        let fl = wrapper.findComponent(FileLink);
        expect(fl.exists()).toBeTruthy();
        expect(fl.props('href')).toBe(link);
    });

    it('shows error if no downloadResourceLink api is available', () => {
        downloadResourceLinkMock.mockReturnValue(null);
        let wrapper = mount(FileDownloadWidget, {
            store,
            localVue,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        const validate = wrapper.vm.validate();
        expect(validate.isValid).toBe(false);
        expect(validate.errorMessage).toBe('File download only available on server.');
    });

    it('displays a file link when run locally', () => {
        downloadResourceLinkMock.mockReturnValue(null);
        window.KnimePageLoader = {};
        let wrapper = mount(FileDownloadWidget, {
            store,
            localVue,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        const validate = wrapper.vm.validate();
        expect(validate.isValid).toBe(true);
        let fl = wrapper.findComponent(FileLink);
        expect(fl.exists()).toBeTruthy();
        expect(fl.props('href')).toBe(`file://${propsData.nodeConfig.viewRepresentation.path}`);
        delete window.KnimePageLoader;
    });
});
