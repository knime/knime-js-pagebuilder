import { ExtensionTypes } from "@knime/ui-extension-service";
import { ExtensionConfig } from "../../uiExtensions/types/ExtensionConfig";
import { ResourceTypes } from "../../uiExtensions/types/ResourceTypes";

export const getTestExtensionConfig: () => ExtensionConfig & {
  resourceInfo: { baseUrl: string };
} = () => ({
  nodeId: "0:0:7",
  projectId: "knime workflow",
  workflowId: "root:10",
  extensionType: ExtensionTypes.VIEW,
  nodeInfo: {
    nodeAnnotation: "",
    nodeState: "executed",
    nodeName: "Scatter Plot",
  },
  hasNodeView: false,
  resourceInfo: {
    id: "org.knime.base.views.scatterplot.ScatterPlotNodeFactory",
    type: ResourceTypes.VUE_COMPONENT_LIB,
    url: "http://localhost:8080/my_widget.html",
    baseUrl: "myBaseUrl",
  },
});
