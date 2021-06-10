import { default as createTreeItemRecursively, checkDefaultPaths, getIcon } from '@/util/createTreeItem';

describe('Tests the createTreeItem functionality', () => {

    it('tests the creation of a empty tree object', () => {
        const flatRepositoryItem = {};
        const defaultPaths = [];
        const viewRep = {
            selectWorkflows: true,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: undefined,
            state: {
                disabled: false,
                opened: false,
                selected: false
            },
            text: ''
        });
    });

    it('tests the creation of a flat tree with only one workflow', () => {
        const flatRepositoryItem = {
            type: 'Workflow',
            path: 'foo/bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: true,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: 'foo/bar',
            state: {
                disabled: false,
                opened: false,
                selected: false
            },
            text: 'bar',
            type: 'WORKFLOW'
        });
    });

    it('tests that with select workflows set to false no workflow item is created', () => {
        const flatRepositoryItem = {
            type: 'Workflow',
            path: 'foo/bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual(null);
    });

    it('tests the creation of a flat tree with only one folder', () => {
        const flatRepositoryItem = {
            type: 'WorkflowGroup',
            path: 'foo/bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: true,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: 'foo/bar',
            state: {
                disabled: false,
                opened: false,
                selected: false
            },
            text: 'bar',
            type: 'DIRECTORY'
        });
    });

    it('tests that no folder is created with only one folder and select folders disabled', () => {
        const flatRepositoryItem = {
            type: 'WorkflowGroup',
            path: 'foo/bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual(null);
    });

    it('tests that a folder is created with a nested folder and select folders disabled', () => {
        const flatRepositoryItem = {
            type: 'WorkflowGroup',
            path: 'foo/bar',
            children: [{
                type: 'Workflow',
                path: 'foo/bar',
                children: []
            }]
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: true,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [{
                children: [],
                id: 'foo/bar',
                state: {
                    disabled: false,
                    opened: false,
                    selected: false
                },
                text: 'bar',
                type: 'WORKFLOW'
            }],
            id: 'foo/bar',
            state: {
                disabled: true,
                opened: false,
                selected: false
            },
            text: 'bar',
            type: 'DIRECTORY'
        });
    });

    it('tests that no file is created select files disabled', () => {
        const flatRepositoryItem = {
            type: 'Data',
            path: 'foo/bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: false,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual(null);
    });

    it('tests that no file is created if no file does not match the allowed files', () => {
        const flatRepositoryItem = {
            type: 'Data',
            path: 'foo/bar.bar',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: true,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual(null);
    });

    it('tests that a file is created if there are no allowed files given', () => {
        const flatRepositoryItem = {
            type: 'Data',
            path: 'foo/bar.foo',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: true,
            fileTypes: []
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: 'foo/bar.foo',
            icon: 'fileIcon',
            state: {
                disabled: false,
                opened: false,
                selected: false
            },
            text: 'bar.foo',
            type: 'DATA'
        });
    });

    it('tests that a file is created if a file does match the allowed files', () => {
        const flatRepositoryItem = {
            type: 'Data',
            path: 'foo/bar.foo',
            children: []
        };
        const defaultPaths = ['foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: true,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: 'foo/bar.foo',
            icon: 'fileIcon',
            state: {
                disabled: false,
                opened: false,
                selected: false
            },
            text: 'bar.foo',
            type: 'DATA'
        });
    });

    it('tests that a file is created and it is selected if it matches the default file', () => {
        const flatRepositoryItem = {
            type: 'Data',
            path: 'foo/bar.foo',
            children: []
        };
        const defaultPaths = ['foo/bar.foo'];
        const viewRep = {
            selectWorkflows: false,
            selectDirectories: false,
            selectDataFiles: true,
            fileTypes: ['.foo']
        };

        expect(createTreeItemRecursively(flatRepositoryItem, defaultPaths, viewRep)).toEqual({
            children: [],
            id: 'foo/bar.foo',
            icon: 'fileIcon',
            state: {
                disabled: false,
                opened: false,
                selected: true
            },
            text: 'bar.foo',
            type: 'DATA'
        });
    });

    it('tests the getIcon function', () => {
        const csvEnding = 'csv';
        const nonExistingIcon = 'foo';
        const nullEnding = null;
        const empty = '';

        expect(getIcon(csvEnding)).toEqual('csvIcon');
        expect(getIcon(nonExistingIcon)).toEqual('fileIcon');
        expect(getIcon(nullEnding)).toEqual('fileIcon');
        expect(getIcon(empty)).toEqual('fileIcon');
    });

    it('tests that it does nothing if the default path does not match', () => {
        const singleDefaultPath = ['bla/test.csv'];
        let treeItem = {
            id: 'foo',
            state: {
                opened: false,
                disabled: false,
                selected: false
            }
        };
        checkDefaultPaths(singleDefaultPath, treeItem);
        expect(treeItem.state.selected).toEqual(false);
        expect(treeItem.state.opened).toEqual(false);
        expect(treeItem.state.disabled).toEqual(false);
    });

    it('tests the file tree is opened if it is on a default path', () => {
        const singleDefaultPath = ['bla/test.csv'];
        let treeItem = {
            id: 'bla',
            state: {
                opened: false,
                disabled: false,
                selected: false
            }
        };
        checkDefaultPaths(singleDefaultPath, treeItem);
        expect(treeItem.state.selected).toEqual(false);
        expect(treeItem.state.opened).toEqual(true);
    });

    it('tests the file tree is selected if it matches a default path', () => {
        const singleDefaultPath = ['bla/test.csv'];
        let treeItem = {
            id: 'bla/test.csv',
            state: {
                opened: false,
                disabled: false,
                selected: false
            }
        };
        checkDefaultPaths(singleDefaultPath, treeItem);
        expect(treeItem.state.selected).toEqual(true);
        expect(treeItem.state.opened).toEqual(false);
    });
});

