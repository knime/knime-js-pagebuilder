/**
 * Identifier for a service which needs to be unique among services on a page but similar between sessions
 * for a given node service instance. (e.g. Workflow "0", Project "0", Node "7", Type: "Dialog" should
 * generate the same ServiceUUID if the page is reopened or reloaded).
 */
export type ServiceUUID = string;
