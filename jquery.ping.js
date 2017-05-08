/**
 * @preserve  ping
 * @name      jquery.ping.js
 * @author    hshhhhh
 * @version   0.0.1
 * @date      2016-11-10
 * @license   DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * @homepage  https://github.com/hshhhhh/jquery.ping.js
 * @example   https://github.com/hshhhhh/jquery.ping.js
 */
(function( $ ) {
    '-use strict'

    // plugin name
    var plugin_name_space = 'ping'

    // Interval id storage
    var interval_id = null

    // Mode to request server: ajax or ajax in worker
    var mode = null;

    // Storage for shared worker
    var shared_worker = null

    /**
     * Default settings
     */
    var options = {
        endpoint        : document.location.protocol + '//' + document.location.host + '/favicon.ico',
        worker_location : null,
        use_default_css : true,
        render_callback : null,
        pause_on_blur   : true,
    }

    ///////////////// METHODS //////////////
    var methods = {

        /////////////// PUBLIC METHODS ///////////////
        public : {
            start: function () {
				if (mode === 'worker') {
					methods.private.worker.start.apply(this)
				}
				else if (mode === 'ajax') {
					methods.private.ajax.start.apply(this)
				}
            },

            pause: function () {
                methods.private.worker.pause.apply(this)
                methods.private.ajax.pause.apply(this)
            },
        },
        /////////////// PUBLIC METHODS ///////////////

        /////////////// PRIVATE METHODS ///////////////
        private: {

            init: function(options_in)
            {
                return $(this).each(function() {
                    options = $.extend({}, options, {render_callback: methods.private.default.render.bind(this)}, options_in)

                    // Generate css
                    if (options.use_default_css) {
                        methods.private.default.css.apply(this)
                    }

                    if (options.pause_on_blur) {
                        $(window).on('focus', methods.public.start.bind(this))
                        $(window).on('blur',  methods.public.pause.bind(this))
                    }

                    console.log(options.endpoint)
                    // Decide what mode we would use: shared workers or ajax
                    mode = methods.private.worker.init.apply(this) ? 'worker' : 'ajax';

                    // Run
                    methods.public.start.apply(this)
                })
            }, // init


            /////////////////// PRIVATE SHARED WORKERS /////////////////////
            worker: {
                // Init shared worker
                init: function () {
                    if (!window.Worker) {
                        return false;
                    }

                    // User didn't provide us worker location, hope it would be in the same place as this script (and hope it not combined or renamed!)
                    if (!options.worker_location) {
                        let current_file_path = null;
                        if (typeof(current_file_path = $('script[src$="jquery.ping.js"]').attr('src')) != 'string') {
                            return false;
                        }
                        options.worker_location = current_file_path.replace('jquery.ping.js', 'jquery.ping.worker.js');
                    }

                    try {
                        let scope = 'jquery.' + plugin_name_space + '/' + options.endpoint
                        shared_worker = new SharedWorker(options.worker_location, scope);
                    }
                    catch (e) { // worker: 404
                        return false
                    }
                    if (!shared_worker) {
                        return false
                    }

                    w = shared_worker

                    shared_worker.port.addEventListener('error',   methods.private.worker.response.bind(this));
                    shared_worker.port.addEventListener('message', methods.private.worker.response.bind(this));
                    shared_worker.port.start();

					// @FIXME TO PUBLIC.START
                    // methods.private.worker.start.apply(this)
                    return true;
                }, // init

                // Send to worker 'start' event
                start: function() {
					console.log('really?')
                    methods.private.worker.message.apply(this, ['start', {'endpoint': options.endpoint, 'interval': 1000}])
                }, // start

                // Send to worker 'pause' event
                pause: function() {
                    methods.private.worker.message.apply(this, ['pause'])
                }, // pause

                // Do request to worker
                message: function (event, data) {
                    var data_out = {
                        'event': event,
                        'data': data,
                    }
					console.log('message to worker: ', data_out);
                    shared_worker.port.postMessage(data_out)
                }, // message


                // Manage response from worker
                response: function (e) {
                    var data_in = e.data
                    console.log('handler received: ', data_in)
                    if (!data_in.event) {
                        return false // @FIXME exception?!
                    }

                    switch(data_in.event) {
                        case 'start':
                            console.log('start', data_in.message);
                            break;

                        case 'pause':
                            console.log('pause', data_in.message);
                            break;

                        case 'update':
                            options.render_callback.apply(this, [parseInt(data_in.start), parseInt(data_in.duration)])
                            break;
                    }
                }, // response
            },
            /////////////////// PRIVATE SHARED WORKERS /////////////////////




            /////////////////// PRIVATE AJAX /////////////////////
            ajax: {
                // Create interval for ajax call
                start: function ()
                {
                    return $(this).each(function() {
                        if (interval_id) {
                            return
                        }
                        interval_id = setInterval(methods.private.ajax.request.bind(this), 1000)
                    })
                }, // start

                // Destroy interval for ajax call
                pause: function ()
                {
                    return $(this).each(function() {
                        if (interval_id) {
                            clearInterval(interval_id)
                            interval_id = null
                            $(this).addClass('disabled')
                        }
                        return
                    })
                }, // pause

                // Do request to server via ajax
                request: function()
                {
                    var i_start = +(new Date())
                    var httpRequest = new XMLHttpRequest();
                    httpRequest.onreadystatechange = function () {
                        var i_end = +(new Date())
                        var i_duration  = i_end - i_start
                        options.render_callback.apply(this, [i_start, i_duration])
                    }.bind(this)
                    httpRequest.open('HEAD', options.endpoint, true)
                    httpRequest.send()
                }, // request
            },
            /////////////////// PRIVATE AJAX /////////////////////



            ////////// PRIVATE DEFAULT METHODS ///////////////
            default: {
                // Default render function
                render: function (i_start, i_duration)
                {
                    var e_ping = $(this)

                    // Label : "ping ~42ms"
                    var s_text = 'ping ~' + i_duration + 'ms'
                    e_ping.html(s_text)

                    // Decide what status color of ping we have
                    var s_class = ''
                    s_class = (!s_class && (i_duration < 100)) ? 'green' : s_class
                    s_class = (!s_class && (i_duration < 300)) ? 'yellow' : s_class
                    s_class = (!s_class)                 ? 'red' : s_class

                    // Enable our class and disable all others possibilities
                    var a_class = ['green', 'yellow', 'red', 'disabled']
                    for (var i = 0; i < a_class.length; i++) {
                        if (a_class[i] === s_class) {
                            e_ping.addClass(a_class[i])
                        }
                        else {
                            e_ping.removeClass(a_class[i])
                        }
                    }

                    // Min length 80px to have enough space for label
                    var s_width = (i_duration < 80) ? '80px' : (i_duration + 'px')
                    e_ping.css({width: s_width})
                },


                // Default css rules
                css: function ()
                {
                    var selector = '#' + $(this).prop('id')
                    var css = "\
                        /* Dynamically generated by hshhhhh/jquery.ping.js */\n\
                        " + selector + " { position: fixed; top: 10px; left: 4px; height: 14px; padding-left: 2px; font-family: monospace; font-size: 10px; line-height: 14px; z-index: 42; transition: width 0.8s, background 0.2s; } \n \
                        " + selector + ".green    { background: rgba(0,   255, 0,    0.5); } \n \
                        " + selector + ".yellow   { background: rgba(255, 255, 0,    0.5); } \n \
                        " + selector + ".red      { background: rgba(255, 0,   0,    0.5); } \n \
                        " + selector + ".disabled { background: rgba(192, 192, 192 , 0.5); transition: initial !important; } \n \
                    "
                    $('head').append("<style type='text/css'>\n" + css + "\n</style>")
                },
            },
            ////////// PRIVATE DEFAULT METHODS ///////////////
        },
        /////////////// PRIVATE METHODS //////////////////////
    }
    ///////////////// METHODS ////////////////////////////////




    $.fn[plugin_name_space] = function( method ) {
        if (methods.public[method]) {
            return methods.public[method].apply(this, Array.prototype.slice.call(arguments, 1))
        }
        else if ((typeof method === 'object') || !method) {
            return methods.private.init.apply(this, arguments)
        }
        else {
            $.error('Method "' + method + '" does not exist (at least in public scope) on jQuery.' + plugin_name_space)
        }
        return this
    }
})(jQuery)
