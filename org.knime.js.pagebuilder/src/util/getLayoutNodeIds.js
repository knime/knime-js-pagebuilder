let findLayoutRowIds = ({ columns }, rowIds) => columns.forEach(({ content }) => content.forEach(item => {
    let { type: itemType, nodeID, layout } = item;
    if (['row', 'JSONLayoutRow'].includes(itemType)) {
        findLayoutRowIds(item, rowIds);
    } else if (['nestedLayout', 'JSONLayoutHTMLContent'].includes(itemType)) {
        layout?.rows?.forEach(row => findLayoutRowIds(row, rowIds));
    } else if (nodeID) {
        rowIds.push(nodeID);
    }
}));

/**
 * Recursively search a page for nodeIds contained in its layout. Unpacks rows, columns and column content
 * to find and return an array of nodeIds.
 *
 * @param {Object} page - the page containing the layout to search for nodeIds.
 * @returns {Array} nodeIds found in the page layout or empty if the provided page is missing a layout.
 */
export default function (page) {
    let { rows } = page?.wizardPageContent?.webNodePageConfiguration?.layout || {};
    let rowIds = [];
    rows?.forEach(row => findLayoutRowIds(row, rowIds));
    return rowIds;
}
