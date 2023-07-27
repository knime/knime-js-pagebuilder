import { describe, expect, it } from "vitest";
import {
  getFileExtension,
  getNameFromPath,
  getRootPath,
  normalizeArray,
  normalizePath,
  resolveWorkflowRelativePath,
  trimSchema,
} from "@/util/fileUtils";

describe("getFileExtension function", () => {
  it("extracts file extensions", () => {
    const file = "file.txt";
    const path = "/Path/to/file.txt";
    const windowsPath = "\\Special\\windows\\path\\to\\file.txt";
    const longFileExtension = "hello.fooBarFoobarTestExt";
    const shortFileExtension = "hello.a";

    expect(getFileExtension(file)).toBe("txt");
    expect(getFileExtension(path)).toBe("txt");
    expect(getFileExtension(windowsPath)).toBe("txt");
    expect(getFileExtension(longFileExtension)).toBe("fooBarFoobarTestExt");
    expect(getFileExtension(shortFileExtension)).toBe("a");
  });

  it("handles invalid parameters", () => {
    const empty = "";
    const nullFile = null;
    const numberFile = 10;
    const booleanFile = false;

    expect(getFileExtension(empty)).toBe("");
    expect(getFileExtension(nullFile)).toBe("");
    expect(getFileExtension(numberFile)).toBe("");
    expect(getFileExtension(booleanFile)).toBe("");
    expect(getFileExtension(expect.undefined)).toBe("");
  });
});

describe("trimSchema function", () => {
  const knimeSchema = "knime://";

  it("removes schemas", () => {
    const workflowRelativePath = "knime://knime.workflow/test";
    const mountpointRelativePath = "knime://LOCAL/test";
    const endingWithSlash = "knime://knime.workflow/test/";

    expect(trimSchema(workflowRelativePath, knimeSchema)).toBe("/test");
    expect(trimSchema(mountpointRelativePath, knimeSchema)).toBe("/test");
    expect(trimSchema(endingWithSlash, knimeSchema)).toBe("/test");
  });

  it("handles invalid parameters", () => {
    const empty = "";
    const nullPath = null;
    const emptySchema = "";
    const regularPath = "knime://knime.workflow/test/";

    expect(trimSchema(empty, knimeSchema)).toEqual(empty);
    expect(trimSchema(nullPath, knimeSchema)).toEqual(empty);
    expect(trimSchema(expect.undefined, knimeSchema)).toEqual(empty);

    expect(trimSchema(regularPath, emptySchema)).toEqual(empty);
  });
});

