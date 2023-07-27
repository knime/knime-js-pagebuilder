/* eslint-disable complexity */
(function () {
  let messageFromParent = function (event) {
    if (!event || !event.origin) {
      return;
    }
    let origin = "%ORIGIN%";
    let data = event.data;
    let originMatch =
      event.origin === origin ||
      event.origin === "*" ||
      event.origin.indexOf("file:") >= 0;
    if (!originMatch || !data) {
      return;
    }
    let namespace = data.namespace;
    let nodeId = data.nodeId;
    let postMessageOrigin = origin;
    if (!postMessageOrigin || postMessageOrigin.indexOf("file:") > -1) {
      postMessageOrigin = "*";
    }
    let postMessageResponse = function (resp) {
      resp.nodeId = nodeId;
      parent.postMessage(resp, postMessageOrigin);
    };
    let postErrorResponse = function (type, errMsg) {
      let resp = {
        isValid: false,
        nodeId,
        type,
        error: errMsg,
      };
      parent.postMessage(resp, postMessageOrigin);
    };
    if (data.type === "init") {
      if (
        window[namespace] &&
        typeof window[namespace][data.initMethodName] === "function"
      ) {
        try {
          let viewRepresentation = JSON.parse(data.viewRepresentation);
          let viewValue = JSON.parse(data.viewValue);
          window[namespace][data.initMethodName](viewRepresentation, viewValue);
        } catch (err) {
          postErrorResponse(data.type, `View initialization failed: ${err}`);
        }
      } else {
        postErrorResponse(data.type, "Init method not present in view.");
      }
    } else if (data.type === "validate") {
      let validResp = {
        isValid: true,
        type: "validate",
      };
      // optional method; some views don't have (i.e. some quickforms)
      if (
        window[namespace] &&
        typeof window[namespace][data.validateMethodName] === "function"
      ) {
        try {
          validResp.isValid = window[namespace][data.validateMethodName]();
          postMessageResponse(validResp);
        } catch (err) {
          postErrorResponse(data.type, `View could not be validated: ${err}`);
        }
      } else {
        postMessageResponse(validResp);
      }
    } else if (data.type === "getValue") {
      if (
        window[namespace] &&
        typeof window[namespace][data.getViewValueMethodName] === "function"
      ) {
        try {
          postMessageResponse({
            value: window[namespace][data.getViewValueMethodName](),
            type: "getValue",
          });
        } catch (err) {
          postErrorResponse(
            data.type,
            `Value could not be retrieved from view: ${err}`,
          );
        }
      } else {
        postErrorResponse(data.type, "Value method not present in view.");
      }
    } else if (data.type === "setValidationError") {
      let errorMessagePrefix = "View error message could not be set: ";
      // optional method; some views don't have (i.e. some quickforms)
      if (
        window[namespace] &&
        typeof window[namespace][data.setValidationErrorMethodName] ===
          "function"
      ) {
        try {
          window[namespace][data.setValidationErrorMethodName](
            data.errorMessage,
          );
          postMessageResponse(data);
        } catch (err) {
          postErrorResponse(data.type, errorMessagePrefix + err);
        }
      } else {
        postErrorResponse(
          data.type,
          `${errorMessagePrefix}Method does not exist.`,
        );
      }
    }
  };
  window.addEventListener("message", messageFromParent);
})();
