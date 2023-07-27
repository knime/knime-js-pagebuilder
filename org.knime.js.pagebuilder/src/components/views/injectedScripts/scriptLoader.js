window.knimeResourceBaseUrl = "%RESOURCEBASEURL%";
window.pageBuilderPresent = true;

window.knimeLoader = (function () {
  let origin = "%ORIGIN%";
  let namespace = "%NAMESPACE%";
  let nodeId = "%NODEID%";
  let knimeLoaderCount = "%LIBCOUNT%";

  let postResponse = function (error) {
    let postMessageOrigin = origin;
    if (!postMessageOrigin || postMessageOrigin.indexOf("file:") > -1) {
      postMessageOrigin = "*";
    }
    parent.postMessage(
      {
        nodeId,
        type: "load",
        error,
      },
      postMessageOrigin,
    );
  };

  if (knimeLoaderCount === 0) {
    postResponse();
  }

  return function knimeLoader(success) {
    knimeLoaderCount--;
    if (!success) {
      let scriptErrorMsg = "Script could not be loaded";
      postResponse(scriptErrorMsg);
      throw new Error(scriptErrorMsg);
    }
    if (knimeLoaderCount === 0) {
      let view = window[namespace];
      if (!view) {
        let referenceErrorMsg = `No view found under namespace ${namespace}`;
        postResponse(referenceErrorMsg);
        throw new ReferenceError(referenceErrorMsg);
      }
      postResponse();
    }
  };
})();
