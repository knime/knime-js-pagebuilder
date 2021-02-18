import { mount, shallowMount } from '@vue/test-utils';

import FileChooserWidget from '@/components/widgets/selection/FileChooserWidget';
import TreeSelect from '@/components/widgets/baseElements/selection/TreeSelect';

describe('FileChooserWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
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
                                path: 'knime://Devserver/Test%20Workflows/Demo/Simple%20Interaction',
                                type: 'WORKFLOW'
                            }
                        ]
                    },
                    selectWorkflows: true,
                    selectDirectories: false,
                    selectDataFiles: false,
                    useDefaultMountId: true,
                    customMountId: '',
                    rootDir: '/',
                    fileTypes: [],
                    multipleSelection: true,
                    errorMessage: '',
                    tree: [
                        {
                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                            state: {
                                opened: false,
                                selected: false,
                                disabled: true
                            },
                            text: 'Admin',
                            type: 'DIRECTORY',
                            children: [
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
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
    });

    it('renders', () => {
        let wrapper = shallowMount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('updates tree on change of viewRepresentation', () => {
        let wrapper = shallowMount(FileChooserWidget, {
            propsData
        });
        propsData.nodeConfig.viewRepresentation.tree = [];
        wrapper.setProps(JSON.parse(JSON.stringify(propsData)));
        expect(wrapper.vm.treeData).toStrictEqual([]);
    });

    it('sends @updateWidget if TreeSelect emits @item-click event', () => {
        let wrapper = mount(FileChooserWidget, {
            propsData
        });

        const comp = wrapper.find(TreeSelect);

        // we just use any node its not the selected one
        comp.vm.$emit('item-click', comp.vm.$children[0], comp.vm.$children[0].$data.model, {});

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: '9:0:4',
            type: 'items',
            value: [
                {
                    path: 'knime://Testserver-master/Admin/Change Workflow Owners',
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

    it('shows info message if runningOnServer is false', () => {
        propsData.nodeConfig.viewRepresentation.runningOnServer = false;
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.vm.infoMessage).toStrictEqual('File selection only possible on server.');
        expect(wrapper.text()).toContain('File selection only possible on server.');
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

    it('fails validation if nothing is selected but selection is required', () => {
        propsData.nodeConfig.viewRepresentation.required = true;
        propsData.nodeConfig.viewRepresentation.tree[0].children[0].state.selected = false;
        let wrapper = mount(FileChooserWidget, {
            propsData
        });
        expect(wrapper.vm.validate()).toStrictEqual({
            isValid: false,
            errorMessage: 'Selection is required.'
        });
    });

});
