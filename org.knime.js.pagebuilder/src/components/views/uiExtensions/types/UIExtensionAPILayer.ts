import type {
  Alert,
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
> & {
  sendAlert: (alert: Alert, closeAlert?: () => void) => void;
  /**
   * @returns the respective deregistration method
   */
  registerPushEventService: (service: {
    dispatchPushEvent: (event: UIExtensionPushEvents.PushEvent<any>) => void;
  }) => () => void;
};

export type { UIExtensionAPILayer };
