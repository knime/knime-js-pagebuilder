<script>
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset.vue';
import Multiselect from '../baseElements/selection/Multiselect.vue';
import SingleSelect from '../baseElements/selection/SingleSelect.vue';

const UPDATE_KEY = 'viewValue.filter.columns.0.values';

/**
 * Interactive Value Filter Widget.
 *
 * Publishes filters for interacting with subscriber-views in the WebPortal and KAP.
 */
export default {
    components: {
        Multiselect,
        SingleSelect,
        Fieldset,
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        viewValue() {
            return this.nodeConfig.viewValue;
        },
        filter() {
            return this.viewValue.filter;
        },
        isMultiselect() {
            return this.viewRep.multipleValues;
        },
        formComponentType() {
            return this.isMultiselect ? 'Multiselect' : 'SingleSelect';
        },
        labelComponentType() {
            if (this.isMultiselect) {
                return this.isList ? 'Label' : 'Fieldset';
            } else {
                return this.isRadioButtons ? 'Fieldset' : 'Label';
            }
        },
        label() {
            return this.viewRep.label || '';
        },
        valueArray() {
            return this.viewValue.filter.columns[0].values;
        },
        value() {
            return this.isMultiselect ? this.valueArray : this.valueArray[0];
        },
        isList() {
            return this.viewRep.type === 'List';
        },
        isRadioButtons() {
            return this.viewRep.type === 'Radio buttons (vertical)' ||
                this.viewRep.type === 'Radio buttons (horizontal)';
        }
    },
    mounted() {
        this.updateCallback();
    },
    methods: {
        getValue() {
            return this.viewValue;
        },
        onChange(value) {
            this.$emit('updateWidget', {
                nodeId: this.nodeId,
                update: {
                    [UPDATE_KEY]: Array.isArray(value) ? value : [value]
                },
                callback: this.updateCallback
            });
        },
        /**
         * Do not call directly except in mounted. Must be called after the asynchronous data
         * for this widget has been updated in the store.
         *
         * @returns {undefined}
         */
        updateCallback() {
            this.$store.dispatch('pagebuilder/interactivity/updateFilter', {
                id: `filter-${this.viewRep.tableID}`,
                data: this.filter
            });
        },
        validate() {
            return { isValid: typeof this.getValue() !== 'undefined' };
        }
    }
};
</script>

<template>
  <Component
    :is="labelComponentType"
    :text="label"
  >
    <Component
      :is="formComponentType"
      ref="form"
      :value="value"
      :type="viewRep.type"
      :number-vis-options="viewRep.numberVisOptions"
      :limit-number-vis-options="viewRep.limitNumberVisOptions"
      :possible-value-list="viewRep.possibleValues"
      :is-valid="isValid"
      :label="label"
      @input="onChange"
    />
    <ErrorMessage :error="errorMessage" />
  </Component>
</template>
