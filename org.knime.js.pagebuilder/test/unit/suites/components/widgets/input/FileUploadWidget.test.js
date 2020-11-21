import { createLocalVue, mount } from '@vue/test-utils';

import FileUploadWidget from '@/components/widgets/input/FileUploadWidget.vue';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Vuex from 'vuex';
import Vue from 'vue';

const uploadResourceMock = jest.fn().mockReturnValue(() => ({ errorResponse: {}, response: {} }));
const cancelUploadResourceMock = jest.fn().mockReturnValue(() => {});
const file = { size: 1000, type: 'image/png', name: 'avatar.png' };
const event = {
    target: {
        files: [file]
    }
};

let storeConfig = {
    getters: {
        'api/uploadResource': uploadResourceMock,
        'api/cancelUploadResource': cancelUploadResourceMock
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
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });

        expect(wrapper.vm.$data.localFileName).toEqual(null);
        wrapper.vm.onChange(event);
        expect(wrapper.vm.$data.localFileName).toEqual('avatar.png');
        expect(wrapper.find('.show-bar').exists()).toBe(true);
        expect(wrapper.find('.upload-wrapper p svg').exists()).toBe(false);
        wrapper.vm.setUploadProgress(2);
        expect(wrapper.find('.upload-wrapper button').text()).toEqual('Cancel');
        expect(wrapper.find('.progress-bar span').text()).toBe('2%');
        expect(wrapper.find('.progress-bar').attributes('style')).toBe('width: 2%;');
        wrapper.vm.setUploadProgress(100);
        expect(wrapper.find('.show-bar').exists()).toBe(false);
        expect(wrapper.find('.upload-wrapper p svg').exists()).toBe(true);
        expect(wrapper.find('.upload-wrapper button').text()).toEqual('Select file');
    });

    it('keeps current file in case upload gets canceled', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });

        expect(wrapper.vm.$data.localFileName).toEqual(null);
        wrapper.vm.onChange(event);
        expect(wrapper.vm.$data.localFileName).toEqual('avatar.png');
        wrapper.vm.onChange({});
        expect(wrapper.vm.$data.localFileName).toEqual('avatar.png');
    });

    it('invalidates if no input is given on second validate', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData: {
                ...propsData,
                nodeConfig: {
                    ...propsData.nodeConfig,
                    viewRepresentation: {
                        ...propsData.nodeConfig.viewRepresentation,
                        path: ''
                    }
                }
            }
        });
        expect(wrapper.vm.validate()).toEqual({
            errorMessage: null,
            isValid: true
        });
        expect(wrapper.vm.validate()).toEqual({
            errorMessage: 'Input is required.',
            isValid: false
        });
    });

    it('checks if still uploading', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });
        wrapper.setData({ initialized: true });
        wrapper.vm.onChange(event);
        expect(wrapper.vm.validate()).toEqual({
            errorMessage: 'Upload still in progress.',
            isValid: false
        });
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
            errorMessage: 'The type of the selected file does not match the allowed file types (.pdf).',
            isValid: false
        });
    });

    it('displays upload error message', async () => {
        let uploadErrorResourceMock = jest.fn().mockReturnValue({
            errorResponse: {
                cancelled: false
            }
        });
        
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });
        wrapper.setData({ uploadAPI: uploadErrorResourceMock });
        wrapper.vm.onChange(event);
        await Vue.nextTick();
        expect(wrapper.find(ErrorMessage).props('error')).toEqual('Upload failed.');
    });

    it('cancels upload correctly', async () => {
        let uploadErrorResourceMock = jest.fn().mockReturnValue({
            errorResponse: {
                cancelled: true
            }
        });
        
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });
        wrapper.setData({ uploadAPI: uploadErrorResourceMock });

        wrapper.vm.onChange(event);
        expect(wrapper.find('.upload-wrapper button').text()).toEqual('Cancel');
        wrapper.find('.upload-wrapper button').trigger('click');
        await Vue.nextTick();
        expect(cancelUploadResourceMock).toHaveBeenCalled();
        expect(wrapper.find(ErrorMessage).props('error')).toEqual('Upload cancelled.');
    });

    it('displays messag if on AP', () => {
        let wrapper = mount(FileUploadWidget, {
            store,
            localVue,
            propsData
        });
        wrapper.setData({ uploadAPI: null });

        expect(wrapper.find('p').text()).toEqual('File upload only available on server.');
    });
});
