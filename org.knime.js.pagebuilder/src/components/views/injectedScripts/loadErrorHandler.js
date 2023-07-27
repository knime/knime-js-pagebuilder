window.onerror = (function () {
  let origin = "%ORIGIN%";
  let nodeId = "%NODEID%";
  return function (msg) {
    let loadingErrRegExp = new this.RegExp(/load timeout/gim);
    let postErrorResponse = function (errMsg) {
      let resp = {
        nodeId,
        type: "error",
        isValid: false,
        error: errMsg,
      };
      let postMessageOrigin = origin;
      if (!postMessageOrigin || postMessageOrigin.indexOf("file:") > -1) {
        postMessageOrigin = "*";
      }
      parent.postMessage(resp, postMessageOrigin);
    };

    if (loadingErrRegExp.test(msg)) {
      postErrorResponse(
        "Required web resources timed out and could not be loaded.",
      );
    }
  };
})();
