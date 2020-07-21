/**
 * Utility function to place a content item inside of a layout container. The container consists of a @see Row and
 * @see Column and ensures the correct responsiveness and layout separation of the item.
 *
 * @param {Object} item - the content item to wrap inside an empty container JSON configuration.
 * @returns {Object} - the wrapped layout container configuration containing the original item.
 */
const wrapView = item => ({
    type: 'JSONLayoutRow',
    additionalStyles: [],
    additionalClasses: [],
    columns: [
        {
            content: [item],
            widthXS: 12,
            additionalStyles: [],
            additionalClasses: []
        }
    ]
});

/**
 * Utility function which checks @see Column content for "adjacent" (top-level; sibling) content items of type "view"
 * or "JSONLayoutViewContent" which need to be wrapped in an empty @see Row -> @see Column layout container to ensure
 * consistent rendering. If there are no views or only one view with this type, then the original content (unwrapped)
 * is returned. NOTE: only wraps content items of the types mentioned above; all others are returned unwrapped.
 *
 * @param {Array} [content] - an array of page content items in the same layout container.
 * @returns {Array} - the original content with any top-level, unwrapped views inside a container configuration if
 *      there were multiple views at the top level.
 */
export default (content = []) => {
    let wrappedColumn = content.map(item => item.type === 'view' || item.type === 'JSONLayoutViewContent'
        ? wrapView(item)
        : item);
    return wrappedColumn.length < 2 ? content : wrappedColumn;
};
