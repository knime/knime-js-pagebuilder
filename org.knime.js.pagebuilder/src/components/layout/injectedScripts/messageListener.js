(function () {
    var messageFromParent = function (event) {
        var data = event.data;
        if (event.origin !== window.origin || !data || data.type !== 'init') {
            return;
        }
        var namespace = data.namespace;
        var initMethodName = data.initMethodName;
        var viewRepresentation = data.viewRepresentation;
        var viewValue = data.viewValue;
        window[namespace][initMethodName](viewRepresentation, viewValue);
    };
    window.addEventListener('message', messageFromParent);
})();
