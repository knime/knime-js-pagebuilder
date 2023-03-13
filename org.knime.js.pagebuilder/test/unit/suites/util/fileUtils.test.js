import { describe, expect, it } from 'vitest';
/* eslint-disable no-magic-numbers */
import { getFileExtension, getNameFromPath, getRootPath, normalizeArray,
    normalizePath, resolveWorkflowRelativePath, trimSchema } from '@/util/fileUtils';

describe('getFileExtension function', () => {
    it('extracts file extensions', () => {
        const file = 'file.txt';
        const path = '/Path/to/file.txt';
        const windowsPath = '\\Special\\windows\\path\\to\\file.txt';
        const longFileExtension = 'hello.fooBarFoobarTestExt';
        const shortFileExtension = 'hello.a';

        expect(getFileExtension(file)).toEqual('txt');
        expect(getFileExtension(path)).toEqual('txt');
        expect(getFileExtension(windowsPath)).toEqual('txt');
        expect(getFileExtension(longFileExtension)).toEqual('fooBarFoobarTestExt');
        expect(getFileExtension(shortFileExtension)).toEqual('a');
    });

    it('handles invalid parameters', () => {
        const empty = '';
        const nullFile = null;
        const numberFile = 10;
        const booleanFile = false;

        expect(getFileExtension(empty)).toEqual('');
        expect(getFileExtension(nullFile)).toEqual('');
        expect(getFileExtension(numberFile)).toEqual('');
        expect(getFileExtension(booleanFile)).toEqual('');
        expect(getFileExtension(expect.undefined)).toEqual('');
    });
});


describe('trimSchema function', () => {
    const knimeSchema = 'knime://';
    
    it('removes schemas', () => {
        const workflowRelativePath = 'knime://knime.workflow/test';
        const mountpointRelativePath = 'knime://LOCAL/test';
        const endingWithSlash = 'knime://knime.workflow/test/';

        expect(trimSchema(workflowRelativePath, knimeSchema)).toEqual('/test');
        expect(trimSchema(mountpointRelativePath, knimeSchema)).toEqual('/test');
        expect(trimSchema(endingWithSlash, knimeSchema)).toEqual('/test');
    });

    it('handles invalid parameters', () => {
        const empty = '';
        const nullPath = null;
        const emptySchema = '';
        const regularPath = 'knime://knime.workflow/test/';

        expect(trimSchema(empty, knimeSchema)).toEqual(empty);
        expect(trimSchema(nullPath, knimeSchema)).toEqual(empty);
        expect(trimSchema(expect.undefined, knimeSchema)).toEqual(empty);

        expect(trimSchema(regularPath, emptySchema)).toEqual(empty);
    });
});

describe('getRootPath functionality', () => {
    const SCHEMA = 'knime';
    const SCHEMA_PART = `${SCHEMA}://`;
    const WORKFLOW_RELATIVE = 'knime.workflow';
    const WORKFLOW_PATH = `/testWorkflow`;
    const MOUNTPOINT_RELATIVE = 'knime.mountpoint';

    it('test normalizeArray function', () => {
        const empty = [];
        const doubleSlashPath = ['', 'test.csv'];
        const dotPath = ['.', 'test.csv'];
        const parentPath = ['..', 'test.csv'];
        const parentMiddlePath = ['somePath', '..', 'test.csv'];

        expect(normalizeArray(empty, true)).toEqual(empty);
        expect(normalizeArray(doubleSlashPath, true)).toEqual(['test.csv']);
        expect(normalizeArray(dotPath, true)).toEqual(['test.csv']);
        expect(normalizeArray(parentPath, true)).toEqual(['..', 'test.csv']);
        expect(normalizeArray(parentPath, false)).toEqual(['test.csv']);
        expect(normalizeArray(parentMiddlePath, true)).toEqual(['test.csv']);
    });

    it('test normalizePath function', () => {
        const empty = '';
        const regularPath = '/test/test.csv';
        const pathWithoutLeadingSlash = 'test/test.csv';

        expect(normalizePath(empty)).toEqual('/');
        expect(normalizePath(regularPath)).toEqual('/test/test.csv');
        expect(normalizePath(pathWithoutLeadingSlash)).toEqual('/test/test.csv');
    });

    it('test resolveWorkflowRelativePath function', () => {
        const empty = '';
        const regularPath = '/test/test.csv';
        const workflowPath = '/someWorkflowFolder/someWorkflow';
        const workflowPathWithSlash = '/someWorkflowFolder/someWorkflow/';

        expect(resolveWorkflowRelativePath(empty, empty)).toEqual('');
        expect(resolveWorkflowRelativePath(regularPath, workflowPath))
            .toEqual('/someWorkflowFolder/someWorkflow/test/test.csv');
        expect(resolveWorkflowRelativePath(regularPath, workflowPathWithSlash))
            .toEqual('/someWorkflowFolder/someWorkflow/test/test.csv');
    });

    it('resolves workflow relative paths', () => {
        const regularPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/test/test.csv`;
        const parentPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/../test/test.csv`;
        const parentParentPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/../../test/test.csv`;
        
        expect(getRootPath(regularPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/testWorkflow/test/test.csv');
        expect(getRootPath(parentPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/test/test.csv');
        expect(getRootPath(parentParentPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/../test/test.csv');
    });

    it('handles special workflow relative paths', () => {
        const empty = '';
        const doubleSlashPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}//test.csv`;
        const currentFolderPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/./test.csv`;

        expect(getRootPath(empty, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual(empty);
        expect(getRootPath(SCHEMA_PART, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/');
        expect(getRootPath(doubleSlashPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/testWorkflow/test.csv');
        expect(getRootPath(currentFolderPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual('/testWorkflow/test.csv');
    });

    it('resolves mountpoint relative paths', () => {
        const regularPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/test/test.csv`;
        const parentPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/../test/test.csv`;
        const customMountpointPath = `${SCHEMA_PART}LOCAL/test/test.csv`;
        
        expect(getRootPath(regularPath, SCHEMA_PART, SCHEMA)).toEqual('/test/test.csv');
        expect(getRootPath(parentPath, SCHEMA_PART, SCHEMA)).toEqual('/../test/test.csv');
        expect(getRootPath(customMountpointPath, SCHEMA_PART, SCHEMA)).toEqual('/test/test.csv');
    });

    it('handles special mountpoint relative paths', () => {
        const empty = '';
        const doubleSlashPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}//test.csv`;
        const currentFolderPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/./test.csv`;

        expect(getRootPath(empty, SCHEMA_PART, SCHEMA)).toEqual(empty);
        expect(getRootPath(SCHEMA_PART, SCHEMA_PART, SCHEMA)).toEqual('/');
        expect(getRootPath(doubleSlashPath, SCHEMA_PART, SCHEMA)).toEqual('/test.csv');
        expect(getRootPath(currentFolderPath, SCHEMA_PART, SCHEMA)).toEqual('/test.csv');
    });

    it('test getNameFromPath function', () => {
        const empty = '';
        const regularPath = '/test/test.csv';
        const workflowPath = '/someWorkflowFolder/someWorkflow';
        const workflowPathWithSlash = '/someWorkflowFolder/someWorkflow/';
        const windowsPath = '\\Special\\windows\\path\\to\\file.txt';

        expect(getNameFromPath(empty)).toEqual('');
        expect(getNameFromPath(regularPath)).toEqual('test.csv');
        expect(getNameFromPath(workflowPath)).toEqual('someWorkflow');
        expect(getNameFromPath(workflowPathWithSlash)).toEqual('');
        expect(getNameFromPath(windowsPath)).toEqual('file.txt');
    });
});

