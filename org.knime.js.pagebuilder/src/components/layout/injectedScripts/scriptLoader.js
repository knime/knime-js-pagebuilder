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
            parent.postMessage({ nodeId: nodeId, type: 'error' }, origin);
            throw new Error('Script could not be loaded');
        }
        if (knimeLoaderCount === 0) {
            var view = window[namespace];
            if (!view) {
                parent.postMessage({ nodeId: nodeId, type: 'error' }, origin);
                throw new Error('no view found under namespace ' + namespace);
            }
            parent.postMessage({ nodeId: nodeId, type: 'load' }, origin);
        }
    };
})();
