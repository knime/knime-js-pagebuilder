export default {
  nodeConfig: {
    "@class": "org.knime.js.core.JSONWebNode",
    initMethodName: "init",
    validateMethodName: "validate",
    setValidationErrorMethodName: "setValidationErrorMessage",
    javascriptLibraries: [
      "/js-lib/knime/service/knime_service_1_0_0.js",
      "/js-lib/jQuery/jquery-1.11.0.min.js",
      "/org/knime/js/base/dialog/selection/single/DropdownSingleSelection.js",
      "/org/knime/js/base/dialog/selection/single/ListSingleSelection.js",
      "/org/knime/js/base/dialog/selection/single/RadioButtonSingleSelection.js",
      "/js-lib/jQueryUI/min/ui/jquery-ui.min.js",
      "/org/knime/js/base/util/quickform/knime_quickform_utils_1_0_0.js",
      "/org/knime/js/base/node/widget/selection/value/valueSelectionWidget.js",
    ],
    stylesheets: [
      "/js-lib/font-awesome/4_7_0/css/font-awesome.min.css",
      "/js-lib/knime/service/knime.css",
      "/js-lib/jQueryUI/min/themes/base/jquery-ui.min.css",
      "/org/knime/js/base/util/quickform/quickformStyles.css",
    ],
    getViewValueMethodName: "value",
    nodeInfo: {
      "@class": "org.knime.js.core.JSONWebNodeInfo",
      nodeAnnotation: "",
      nodeState: "executed",
      nodeName: "Value Selection Widget",
      nodeErrorMessage: null,
      nodeWarnMessage: null,
      displayPossible: true,
    },
    viewRepresentation: {
      "@class":
        "org.knime.js.base.node.base.selection.value.ValueSelectionNodeRepresentation",
      label: "Value Selection (List) Column Locked",
      description: "Enter Description",
      required: true,
      defaultValue: {
        "@class":
          "org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue",
        column: "Cluster Membership",
        value: "Cluster_0",
      },
      currentValue: {
        "@class":
          "org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue",
        column: "Cluster Membership",
        value: "Cluster_0",
      },
      columnType: "All",
      lockColumn: true,
      possibleValues: {
        "Cluster Membership": [
          "Cluster_0",
          "Cluster_1",
          "Cluster_2",
          "Cluster_3",
        ],
      },
      type: "List",
      limitNumberVisOptions: false,
      numberVisOptions: 10,
      possibleColumns: ["Cluster Membership"],
    },
    viewValue: {
      "@class":
        "org.knime.js.base.node.base.selection.value.ValueSelectionNodeValue",
      column: "Cluster Membership",
      value: "Cluster_0",
    },
    customCSS: "",
    namespace: "knimeValueSelectionWidget",
  },
  nodeId: "3:0:9",
  isValid: false,
};
