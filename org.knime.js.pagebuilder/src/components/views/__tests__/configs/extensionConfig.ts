import { ExtensionTypes, RenderingType } from "@knime/ui-extension-service";
import {
  type ExtensionConfig,
  ResourceTypes,
} from "webapps-common/ui/uiExtensions";

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
    type: ResourceTypes.SHADOW_APP,
    url: "http://localhost:8080/my_widget.html",
    baseUrl: "myBaseUrl",
  },
  renderingConfig: {
    type: RenderingType.DEFAULT,
  },
});
