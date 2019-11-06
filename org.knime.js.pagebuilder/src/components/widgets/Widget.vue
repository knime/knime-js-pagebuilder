<script>
import { mapActions } from 'vuex';
import widgetConfig from './widgets.config';
import IntegerWidget from './input/IntegerWidget';
import DoubleWidget from './input/DoubleWidget';
import StringWidget from './input/StringWidget';
import SliderWidget from './input/SliderWidget';
import { applyCustomCss } from '../../util/customCss';

/**
 * A Widget node view. This top level component sits at
 * the same level as would a NodeViewIFrame component and
 * is specifically designed to be the parent component of
 * all individual widget implementations.
 *
 * This parent-of-widgets component controls the invocation
 * of actions from the Vuex store. Each instance of this Widget
 * component is listening for an "updateWidget" event from its child
 * component. The children of the Widget instance will parse and
 * package their own updated value and validity on the event object
 * passed to the parent Widget.
 *
 * This Widget component can then complete some last minute
 * verification before using the "updateValue" action to update
 * the store and validity of the page.
 *
 * This component should fill its parent container. Avoid styling
 * this component. This serves primarily as a separation of
 * concerns between the Vuex store and individual widget
 * implementations, allowing each unique child to agnostically
 * handle their own nodeConfig objects and values/validations.
 *
 * The type of the child of this component is determined through
 * the computed property type, as all widget class names are
 * mapped in a config file.
 *
 * The application of customCSS is also handled by this component.
 */
export default {
    components: {
        IntegerWidget,
        DoubleWidget,
        StringWidget,
        SliderWidget
    },
    props: {
        /**
         * Node configuration as received by API
         */
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.viewRepresentation && obj.viewRepresentation['@class'];
            }
        },
        /**
         * The unique string node ID as it exists
         * in the store webNodes
         */
        nodeId: {
            default: () => null,
            type: String
        }
    },
    computed: {
        type() {
            return widgetConfig[this.nodeConfig.viewRepresentation['@class']];
        },
        isValid() {
            return Boolean(this.$store.state.pagebuilder.pageValidity[this.nodeId]);
        }
    },
    mounted() {
        this.$store.dispatch('pagebuilder/addValueGetter', { nodeId: this.nodeId, valueGetter: this.getValue });
        applyCustomCss(this.$el, this.nodeConfig.customCSS);
    },
    beforeDestroy() {
        this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
    },
    methods: {
        validate(value) {
            /**
             * TODO: SRV-2626
             *
             * insert additional custom widget validation
             * currently fake validation
             */
            return true;
        },
        publishUpdate(update) {
            update.isValid = update.isValid && this.validate(update);
            this.updateValue(update);
        },
        getValue() {
            return new Promise((resolve, reject) => {
                try {
                    let value = this.$store.state.pagebuilder.page.webNodes[this.nodeId]
                        .viewRepresentation.currentValue;
                    if (typeof value === 'undefined') {
                        reject(new Error('Value of widget could not be retrieved.'));
                    } else {
                        resolve({ nodeId: this.nodeId, value });
                    }
                } catch (error) {
                    reject(new Error(error));
                }
            });
        },
        ...mapActions({
            updateValue: 'pagebuilder/updateWebNode'
        })
    }
};
</script>

<template>
  <!-- knime-qf-container legacy selector -->
  <div class="knime-widget knime-qf-container">
    <Component
      :is="type"
      v-bind="$props"
      :is-valid="isValid"
      @updateWidget="publishUpdate"
    />
  </div>
</template>

<style lang="postcss" scoped>
.knime-widget {
  width: 100%;
  height: 100%;
  background-color: white;
  border: none;
  overflow: hidden;
}
</style>
