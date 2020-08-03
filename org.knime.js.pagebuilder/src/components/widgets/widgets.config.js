/**
 * This object contains a mapping for KNIME Widget Node class names and their corresponding
 * Vue component names. It's intended to be used with the Vue Component "is" functionality.
 * It is also used to verify that a Node View is a Vue Widget and some other view content.
 * This mapping can NOT be used for KNIME Widget Nodes which share a class name with another
 * non-Widget node. (@example: some QuickForms use the same class and should be added to the
 * @see nodeNameToComponentMap ).
 *
 * TODO: WEBP-327 - update class mappings when Widgets have their own repository.
 */
export const classToComponentMap = {
    // input widgets
    'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation': 'SliderWidget',
    'org.knime.js.base.node.base.input.string.StringNodeRepresentation': 'StringWidget',
    'org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation': 'DoubleWidget',
    'org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation': 'IntegerWidget',
    'org.knime.js.base.node.base.input.bool.BooleanNodeRepresentation': 'BooleanWidget',
    'org.knime.js.base.node.base.input.listbox.ListBoxNodeRepresentation': 'ListBoxInputWidget',

    // selection widgets
    'org.knime.js.base.node.widget.selection.single.SingleSelectionWidgetRepresentation': 'SingleSelectionWidget',
    'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation': 'MultipleSelectionWidget',
    'org.knime.js.base.node.base.filter.column.ColumnFilterNodeRepresentation': 'ColumnFilterSelectionWidget',
    'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeRepresentation': 'ColumnSelectionWidget',
    'org.knime.js.base.node.base.filter.value.ValueFilterNodeRepresentation': 'ValueFilterSelectionWidget',
    'org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation': 'ValueSelectionWidget',
};

/**
 * This object contains a mapping for KNIME Widget Node node names and their corresponding
 * Vue component names. It's intended to be used with the Vue Component "is" functionality.
 * It is also used to verify that a Node View is a Vue Widget and some other view content.
 * This mapping SHOULD be used for KNIME Widget Nodes which share a class name with another
 * non-Widget node. (@example: some QuickForms use the same class and should be added here).
 *
 * TODO: WEBP-327 - revisit when Widget nodes have unique class names.
 */
export const nodeNameToComponentMap = {
    // output widgets
    'Text Output Widget': 'TextWidget',
    'Image Output Widget': 'ImageWidget',
    'File Download Widget': 'FileDownloadWidget',

    // interactive widgets
    'Interactive Value Filter Widget': 'InteractiveValueWidget',
    'Interactive Range Slider Filter Widget': 'InteractiveRangeWidget'
};
