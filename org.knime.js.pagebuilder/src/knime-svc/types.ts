type DefaultParams = { projectId: string; workflowId: string; nodeId: string };

/**
 * API layer definition for the UIExtension service. This contract
 * represents the method implementations that the embedded of Extensions
 * needs to supply in order to make the communication with Extensions work properly
 */
export interface UIExtensionAPILayer {
  getResourceLocation(baseUrl: string, path: string): string;

  callNodeDataService(
    params: DefaultParams & {
      extensionType: string;
      serviceType: string;
      dataServiceRequest: string;
    },
  ): Promise<any>;

  callPortDataService(
    params: DefaultParams & {
      portIdx: number;
      viewIdx: number;
      serviceType: string;
      dataServiceRequest: string;
    },
  ): Promise<any>;

  updateDataPointSelection(
    params: DefaultParams & { mode: string; selections: string[] },
  ): Promise<any>;
}

export namespace UIExtensionMessageExchange {
  export type GenericEvent<T = string> = {
    type: T;
    requestId: string;
  };

  export type Request = GenericEvent<"UIExtensionRequest"> & {
    payload: {
      method: keyof UIExtensionAPILayer;
      params: any[];
    };
  };

  export type Response<T = any> = GenericEvent<"UIExtensionResponse"> & {
    payload: T;
  };
}

export namespace UIExtensionEvents {
  export type Event<T> = {
    name: string;
    data?: T;
  };

  type GetWrappedEvent<T extends string, TPayload = unknown> = {
    type: T;
    payload: Event<TPayload>;
  };

  export type PushEvent<T> = GetWrappedEvent<"UIExtensionPushEvent", T>;

  export type EventCallback = <T>(event: Event<T>) => void;
}

export type GetConfig<T = any> = {
  getConfig(): T;
};

type PushEventHandling = {
  addPushEventListener: (
    eventName: string,
    callback: UIExtensionEvents.EventCallback,
  ) => () => void;
  dispatchPushEvent: <T>(event: UIExtensionEvents.Event<T>) => void;
};

export type UIExtensionService<T = any> = UIExtensionAPILayer &
  PushEventHandling &
  GetConfig<T>;

export type UIExtensionIframeService<T = any> = UIExtensionService<T> & {
  setIframe(iframe: HTMLIFrameElement): void;
};

export type CreateUIExtensionService<T = any> = (
  config: T,
) => UIExtensionService<T>;

export type CreateUIExtensionIframeService<T = any> = (
  config: T,
) => UIExtensionIframeService<T>;
