import layoutMixin from '../../../../../src/components/mixins/layoutMixin';
import { shallowMount } from '@vue/test-utils';
import MockComponent from './mockComponent.vue';


describe('layoutMixin.js', () => {

    describe('test layout classes', () => {
        it('does not apply classes if no resize method is set', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutClasses).toEqual([]);
        });

        it('appends classes starting with aspectRatio', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'aspectRatio16by9'
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutClasses).toEqual(['aspectRatio16by9']);
        });

        it('adds only classes starting with aspectRatio', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'viewLowestElement'
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutClasses).toEqual([]);
        });

        it('appends additional classes', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'aspectRatio16by9',
                        additionalClasses: ['class1', 'class2']
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutClasses).toEqual(['aspectRatio16by9', 'class1', 'class2']);
        });
    });

    describe('test layout styles', () => {
        it('appends additional styles', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'aspectRatio16by9',
                        additionalStyles: ['testStyle', 'otherTestStyle']
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('testStyle;otherTestStyle');
        });

        it('applies styles if viewLowestElement is set and it is a widget', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'viewLowestElement',
                        maxHeight: 300,
                        maxWidth: 300,
                        minHeight: 100,
                        minWidth: 100
                    },
                    isWidget: true
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('max-height:300px;max-width:300px;min-height:100px;min-width:100px');
        });

        it('applies styles if viewLowestElement is set and it is a ui-extension', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'viewLowestElement',
                        maxHeight: 300,
                        maxWidth: 300,
                        minHeight: 100,
                        minWidth: 100
                    },
                    extensionConfig: {name: 'test'}
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('max-height:300px;max-width:300px;min-height:100px;min-width:100px');
        });

        it('does not apply styles if viewLowestElement is set, but it is not a widget or ui-extension', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'viewLowestElement',
                        maxHeight: 300,
                        maxWidth: 300,
                        minHeight: 100,
                        minWidth: 100
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('');
        });

        it('does not apply styles if viewLowestElement is not set', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'aspectRatio16by9',
                        maxHeight: 300,
                        maxWidth: 300,
                        minHeight: 100,
                        minWidth: 100
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('');
        });

        it('does not apply styles if they are not set', () => {
            const wrapper = shallowMount(MockComponent, {
                propsData: {
                    viewConfig: {
                        resizeMethod: 'viewLowestElement'
                    }
                },
                mixins: [layoutMixin]
            });
            expect(wrapper.vm.layoutStyle).toEqual('');
        });
    });
});