// TODO AP-19689 Remove if 'required' functionality implemented
/**
 * Overrides the `required` property in a WebNodeConfig; specifically for widgets. Needed during re-execution to
 * prevent inputs from becoming required after update @see AP-17576.
 *
 * @param {Object} [webNode] - the configuration to update required (if present; otherwise fail-safe).
 * @returns {Object} the webNode to update.
 */
export default (webNode) => {
  if (webNode?.viewRepresentation?.required) {
    webNode.viewRepresentation.required = false;
  }
  return webNode;
};
