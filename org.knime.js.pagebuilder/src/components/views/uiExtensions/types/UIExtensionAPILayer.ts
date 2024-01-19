import type {
  UIExtensionPushEvents,
  UIExtensionServiceAPILayer,
} from "@knime/ui-extension-service";

type UIExtensionAPILayer = Pick<
  UIExtensionServiceAPILayer,
  | "callNodeDataService"
  | "imageGenerated"
  | "setReportingContent"
  | "publishData"
  | "updateDataPointSelection"
  | "getResourceLocation"
  | "sendAlert"
> & {
  /**
   * @returns the respective deregistration method
   */
  registerPushEventService: (service: {
    dispatchPushEvent: (event: UIExtensionPushEvents.PushEvent<any>) => void;
  }) => () => void;
};

export type { UIExtensionAPILayer };