describe("getRootPath functionality", () => {
  const SCHEMA = "knime";
  const SCHEMA_PART = `${SCHEMA}://`;
  const WORKFLOW_RELATIVE = "knime.workflow";
  const WORKFLOW_PATH = "/testWorkflow";
  const MOUNTPOINT_RELATIVE = "knime.mountpoint";

  it("test normalizeArray function", () => {
    const empty = [];
    const doubleSlashPath = ["", "test.csv"];
    const dotPath = [".", "test.csv"];
    const parentPath = ["..", "test.csv"];
    const parentMiddlePath = ["somePath", "..", "test.csv"];

    expect(normalizeArray(empty, true)).toEqual(empty);
    expect(normalizeArray(doubleSlashPath, true)).toEqual(["test.csv"]);
    expect(normalizeArray(dotPath, true)).toEqual(["test.csv"]);
    expect(normalizeArray(parentPath, true)).toEqual(["..", "test.csv"]);
    expect(normalizeArray(parentPath, false)).toEqual(["test.csv"]);
    expect(normalizeArray(parentMiddlePath, true)).toEqual(["test.csv"]);
  });

  it("test normalizePath function", () => {
    const empty = "";
    const regularPath = "/test/test.csv";
    const pathWithoutLeadingSlash = "test/test.csv";

    expect(normalizePath(empty)).toBe("/");
    expect(normalizePath(regularPath)).toBe("/test/test.csv");
    expect(normalizePath(pathWithoutLeadingSlash)).toBe("/test/test.csv");
  });

  it("test resolveWorkflowRelativePath function", () => {
    const empty = "";
    const regularPath = "/test/test.csv";
    const workflowPath = "/someWorkflowFolder/someWorkflow";
    const workflowPathWithSlash = "/someWorkflowFolder/someWorkflow/";

    expect(resolveWorkflowRelativePath(empty, empty)).toBe("");
    expect(resolveWorkflowRelativePath(regularPath, workflowPath)).toBe(
      "/someWorkflowFolder/someWorkflow/test/test.csv",
    );
    expect(
      resolveWorkflowRelativePath(regularPath, workflowPathWithSlash),
    ).toBe("/someWorkflowFolder/someWorkflow/test/test.csv");
  });

  it("resolves workflow relative paths", () => {
    const regularPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/test/test.csv`;
    const parentPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/../test/test.csv`;
    const parentParentPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/../../test/test.csv`;

    expect(getRootPath(regularPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toBe(
      "/testWorkflow/test/test.csv",
    );
    expect(getRootPath(parentPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toBe(
      "/test/test.csv",
    );
    expect(
      getRootPath(parentParentPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH),
    ).toBe("/../test/test.csv");
  });

  it("handles special workflow relative paths", () => {
    const empty = "";
    const doubleSlashPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}//test.csv`;
    const currentFolderPath = `${SCHEMA_PART}${WORKFLOW_RELATIVE}/./test.csv`;

    expect(getRootPath(empty, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toEqual(
      empty,
    );
    expect(getRootPath(SCHEMA_PART, SCHEMA_PART, SCHEMA, WORKFLOW_PATH)).toBe(
      "/",
    );
    expect(
      getRootPath(doubleSlashPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH),
    ).toBe("/testWorkflow/test.csv");
    expect(
      getRootPath(currentFolderPath, SCHEMA_PART, SCHEMA, WORKFLOW_PATH),
    ).toBe("/testWorkflow/test.csv");
  });

  it("resolves mountpoint relative paths", () => {
    const regularPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/test/test.csv`;
    const parentPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/../test/test.csv`;
    const customMountpointPath = `${SCHEMA_PART}LOCAL/test/test.csv`;

    expect(getRootPath(regularPath, SCHEMA_PART, SCHEMA)).toBe(
      "/test/test.csv",
    );
    expect(getRootPath(parentPath, SCHEMA_PART, SCHEMA)).toBe(
      "/../test/test.csv",
    );
    expect(getRootPath(customMountpointPath, SCHEMA_PART, SCHEMA)).toBe(
      "/test/test.csv",
    );
  });

  it("handles special mountpoint relative paths", () => {
    const empty = "";
    const doubleSlashPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}//test.csv`;
    const currentFolderPath = `${SCHEMA_PART}${MOUNTPOINT_RELATIVE}/./test.csv`;

    expect(getRootPath(empty, SCHEMA_PART, SCHEMA)).toEqual(empty);
    expect(getRootPath(SCHEMA_PART, SCHEMA_PART, SCHEMA)).toBe("/");
    expect(getRootPath(doubleSlashPath, SCHEMA_PART, SCHEMA)).toBe("/test.csv");
    expect(getRootPath(currentFolderPath, SCHEMA_PART, SCHEMA)).toBe(
      "/test.csv",
    );
  });

  it("test getNameFromPath function", () => {
    const empty = "";
    const regularPath = "/test/test.csv";
    const workflowPath = "/someWorkflowFolder/someWorkflow";
    const workflowPathWithSlash = "/someWorkflowFolder/someWorkflow/";
    const windowsPath = "\\Special\\windows\\path\\to\\file.txt";

    expect(getNameFromPath(empty)).toBe("");
    expect(getNameFromPath(regularPath)).toBe("test.csv");
    expect(getNameFromPath(workflowPath)).toBe("someWorkflow");
    expect(getNameFromPath(workflowPathWithSlash)).toBe("");
    expect(getNameFromPath(windowsPath)).toBe("file.txt");
  });
});
