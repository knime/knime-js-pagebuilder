import { KnimeService } from 'knime-ui-extension-service';
import { ServiceUUID } from 'types/util';

/**
 * Creates an instance ID from a @type {KnimeService}. This ID unique among node instances in a workflow but shared
 * between KnimeService instances instantiated by the same node instance (i.e. between sessions, refreshes, reloads,
 * etc.).
 *
 * @param {KnimeService} knimeService - the service from which to derive an ID.
 * @returns {ServiceUUID} the id derived from the provided service.
 */
export default function (knimeService: KnimeService) : ServiceUUID {
    let { nodeId, projectId, workflowId, extensionType } = knimeService.extensionConfig;
    return `${nodeId}.${projectId}.${workflowId}.${extensionType}`;
}
