import { type ExtensionConfig } from "@knime/ui-extension-renderer/vue";

export const getTestExtensionConfig: () => ExtensionConfig & {
  resourceInfo: { baseUrl: string };
} = () => ({
  nodeId: "0:0:7",
  projectId: "knime workflow",
  workflowId: "root:10",
  extensionType: "view",
  nodeInfo: {
    nodeAnnotation: "",
    nodeState: "executed",
    nodeName: "Scatter Plot",
  },
  hasNodeView: false,
  resourceInfo: {
    id: "org.knime.base.views.scatterplot.ScatterPlotNodeFactory",
    type: "SHADOW_APP",
    url: "http://localhost:8080/my_widget.html",
    baseUrl: "myBaseUrl",
  },
  renderingConfig: {
    type: "DEFAULT",
  },
});
