const WORKFLOW_RELATIVE = "knime.workflow";
const MOUNTPOINT_RELATIVE = "knime.mountpoint";

/**
 * @param {String} [path] - path to the file (supports `\\` and `/` separators) with a `<filename>.<extension.> postfix.
 * @returns {String} - the file extension extracted from the path or an empty string.
 */
export const getFileExtension = (path) => {
  if (typeof path !== "string") {
    return "";
  }
  // extract file name from full path (supports `\\` and `/` separators)
  let basename = path.split(/[\\/]/).pop();
  let pos = basename.lastIndexOf(".");
  if (basename === "" || pos < 1) {
    return "";
  }
  // extract extension ignoring `.`
  return basename.slice(pos + 1);
};

/**
 * @param {String} [path] - the path for which the name is wanted
 * @returns {String} - returns the part of the path after the last '/' or an empty string
 */
export const getNameFromPath = (path) => {
  if (typeof path !== "string") {
    return "";
  }
  // extract file name from full path (supports `\\` and `/` separators)
  let basename = path.split(/[\\/]/).pop();
  return basename;
};

/**
 * @param {String} [path] - path to the file
 * @param {String} [schema] - schema that is being replaced
 * @returns {String} - the path without the schema and a '/' at the end or an empty string
 */
export const trimSchema = (path, schema) => {
  if (!path || !schema) {
    return "";
  }
  let pathWithoutSchema = path.replace(schema, "");
  // removes the mountpoint
  let trimmedPath = pathWithoutSchema.substring(pathWithoutSchema.indexOf("/"));
  // if the last char is a forward slash, remove it
  if (trimmedPath.length && trimmedPath[trimmedPath.length - 1] === "/") {
    trimmedPath = trimmedPath.substring(0, trimmedPath.length - 1);
  }
  return trimmedPath;
};

/**
 * Normalizes the path parts array and resolves empty parts and folder up operations
 * @param {Array} [parts] - array of the different path parts
 * @param {Boolean} [allowAboveRoot] - if true referencing parents is allowed
 * @returns {Array} - returns the normalized string parts array
 */
export const normalizeArray = (parts, allowAboveRoot) => {
  let res = [];
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i];

    // ignore empty parts
    if (!p || p === ".") {
      continue;
    }
    if (p === "..") {
      if (res.length && res[res.length - 1] !== "..") {
        res.pop();
      } else if (allowAboveRoot) {
        res.push("..");
      }
    } else {
      res.push(p);
    }
  }
  return res;
};

/**
 * @param {String} [path] - Path that should be normalized
 * @returns {String} returns the normalized path
 */
export const normalizePath = (path) => {
  let normalizedPath = normalizeArray(path.split("/"), true).join("/");
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }
  return normalizedPath;
};

/**
 * Resolves workflow relative paths
 * @param {String} [path] - the workflow relative path
 * @param {String} [workflowPath] - the path to the workflow
 * @returns {String} returns the resulting workflow relative path
 */
export const resolveWorkflowRelativePath = (path, workflowPath) => {
  let relativePath = path;
  if (workflowPath) {
    if (workflowPath.endsWith("/")) {
      workflowPath = workflowPath.substring(0, workflowPath.length - 1);
    }
    relativePath = normalizePath(workflowPath + path);
  }
  return relativePath;
};

/**
 * Resolves paths that start with a schema part like workflow relative or mountpoint relative paths
 * @param {String} [rootPath] - The root path
 * @param {String} [schemaPart] - The schema part will most likely be ('knime://')
 * @param {String} [schema] - Only the name of the schema - most likely ('knime')
 * @param {String} [workflowPath] - The path to the executed workflow
 * @returns {String} returns the resulting path string
 */
export const getRootPath = (rootPath, schemaPart, schema, workflowPath) => {
  if (rootPath.toLowerCase().startsWith(schemaPart)) {
    let pathWithoutSchema = rootPath.replace(schemaPart, "");
    let schemaIndex = pathWithoutSchema.indexOf("/") + 1;
    rootPath = pathWithoutSchema.substring(schemaIndex - 1);
    let host = pathWithoutSchema.substring(0, schemaIndex - 1);
    if (host === WORKFLOW_RELATIVE) {
      rootPath = resolveWorkflowRelativePath(rootPath, workflowPath);
    } else if (host === MOUNTPOINT_RELATIVE || !host.startsWith(schema)) {
      rootPath = normalizePath(rootPath);
    }
  }
  return rootPath;
};
