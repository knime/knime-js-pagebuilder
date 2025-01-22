import {
  ErrorAlert,
  INTERNAL_ERROR_CODE,
  USER_ERROR_CODE,
  WarningAlert,
  WarningData,
} from "@knime/ui-extension-renderer/api";

/**
 * We have to limit the message length to 160 characters,
 * because the global alert can only display 160 characters initially.
 */
const MAX_MESSAGE_LENGTH = 160;

const fitsInSubtitle = (message: string) =>
  message.length <= MAX_MESSAGE_LENGTH;

export type GlobalAlertParams = {
  type: "error" | "warn";
  // Should have no more than MAX_MESSAGE_LENGTH characters
  subtitle?: string;
  message?: string;
};

const combineText = (text: (string | undefined | null)[]) =>
  text.filter(Boolean).join("\n\n").trim();

const messageAndDetailsToSubtitleAndMessage = (
  message: string,
  details?: string | null,
) =>
  fitsInSubtitle(message)
    ? {
        subtitle: message,
        ...(details && { message: details }),
      }
    : {
        message: combineText([message, details]),
      };

const errorToSubtitleAndMessage = (
  error: ErrorAlert,
): { subtitle?: string; message?: string } => {
  if (error.code === USER_ERROR_CODE && error.data) {
    const {
      message,
      data: { details },
    } = error;
    return messageAndDetailsToSubtitleAndMessage(message, details);
  } else if (error.code === INTERNAL_ERROR_CODE && error.data) {
    const {
      message,
      data: { stackTrace, typeName },
    } = error;
    if (fitsInSubtitle(message)) {
      return {
        subtitle: message,
        message: combineText([typeName, stackTrace.join("\n\t")]),
      };
    } else {
      return {
        subtitle: typeName,
        message: combineText([message, stackTrace.join("\n\t")]),
      };
    }
  } else {
    return messageAndDetailsToSubtitleAndMessage(error.message);
  }
};

export const errorToGlobalAlertParams = (
  error: ErrorAlert,
): GlobalAlertParams => {
  return {
    type: "error",
    ...errorToSubtitleAndMessage(error),
  };
};

const warningsToSubtitleAndMessage = (
  warnings: WarningData[],
): { subtitle?: string; message: string } => {
  if (warnings.length === 1 && warnings[0].details) {
    return {
      subtitle: warnings[0].message,
      message: warnings[0].details,
    };
  }
  const messages = warnings.map(({ message }) => message);
  const message = combineText(messages);
  if (messages.length > 1) {
    return {
      subtitle: `${messages.length} warnings`,
      message,
    };
  } else if (fitsInSubtitle(message)) {
    return {
      message,
    };
  } else {
    return {
      subtitle: "Expand for details",
      message,
    };
  }
};

export const warningToGlobalAlertParams = (
  warning: WarningAlert,
): GlobalAlertParams => {
  return {
    type: "warn",
    ...warningsToSubtitleAndMessage(warning.warnings),
  };
};
