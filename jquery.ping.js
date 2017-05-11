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
    '-use strict' // @FIXME

    // plugin name
    var plugin_name_space = 'ping'

    // Mode to request server: ajax or ajax in worker
    var mode = null

    // Interval id storage
    var ajax_interval_id = null

    // Storage for shared worker
    var shared_worker = null

    /**
     * Default settings
     */
    var options = {
        // Ping endpoint. I recomend to configure Webserver for it to minimize load
        endpoint        : document.location.protocol + '//' + document.location.host + '/favicon.ico',
        // Path to worker source code, by default will look in the same path as current file
        worker_location : null,
        // Inject default css rules or not?
        use_default_css : true,
        // Render callback
        render_callback : null,
        // Pause on blur to minify everything
        pause_on_blur   : true,
    }

    var methods = {
        public: {
            /*
             * Handler for $('#ping').ping('start')
             */
            start: function () {
                if (mode === 'worker') {
                    methods.private.worker.start.apply(this)
                }
                else if (mode === 'ajax') {
                    methods.private.ajax.start.apply(this)
                }
            },

            /*
             * Handler for $('#ping').ping('pause')
             */
            pause: function () {
                if (mode === 'worker') {
                    methods.private.worker.pause.apply(this)
                }
                else if (mode === 'ajax') {
                    methods.private.ajax.pause.apply(this)
                }
            },
        },

        private: {
            /*
             * Init for whole plugin
             */
            init: function(options_in)
            {
                return $(this).each(function() {
                    // Just merge income options and defaults
                    options = $.extend({}, options, {render_callback: methods.private.default.render.bind(this)}, options_in)

                    // Should we need to generate css or user would use their own custom normal pretty ccs?
                    if (options.use_default_css) {
                        methods.private.default.css.apply(this)
                    }

                    /* It possible to pause rendering and queries when user leave tab.
                     * But it normally works only for ajax.
                     * For shared webworker we disable only rendering (but I'm not sure that browser doesn't do the same)
                     * For status of pausing of network activity check jquery.ping.worker.js file
                     */
                    if (options.pause_on_blur) {
                        $(window).on('focus', methods.public.start.bind(this))
                        $(window).on('blur',  methods.public.pause.bind(this))
                    }

                    // Decide what mode we would use: shared workers or ajax
                    mode = methods.private.worker.init.apply(this) ? 'worker' : 'ajax'

                    // Run plugin run
                    methods.public.start.apply(this)
                })
            },
        }
    }


                                                                                                                                    /*
                        ███████╗██╗  ██╗ █████╗ ██████╗ ███████╗██████╗     ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██████╗
                        ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
                        ███████╗███████║███████║██████╔╝█████╗  ██║  ██║    ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██████╔╝
                        ╚════██║██╔══██║██╔══██║██╔══██╗██╔══╝  ██║  ██║    ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
                        ███████║██║  ██║██║  ██║██║  ██║███████╗██████╔╝    ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████╗██║  ██║
                        ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝      ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                                                                                                     */
    methods.private.worker: {

        /*
         * Init method and here I try to (you know what!) to init it!
         * If browser supports shared workers we will spawn one shared worker OR connect to existing one if possible
         */
        init: function () {
            // Browser, why?
            if (!window.Worker) {
                return false
            }

            /*
               User didn't provide us worker location in , hope it would be in the same place as this script (and hope it not combined or renamed!)
               User doesn't provide in options worker location so Let's try to generate it from air and look for it in the same path as current script
               (But if script was minified and aggregated it will not work)
            */
            if (!options.worker_location) {
                let current_file_path = null
                if (typeof(current_file_path = $('script[src$="jquery.ping.js"]').attr('src')) != 'string') {
                    return false
                }
                options.worker_location = current_file_path.replace('jquery.ping.js', 'jquery.ping.worker.js')
            }

            // And try to create worker or return false in case if it not found or i don't know why
            try {
                let scope = 'jquery.' + plugin_name_space + '/' + options.endpoint
                shared_worker = new SharedWorker(options.worker_location, scope)
            }
            catch (e) { // worker: 404
                return false
            }

            if (!shared_worker) {
                return false
            }

            // Create handlers for shared worker to speak with this creature
            shared_worker.port.addEventListener('error',   methods.private.worker.response.bind(this))
            shared_worker.port.addEventListener('message', methods.private.worker.response.bind(this))

            // @TODO WORKER SET OPTIONS
            // {'endpoint': options.endpoint, 'interval': 1000}
            shared_worker.port.start()

            // Shared worker was succesfully created!
            return true
        }, // init


        /*
         * Send to worker 'start' event and enable DOM rendering when worker will return data
         */
        start: function() {
            methods.private.worker.message.apply(this, ['start'])
        },


        /*
         * Send to worker 'pause' event and also pause the render of DOM
         */
        pause: function() {
            methods.private.worker.message.apply(this, ['pause'])
        },

        /*
         * Send request to shared worker
         */
        message: function (event, data) {
            var data_out = {
                'event': event,
                'data': data,
            }
            shared_worker.port.postMessage(data_out)
        },


        /*
         * Catch response of shared worker and do some action like update DOM
         */
        response: function (e) {
            var data_in = e.data
            if (!data_in.event) {
                return false // @FIXME exception?!
            }

            switch(data_in.event) {
                case 'start':
                    console.log('start', data_in.message)
                    break

                case 'pause':
                    console.log('pause', data_in.message)
                    break

                // Update DOM with new information
                case 'update':
                    options.render_callback.apply(this, [parseInt(data_in.start), parseInt(data_in.duration)])
                    break
            }
        },
    },





                                                                                                                                    /*
                         █████╗      ██╗ █████╗ ██╗  ██╗
                        ██╔══██╗     ██║██╔══██╗╚██╗██╔╝
                        ███████║     ██║███████║ ╚███╔╝
                        ██╔══██║██   ██║██╔══██║ ██╔██╗
                        ██║  ██║╚█████╔╝██║  ██║██╔╝ ██╗
                        ╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                                                                                                                     */
    /*
     * Here is ajax section and the copy of it you can find in jquery.ping.worker.js
     */
    methods.private.ajax: {

        /*
         * Create interval for ajax call
         */
        start: function ()
        {
            return $(this).each(function() {
                if (ajax_interval_id) {
                    return
                }
                ajax_interval_id = setInterval(methods.private.ajax.request.bind(this), 1000)
            })
        },

        /*
         * Destroy interval for ajax call
         */
        pause: function ()
        {
            return $(this).each(function() {
                if (ajax_interval_id) {
                    clearInterval(ajax_interval_id)
                    ajax_interval_id = null
                    $(this).addClass('disabled')
                }
                return
            })
        },

        /*
         * Do request to server via ajax
         */
        request: function()
        {
            var i_start = +(new Date())
            var httpRequest = new XMLHttpRequest()
            httpRequest.onreadystatechange = function () {
                var i_end = +(new Date())
                var i_duration  = i_end - i_start
                options.render_callback.apply(this, [i_start, i_duration])
            }.bind(this)
            httpRequest.open('HEAD', options.endpoint, true)
            httpRequest.send()
        }, // request
    },


                                                                                                                                    /*
                        ██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗    ██╗ ██████╗███████╗███████╗
                        ██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║   ██╔╝██╔════╝██╔════╝██╔════╝
                        ██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║  ██╔╝ ██║     ███████╗███████╗
                        ██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║ ██╔╝  ██║     ╚════██║╚════██║
                        ██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║██╔╝   ╚██████╗███████║███████║
                        ╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═════╝╚══════╝╚══════╝
                                                                                                                                     */
    methods.private.default: {
        /*
         * Render function, can be easily replaced wia passing new callback on init step
         */
        render: function (i_start, i_duration)
        {
            var $ping = $(this)

            // Label : "ping ~42ms"
            var s_text = 'ping ~' + i_duration + 'ms'
            $ping.html(s_text)

            // Decide what status color of ping we have
            var s_class = ''
            s_class = (!s_class && (i_duration < 100)) ? 'green'  : s_class
            s_class = (!s_class && (i_duration < 300)) ? 'yellow' : s_class
            s_class = (!s_class)                       ? 'red'    : s_class

            // Apply our css class to element
            var a_class = ['green', 'yellow', 'red', 'disabled']
            for (var i = 0; i < a_class.length; i++) {
                if (a_class[i] === s_class) {
                    $ping.addClass(a_class[i])
                }
                else {
                    $ping.removeClass(a_class[i])
                }
            }

            // Min length 80px to have enough space for label
            var s_width = (i_duration < 80) ? '80px' : (i_duration + 'px')
            $ping.css({width: s_width})
        },


        /*
         * Inject CSS rules for ping widget to current html page, can be disabled on init step
         */
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
    }




    /*
     * jQuery plugin integration logic
     */
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
