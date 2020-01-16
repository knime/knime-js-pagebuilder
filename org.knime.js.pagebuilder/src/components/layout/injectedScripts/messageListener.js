(function () {
    var messageFromParent = function (event) {
        var data = event.data;
        if (event.origin !== window.origin || !data) {
            return;
        }
        var namespace = data.namespace;
        var nodeId = data.nodeId;
        if (data.type === 'init') {
            var initMethodName = data.initMethodName;
            var viewRepresentation = data.viewRepresentation;
            var viewValue = data.viewValue;
            window[namespace][initMethodName](viewRepresentation, viewValue);
        } else if (data.type === 'validate') {
            var validateResponse = function (valid, errMsg) {
                var resp = {
                    isValid: valid,
                    nodeId: nodeId,
                    type: 'validate'
                };
                resp.error = errMsg || resp.error;
                return resp;
            };
            var validateMethod = window[namespace] && window[namespace][data.validateMethodName];
            if (typeof validateMethod === 'function') {
                try {
                    var validity = validateMethod();
                    parent.postMessage(validateResponse(validity), window.origin);
                } catch (err) {
                    parent.postMessage(validateResponse(false, 'View could not be validated: ' + err),
                        window.origin);
                }
            } else {
                parent.postMessage(validateResponse(false, 'Validate method not present in view.'),
                    window.origin);
            }
        } else if (data.type === 'getValue') {
            var getValueMethod = window[namespace] && window[namespace][data.getViewValueMethodName];
            if (typeof getValueMethod === 'function') {
                try {
                    var retrievedValue = getValueMethod();
                    parent.postMessage({
                        value: retrievedValue,
                        nodeId: nodeId,
                        type: 'getValue'
                    }, window.origin);
                } catch (err) {
                    parent.postMessage({
                        error: 'Value could not be retrieved from view: ' + err,
                        nodeId: nodeId,
                        type: 'getValue'
                    }, window.origin);
                }
            } else {
                parent.postMessage({
                    error: 'Value method not present in view',
                    nodeId: nodeId,
                    type: 'getValue'
                }, window.origin);
            }
        }
    };
    window.addEventListener('message', messageFromParent);
})();
