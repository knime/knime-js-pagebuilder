/**
 * @param {String} [path] - path to the file (supports `\\` and `/` separators) with a `<filename>.<extension.> postfix.
 * @returns {String} - the file extension extracted from the path or an empty string.
 */
export default (path) => {
    if (typeof path !== 'string') {
        return '';
    }
    // extract file name from full path (supports `\\` and `/` separators)
    let basename = path.split(/[\\/]/).pop();
    let pos = basename.lastIndexOf('.');
    if (basename === '' || pos < 1) {
        return '';
    }
    // extract extension ignoring `.`
    return basename.slice(pos + 1);
};
