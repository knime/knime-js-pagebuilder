window.alert = (function () {
    var nodeId = '%NODEID%';
    return function (msg) {
        var loadingErrRegExp = new this.RegExp(/error/gmi);
        var postResponse = function (message, level) {
            var resp = {
                nodeId: nodeId,
                type: 'alert',
                message: message,
                level: level
            };
            var messageTarget = window.origin;
            if (typeof messageTarget === 'undefined') {
                messageTarget = window.location.origin;
            } else if (messageTarget === 'null') {
                messageTarget = window;
            }
            parent.postMessage(resp, messageTarget);
        };

        if (loadingErrRegExp.test(msg)) {
            postResponse(msg, 'error');
        } else {
            postResponse(msg, 'info');
        }
    };
})();
