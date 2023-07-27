window.alert = (function () {
  let origin = "%ORIGIN%";
  let nodeId = "%NODEID%";
  return function (msg) {
    let loadingErrRegExp = new this.RegExp(/error/gim);
    let postResponse = function (message, level) {
      let resp = {
        nodeId,
        type: "alert",
        message,
        level,
      };
      let postMessageOrigin = origin;
      if (!postMessageOrigin || postMessageOrigin.indexOf("file:") > -1) {
        postMessageOrigin = "*";
      }
      parent.postMessage(resp, postMessageOrigin);
    };

    if (loadingErrRegExp.test(msg)) {
      postResponse(msg, "error");
    } else {
      postResponse(msg, "info");
    }
  };
})();
