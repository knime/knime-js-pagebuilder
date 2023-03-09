import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';

import FileChooserWidget from '@/components/widgets/selection/FileChooserWidget.vue';
import TreeSelect from '@/components/widgets/baseElements/selection/TreeSelect.vue';


const propsDataTemplate = {
    nodeConfig: {
        '@class': 'org.knime.js.core.JSONWebNode',
        viewRepresentation: {
            '@class': 'org.knime.js.base.node.base.input.filechooser.FileChooserNodeRepresentation',
            label: 'Label',
            description: 'Enter Description',
            required: true,
            defaultValue: {
                '@class': 'org.knime.js.base.node.base.input.filechooser.FileChooserNodeValue',
                items: [
                    {
                        path: 'knime://Devserver/Test%20Workflows/Demo/Simple%20Interaction',
                        type: 'WORKFLOW'
                    }
                ]
            },
            currentValue: {
                '@class': 'org.knime.js.base.node.base.input.filechooser.FileChooserNodeValue',
                items: [
                    {
                        path: 'knime://Devserver/file_chooser_verification/directory_folder/a/customers.csv',
                        type: 'WORKFLOW'
                    }
                ]
            },
            selectWorkflows: true,
            selectDirectories: false,
            selectDataFiles: true,
            useDefaultMountId: true,
            customMountId: '',
            rootDir: '/',
            fileTypes: ['.csv'],
            multipleSelection: true,
            errorMessage: '',
            tree: [
                {
                    icon: '',
                    state: {
                        opened: false,
                        selected: false,
                        disabled: true
                    },
                    text: 'Admin',
                    type: 'DIRECTORY',
                    children: [
                        {
                            icon: '',
                            state: {
                                opened: false,
                                selected: true,
                                disabled: false
                            },
                            text: 'Change Workflow Owners',
                            type: 'WORKFLOW',
                            children: null,
                            id: '/Admin/Change Workflow Owners'
                        }
                    ],
                    id: '/Admin'
                }
            ],
            prefix: 'knime://Testserver-master',
            runningOnServer: true
        },
        viewValue: {
            '@class': 'org.knime.js.base.node.base.input.filechooser.FileChooserNodeValue',
            items: [
                {
                    path: 'knime://Devserver/Test%20Workflows/Demo/Simple%20Interaction',
                    type: 'WORKFLOW'
                }
            ]
        },
        initMethodName: 'init',
        validateMethodName: 'validate',
        setValidationErrorMethodName: 'setValidationErrorMessage',
        customCSS: '',
        nodeInfo: {
            '@class': 'org.knime.js.core.JSONWebNodeInfo',
            nodeName: 'File Chooser Widget',
            nodeErrorMessage: null,
            nodeWarnMessage: null,
            displayPossible: true,
            nodeAnnotation: '',
            nodeState: 'executed'
        },
        stylesheets: [
            '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
            '/js-lib/knime/service/knime.css',
            '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
            '/org/knime/js/base/util/quickform/quickformStyles.css',
            '/js-lib/jsTree/min/themes/default/style.min.css'
        ],
        javascriptLibraries: [
            '/js-lib/knime/service/knime_service_1_0_0.js',
            '/js-lib/jQuery/jquery-1.11.0.min.js',
            '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
            '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
            '/js-lib/jsTree/min/jstree.min.js',
            '/org/knime/js/base/node/widget/input/filechooser/fileChooserWidget.js'
        ],
        getViewValueMethodName: 'value',
        namespace: 'knimeFileChooserWidget'
    },
    nodeId: '9:0:4',
    isValid: false
};

