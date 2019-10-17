<script>
import Slider from '../baseElements/input/Slider';
import { format } from '../../../util/numStrFormatter';
import { getProp } from '../../../util/nestedProperty';

const CURRENT_VALUE_KEY = 'viewRepresentation.currentValue.double';
const DEFAULT_VALUE_KEY = 'viewRepresentation.defaultValue.double';
const MINIMUM_SLIDER_STEP = .000001;
const VERTICAL_SLIDER_HEIGHT = 533;
const DEBOUNCER_TIMEOUT = 250;

/**
 * At the SliderWidget component level (2nd level), the component will know more about its
 * context, such as nodeId, full config, etc. It will also be able to
 * so second level validation (after the base component validation).
 * 
 * It will be responsible for knowing its incomming nodeConfig object,
 * as well as the keys for its corresponding properties. When the 2nd level
 * receives an update event from the 1st (lower) level child component, it
 * will validate and then emit an updateWidget event to the parent Widget
 * which contains the widget specific information needed to update the global
 * state on the store.
 * 
 * 2nd level (this) components will not know or care about the global store,
 * so API changes will no affect them.
 * 
 */
export default {
    components: {
        Slider
    },
    props: {
        nodeConfig: {
            default: () => ({}),
            type: Object
        },
        nodeId: {
            default: () => null,
            type: String
        },
        isValid: {
            default: () => (false),
            type: Boolean
        }
    },
    data() {
        return {
            viewRep: this.nodeConfig.viewRepresentation,
            sliderSettings: this.nodeConfig.viewRepresentation.sliderSettings
        }
    },
    updateDebouncer: null,
    computed: {
        min() {
            if (this.viewRep.useCustomMin) return this.viewRep.customMin;
            return this.sliderSettings.range.min[0];
        },
        max() {
            if (this.viewRep.useCustomMax) return this.viewRep.customMax;
            return this.sliderSettings.range.max[0];
        },
        val() {
            return getProp(this.nodeConfig, CURRENT_VALUE_KEY) ||
                getProp(this.nodeConfig, DEFAULT_VALUE_KEY);
        },
        direction() {
            return this.sliderSettings.orientation === 'horizontal' ?
                this.sliderSettings.direction :
                this.sliderSettings.direction === 'ltr' ? 'ttb' : 'btt';
        },
        stepSize() {
            return this.sliderSettings.step || MINIMUM_SLIDER_STEP;
        },
        height() {
            if(this.direction.includes('b')) {
                return VERTICAL_SLIDER_HEIGHT;
            }
            return null;
        },
        tooltips() {
            return this.sliderSettings.tooltips ? 'always' : 'none';
        },
        tooltipFormat() {
            const tt = this.sliderSettings.tooltips;

            if (tt && typeof tt[0] === 'object'){
                return (val) => {
                    return format(val, tt[0]);
                }
            }
            return "'{value}'";
        },
        marks() {
            const config = this.sliderSettings.pips;
            if(config){
                switch (config.mode) {
                    case 'steps':
                        return (val) => {
                            return val % this.stepSize === 0 ?
                                {label: `${format(val, config.format)}`} :
                                null;
                        };
                    case 'values': {
                        const valuesLabels = {};
                        config.values.forEach((val)=> {
                            valuesLabels[val] = `${format(val, config.format)}`;
                        });
                        return valuesLabels;
                    }
                    case 'range':
                        return {
                            [this.min]: `${format(this.min, config.format)}`,
                            [this.max]: `${format(this.max, config.format)}`
                            };
                    case 'positions': {
                        const positionsLabels = {};
                        config.values.forEach((val)=> {
                            let key = this.max * (val/100) || this.min;
                            positionsLabels[key] = `${format(key, config.format)}`;
                        });
                        return positionsLabels;
                    }
                    case 'count': {
                        const countLabels = { [this.min] : `${format(this.min, config.format)}` };
                        const step = (this.max - this.min) / config.values[0];
                        for (let i = 1; i < config.values[0]; i++){
                            let key = this.min + (i * step);
                            countLabels[key] = `${format(key, config.format)}`;
                        }
                        countLabels[this.max] = `${format(this.max, config.format)}`;
                        return countLabels;
                    }
                    default:
                        // nothing
                }
            } else {
                return false;
            }
        },
        connect() {
            const conSet = this.sliderSettings.connect;
            if (conSet[0]) {
                return conSet[1] ? 'both' : 'top';
            } else {
                return conSet[1] ? 'bottom' : 'none';
            }
        },
        validClass() {
            return this.isValid ? 'knime-valid-widget' : 'knime-invalid-widget'
        }
    },
    methods: {
        onChange(e) {
            clearTimeout(this.updateDebouncer);
            const newValue = parseFloat(e.val);
            const newWebNodeConfig = {
                type: 'Slider',
                nodeId: this.nodeId,
                originalEvent: e.originalEvent,
                isValid: e.isValid && this.validate(newValue),
                update: {
                    [CURRENT_VALUE_KEY]: newValue
                }
            };
            this.updateDebouncer = setTimeout(()=>{
                this.$emit("updateWidget", newWebNodeConfig);
            }, DEBOUNCER_TIMEOUT);
        },
        validate(value) {
            /**
             * TODO: SRV-2626
             * 
             * insert additional custom widget validation
             * currently fake validation to test styling
             */
            return true;
        }
    }
};
</script>

<template>
    <div class="knime-slider">
        <Slider
            :minimum="min"
            :maximum="max"
            :value="val"
            :isValid="isValid"
            :direction="direction"
            :step-size="stepSize"
            :height="height"
            :tooltips="tooltips"
            :tooltip-format="tooltipFormat"
            :marks="marks"
            :connect="connect"
            :class="validClass"
            v-on:updateValue="onChange"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* Dynamically style container at some point */
.knime-slider{
    padding: 40px 20px 35px 50px;
}
</style>
