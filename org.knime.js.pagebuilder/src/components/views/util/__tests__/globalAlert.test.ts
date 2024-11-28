import {
  AlertType,
  INTERNAL_ERROR_CODE,
  InternalErrorAlert,
  OtherErrorAlert,
  USER_ERROR_CODE,
  UserErrorAlert,
  WarningAlert,
} from "@knime/ui-extension-service";
import { describe, expect, it } from "vitest";
import {
  errorToGlobalAlertParams,
  warningToGlobalAlertParams,
} from "../globalAlert";

const LONG_STRING = "a".repeat(161);

describe("globalAlert", () => {
  describe("user error alerts", () => {
    it("formats user error alert with short message and without details", () => {
      const error: UserErrorAlert = {
        code: USER_ERROR_CODE,
        data: {
          details: null,
        },
        message: "message",
        type: AlertType.ERROR,
      };
      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        subtitle: "message",
      });
    });

    it("formats user error alert with short message and with details", () => {
      const error: UserErrorAlert = {
        code: USER_ERROR_CODE,
        data: {
          details: "details",
        },
        message: "message",
        type: AlertType.ERROR,
      };
      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        subtitle: "message",
        message: "details",
      });
    });

    it("formats user error alert with long message and without details", () => {
      const error: UserErrorAlert = {
        code: USER_ERROR_CODE,
        data: {
          details: null,
        },
        message: LONG_STRING,
        type: AlertType.ERROR,
      };
      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        message: LONG_STRING,
      });
    });

    it("formats user error alert with long message and with details", () => {
      const error: UserErrorAlert = {
        code: USER_ERROR_CODE,
        data: {
          details: "details",
        },
        message: LONG_STRING,
        type: AlertType.ERROR,
      };
      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        message: `${LONG_STRING}\n\ndetails`,
      });
    });
  });

  describe("internal error alerts", () => {
    it("formats internal error alert with short message", () => {
      const error: InternalErrorAlert = {
        code: INTERNAL_ERROR_CODE,
        data: {
          stackTrace: ["stackTrace line 1", "stackTrace line 2"],
          typeName: "org.knime.some.Type",
        },
        message: "message",
        type: AlertType.ERROR,
      };

      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        subtitle: "message",
        message:
          "org.knime.some.Type\n\nstackTrace line 1\n\tstackTrace line 2",
      });
    });

    it("formats internal error alert with long message", () => {
      const error: InternalErrorAlert = {
        code: INTERNAL_ERROR_CODE,
        data: {
          stackTrace: ["stackTrace line 1", "stackTrace line 2"],
          typeName: "org.knime.some.Type",
        },
        message: LONG_STRING,
        type: AlertType.ERROR,
      };

      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        subtitle: "org.knime.some.Type",
        message: `${LONG_STRING}\n\nstackTrace line 1\n\tstackTrace line 2`,
      });
    });
  });

  describe("other error alerts", () => {
    it("formats error alert with short message", () => {
      const error: OtherErrorAlert = {
        message: "message",
        type: AlertType.ERROR,
      };

      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        subtitle: "message",
      });
    });

    it("formats error alert with long message", () => {
      const error: OtherErrorAlert = {
        message: LONG_STRING,
        type: AlertType.ERROR,
      };

      expect(errorToGlobalAlertParams(error)).toStrictEqual({
        type: "error",
        message: LONG_STRING,
      });
    });
  });

  describe("warnings", () => {
    it("formats warning with details", () => {
      const warning: WarningAlert = {
        warnings: [
          {
            message: "message",
            details: "details",
          },
        ],
        type: AlertType.WARN,
      };
      expect(warningToGlobalAlertParams(warning)).toStrictEqual({
        subtitle: "message",
        message: "details",
        type: "warn",
      });
    });

    it("formats warning without details", () => {
      const warning: WarningAlert = {
        warnings: [
          {
            message: "message",
          },
        ],
        type: AlertType.WARN,
      };
      expect(warningToGlobalAlertParams(warning)).toStrictEqual({
        message: "message",
        type: "warn",
      });
    });

    it("formats multiple warnings", () => {
      const warning: WarningAlert = {
        warnings: [
          {
            message: "message1",
          },
          {
            message: "message2",
          },
        ],
        type: AlertType.WARN,
      };
      expect(warningToGlobalAlertParams(warning)).toStrictEqual({
        subtitle: "2 warnings",
        message: "message1\n\nmessage2",
        type: "warn",
      });
    });

    it("formats warning with long message", () => {
      const warning: WarningAlert = {
        warnings: [
          {
            message: LONG_STRING,
          },
        ],
        type: AlertType.WARN,
      };
      expect(warningToGlobalAlertParams(warning)).toStrictEqual({
        subtitle: "Expand for details",
        message: LONG_STRING,
        type: "warn",
      });
    });
  });
});