describe('FileChooserWidget.vue AP', () => {
    let propsData;

    beforeAll(() => {
        window.KnimePageLoader = {};
    });

    beforeEach(() => {
        propsData = JSON.parse(JSON.stringify(propsDataTemplate));
        propsData.nodeConfig.viewRepresentation.runningOnServer = true;

        window.KnimePageLoader.isRunningInWebportal = vi.fn().mockReturnValue(false);
    });

    it('renders', () => {
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders with null tree', () => {
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        propsData.nodeConfig.viewRepresentation.tree = null;
        wrapper.setProps(JSON.parse(JSON.stringify(propsData)));
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('updates tree on change of viewRepresentation', async () => {
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        propsData.nodeConfig.viewRepresentation.tree = [];
        wrapper.setProps(JSON.parse(JSON.stringify(propsData)));
        await Vue.nextTick();
        expect(wrapper.vm.treeData).toStrictEqual([]);
    });


    it('sends @updateWidget if TreeSelect emits @item-click event', () => {
        let wrapper = mount(FileChooserWidget, {
            propsData
        });

        const comp = wrapper.findComponent(TreeSelect);

        // we just use any node its not the selected one
        comp.vm.$emit('item-click', comp.vm.$children[0], comp.vm.$children[0].$data.model, {});

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: '9:0:4',
            type: 'items',
            value: [
                {
                    path: 'knime://Testserver-master/Admin/Change%20Workflow%20Owners',
                    type: 'WORKFLOW'
                }
            ]
        });
    });

    it('shows info message if tree is empty', () => {
        propsData.nodeConfig.viewRepresentation.tree = [];
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.vm.infoMessage).toStrictEqual('No items found for selection.');
        expect(wrapper.text()).toContain('No items found for selection.');
    });

    it('shows info message if it is not running on the server', () => {
        propsData.nodeConfig.viewRepresentation.runningOnServer = false;
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.vm.infoMessage).toStrictEqual('File selection only possible on server.');
    });

    it('checks, that the default item is returned when run in the AP', async () => {
        propsData.nodeConfig.viewRepresentation.runningOnServer = false;
        propsData.nodeConfig.viewRepresentation.tree = undefined;
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        await Vue.nextTick();

        expect(wrapper.vm.viewRep.currentValue.items).toStrictEqual(
            [
                {
                    path: 'knime://Devserver/file_chooser_verification/directory_folder/a/customers.csv',
                    type: 'WORKFLOW'
                }
            ]
        );
    });

    it('reports as valid if info message is shown', () => {
        propsData.nodeConfig.viewRepresentation.runningOnServer = false;
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: true,
            errorMessage: ''
        });
    });
});

