import { mount } from '@vue/test-utils';

import Slider from '@/components/widgets/baseElements/input/Slider';
import VueSlider from 'vue-slider-component';

describe('Slider.vue', () => {
    let context, propsData;

    beforeEach(() => {
        propsData = {
            value: 50,
            maximum: 100,
            minimum: 0,
            isValid: true,
            direction: 'ltr',
            stepSize: 10,
            height: 250,
            tooltips: 'always',
            tooltipFormat: (val) => val.toString(),
            marks: {},
            connect: 'both',
            drageOnClick: true,
            contained: false
        };
    });

    it('renders', () => {
        let wrapper = mount(Slider, {
            ...context,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(VueSlider).isVisible()).toBeTruthy();
    });

    it('has default props', () => {
        let wrapper = mount(Slider, {
            ...context
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(VueSlider).isVisible()).toBeTruthy();
    });

    it('receives onValueChange events', () => {
        let wrapper = mount(Slider, {
            ...context,
            propsData
        });

        wrapper.vm.$refs.slider.setValue(wrapper.vm.value++);

        expect(wrapper.emitted().updateValue).toBeTruthy();
    });

    it('invalidates undefined values', () => {
        let wrapper = mount(Slider, {
            ...context,
            propsData
        });

        // should be undefined
        wrapper.vm.$refs.slider.setValue(propsData.newValue);

        expect(wrapper.vm.validate()).toBe(false);
    });

    it('invalidates values outside the given range', () => {
        let wrapper = mount(Slider, {
            ...context,
            propsData
        });

        // too low
        wrapper.vm.$refs.slider.setValue(-10);
        expect(wrapper.vm.validate()).toBe(false);

        // valid
        wrapper.vm.$refs.slider.setValue(10);
        expect(wrapper.vm.validate()).toBe(true);

        // too high
        wrapper.vm.$refs.slider.setValue(110);
        expect(wrapper.vm.validate()).toBe(false);
    });

    it('invalidates incorrect range', () => {
        propsData.minimum = 100;
        propsData.maximum = 0;
        let wrapper = mount(Slider, {
            ...context,
            propsData
        });

        expect(wrapper.vm.validate()).toBe(false);
    });
});
