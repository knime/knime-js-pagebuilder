export {};

declare global {
  export interface Window {
    closeCEFWindow: (executeNode: boolean) => void;
    EquoCommService: {
      send: (actionId: string, payload: string) => void;
    };
  }
}
