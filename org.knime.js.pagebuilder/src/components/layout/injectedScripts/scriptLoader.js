window.knimeResourceBaseUrl = '%RESOURCEBASEURL%';

window.knimeLoader = (function () {
    var origin = '%ORIGIN%';
    var namespace = '%NAMESPACE%';
    var nodeId = '%NODEID%';
    var knimeLoaderCount = '%LIBCOUNT%';

    var postResponse = function (error) {
        parent.postMessage({
            nodeId: nodeId,
            type: 'load',
            error: error
        }, origin);
    };

    if (knimeLoaderCount === 0) {
        postResponse();
    }

    return function knimeLoader(success) {
        knimeLoaderCount--;
        if (!success) {
            var scriptErrorMsg = 'Script could not be loaded';
            postResponse(scriptErrorMsg);
            throw new Error(scriptErrorMsg);
        }
        if (knimeLoaderCount === 0) {
            var view = window[namespace];
            if (!view) {
                var referenceErrorMsg = 'No view found under namespace ' + namespace;
                postResponse(referenceErrorMsg);
                throw new ReferenceError(referenceErrorMsg);
            }
            postResponse();
        }
    };

})();
