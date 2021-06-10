import * as icons from '~/webapps-common/ui/util/fileTypeIcons';
import { getFileExtension, getNameFromPath } from '@/util/fileUtils';

let getIcon, createTreeItemRecursively, checkDefaultPaths;

const SERVER_ITEM_TYPE = {
    WORKFLOW: 'Workflow',
    WORKFLOW_GROUP: 'WorkflowGroup',
    DATA: 'Data'
};
const WIDGET_ITEM_TYPE = {
    WORKFLOW: 'WORKFLOW',
    DIR: 'DIRECTORY',
    DATA: 'DATA',
    UNKNOWN: 'UNKNOWN'
};

export default (repositoryItem, defaultPaths, viewRep) => createTreeItemRecursively(
    repositoryItem, defaultPaths, viewRep
);

export {
    checkDefaultPaths,
    getIcon
};

/**
 * This function is called recursive to build up the file tree
 * @param {Object} [repositoryItem] - the repository item for which the tree should be build
 * @param {Array} [defaultPaths] - an array of paths, if they match a repository item it will be selected
 * @param {Object} [viewRep] - the view representation of the node
 * @returns {Object} the created tree
 */
createTreeItemRecursively = (repositoryItem, defaultPaths, viewRep) => {
    let treeItem = {
        id: repositoryItem.path,
        text: getNameFromPath(repositoryItem.path),
        state: {
            opened: false,
            disabled: false,
            selected: false
        },
        children: []
    };
    
    // set type and icons
    if (repositoryItem.type === SERVER_ITEM_TYPE.WORKFLOW) {
        // return if workflows cannot be selected
        if (!viewRep.selectWorkflows) {
            return null;
        }
        treeItem.type = WIDGET_ITEM_TYPE.WORKFLOW;
    } else if (repositoryItem.type === SERVER_ITEM_TYPE.WORKFLOW_GROUP) {
        // set folder disabled if it cannot be selected
        treeItem.type = WIDGET_ITEM_TYPE.DIR;
        if (!viewRep.selectDirectories) {
            treeItem.state.disabled = true;
        }
    } else if (repositoryItem.type === SERVER_ITEM_TYPE.DATA) {
        // return if files are not allowed to be selected
        if (!viewRep.selectDataFiles) {
            return null;
        }

        let fileEnding = getFileExtension(treeItem.id);

        // check if file type is allowed
        if (viewRep.fileTypes && viewRep.fileTypes.length > 0) {
            // checks if the file ending exists in the viewRep allowed file endings
            let allowedFileEnding = viewRep.fileTypes.includes(`.${fileEnding.toLowerCase()}`);
            if (!allowedFileEnding) {
                return null;
            }
        }
        
        treeItem.type = WIDGET_ITEM_TYPE.DATA;

        // set custom icon if possible
        treeItem.icon = getIcon(fileEnding);
    }

    checkDefaultPaths(defaultPaths, treeItem);
    
    // resolve children
    if (treeItem.type === WIDGET_ITEM_TYPE.DIR) {
        if (repositoryItem.children) {
            repositoryItem.children.forEach((child) => {
                let childItem = createTreeItemRecursively(child, defaultPaths, viewRep);
                if (childItem) {
                    treeItem.children.push(childItem);
                }
            });
        }
        
        // remove empty directories if directories can't be selected
        if (!treeItem.children?.length && !viewRep.selectDirectories) {
            return null;
        }
    }

    return treeItem;
};

/**
 * Opens the folder structure if the tree item is on the default path.
 * If it is the same file, then the file is additionally selected.
 * @param {Array} [defaultPaths] - the paths to check if they match
 * @param {Object} [treeItem] - the tree item to check if its on a default path
 * @returns {void} - nothing
 */
checkDefaultPaths = (defaultPaths, treeItem) => {
    // set selection if default paths match
    if (defaultPaths?.length) {
        defaultPaths.forEach((defaultPath) => {
            if (defaultPath?.startsWith(treeItem.id)) {
                treeItem.state.opened = true;
                if (defaultPath === treeItem.id && !treeItem.state.disabled) {
                    treeItem.state.opened = false;
                    treeItem.state.selected = true;
                }
            }
        });
    }
};

/**
 * Checks if the icon exists in the webapps-common file, otherwise returns a file icon
 * @param {String} [fileEnding] the file ending for which an icon is required
 * @returns {String} returns either the icon name or a default file icon name if the icon is not present
 */
getIcon = (fileEnding) => {
    let candidate = `${fileEnding}Icon`;
    return icons.isIconExisting(candidate)
        ? candidate
        : `fileIcon`;
};
