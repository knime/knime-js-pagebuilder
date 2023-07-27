window.alert = (function () {
  var origin = "%ORIGIN%";
  var nodeId = "%NODEID%";
  return function (msg) {
    var loadingErrRegExp = new this.RegExp(/error/gim);
    var postResponse = function (message, level) {
      var resp = {
        nodeId: nodeId,
        type: "alert",
        message: message,
        level: level,
      };
      var postMessageOrigin = origin;
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
