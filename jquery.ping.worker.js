var peers = [];

// @FIXME attach handler by event!
onconnect = function(e) {
    var port = e.ports[0];
    peers.push(port);

    port.onmessage = function(e) {
        var data_in = e.data
        var data_out = {
            'event': data_in.event,
            'status': null,
            'message': null,
            'data': null,
        }

        switch (data_in.event) {
            case 'start':
                methods.start.apply(this, [data_in.data.endpoint])
                break

            case 'pause':
                methods.pause.apply(this)
                break
        }

        methods.message(data_out)
    }

    // port.addEventListener('message', function (e) {
    //     port.postMessage('count: ', count);
    //     // peers.forEach(function (port) {
    //     //     port.postMessage('ts1: ' + (i++) + ' : ' + (new Date()));
    //     // });
    // });

    port.start();
    port.postMessage('worker inited. peers count: ' + peers.length);
}



var interval_id

var i = 0;
var methods = {
    start: function(endpoint, interval) {
        if (interval_id) {
            return true
        }
        if (!endpoint) {
            return false;
        }
        interval_id = setInterval(methods.request.bind(this, endpoint), (interval || 1000))
        methods.message([endpoint, interval, interval_id])
        methods.message('started?')
        return true
    },

    pause: function() {
        if (interval_id) {
            clearInterval(interval_id)
            interval_id = null
        }
        methods.message('paused?')
        return true
    },

    request: function(endpoint) {
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          return false;
        }

        var i_start = +(new Date())
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            var i_end = +(new Date())
            var i_duration  = i_end - i_start
            methods.message({'event': 'update', 'start': i_start, 'duration' : i_duration, 'peers': peers.length, 'i': i++})
        }.bind(this)
        httpRequest.open('HEAD', endpoint, true)
        httpRequest.send()
    }, // request


    message: function(data_out) {
        peers.forEach(function (port) {
            port.postMessage(data_out)
        });
    },
}


