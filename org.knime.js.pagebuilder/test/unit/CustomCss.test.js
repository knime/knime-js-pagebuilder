import { applyCustomCss } from '../../src/util/customCss';
import { createLocalVue, shallowMount } from '@vue/test-utils';

describe('customCss.js', () => {
    let localVue, context, component;

    beforeEach(() => {
        localVue = createLocalVue();
        context = {
            localVue
        };

        component = () => ({
            template: `<div class="parent-element">
                <div class="child-one">
                    <div class="child-two">
                    </div>
                </div>
                <div class="child-one">
                </div>
            </div>`
        });
    });

    it('can apply basic styles', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '.child-one { color: blue; }';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-one').forEach(el => expect(el.style.cssText).toBe('color: blue;'));
    });

    it('can apply nested styles', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '.child-two { color: blue; }';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-two').forEach(el => expect(el.style.cssText).toBe('color: blue;'));
    });

    it('can apply partially valid styles', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '.child-two, not_valid*TEST { color: blue; }';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-two').forEach(el => expect(el.style.cssText).toBe('color: blue;'));
    });

    it('can handle empty rules', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '.child-two { color: blue; } {} ';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-two').forEach(el => expect(el.style.cssText).toBe('color: blue;'));
    });

    it('can handle extra brackets', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        let cssString = '.child-two { color: blue; } } ';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-two').forEach(el => expect(el.style.cssText).toBe('color: blue;'));

        cssString = '.child-one { color: red; } { ';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-one').forEach(el => expect(el.style.cssText).toBe('color: red;'));

        cssString = ' } .child-one { color: black; } ';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-one').forEach(el => expect(el.style.cssText).toBe('color: black;'));
    });

    it('applies css in a scoped manner', () => {
        let comp = component();
        comp.template = `<div>${comp.template}<div class="child-one"></div></div>`;
        let wrapper = shallowMount(comp, {
            ...context
        });
        const cssString = '.child-one { color: blue; } ';
        expect(applyCustomCss(wrapper.vm.$el.querySelector('.parent-element'), cssString)).toHaveLength(0);
        let totalStylesApplied = 0;
        wrapper.vm.$el.querySelectorAll('.child-one').forEach(el => {
            if (el.style.cssText === 'color: blue;') {
                totalStylesApplied++;
            }
        });
        expect(totalStylesApplied).toBe(2);
    });

    it('can handle descendant selectors', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '.child-one .child-two { color: blue; } ';
        expect(applyCustomCss(wrapper.vm.$el, cssString)).toHaveLength(0);
        wrapper.vm.$el.querySelectorAll('.child-two').forEach(el => expect(el.style.cssText).toBe('color: blue;'));
    });

    it('can catch non-css mistakes', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        const cssString = '{}{{{}}}{{..":;;}}}}this is a Fancy te$t sen+ence w/ r@ndom char.{{{}}}}}{{{;:';
        expect(() => applyCustomCss(wrapper.vm.$el, cssString)).not.toThrow();
    });

    it('can missing parentEl', () => {
        const cssString = '.child-one .child-two { color: blue; } ';
        expect(() => applyCustomCss(context.undefinedProp, cssString)).not.toThrow();
    });

    it('can missing CSS', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        expect(() => applyCustomCss(wrapper.vm.$el)).not.toThrow();
    });

    it('can return information about failures', () => {
        let wrapper = shallowMount(component(), {
            ...context
        });
        let cssTestObject = {};
        expect(applyCustomCss(wrapper.vm.$el, cssTestObject).length).toBeGreaterThan(0);
        cssTestObject = '.child-one .child-two { color: blue; } ';
        expect(applyCustomCss({}, cssTestObject).length).toBeGreaterThan(0);
    });
});