describe('FileChooserWidget.vue WebPortal', () => {
    let propsData, store, localVue, mocks;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
        window.KnimePageLoader = {};
    });

    beforeEach(() => {
        propsData = JSON.parse(JSON.stringify(propsDataTemplate));
        propsData.nodeConfig.viewRepresentation.runningOnServer = false;
        propsData.nodeConfig.viewRepresentation.tree = [];

        store = new Vuex.Store({
            modules: {
                api: {
                    getters: {
                        repository: () => () => new Promise((resolve) => {
                            resolve({ response: mocks.repoData });
                        })
                    },
                    namespaced: true
                },
                pagebuilder: {
                    state: {
                        resourceBaseUrl: '/'
                    }
                },
                wizardExecution: {
                    getters: {
                        workflowPath: vi.fn().mockReturnValue('/../test/../')
                    },
                    namespaced: true
                }
            }
        });
        mocks = {};
        mocks.$store = store;
        mocks.repoData = {
            children: [
                {
                    _class:
                        'com.knime.enterprise.server.rest.api.v4.repository.ent.WorkflowGroup',
                    path: '/file_chooser_verification/directory_folder/a',
                    type: 'WorkflowGroup',
                    children: [
                        {
                            _class:
                                'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
                            path:
                                '/file_chooser_verification/directory_folder/a/customers.csv',
                            type: 'WorkflowGroup',
                            size: 340735,
                            owner: 'knimeadmin'
                        },
                        {
                            _class:
                                'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
                            path:
                                '/file_chooser_verification/directory_folder/a/customers.csv',
                            type: 'Data',
                            size: 340735,
                            owner: 'knimeadmin'
                        },
                        {
                            _class:
                                'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
                            path:
                                '/file_chooser_verification/directory_folder/a/customers1.csv',
                            type: 'Foo',
                            size: 340735,
                            owner: 'knimeadmin'
                        },
                        {
                            _class:
                                'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
                            path:
                                '/file_chooser_verification/directory_folder/a/customers.zip',
                            type: 'Data',
                            size: 340735,
                            owner: 'knimeadmin'
                        }
                    ],
                    owner: 'knimeadmin'
                }
            ]
        };
        // mocks the pageloade to simulate execution in new webportal
        window.KnimePageLoader.isRunningInWebportal = vi.fn().mockReturnValue(true);
    });

    it('updates tree on change of viewRepresentation on new WebPortal', async () => {
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        propsData.nodeConfig.viewRepresentation.tree = [];
        wrapper.setProps(JSON.parse(JSON.stringify(propsData)));
        expect(wrapper.vm.treeData).toStrictEqual([]);
    });

    it('shows no info message if is running on new webportal and tree is present', async () => {
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.infoMessage).toStrictEqual(null);
        const treeSelect = wrapper.findComponent(TreeSelect);
        expect(treeSelect.exists()).toBe(true);
    });

    it('shows info message if it is not running on the server', () => {
        window.KnimePageLoader.isRunningInWebportal = vi.fn().mockReturnValueOnce(false);
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        expect(wrapper.vm.infoMessage).toStrictEqual('File selection only possible on server.');
    });

    it('reports as valid if info message is shown', () => {
        window.KnimePageLoader.isRunningInWebportal = vi.fn().mockReturnValueOnce(false);
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: true,
            errorMessage: ''
        });
    });

    it('fails validation if nothing is selected but selection is required', async () => {
        mocks.repoData.children[0].children[1].path = '/file_chooser_verification/directory_folder/a/customers1.csv';
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: false,
            errorMessage: 'Selection is required.'
        });
    });

    it('creates a test where nothing is selected, but selection is required and possible', async () => {
        propsData.nodeConfig.viewRepresentation.selectDataFiles = false;
        propsData.nodeConfig.viewRepresentation.selectWorkflows = false;
        propsData.nodeConfig.viewRepresentation.required = true;
        mocks.repoData.children[0].children = [{
            _class: 'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
            path: '/file_chooser_verification/directory_folder/a/customers.csv',
            type: 'Data',
            size: 340735,
            owner: 'knimeadmin'
        }, {
            _class: 'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
            path: '/file_chooser_verification/directory_folder/test/customers.csv',
            type: 'Test',
            size: 340735,
            owner: 'knimeadmin'
        }, {
            _class: 'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
            path: '/file_chooser_verification/directory_folder/test/customers.csv',
            type: 'Workflow',
            size: 340735,
            owner: 'knimeadmin'
        }];
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: false,
            errorMessage: 'Selection is required.'
        });
    });

    it('creates a damaged tree', async () => {
        propsData.nodeConfig.viewRepresentation.required = true;
        propsData.nodeConfig.viewRepresentation.tree = [];
        mocks.repoData.children[0].children = [{
            _class: 'com.knime.enterprise.server.rest.api.v4.repository.ent.Data',
            type: 'Data',
            size: 340735,
            owner: 'knimeadmin'
        }];
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.infoMessage).toStrictEqual('No items found for selection.');
        expect(wrapper.text()).toContain('No items found for selection.');
    });

    it('tests workflow relative paths', async () => {
        propsData.nodeConfig.viewRepresentation.required = true;
        propsData.nodeConfig.viewRepresentation.rootDir = 'knime://test/../test/../test.csv';
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: true,
            errorMessage: null
        });
    });

    it('tests workflow relative paths with knime.workflow', async () => {
        propsData.nodeConfig.viewRepresentation.required = true;
        propsData.nodeConfig.viewRepresentation.rootDir = 'knime://knime.workflow/test/blabla';
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: true,
            errorMessage: null
        });
    });

    it('tests custom mountIDs', async () => {
        propsData.nodeConfig.viewRepresentation.required = true;
        propsData.nodeConfig.viewRepresentation.rootDir = 'knime://knime.workflow/test/blabla';
        propsData.nodeConfig.viewRepresentation.useDefaultMountId = false;
        propsData.nodeConfig.viewRepresentation.customMountId = 'test://';
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: true,
            errorMessage: null
        });
    });

    it('shows a info message if the repo cannot be resolved', async () => {
        mocks.$store = new Vuex.Store({
            modules: {
                api: {
                    getters: {
                        repository: () => () => new Promise((resolve) => {
                            resolve({ errorResponse: 'Error' });
                        })
                    },
                    namespaced: true
                },
                pagebuilder: {
                    state: {
                        resourceBaseUrl: '/'
                    }
                },
                wizardExecution: {
                    getters: {
                        workflowPath: vi.fn().mockReturnValue('/../test/../')
                    },
                    namespaced: true
                }
            }
        });
        let wrapper = mount(FileChooserWidget, {
            propsData,
            mocks
        });
        await Vue.nextTick();
        expect(wrapper.vm.infoMessage).toStrictEqual('No items found for selection.');
        expect(wrapper.text()).toContain('No items found for selection.');
    });
});
