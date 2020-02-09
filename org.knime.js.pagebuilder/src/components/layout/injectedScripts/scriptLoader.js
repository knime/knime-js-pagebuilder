window.knimeLoader = (function () {
    var origin = '%ORIGIN%';
    var namespace = '%NAMESPACE%';
    var nodeId = '%NODEID%';
    var knimeLoaderCount = '%LIBCOUNT%';
    if (knimeLoaderCount === 0) {
        parent.postMessage({ nodeId: nodeId, type: 'load' }, origin);
    }

    return function knimeLoader(success) {
        knimeLoaderCount--;
        if (!success) {
            var scriptErrorMsg = 'Script could not be loaded';
            parent.postMessage({ nodeId: nodeId, error: scriptErrorMsg }, origin);
            throw new Error(scriptErrorMsg);
        }
        if (knimeLoaderCount === 0) {
            var view = window[namespace];
            if (!view) {
                var referenceErrorMsg = 'No view found under namespace ' + namespace;
                parent.postMessage({ nodeId: nodeId, error: referenceErrorMsg }, origin);
                throw new ReferenceError(referenceErrorMsg);
            }
            parent.postMessage({ nodeId: nodeId, type: 'load' }, origin);
        }
    };
})();
