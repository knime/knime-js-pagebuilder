import type { UIExtensionService } from "..";
import { createUIExtensionServiceProxy } from "../service-proxy";

const getBaseService = (baseService?: UIExtensionService) => {
  const { service } = baseService
    ? { service: baseService }
    : createUIExtensionServiceProxy();

  return service;
};

export const createResourceService = (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  return {
    getResourceUrl: (path: string) => {
      const config = service.getConfig();
      return service.getResourceLocation(config?.resourceInfo?.baseUrl, path);
    },
  };
};

// PUBLICLY EXPOSED SERVICES
export const createJSONDataService = (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  // TODO: could detect BE service type / (endpoint) based on config
  // and call specific service.(...)

  return {
    getInitialData: () => {
      const config = service.getConfig();

      return service.callNodeDataService({
        projectId: config.projectId,
        workflowId: config.workflowId,
        nodeId: config.nodeId,
        extensionType: config.extensionType,
        serviceType: "initial_data",
        dataServiceRequest: "",
      });
    },

    getData: () => {
      // TODO
    },

    addListener: () => {
      service.addPushEventListener("some-push-event", () => {
        console.log("GOT EVENT");
      });
    },
  };
};

export const createSelectionService = (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  return {
    updateSelection: () => {
      const config = service.getConfig();

      return service.updateDataPointSelection({
        projectId: config.projectId,
        workflowId: config.workflowId,
        nodeId: config.nodeId,
        mode: "",
        selections: [],
      });
    },
  };
};

export const createColorService = async (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  return {
    async getColor() {
      const config = await service.getConfig();
      // run custom logic only based on config (e.g w/o hitting API)
      const baseColor = "#fff";

      return { baseColor, type: config };
    },
  };
};

export const createDialogService = (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  return {
    hasNodeView: () => {
      return service.getConfig().hasNodeView;
    },

    isWriteProtected: () => {
      return service.getConfig().isWriteProtected;
    },
  };
};

export const createReportingService = (baseService?: UIExtensionService) => {
  const service = getBaseService(baseService);

  return {
    isReportingActive() {
      return Boolean(service.getConfig()?.generatedImageActionId);
    },
  };
};
