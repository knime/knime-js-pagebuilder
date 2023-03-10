import { expect, describe, beforeEach, it, vi } from 'vitest';
/* eslint-disable no-magic-numbers */
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';

import Widget from '@/components/widgets/Widget.vue';
import { getProp, setProp } from '@/util/nestedProperty';

import * as storeConfig from '@/store/pagebuilder';

describe('Widget.vue', () => {
    let store, context, nodeConfig, wrapper;

    const nodeConfigBlueprint = {
        foo: 'bar',
        nodeInfo: {
            '@class': 'org.knime.js.core.JSONWebNodeInfo',
            nodeState: 'executed',
            nodeAnnotation: '',
            nodeErrorMessage: null,
            nodeWarnMessage: null,
            displayPossible: true,
            nodeName: 'Slider Widget'
        },
        viewRepresentation: {
            '@class': 'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation',
            sliderSettings: {
                '@class': 'org.knime.js.core.settings.slider.SliderSettings',
                connect: [
                    false,
                    false
                ],
                tooltips: [
                    {
                        prefix: '$',
                        negative: '-',
                        thousand: ',',
                        decimals: 2,
                        postfix: '_',
                        mark: '.',
                        negativeBefore: '-'
                    }
                ],
                pips: {
                    '@class': 'org.knime.js.core.settings.slider.SliderPipsSettings',
                    format: {
                        '@class': 'org.knime.js.core.settings.numberFormat.NumberFormatSettings',
                        negative: '-',
                        decimals: 2,
                        mark: '.'
                    },
                    mode: 'positions',
                    values: [
                        0,
                        25,
                        50,
                        75,
                        100
                    ],
                    stepped: false,
                    density: 3
                },
                direction: 'ltr',
                orientation: 'vertical',
                range: {
                    min: [
                        5
                    ],
                    max: [
                        25
                    ]
                },
                start: [
                    5
                ]
            },
            useCustomMax: true,
            useCustomMin: true,
            customMax: 100,
            customMin: 0,
            defaultValue: {
                '@class': 'org.knime.js.base.node.base.input.slider.SliderNodeValue',
                double: 5
            },
            description: 'Enter Description',
            required: true,
            label: 'Testing Slider',
            currentValue: {
                testValue: 10
            }
        },
        viewValue: {
            testValue: 10
        }
    };

    let nodeId = 'id1';

    const getNodeConfig = () => JSON.parse(JSON.stringify(nodeConfigBlueprint));

    beforeEach(() => {
        nodeConfig = getNodeConfig();

        store = createStore({ modules: { pagebuilder: storeConfig } });
        store.registerModule('api', {
            namespaced: true,
            actions: {
                triggerReExecution: vi.fn()
            }
        });
        let page = {
            wizardPageContent: {
                webNodes: {
                    [nodeId]: nodeConfig,
                    SINGLE: {
                        filters: [
                            {
                                test: 0
                            }
                        ]
                    }
                }
            }
        };
        store.commit('pagebuilder/setPage', page);
        context = {
            props: {
                nodeConfig,
                nodeId
            },
            global: {
                mocks: {
                    $store: store
                },
                stubs: {
                    SliderWidget: {
                        name: 'slider-widget',
                        template: '<div />',
                        ref: 'widget',
                        methods: {
                            onChange() {
                                return true;
                            }, // because hasValueGetter checks for it,
                            validate: vi.fn().mockReturnValue(Promise.resolve(true))
                        }
                    }
                }
            }
        };
        wrapper = shallowMount(Widget, {
            ...context,
            props: {
                nodeConfig,
                nodeId,
                widgetName: 'SliderWidget'
            }
        });
    });

    it('renders and updates the required field in the viewRepresentation', () => {
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        // TODO WEBP-327 Remove if dialog option added.
        expect(wrapper.vm.nodeConfig.viewRepresentation.required).toBe(false);
    });

    it('publishes update to store', () => {
        const expectedValue = 10;
        const newValue = 11;

        expect(wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation
            .currentValue.testValue).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            nodeId,
            type: 'testValue',
            value: newValue
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation
                .currentValue.testValue
        ).toEqual(newValue);
    });

    it('uses update object in change event if provided', () => {
        let updateMock = vi.spyOn(wrapper.vm, 'updateWebNode');
        wrapper.vm.publishUpdate({
            nodeId,
            update: {
                foo: 0
            }
        });

        expect(updateMock).toHaveBeenCalledWith({
            nodeId,
            update: {
                foo: 0
            }
        });
    });

    it('updates objects inside arrays in the store', () => {
        let nodeId = 'SINGLE';
        expect(wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.SINGLE.filters[0].test).toEqual(0);
        wrapper.vm.publishUpdate({
            nodeId,
            update: {
                'filters.0.test': 1
            }
        });
        expect(wrapper.vm.$store.state.pagebuilder.page.wizardPageContent.webNodes.SINGLE.filters[0].test).toEqual(1);
    });

    it('calls callback after change event if provided', async () => {
        let localNodeConfig = getNodeConfig();

        let localStore = createStore({ modules: { pagebuilder: storeConfig } });
        let page = {
            wizardPageContent: {
                webNodes: {
                    [nodeId]: localNodeConfig,
                    SINGLE: {
                        filters: [
                            {
                                test: 0
                            }
                        ]
                    }
                }
            }
        };
        localStore.commit('pagebuilder/setPage', page);
        let localContext = {
            global: {
                mocks: {
                    $store: localStore
                },
                stubs: {
                    Component: {
                        template: '<div/>'
                    }
                }
            }
        };
        let localWrapper = shallowMount(Widget, {
            ...localContext,
            props: {
                nodeConfig: localNodeConfig,
                nodeId,
                widgetName: 'SliderWidget'
            }
        });
        let mock = vi.fn();
        localWrapper.vm.publishUpdate({
            nodeId,
            type: 'testValue',
            value: 0,
            callback: mock
        });
        await localWrapper.vm.$nextTick();
        expect(mock).toHaveBeenCalled();
    });

    it('test getting deep properties with util', () => {
        const expectedValue = 10;
        const newValue = 12;

        expect(
            getProp(
                wrapper.vm.$store.state,
                'pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation.currentValue.testValue'
            )
        ).toEqual(expectedValue);
        setProp(
            wrapper.vm.$store.state,
            'pagebuilder.page.wizardPageContent.webNodes.id1.viewRepresentation.currentValue.testValue', newValue
        );
        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
    });

    it('retrieves value as resolvable promise', () => {
        const expectedValue = 10;
        const newValue = 42;

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(expectedValue);

        wrapper.vm.publishUpdate({
            nodeId,
            type: 'testValue',
            value: newValue
        });

        expect(
            wrapper.vm.$store.state.pagebuilder.page.wizardPageContent
                .webNodes.id1.viewRepresentation.currentValue.testValue
        ).toEqual(newValue);
        let valPromise = wrapper.vm.getValue();
        return expect(valPromise).resolves.toStrictEqual({
            nodeId,
            value: { testValue: newValue }
        });
    });

    it('registers a value getter with the store', () => {
        expect(wrapper.vm.hasValueGetter).toBe(true);
        expect(typeof wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId]).toBe('function');
        expect(wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId])
            .toBe(wrapper.vm.getValue);
    });

    // test with an output widget to ensure the store does not register a getter
    it('prevents value getter registration for incompatible types', () => {
        expect(wrapper.vm.hasValueGetter).toBe(true);
        expect(typeof wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId]).toBe('function');

        let nodeId2 = 'node2';
        let newWrapper = shallowMount(Widget, {
            props: {
                nodeConfig: {
                    nodeInfo: {
                        '@class': 'org.knime.js.core.JSONWebNodeInfo',
                        nodeState: 'executed',
                        nodeName: 'Text Widget'
                    },
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.output.text.TextOutputRepresentation',
                        text: 'Test String to prevent TextWidget prop validation failure'
                    }
                },
                nodeId: nodeId2,
                widgetName: 'TextWidget'
            },
            global: {
                mocks: {
                    $store: store
                },
                stubs: {
                    TextOutput: {
                        name: 'text-output-widget',
                        template: '<div />',
                        ref: 'widget',
                        methods: {
                            validate() {
                                return true;
                            }
                        }
                    }
                }
            }
        });

        expect(newWrapper.vm.hasValueGetter).toBeFalsy();
        expect(typeof newWrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId2]).toBe('undefined');
    });

    it('registers a validator with the store', () => {
        expect(typeof wrapper.vm.$store.state.pagebuilder.pageValidators[nodeId]).toBe('function');
        expect(wrapper.vm.$store.state.pagebuilder.pageValidators[nodeId])
            .toBe(wrapper.vm.validate);
    });

    it('updates values for reactive widgets without valueGetter (no onChange)', async () => {
        let localWrapper = shallowMount(Widget, {
            ...context,
            global: {
                ...context.global,
                stubs: {
                    RefreshButton: {
                        name: 'refresh',
                        template: '<div />',
                        ref: 'widget',
                        methods: {
                            validate: vi.fn().mockReturnValue(Promise.resolve(true))
                        }
                    }
                }
            },
            props: {
                nodeConfig: {
                    ...nodeConfig,
                    viewRepresentation: {
                        ...nodeConfig.viewRepresentation,
                        triggerReExecution: true
                    }
                },
                nodeId: 'id1',
                widgetName: 'SliderWidget'
            }
        });

        let updateSpy = vi.spyOn(localWrapper.vm, 'updateWebNode').mockResolvedValueOnce(true);
        await localWrapper.vm.$refs.widget.$emit('updateWidget', { type: 'any', value: 'some' });

        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('updates values for reactive widgets with valueGetter (onChange)', async () => {
        let localWrapper = shallowMount(Widget, {
            ...context,
            props: {
                nodeConfig: {
                    ...nodeConfig,
                    viewRepresentation: {
                        ...nodeConfig.viewRepresentation,
                        triggerReExecution: true
                    }
                },
                nodeId: 'id1',
                widgetName: 'SliderWidget'
            }
        });
        let updateSpy = vi.spyOn(localWrapper.vm, 'updateWebNode').mockReturnValueOnce(true);
        await localWrapper.vm.$refs.widget.$emit('updateWidget', { type: 'any', value: 'some' });

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'any',
            update: {
                'viewRepresentation.currentValue.any': 'some'
            },
            value: 'some'
        });
    });

    it('triggers re-execution if widget is reactive', async () => {
        let localWrapper = shallowMount(Widget, {
            ...context,
            global: {
                ...context.global,
                stubs: {
                    RefreshButton: {
                        name: 'refresh',
                        template: '<div />',
                        ref: 'widget',
                        methods: {
                            validate: vi.fn().mockReturnValue(Promise.resolve(true))
                        }
                    }
                }
            },
            props: {
                nodeConfig: {
                    ...nodeConfig,
                    viewRepresentation: {
                        ...nodeConfig.viewRepresentation,
                        triggerReExecution: true
                    }
                },
                nodeId: 'id1',
                widgetName: 'SliderWidget'
            }
        });

        let triggerSpy = vi.spyOn(localWrapper.vm, 'triggerReExecution').mockReturnValueOnce(true);
        await localWrapper.vm.$refs.widget.$emit('updateWidget', { type: 'any', value: 'some' });

        expect(triggerSpy).toHaveBeenCalled();
    });
});
