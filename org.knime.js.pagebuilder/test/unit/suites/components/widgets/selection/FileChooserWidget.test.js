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
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Configure Default Usernames Roles and Passwords',
                                    type: 'SOME-TYPE-WILL-BE-FILE',
                                    children: null,
                                    id: '/Admin/Configure Default Usernames Roles and Passwords'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'configure_usernames_roles_and_passwords_for_knime_server',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/configure_usernames_roles_and_passwords_for_knime_server'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Delete Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Delete Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Discard Failed Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Discard Failed Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Display Executor Information',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Display Executor Information'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Empty Recycle Bin',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Empty Recycle Bin'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Empty Trash',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Empty Trash'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Enable_Disable Scheduled Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Enable_Disable Scheduled Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'List All Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/List All Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'List Scheduled Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/List Scheduled Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'list_scheduled_jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/list_scheduled_jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Log Parser and Usage Reporting',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Log Parser and Usage Reporting'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Modify Scheduled Jobs',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Modify Scheduled Jobs'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Schedule Jobs via WebPortal',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Admin/Schedule Jobs via WebPortal'
                                }
                            ],
                            id: '/Admin'
                        },
                        {
                            icon: './VAADIN/themes/knime/img/workflow.png',
                            state: {
                                opened: false,
                                selected: false,
                                disabled: false
                            },
                            text: 'Capture-0_7_0_15_12',
                            type: 'WORKFLOW',
                            children: null,
                            id: '/Capture-0_7_0_15_12'
                        },
                        {
                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                            state: {
                                opened: false,
                                selected: false,
                                disabled: true
                            },
                            text: 'Examples',
                            type: 'DIRECTORY',
                            children: [
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'Orchestration',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '01 - Build a Simple Model Training for Classification ' +
                                                '(Execute on a Schedule)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/Orchestration/01 - Build a Simple Model Training for ' +
                                                'Classification (Execute on a Schedule)'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '02 - Call (Remote) Workflow',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/Orchestration/02 - Call (Remote) Workflow'
                                        }
                                    ],
                                    id: '/Examples/Orchestration'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'Reporting',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '01 - Simple Reporting Example (Execute on a Schedule)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/Reporting/01 - Simple Reporting Example ' +
                                                '(Execute on a Schedule)'
                                        }
                                    ],
                                    id: '/Examples/Reporting'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'REST',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Predict Results Using REST API',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/REST/Predict Results Using REST API'
                                        }
                                    ],
                                    id: '/Examples/REST'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'Test Workflows (add your own for databases)',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '01 - Test Basic Workflow - Data Blending',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/Test Workflows (add your own for databases)/01 - ' +
                                                'Test Basic Workflow - Data Blending'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '02 - Extract System and Environment Variables (Linux only) - ' +
                                                '20140703',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/Test Workflows (add your own for databases)/02 - ' +
                                                'Extract System and Environment Variables (Linux only) - 20140703'
                                        }
                                    ],
                                    id: '/Examples/Test Workflows (add your own for databases)'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'WebPortal',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'DataVisualization_AirlineDataset',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/DataVisualization_AirlineDataset'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Interactive_Webportal_Visualisation_of_Neighbor_Network',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/Interactive_Webportal_Visualisation_' +
                                                'of_Neighbor_Network'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Using_the_Sunburst_Chart_for_Titanic',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/Using_the_Sunburst_Chart_for_Titanic'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'WebPortal Customer Segmentation Use Case (Advanced)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/WebPortal Customer Segmentation Use ' +
                                                'Case (Advanced)'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'WebPortal Data Mining (Basic)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/WebPortal Data Mining (Basic)'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Webportal IF statements',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Examples/WebPortal/Webportal IF statements'
                                        }
                                    ],
                                    id: '/Examples/WebPortal'
                                }
                            ],
                            id: '/Examples'
                        },
                        {
                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                            state: {
                                opened: true,
                                selected: false,
                                disabled: true
                            },
                            text: 'Test Workflows',
                            type: 'DIRECTORY',
                            children: [
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'A couple widgets',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/A couple widgets'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: true,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'Demo',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '01_Guided_Visualization',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Test Workflows/Demo/01_Guided_Visualization'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Hub Browser Percentage',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Test Workflows/Demo/Hub Browser Percentage'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Legacy Mode',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Test Workflows/Demo/Legacy Mode'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Simple Interaction',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Test Workflows/Demo/Simple Interaction'
                                        }
                                    ],
                                    id: '/Test Workflows/Demo'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'File Download',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/File Download'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'File Upload',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/File Upload'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Generic or not so generic',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Generic or not so generic'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Large tables',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Large tables'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Layout sizing',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Layout sizing'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'non_available_webnodes',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/non_available_webnodes'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Scatter Plot',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Scatter Plot'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Selection Translation Station',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Selection Translation Station'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Selection Translation Station 2',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Selection Translation Station 2'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Server-side Validation Test',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Server-side Validation Test'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Simple Interaction',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Simple Interaction'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Simple Report Example',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Simple Report Example'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Slider Widget',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Slider Widget'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Test Value Passing',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Test Value Passing'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'Time will tell',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/Time will tell'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: false
                                    },
                                    text: 'WebPortal Showcase',
                                    type: 'WORKFLOW',
                                    children: null,
                                    id: '/Test Workflows/WebPortal Showcase'
                                }
                            ],
                            id: '/Test Workflows'
                        },
                        {
                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                            state: {
                                opened: false,
                                selected: false,
                                disabled: true
                            },
                            text: 'Users',
                            type: 'DIRECTORY',
                            children: [
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'alexander.staehle',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '02_Active_Learning_for_Document_Classification',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/alexander.staehle/02_Active_Learning_for_Document_' +
                                                'Classification'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: '07_BIRT_Example_Basic',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/alexander.staehle/07_BIRT_Example_Basic'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'credentials_input',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/alexander.staehle/credentials_input'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'vue_widget_test_wf',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/alexander.staehle/vue_widget_test_wf'
                                        }
                                    ],
                                    id: '/Users/alexander.staehle'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'ben.laney',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'configuration_parameters_test_full_final',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/configuration_parameters_test_full_final'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Date_Time_Input_widget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/Date_Time_Input_widget'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'evotech_form_validation_example',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/evotech_form_validation_example'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'File Download',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/File Download'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'File Download(2)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/File Download(2)'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'file_chooser_widget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/file_chooser_widget'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'file_download',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/file_download'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'file_upload1',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/file_upload1'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'legacy_widgets_demo',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/legacy_widgets_demo'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'server_validation_view_failure',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/server_validation_view_failure'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Simple_AutoML-DataUpload',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/Simple_AutoML-DataUpload'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: 'Team_1_AutoML',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: '01_Guided_Analytics_for_ML_Automation',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/01_Guided_An' +
                                                                'alytics_for_ML_Automation/01_Guided_Analytic' +
                                                                's_for_ML_Automation'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: 'Models',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: true
                                                                    },
                                                                    text: 'classification',
                                                                    type: 'DIRECTORY',
                                                                    children: [
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workf' +
                                                                                'low.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'dec_tree',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/' +
                                                                                '01_Guided_Analytics_for_ML_Automa' +
                                                                                'tion/Models/classification/dec_tree'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'h2o_gbm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01' +
                                                                                '_Guided_Analytics_for_ML_Automati' +
                                                                                'on/Models/classification/h2o_gbm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'h2o_glm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01' +
                                                                                '_Guided_Analytics_for_ML_Automat' +
                                                                                'ion/Models/classification/h2o_glm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'h2o_naive',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01_' +
                                                                                'Guided_Analytics_for_ML_Automatio' +
                                                                                'n/Models/classification/h2o_naive'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workf' +
                                                                                'low.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'h2o_rndfor',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01_Gu' +
                                                                                'ided_Analytics_for_ML_Automation' +
                                                                                '/Models/classification/h2o_rndfor'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'log_regression',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01' +
                                                                                '_Guided_Analytics_for_ML_Automati' +
                                                                                'on/Models/classification/lo' +
                                                                                'g_regression'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'mlp',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01_Gu' +
                                                                                'ided_Analytics_for_ML_Automation/Mod' +
                                                                                'els/classification/mlp'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'svm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01_G' +
                                                                                'uided_Analytics_for_ML_Automation/M' +
                                                                                'odels/classification/svm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'xgboost',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/ben.laney/Team_1_AutoML/01' +
                                                                                '_Guided_Analytics_for_ML_Automati' +
                                                                                'on/Models/classification/xgboost'
                                                                        }
                                                                    ],
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Models/classif' +
                                                                        'ication'
                                                                }
                                                            ],
                                                            id: '/Users/ben.laney/Team_1_AutoML/01_Guided_Analytic' +
                                                                's_for_ML_Automation/Models'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: 'Prediction',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_dec_tree',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Prediction/Pre' +
                                                                        'diction_dec_tree'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_h2o_gbm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_' +
                                                                        'Analytics_for_ML_Automation/Prediction/Pr' +
                                                                        'ediction_h2o_gbm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_h2o_glm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_' +
                                                                        'Analytics_for_ML_Automation/Prediction/Pr' +
                                                                        'ediction_h2o_glm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_h2o_naive',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_' +
                                                                        'Analytics_for_ML_Automation/Prediction/P' +
                                                                        'rediction_h2o_naive'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_h2o_rndfor',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Prediction/Pred' +
                                                                        'iction_h2o_rndfor'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_log_regression',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Prediction/Pre' +
                                                                        'diction_log_regression'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_mlp',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Prediction/Pr' +
                                                                        'ediction_mlp'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_svm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_An' +
                                                                        'alytics_for_ML_Automation/Prediction/Pred' +
                                                                        'iction_svm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Prediction_xgboost',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_A' +
                                                                        'nalytics_for_ML_Automation/Prediction/Pre' +
                                                                        'diction_xgboost'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'Workflow_to_Binary',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_An' +
                                                                        'alytics_for_ML_Automation/Prediction/Workf' +
                                                                        'low_to_Binary'
                                                                }
                                                            ],
                                                            id: '/Users/ben.laney/Team_1_AutoML/01_Guided_Analytics_' +
                                                                'for_ML_Automation/Prediction'
                                                        }
                                                    ],
                                                    id: '/Users/ben.laney/Team_1_AutoML/01_Guided_Analytics_for_' +
                                                        'ML_Automation'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: '04_Integrated_Deployment-Selected_for_Hub',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: '01 Automation of Data Prep and Modeling - Not a' +
                                                                ' WebPortal Application',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_De' +
                                                                'ployment-Selected_for_Hub/01 Automation of Data P' +
                                                                'rep and Modeling - Not a WebPortal Application'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: '06 Automation of Data Prep and Modeling - WebP' +
                                                                'ortal Application - Retrain in here then Write Dep' +
                                                                'loy in a Single Capture-square',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_De' +
                                                                'ployment-Selected_for_Hub/06 Automation of Data ' +
                                                                'Prep and Modeling - WebPortal Application - Retr' +
                                                                'ain in here then Write Deploy in a Single Capt' +
                                                                'ure-square'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: '06 Automation of Data Prep and Modeling - WebPo' +
                                                                'rtal Application - Retrain in here then Write De' +
                                                                'ploy in a Single Capture-square-WriterBug',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_De' +
                                                                'ployment-Selected_for_Hub/06 Automation of Data' +
                                                                ' Prep and Modeling - WebPortal Application - R' +
                                                                'etrain in here then Write Deploy in a Single ' +
                                                                'Capture-square-WriterBug'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Guided_Analytics_with_Shared_Components-Wt' +
                                                                'bW-todeploy-noPMML',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_' +
                                                                'Deployment-Selected_for_Hub/Guided_Analytics_' +
                                                                'with_Shared_Components-WtbW-todeploy-noPMML'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Guided_Analytics_with_Shared_Components-WtbW' +
                                                                '-tried-to-fix',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_' +
                                                                'Deployment-Selected_for_Hub/Guided_Analytics_w' +
                                                                'ith_Shared_Components-WtbW-tried-to-fix'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Guided_Automation_and_Monitoring_Testing',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_Dep' +
                                                                'loyment-Selected_for_Hub/Guided_Automation_and_' +
                                                                'Monitoring_Testing'
                                                        }
                                                    ],
                                                    id: '/Users/ben.laney/Team_1_AutoML/04_Integrated_Deployment' +
                                                        '-Selected_for_Hub'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'COVID-19_Live_Visualization',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/ben.laney/Team_1_AutoML/COVID-19_Live_Visualization'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Deployed_Models',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'deployed_model',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/ben.laney/Team_1_AutoML/Deployed_Models' +
                                                                '/deployed_model'
                                                        }
                                                    ],
                                                    id: '/Users/ben.laney/Team_1_AutoML/Deployed_Models'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'Simple_AutoML',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/ben.laney/Team_1_AutoML/Simple_AutoML'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'Simple_AutoML-nodatabug',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/ben.laney/Team_1_AutoML/Simple_AutoML-nodatabug'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'Simple_AutoML_no-hidden-credentialfake',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/ben.laney/Team_1_AutoML/Simple_AutoML_no-hi' +
                                                        'dden-credentialfake'
                                                }
                                            ],
                                            id: '/Users/ben.laney/Team_1_AutoML'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'truate_wp_error',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/truate_wp_error'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'url_param_single_string-input-10',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/url_param_single_string-input-10'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'view_alert_example_2',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/ben.laney/view_alert_example_2'
                                        }
                                    ],
                                    id: '/Users/ben.laney'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'daniel.bogenrieder',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'TestMoleculeSketcher',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/daniel.bogenrieder/TestMoleculeSketcher'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'WidgetTest',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/daniel.bogenrieder/WidgetTest'
                                        }
                                    ],
                                    id: '/Users/daniel.bogenrieder'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'gabriel.einsdorf',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'upload test',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/gabriel.einsdorf/upload test'
                                        }
                                    ],
                                    id: '/Users/gabriel.einsdorf'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'janina.mothes',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'CredentialQuickform',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/janina.mothes/CredentialQuickform'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'CredentialQuickform_noRender',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/janina.mothes/CredentialQuickform_noRender'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'CredentialWidget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/janina.mothes/CredentialWidget'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'CredentialWidget_noRender',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/janina.mothes/CredentialWidget_noRender'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'MoleculeSketcherWidget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/janina.mothes/MoleculeSketcherWidget'
                                        }
                                    ],
                                    id: '/Users/janina.mothes'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'kathrin.melcher',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'dropdown-widget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/kathrin.melcher/dropdown-widget'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Test_Componants',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/kathrin.melcher/Test_Componants'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Test_Componants_v2',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/kathrin.melcher/Test_Componants_v2'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Test_Componants_without_lagacy_flag',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/kathrin.melcher/Test_Componants_without_lagacy_flag'
                                        }
                                    ],
                                    id: '/Users/kathrin.melcher'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'martin.horn',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: '01_Guided_Analytics_for_ML_Automation-nightly',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automat' +
                                                        'ion-nightly/01_Guided_Analytics_for_ML_Automation'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automation-' +
                                                        'nightly/01_Guided_Analytics_for_ML_Automation-nightly'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly(2)',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automatio' +
                                                        'n-nightly/01_Guided_Analytics_for_ML_Automation-nightly(2)'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-buggedParChunk',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automatio' +
                                                        'n-nightly/01_Guided_Analytics_for_ML_Automation-nightly' +
                                                        '-buggedParChunk'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-ds1',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automation-' +
                                                        'nightly/01_Guided_Analytics_for_ML_Automation-nightly-ds1'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-ds1-executed',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automation-n' +
                                                        'ightly/01_Guided_Analytics_for_ML_Automation-nightly-ds1-' +
                                                        'executed'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-executed',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automatio' +
                                                        'n-nightly/01_Guided_Analytics_for_ML_Automation-nightl' +
                                                        'y-executed'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Models',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: 'classification',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'dec_tree',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classificat' +
                                                                        'ion/dec_tree'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_gbm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classifi' +
                                                                        'cation/h2o_gbm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_glm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classificat' +
                                                                        'ion/h2o_glm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_naive',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classificat' +
                                                                        'ion/h2o_naive'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_rndfor',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classificat' +
                                                                        'ion/h2o_rndfor'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'log_regression',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_' +
                                                                        'ML_Automation-nightly/Models/classificat' +
                                                                        'ion/log_regression'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'mlp',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_fo' +
                                                                        'r_ML_Automation-nightly/Models/classifica' +
                                                                        'tion/mlp'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'svm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_fo' +
                                                                        'r_ML_Automation-nightly/Models/classifica' +
                                                                        'tion/svm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'xgboost',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/martin.horn/01_Guided_Analytics_for' +
                                                                        '_ML_Automation-nightly/Models/classificat' +
                                                                        'ion/xgboost'
                                                                }
                                                            ],
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Au' +
                                                                'tomation-nightly/Models/classification'
                                                        }
                                                    ],
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automati' +
                                                        'on-nightly/Models'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Prediction',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_dec_tree',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Autom' +
                                                                'ation-nightly/Prediction/Prediction_dec_tree'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_gbm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Aut' +
                                                                'omation-nightly/Prediction/Prediction_h2o_gbm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_glm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Auto' +
                                                                'mation-nightly/Prediction/Prediction_h2o_glm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_naive',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_A' +
                                                                'utomation-nightly/Prediction/Prediction_h2o_naive'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_rndfor',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Aut' +
                                                                'omation-nightly/Prediction/Prediction_h2o_rndfor'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_log_regression',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Au' +
                                                                'tomation-nightly/Prediction/Prediction_log_regression'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_mlp',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Au' +
                                                                'tomation-nightly/Prediction/Prediction_mlp'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_svm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Au' +
                                                                'tomation-nightly/Prediction/Prediction_svm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_xgboost',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Au' +
                                                                'tomation-nightly/Prediction/Prediction_xgboost'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Workflow_to_Binary',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_' +
                                                                'Automation-nightly/Prediction/Workflow_to_Binary'
                                                        }
                                                    ],
                                                    id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automati' +
                                                        'on-nightly/Prediction'
                                                }
                                            ],
                                            id: '/Users/martin.horn/01_Guided_Analytics_for_ML_Automation-nightly'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: '11298_callWorkflow',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'callee',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/11298_callWorkflow/callee'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: 'KNIME_project',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/martin.horn/11298_callWorkflow/KNIME_project'
                                                }
                                            ],
                                            id: '/Users/martin.horn/11298_callWorkflow'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'AP-13907_nested_capture_scopes_in_workflow_executor_problem',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/AP-13907_nested_capture_scopes_in_workflow' +
                                                '_executor_problem'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'content-errors_recloop',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/content-errors_recloop'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'file_upload',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/file_upload'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'KNIME_project',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/KNIME_project'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'KNIME_project2',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/KNIME_project2'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'SpecialCharacterWindowsProblem',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/SpecialCharacterWindowsProblem'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'test_workflow_executor',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/test_workflow_executor'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Wizard Execution Long Reexecute',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/martin.horn/Wizard Execution Long Reexecute'
                                        }
                                    ],
                                    id: '/Users/martin.horn'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'paolo.tamagnini',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: '01_Guided_Analytics_for_ML_Automation-manually-rexecuted',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Automa' +
                                                        'tion-manually-rexecuted/01_Guided_Analytics_for_ML_Automation'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Models',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: 'classification',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'dec_tree',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyt' +
                                                                        'ics_for_ML_Automation-manually-rexecut' +
                                                                        'ed/Models/classification/dec_tree'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_gbm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyt' +
                                                                        'ics_for_ML_Automation-manually-rexecute' +
                                                                        'd/Models/classification/h2o_gbm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_glm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyti' +
                                                                        'cs_for_ML_Automation-manually-rexecuted/' +
                                                                        'Models/classification/h2o_glm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_naive',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytic' +
                                                                        's_for_ML_Automation-manually-rexecuted/M' +
                                                                        'odels/classification/h2o_naive'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_rndfor',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics' +
                                                                        '_for_ML_Automation-manually-rexecuted/Mo' +
                                                                        'dels/classification/h2o_rndfor'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'log_regression',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyt' +
                                                                        'ics_for_ML_Automation-manually-rexecut' +
                                                                        'ed/Models/classification/log_regression'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'mlp',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics' +
                                                                        '_for_ML_Automation-manually-rexecuted/M' +
                                                                        'odels/classification/mlp'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'svm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytic' +
                                                                        's_for_ML_Automation-manually-rexecuted/M' +
                                                                        'odels/classification/svm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'xgboost',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytic' +
                                                                        's_for_ML_Automation-manually-rexecuted/Mo' +
                                                                        'dels/classification/xgboost'
                                                                }
                                                            ],
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_' +
                                                                'ML_Automation-manually-rexecuted/Models/classification'
                                                        }
                                                    ],
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Au' +
                                                        'tomation-manually-rexecuted/Models'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Prediction',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_dec_tree',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_' +
                                                                'for_ML_Automation-manually-rexecuted/Predict' +
                                                                'ion/Prediction_dec_tree'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_gbm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-manually-rexecuted/Prediction/Predi' +
                                                                'ction_h2o_gbm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_glm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for' +
                                                                '_ML_Automation-manually-rexecuted/Predictio' +
                                                                'n/Prediction_h2o_glm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_naive',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for' +
                                                                '_ML_Automation-manually-rexecuted/Prediction/' +
                                                                'Prediction_h2o_naive'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_rndfor',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for' +
                                                                '_ML_Automation-manually-rexecuted/Prediction' +
                                                                '/Prediction_h2o_rndfor'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_log_regression',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_fo' +
                                                                'r_ML_Automation-manually-rexecuted/Pre' +
                                                                'diction/Prediction_log_regression'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_mlp',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics' +
                                                                '_for_ML_Automation-manually-rexecuted/Predic' +
                                                                'tion/Prediction_mlp'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_svm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for' +
                                                                '_ML_Automation-manually-rexecuted/Prediction' +
                                                                '/Prediction_svm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_xgboost',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-manually-rexecuted/Prediction/Pred' +
                                                                'iction_xgboost'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Workflow_to_Binary',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_f' +
                                                                'or_ML_Automation-manually-rexecuted/Predictio' +
                                                                'n/Workflow_to_Binary'
                                                        }
                                                    ],
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Au' +
                                                        'tomation-manually-rexecuted/Prediction'
                                                }
                                            ],
                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Automati' +
                                                'on-manually-rexecuted'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: '01_Guided_Analytics_for_ML_Automation-nightly',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Autom' +
                                                        'ation-nightly/01_Guided_Analytics_for_ML_Automation'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Autom' +
                                                        'ation-nightly/01_Guided_Analytics_for_ML_Automation-nightly'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-bugged' +
                                                        'ParChunk',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Automatio' +
                                                        'n-nightly/01_Guided_Analytics_for_ML_Automation-nightly-' +
                                                        'buggedParChunk'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-ds1',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Automati' +
                                                        'on-nightly/01_Guided_Analytics_for_ML_Automation-nightly-ds1'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-ds1-executed',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Autom' +
                                                        'ation-nightly/01_Guided_Analytics_for_ML_Automation-ni' +
                                                        'ghtly-ds1-executed'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Analytics_for_ML_Automation-nightly-executed',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Autom' +
                                                        'ation-nightly/01_Guided_Analytics_for_ML_Automation-n' +
                                                        'ightly-executed'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Models',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: 'classification',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'dec_tree',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Anal' +
                                                                        'ytics_for_ML_Automation-nightly/Model' +
                                                                        's/classification/dec_tree'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_gbm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Anal' +
                                                                        'ytics_for_ML_Automation-nightly/Models' +
                                                                        '/classification/h2o_gbm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_glm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyti' +
                                                                        'cs_for_ML_Automation-nightly/Models/clas' +
                                                                        'sification/h2o_glm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_naive',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics' +
                                                                        '_for_ML_Automation-nightly/Models/class' +
                                                                        'ification/h2o_naive'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'h2o_rndfor',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analyti' +
                                                                        'cs_for_ML_Automation-nightly/Models/clas' +
                                                                        'sification/h2o_rndfor'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'log_regression',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics' +
                                                                        '_for_ML_Automation-nightly/Models/classif' +
                                                                        'ication/log_regression'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'mlp',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_f' +
                                                                        'or_ML_Automation-nightly/Models/classifica' +
                                                                        'tion/mlp'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'svm',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytic' +
                                                                        's_for_ML_Automation-nightly/Models/classi' +
                                                                        'fication/svm'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: 'xgboost',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytic' +
                                                                        's_for_ML_Automation-nightly/Models/class' +
                                                                        'ification/xgboost'
                                                                }
                                                            ],
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-nightly/Models/classification'
                                                        }
                                                    ],
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_Autom' +
                                                        'ation-nightly/Models'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: 'Prediction',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_dec_tree',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_' +
                                                                'ML_Automation-nightly/Prediction/Prediction_dec_tree'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_gbm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_' +
                                                                'ML_Automation-nightly/Prediction/Prediction_h2o_gbm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_glm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for' +
                                                                '_ML_Automation-nightly/Prediction/Prediction_h2o_glm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_naive',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_M' +
                                                                'L_Automation-nightly/Prediction/Prediction_h2o_naive'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_h2o_rndfor',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-nightly/Prediction/Prediction_h2o_rndfor'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_log_regression',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-nightly/Prediction/Prediction_log_reg' +
                                                                'ression'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_mlp',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML' +
                                                                '_Automation-nightly/Prediction/Prediction_mlp'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_svm',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_M' +
                                                                'L_Automation-nightly/Prediction/Prediction_svm'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Prediction_xgboost',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_' +
                                                                'Automation-nightly/Prediction/Prediction_xgboost'
                                                        },
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: false
                                                            },
                                                            text: 'Workflow_to_Binary',
                                                            type: 'WORKFLOW',
                                                            children: null,
                                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_f' +
                                                                'or_ML_Automation-nightly/Prediction/Workflow_to_Binary'
                                                        }
                                                    ],
                                                    id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_' +
                                                        'ML_Automation-nightly/Prediction'
                                                }
                                            ],
                                            id: '/Users/paolo.tamagnini/01_Guided_Analytics_for_ML_A' +
                                                'utomation-nightly'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Capture-0_7_0_15_12',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Capture-0_7_0_15_12'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Capture-5_7_0_15_12',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Capture-5_7_0_15_12'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Capture-6_8_0_15_12',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Capture-6_8_0_15_12'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Capture-8_8_0_15_12',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Capture-8_8_0_15_12'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Capture-9_7_0_15_12',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Capture-9_7_0_15_12'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'component test - for WebPortal',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/component test - for WebPortal'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'component test - for WebPortal - legacy on - only',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/component test - for WebPortal - lega' +
                                                'cy on - only'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'COVID-19_Live_Visualization',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/COVID-19_Live_Visualization'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'credential_widget_testserver',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/credential_widget_testserver'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'credential_widget_testserver-empty',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/credential_widget_testserver-empty'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'credential_widget_testserver-full',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/credential_widget_testserver-full'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'dropdown-widget',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/dropdown-widget'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'file_upload',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/file_upload'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'labeling_view_bug',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/labeling_view_bug'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: true
                                            },
                                            text: 'oldGAapps',
                                            type: 'DIRECTORY',
                                            children: [
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: false
                                                    },
                                                    text: '01_Guided_Labeling_for_Document_Classification',
                                                    type: 'WORKFLOW',
                                                    children: null,
                                                    id: '/Users/paolo.tamagnini/oldGAapps/01_Guided_Labeling_for' +
                                                        '_Document_Classification'
                                                },
                                                {
                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                    state: {
                                                        opened: false,
                                                        selected: false,
                                                        disabled: true
                                                    },
                                                    text: '36_Guided_Analytics_for_ML_Automation',
                                                    type: 'DIRECTORY',
                                                    children: [
                                                        {
                                                            icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                            state: {
                                                                opened: false,
                                                                selected: false,
                                                                disabled: true
                                                            },
                                                            text: '01_Guided_Analytics_for_ML_Automation',
                                                            type: 'DIRECTORY',
                                                            children: [
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflow.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: false
                                                                    },
                                                                    text: '01_Guided_Analytics_for_ML_Automation',
                                                                    type: 'WORKFLOW',
                                                                    children: null,
                                                                    id: '/Users/paolo.tamagnini/oldGAapps/36_Guide' +
                                                                        'd_Analytics_for_ML_Automation/01_Guided_An' +
                                                                        'alytics_for_ML_Automation/01_Guided_Anal' +
                                                                        'ytics_for_ML_Automation'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: true
                                                                    },
                                                                    text: 'Models',
                                                                    type: 'DIRECTORY',
                                                                    children: [
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workf' +
                                                                                'lowgroup.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: true
                                                                            },
                                                                            text: 'classification',
                                                                            type: 'DIRECTORY',
                                                                            children: [
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/im' +
                                                                                        'g/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'dec_tree',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/old' +
                                                                                        'GAapps/36_Guided_Analyti' +
                                                                                        'cs_for_ML_Automation/01_G' +
                                                                                        'uided_Analytics_for_ML_Au' +
                                                                                        'tomation/Models/classific' +
                                                                                        'ation/dec_tree'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/img' +
                                                                                        '/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'h2o_gbm',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/oldG' +
                                                                                        'Aapps/36_Guided_Analytics' +
                                                                                        '_for_ML_Automation/01_Gu' +
                                                                                        'ided_Analytics_for_ML_Au' +
                                                                                        'tomation/Models/classifi' +
                                                                                        'cation/h2o_gbm'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knim' +
                                                                                        'e/img/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'h2o_glm',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/ol' +
                                                                                        'dGAapps/36_Guided_Analyti' +
                                                                                        'cs_for_ML_Automation/01_G' +
                                                                                        'uided_Analytics_for_ML_Au' +
                                                                                        'tomation/Models/classific' +
                                                                                        'ation/h2o_glm'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/i' +
                                                                                        'mg/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'h2o_naive',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/old' +
                                                                                        'GAapps/36_Guided_Analytic' +
                                                                                        's_for_ML_Automation/01_Gui' +
                                                                                        'ded_Analytics_for_ML_Autom' +
                                                                                        'ation/Models/classification' +
                                                                                        '/h2o_naive'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/i' +
                                                                                        'mg/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'h2o_rndfor',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/oldG' +
                                                                                        'Aapps/36_Guided_Analytics_' +
                                                                                        'for_ML_Automation/01_Guide' +
                                                                                        'd_Analytics_for_ML_Automa' +
                                                                                        'tion/Models/classificati' +
                                                                                        'on/h2o_rndfor'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/i' +
                                                                                        'mg/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'log_regression',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/oldG' +
                                                                                        'Aapps/36_Guided_Analytics_f' +
                                                                                        'or_ML_Automation/01_Gui' +
                                                                                        'ded_Analytics_for_ML_Au' +
                                                                                        'tomation/Models/classifi' +
                                                                                        'cation/log_regression'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/' +
                                                                                        'img/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'mlp',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/o' +
                                                                                        'ldGAapps/36_Guided_Analy' +
                                                                                        'tics_for_ML_Automation/01' +
                                                                                        '_Guided_Analytics_for_ML' +
                                                                                        '_Automation/Models/class' +
                                                                                        'ification/mlp'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/' +
                                                                                        'img/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'svm',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/' +
                                                                                        'oldGAapps/36_Guided_Anal' +
                                                                                        'ytics_for_ML_Automation/' +
                                                                                        '01_Guided_Analytics_for_' +
                                                                                        'ML_Automation/Models/cla' +
                                                                                        'ssification/svm'
                                                                                },
                                                                                {
                                                                                    icon: './VAADIN/themes/knime/' +
                                                                                        'img/workflow.png',
                                                                                    state: {
                                                                                        opened: false,
                                                                                        selected: false,
                                                                                        disabled: false
                                                                                    },
                                                                                    text: 'xgboost',
                                                                                    type: 'WORKFLOW',
                                                                                    children: null,
                                                                                    id: '/Users/paolo.tamagnini/ol' +
                                                                                        'dGAapps/36_Guided_Analy' +
                                                                                        'tics_for_ML_Automation/0' +
                                                                                        '1_Guided_Analytics_for_M' +
                                                                                        'L_Automation/Models/clas' +
                                                                                        'sification/xgboost'
                                                                                }
                                                                            ],
                                                                            id: '/Users/paolo.tamagnini/oldGAap' +
                                                                                'ps/36_Guided_Analytics_for_ML_' +
                                                                                'Automation/01_Guided_Analytics_' +
                                                                                'for_ML_Automation/Models/classi' +
                                                                                'fication'
                                                                        }
                                                                    ],
                                                                    id: '/Users/paolo.tamagnini/oldGAapps/36_G' +
                                                                        'uided_Analytics_for_ML_Automation/01_G' +
                                                                        'uided_Analytics_for_ML_Automation/Models'
                                                                },
                                                                {
                                                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                                                    state: {
                                                                        opened: false,
                                                                        selected: false,
                                                                        disabled: true
                                                                    },
                                                                    text: 'Prediction',
                                                                    type: 'DIRECTORY',
                                                                    children: [
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_dec_tree',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapps/3' +
                                                                                '6_Guided_Analytics_for_ML_Automa' +
                                                                                'tion/01_Guided_Analytics_for_ML' +
                                                                                '_Automation/Prediction/Predicti' +
                                                                                'on_dec_tree'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_h2o_gbm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGA' +
                                                                                'apps/36_Guided_Analytics_for_M' +
                                                                                'L_Automation/01_Guided_Analyti' +
                                                                                'cs_for_ML_Automation/Predictio' +
                                                                                'n/Prediction_h2o_gbm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_h2o_glm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAa' +
                                                                                'pps/36_Guided_Analytics_for_ML' +
                                                                                '_Automation/01_Guided_Analytic' +
                                                                                's_for_ML_Automation/Prediction/' +
                                                                                'Prediction_h2o_glm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_h2o_naive',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapp' +
                                                                                's/36_Guided_Analytics_for_ML_Aut' +
                                                                                'omation/01_Guided_Analytics_for_ML' +
                                                                                '_Automation/Prediction/Prediction' +
                                                                                '_h2o_naive'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/wor' +
                                                                                'kflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_h2o_rndfor',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapp' +
                                                                                's/36_Guided_Analytics_for_ML_Au' +
                                                                                'tomation/01_Guided_Analytics_for_' +
                                                                                'ML_Automation/Prediction/Predicti' +
                                                                                'on_h2o_rndfor'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workf' +
                                                                                'low.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_log_regression',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapps/' +
                                                                                '36_Guided_Analytics_for_ML_Automa' +
                                                                                'tion/01_Guided_Analytics_for_ML_A' +
                                                                                'utomation/Prediction/Prediction_l' +
                                                                                'og_regression'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workflow' +
                                                                                '.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_mlp',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapps/' +
                                                                                '36_Guided_Analytics_for_ML_Automat' +
                                                                                'ion/01_Guided_Analytics_for_ML_Aut' +
                                                                                'omation/Prediction/Prediction_mlp'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/w' +
                                                                                'orkflow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_svm',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAap' +
                                                                                'ps/36_Guided_Analytics_for_ML_Au' +
                                                                                'tomation/01_Guided_Analytics_for' +
                                                                                '_ML_Automation/Prediction/Predic' +
                                                                                'tion_svm'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/workfl' +
                                                                                'ow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Prediction_xgboost',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapps/' +
                                                                                '36_Guided_Analytics_for_ML_Automa' +
                                                                                'tion/01_Guided_Analytics_for_ML_A' +
                                                                                'utomation/Prediction/Prediction_x' +
                                                                                'gboost'
                                                                        },
                                                                        {
                                                                            icon: './VAADIN/themes/knime/img/work' +
                                                                                'flow.png',
                                                                            state: {
                                                                                opened: false,
                                                                                selected: false,
                                                                                disabled: false
                                                                            },
                                                                            text: 'Workflow_to_Binary',
                                                                            type: 'WORKFLOW',
                                                                            children: null,
                                                                            id: '/Users/paolo.tamagnini/oldGAapps' +
                                                                                '/36_Guided_Analytics_for_ML_Aut' +
                                                                                'omation/01_Guided_Analytics_for' +
                                                                                '_ML_Automation/Prediction/Workflo' +
                                                                                'w_to_Binary'
                                                                        }
                                                                    ],
                                                                    id: '/Users/paolo.tamagnini/oldGAapps/36_Guid' +
                                                                        'ed_Analytics_for_ML_Automation/01_Guided' +
                                                                        '_Analytics_for_ML_Automation/Prediction'
                                                                }
                                                            ],
                                                            id: '/Users/paolo.tamagnini/oldGAapps/36_Guided_Analyt' +
                                                                'ics_for_ML_Automation/01_Guided_Analytics_for_ML_' +
                                                                'Automation'
                                                        }
                                                    ],
                                                    id: '/Users/paolo.tamagnini/oldGAapps/36_Guided_Analytics_fo' +
                                                        'r_ML_Automation'
                                                }
                                            ],
                                            id: '/Users/paolo.tamagnini/oldGAapps'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Simple_AutoML-DataUpload-devserver',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Simple_AutoML-DataUpload-devserver'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Simple_AutoML-manual-reset',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/Simple_AutoML-manual-reset'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'test-file-upload',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/test-file-upload'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'testserver-prop',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/paolo.tamagnini/testserver-prop'
                                        }
                                    ],
                                    id: '/Users/paolo.tamagnini'
                                },
                                {
                                    icon: './VAADIN/themes/knime/img/workflowgroup.png',
                                    state: {
                                        opened: false,
                                        selected: false,
                                        disabled: true
                                    },
                                    text: 'peter.schramm',
                                    type: 'DIRECTORY',
                                    children: [
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'new_widgets',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/peter.schramm/new_widgets'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'new_widgets(2)',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/peter.schramm/new_widgets(2)'
                                        },
                                        {
                                            icon: './VAADIN/themes/knime/img/workflow.png',
                                            state: {
                                                opened: false,
                                                selected: false,
                                                disabled: false
                                            },
                                            text: 'Peterschen Mondfahrt',
                                            type: 'WORKFLOW',
                                            children: null,
                                            id: '/Users/peter.schramm/Peterschen Mondfahrt'
                                        }
                                    ],
                                    id: '/Users/peter.schramm'
                                }
                            ],
                            id: '/Users'
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
