const getBaseExtID = (knimeService) => {
    let { nodeId, projectId, workflowId } = knimeService.extensionConfig;
    return `${nodeId}.${projectId}.${workflowId}`;
};

/**
 * Creates an instance ID from a @type {KnimeService}. This ID unique among node instances in a workflow but shared
 * between KnimeService instances instantiated by the same node instance (i.e. between sessions, refreshes, reloads,
 * etc.).
 *
 * @param {KnimeService} knimeService - the service from which to derive an ID.
 * @returns {String} the id derived from the provided service.
 */
const getUIExtUUID = (knimeService) => {
    let { extensionType } = knimeService.extensionConfig;
    return `${getBaseExtID(knimeService)}.${extensionType}`;
};

export {
    getBaseExtID,
    getUIExtUUID
};
