(function () {
    var messageFromParent = function (event) {
        var data = event.data;
        if (event.origin !== window.origin || !data) {
            return;
        }
        var namespace = data.namespace;
        var nodeId = data.nodeId;
        var postErrorResponse = function (type, errMsg) {
            var resp = {
                isValid: false,
                nodeId: nodeId,
                type: type,
                error: errMsg
            };
            parent.postMessage(resp, window.origin);
        };
        if (data.type === 'init') {
            var initMethod = window[namespace] && window[namespace][data.initMethodName];
            if (typeof initMethod === 'function') {
                try {
                    initMethod(data.viewRepresentation, data.viewValue);
                } catch (err) {
                    postErrorResponse(data.type, 'View initialization failed: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Init method not present in view.');
            }
        } else if (data.type === 'validate') {
            var validateMethod = window[namespace] && window[namespace][data.validateMethodName];
            if (typeof validateMethod === 'function') {
                try {
                    parent.postMessage({
                        isValid: validateMethod(),
                        nodeId: nodeId,
                        type: 'validate'
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'View could not be validated: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Validate method not present in view.');
            }
        } else if (data.type === 'getValue') {
            var getValueMethod = window[namespace] && window[namespace][data.getViewValueMethodName];
            if (typeof getValueMethod === 'function') {
                try {
                    parent.postMessage({
                        value: getValueMethod(),
                        nodeId: nodeId,
                        type: 'getValue'
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'Value could not be retrieved from view: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Value method not present in view.');
            }
        } else if (data.type === 'setValidationError') {
            var setValidationErrorMethod = window[namespace] && window[namespace][data.setValidationErrorMethodName];
            if (typeof setValidationErrorMethod === 'function') {
                try {
                    setValidationErrorMethod(data.errorMessage);
                    parent.postMessage({
                        nodeId: nodeId,
                        type: 'setValidationError',
                        message: data.errorMessage
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'View error message could not be set: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Set error message method not present in view.');
            }
        }
    };
    window.addEventListener('message', messageFromParent);
})();
