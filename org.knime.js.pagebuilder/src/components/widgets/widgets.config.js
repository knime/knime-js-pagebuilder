export const classToComponentMap = {
    // input widgets
    'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation': 'SliderWidget',
    'org.knime.js.base.node.base.input.string.StringNodeRepresentation': 'StringWidget',
    'org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation': 'DoubleWidget',
    'org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation': 'IntegerWidget',
    'org.knime.js.base.node.base.input.bool.BooleanNodeRepresentation': 'BooleanWidget',

    // selection widgets
    'org.knime.js.base.node.widget.selection.single.SingleSelectionWidgetRepresentation': 'SingleSelectionWidget',
    'org.knime.js.base.node.widget.selection.multiple.MultipleSelectionWidgetRepresentation': 'MultipleSelectionWidget',
    'org.knime.js.base.node.base.filter.column.ColumnFilterNodeRepresentation': 'ColumnFilterSelectionWidget',
    'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeRepresentation': 'ColumnSelectionWidget',

    // output widgets
    'org.knime.js.base.node.output.text.TextOutputRepresentation': 'TextWidget'
};
