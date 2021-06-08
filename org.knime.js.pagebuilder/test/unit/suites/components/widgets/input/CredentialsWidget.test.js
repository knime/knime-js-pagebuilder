/* eslint-disable no-magic-numbers */
import { shallowMount, mount } from '@vue/test-utils';
import Vue from 'vue';

import CredentialsWidget from '@/components/widgets/input/CredentialsWidget';
import InputField from '~/webapps-common/ui/components/forms/InputField';
import Label from '~/webapps-common/ui/components/forms/Label';
import Fieldset from '~/webapps-common/ui/components/forms/Fieldset';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

describe('CredentialsWidget.vue', () => {
    let propsDataDefault, propsDataServer;

    beforeEach(() => {
        propsDataDefault = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                namespace: 'knimeCredentialsWidget',
                viewValue: null,
                customCSS: '',
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.credentials.CredentialsNodeRepresentation',
                    label: 'Default',
                    description: 'Enter Description',
                    required: true,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                        username: '',
                        isSavePassword: false,
                        magicDefaultPassword: null,
                        password: null
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                        username: '',
                        isSavePassword: false,
                        magicDefaultPassword: null,
                        password: null
                    },
                    promptUsername: true,
                    useServerLoginCredentials: false,
                    errorMessage: '',
                    noDisplay: false
                },
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Credentials Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/credentials/credentialsWidget.js'
                ],
                getViewValueMethodName: 'value'
            },
            nodeId: '2:0:1',
            isValid: false
        };

        propsDataServer = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                initMethodName: 'init',
                validateMethodName: 'validate',
                setValidationErrorMethodName: 'setValidationErrorMessage',
                javascriptLibraries: [
                    '/js-lib/knime/service/knime_service_1_0_0.js',
                    '/js-lib/jQuery/jquery-1.11.0.min.js',
                    '/js-lib/jQueryUI/min/ui/jquery-ui.min.js',
                    '/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js',
                    '/org/knime/js/base/node/widget/input/credentials/credentialsWidget.js'
                ],
                stylesheets: [
                    '/js-lib/font-awesome/4_7_0/css/font-awesome.min.css',
                    '/js-lib/knime/service/knime.css',
                    '/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css',
                    '/org/knime/js/base/util/quickform/quickformStyles.css'
                ],
                getViewValueMethodName: 'value',
                nodeInfo: {
                    '@class': 'org.knime.js.core.JSONWebNodeInfo',
                    nodeAnnotation: '',
                    nodeState: 'executed',
                    nodeName: 'Credentials Widget',
                    nodeErrorMessage: null,
                    nodeWarnMessage: null,
                    displayPossible: true
                },
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.credentials.CredentialsNodeRepresentation',
                    label: 'Prompt, Save, Dialog user and Pass & Use KNIME Server Login (render Input)',
                    description: 'Enter Description',
                    required: false,
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                        username: 'TestUsername',
                        isSavePassword: true,
                        magicDefaultPassword: '*************',
                        password: 'TestPassword'
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                        username: 'TestUsername',
                        isSavePassword: true,
                        magicDefaultPassword: '*************',
                        password: 'TestPassword'
                    },
                    promptUsername: true,
                    useServerLoginCredentials: true,
                    errorMessage: '',
                    noDisplay: false
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                    username: 'TestUsername',
                    isSavePassword: true,
                    magicDefaultPassword: '*************',
                    password: 'TestPassword'
                },
                customCSS: '',
                namespace: 'knimeCredentialsWidget'
            },
            nodeId: '2:0:7',
            isValid: false,
            valuePair: {
                '@class': 'org.knime.js.base.node.configuration.input.credentials.CredentialsDialogNodeValue',
                username: 'TestUsername',
                isSavePassword: true,
                magicDefaultPassword: '*************',
                password: 'TestPassword'
            }
        };
    });

    describe('credentials widget', () => {
        it('renders', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: propsDataDefault,
                stubs: { Label, Fieldset }
            });
            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find(Fieldset)).toBeTruthy();
            expect(wrapper.findAll(InputField).length).toBe(2);
        });

        it('adds hidden class if noDisplay is true', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: {
                    ...propsDataDefault,
                    nodeConfig: {
                        ...propsDataDefault.nodeConfig,
                        viewRepresentation: {
                            ...propsDataDefault.nodeConfig.viewRepresentation, noDisplay: true
                        }
                    }
                },
                stubs: { Label, Fieldset }
            });
            expect(wrapper.find('.hide').exists()).toBe(true);
        });

        it('renders no username input if promptUsername is false', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: {
                    ...propsDataDefault,
                    nodeConfig: {
                        ...propsDataDefault.nodeConfig,
                        viewRepresentation: {
                            ...propsDataDefault.nodeConfig.viewRepresentation,
                            promptUsername: false
                        }
                    }
                },
                stubs: { Label, Fieldset }
            });
            expect(wrapper.find({ ref: 'usernameForm' }).exists()).toBe(false);
            expect(wrapper.find({ ref: 'passwordForm' }).exists()).toBe(true);
        });

        it('emits @updateWidget on username if child emits @input', () => {
            let wrapper = mount(CredentialsWidget, {
                propsData: propsDataDefault,
                stubs: { Label, Fieldset }
            });

            const testValue = 'VALUE';
            const input = wrapper.find(InputField);
            input.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataDefault.nodeId,
                type: 'username',
                value: testValue
            });
        });

        it('emits @updateWidget on password if child emits @input', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: propsDataDefault,
                stubs: { Label, Fieldset }
            });

            const testValue = 'VALUE';
            const input = wrapper.find({ ref: 'passwordForm' });
            input.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget).toBeTruthy();
            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataDefault.nodeId,
                type: 'magicDefaultPassword',
                value: testValue
            });
        });

        it('emits @updateWidget on password only if input differs from serverCredentials', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: propsDataServer,
                stubs: { Label, Fieldset }
            });

            const testValue = 'VALUE';
            const input = wrapper.find({ ref: 'passwordForm' });
            input.vm.$emit('input', propsDataServer.nodeConfig.viewRepresentation.defaultValue.magicDefaultPassword);

            expect(wrapper.emitted().updateWidget).toBeFalsy();

            input.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataServer.nodeId,
                type: 'magicDefaultPassword',
                value: testValue
            });
        });

        it('emits @updateWidget on username only if input differs from serverCredentials', () => {
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: propsDataServer,
                stubs: { Label, Fieldset }
            });

            const testValue = 'VALUE';
            const input = wrapper.find({ ref: 'usernameForm' });
            input.vm.$emit('input', propsDataServer.nodeConfig.viewRepresentation.defaultValue.username);

            expect(wrapper.emitted().updateWidget).toBeFalsy();

            input.vm.$emit('input', testValue);

            expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
                nodeId: propsDataServer.nodeId,
                type: 'username',
                value: testValue
            });
        });

        it('will be invalid if widget is', () => {
            let widget = mount(CredentialsWidget, {
                propsData: { ...propsDataDefault, isValid: true }
            });

            let textComponent = widget.find(InputField);
            expect(textComponent.props('isValid')).toBe(true);
            widget.setProps({ isValid: false });
            expect(textComponent.props('isValid')).toBe(false);
        });

        it('takes specific error message over child error message', async () => {
            let wrapper = mount(CredentialsWidget, {
                propsData: propsDataDefault,
                stubs: {
                    InputField: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue('test_string'),
                            validate: jest.fn().mockReturnValue({ isValid: false, errorMessage: 'test Error Message' })
                        }
                    }
                }
            });
            await Vue.nextTick();
            expect(wrapper.vm.validate().isValid).toBe(false);
            expect(wrapper.vm.validate().errorMessage).toBe('Please correct input for username and password.');
        });

        it('renders serverCredentials input correctly', () => {
            const checkServerCredentialsSpy = jest.fn();
            let wrapper = shallowMount(CredentialsWidget, {
                propsData: propsDataServer,
                stubs: { Label, Fieldset },
                methods: { checkServerCredentials: checkServerCredentialsSpy }
            });
            expect(wrapper.find({ ref: 'usernameForm' }).props('value'))
                .toEqual(propsDataServer.nodeConfig.viewRepresentation.defaultValue.username);

            expect(wrapper.find({ ref: 'passwordForm' }).props('value'))
                .toEqual(propsDataServer.nodeConfig.viewRepresentation.defaultValue.magicDefaultPassword);
            expect(checkServerCredentialsSpy).toHaveBeenCalled();
        });

        it('displays server error in correct hierarchy', () => {
            let wrapper = mount(CredentialsWidget, {
                propsData: {
                    ...propsDataServer,
                    nodeConfig: {
                        ...propsDataServer.nodeConfig,
                        viewValue: null,
                        viewRepresentation: {
                            ...propsDataServer.nodeConfig.viewRepresentation,
                            defaultValue: null,
                            currentValue: null
                        }
                    }
                },
                stubs: {
                    Label,
                    Fieldset,
                    InputField: {
                        template: '<div />',
                        methods: {
                            getValue: jest.fn().mockReturnValue(null),
                            validate: jest.fn()
                                // username and password  invalid
                                .mockReturnValueOnce({ isValid: false, errorMessage: null })
                                .mockReturnValueOnce({ isValid: false, errorMessage: null })
                                // username valid, password invalid
                                .mockReturnValueOnce({ isValid: false, errorMessage: null })
                                .mockReturnValueOnce({ isValid: true, errorMessage: null })
                                // username invalid, password valid
                                .mockReturnValueOnce({ isValid: true, errorMessage: null })
                                .mockReturnValueOnce({ isValid: false, errorMessage: null })
                                // username and password valid
                                .mockReturnValueOnce({ isValid: true, errorMessage: null })
                                .mockReturnValueOnce({ isValid: true, errorMessage: null })
                        }
                    }
                }
            });

            expect(wrapper.vm.validate()).toStrictEqual(
                { errorMessage: 'Please correct input for username and password.', isValid: false }
            );

            expect(wrapper.vm.validate()).toStrictEqual(
                { errorMessage: 'Please correct input for password.', isValid: false }
            );

            expect(wrapper.vm.validate()).toStrictEqual(
                { errorMessage: 'Please correct input for username.', isValid: false }
            );

            expect(wrapper.vm.validate()).toStrictEqual(
                { errorMessage: '', isValid: true }
            );
            expect(wrapper.find(ErrorMessage).props('error'))
                .toEqual('KNIME Server login credentials could not be fetched!');
        });

        it('renders server credentials error if no username gets prompted', () => {
            let wrapper = mount(CredentialsWidget, {
                propsData: {
                    ...propsDataServer,
                    nodeConfig: {
                        ...propsDataServer.nodeConfig,
                        viewValue: null,
                        viewRepresentation: {
                            ...propsDataServer.nodeConfig.viewRepresentation,
                            defaultValue: null,
                            currentValue: null,
                            promptUsername: false
                        }
                    }
                },
                stubs: { Label, Fieldset }
            });

            expect(wrapper.find({ ref: 'usernameForm' }).exists()).toBe(false);
            wrapper.vm.validate();
            expect(wrapper.find(ErrorMessage).props('error'))
                .toEqual('KNIME Server login credentials could not be fetched!');
        });
    });
});
