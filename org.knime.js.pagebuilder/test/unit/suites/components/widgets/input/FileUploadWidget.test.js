import { createLocalVue, mount } from '@vue/test-utils';

import FileUploadWidget from '@/components/widgets/input/FileUploadWidget.vue';
import Vuex from 'vuex';

const uploadResourceMock = jest.fn().mockReturnValue(() => {});

let storeConfig = {
    getters: {
        'api/uploadResource': uploadResourceMock
    }
};

describe('FileUploadWidget.vue', () => {
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
                    nodeName: 'File Upload Widget'
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/input/fileupload/FileUpload.js'
                ],
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                getViewValueMethodName: 'value',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.input.fileupload.FileUploadRepresentation',
                    path: '/home/knime-server/server-repos/runtime/runtime_knime-rmi-30721',
                    description: 'Generated content\t\t\t',
                    fileTypes: []
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.input.fileupload.FileUploadValue'
                },
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                namespace: 'org_knime_js_base_node_input_fileupload'
            },
            nodeId: '5:0:22',
            isValid: true
        };
    });

    it('renders', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.vm.$store.getters['api/uploadResource']).toBeDefined();
        expect(uploadResourceMock).toBeCalled();
        expect(wrapper.find('.show-bar').exists()).toBe(false);
        expect(wrapper.find('.vertical').exists()).toBe(false);
    });

    it('triggers input on click', () => {
        const triggerInputMock = jest.fn();
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData,
            methods: {
                triggerInput: triggerInputMock
            }
        });
        wrapper.find('.upload-wrapper .button').trigger('click');
        expect(triggerInputMock).toHaveBeenCalled();
    });

    it('uploads file correctly', () => {
        const file = { size: 1000, type: 'image/png', name: 'avatar.png' };
        const event = {
            target: {
                files: [file]
            }
        };

        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });

        expect(wrapper.vm.$data.selectedFile).toEqual(null);
        wrapper.vm.onChange(event);
        expect(wrapper.vm.$data.selectedFile).toEqual('avatar.png');
        expect(wrapper.find('.show-bar').exists()).toBe(true);
        expect(wrapper.find('.upload-wrapper p svg').exists()).toBe(false);
        wrapper.vm.setUploadProgress(2);
        expect(wrapper.find('.progress-bar span').text()).toBe('2%');
        expect(wrapper.find('.progress-bar').attributes('style')).toBe('width: 2%;');
        wrapper.vm.setUploadProgress(100);
        expect(wrapper.find('.show-bar').exists()).toBe(false);
        expect(wrapper.find('.upload-wrapper p svg').exists()).toBe(true);
    });

    it('keeps current file in case upload gets canceled', () => {
        const file = { size: 1000, type: 'image/png', name: 'avatar.png' };
        const event = {
            target: {
                files: [file]
            }
        };

        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });

        expect(wrapper.vm.$data.selectedFile).toEqual(null);
        wrapper.vm.onChange(event);
        expect(wrapper.vm.$data.selectedFile).toEqual('avatar.png');
        wrapper.vm.onChange({});
        expect(wrapper.vm.$data.selectedFile).toEqual('avatar.png');
    });

    it('invalidates if no input is given', () => {
        // TODO
    });

    it('checks for wrong file extension', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData: {
                ...propsData,
                nodeConfig: {
                    ...propsData.nodeConfig,
                    viewRepresentation: {
                        ...propsData.nodeConfig.viewRepresentation,
                        fileTypes: ['.pdf']
                    }
                }
            }
        });
        wrapper.setProps({
            valuePair: {
                '@class': 'org.knime.js.base.node.base.input.fileupload.FileUploadNodeValue',
                fileName: '',
                pathValid: false,
                path: '/Users/testUser/avatar.png'
            }
        });
        expect(wrapper.vm.validate()).toEqual({
            errorMessage: 'The type of the selected file does not match the allowed file types (.pdf)',
            isValid: false
        });
    });

    it('cancels upload correctly', () => {
        // TODO
    });
});
