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
    // plugin name
    var plugin_name_space = 'ping'

    // Interval id storage
    var interval_id = null

    var webworker = null

    /**
     * Default settings
     */
    var defaults = {
        endpoint        : document.location.protocol + '//' + document.location.host + '/favicon.ico',
        worker_location : null,
        use_default_css : true,
        render_callback : null,
        pause_on_blur   : true,
    }

    var methods = {
        // Init method - the default one
        init: function(options)
        {
            return this.each(function() {
                // Generate and store settings
                var settings = $.extend({}, defaults, {render_callback: methods.render}, options)
                $(this).data('ping.settings', settings)

                // Generate css
                if (settings.use_default_css) {
                    methods.default_css.apply($(this))
                }

                if (settings.pause_on_blur) {
                    $(window).on('focus', methods.start.bind($(this)))
                    $(window).on('blur',  methods.pause.bind($(this)))
                }

                // Run
                methods.start.apply($(this))
            })
        },


        start: function () {
            methods.ajax.start.apply($(this));
        },

        pause: function () {
            methods.ajax.pause.apply($(this));
        },


        webworker: {
            init: function () {
            },

            start: function() {
            },

            pause: function() {
            },
        },




        /////////////////// AJAX START / PAUSE /////////////////////
        ajax: {
            // Create interval for ajax call
            start: function ()
            {
                return this.each(function() {
                    if (interval_id) {
                        return
                    }
                    interval_id = setInterval(methods.ajax.request.bind(this), 1000)
                })
            },

            // Destroy interval for ajax call
            pause: function ()
            {
                return this.each(function() {
                    if (interval_id) {
                        clearInterval(interval_id)
                        interval_id = null
                        $(this).addClass('disabled')
                    }
                    return
                })
            },

            request: function()
            {
                var settings = $(this).data('ping.settings')
                var i_start  = +(new Date())

                // Callback for ajax call
                var f_callback = function () {
                    var i_end = +(new Date())
                    var i_ms  = i_end - i_start
                    settings.render_callback.apply(this, [i_start, i_ms])
                }.bind(this)

                // Ajax call!
                $.ajax({
                    type    : "HEAD",
                    url     : settings.endpoint,
                    cache   : false,
                    success : f_callback,
                    error   : f_callback,
                })
            },
        },
        /////////////////// AJAX START / PAUSE /////////////////////


        // Default render function
        render: function (i_start, i_ms)
        {
            var e_ping = $(this)

            // Label : "ping ~42ms"
            var s_text = 'ping ~' + i_ms + 'ms'
            e_ping.html(s_text)

            // Decide what status color of ping we have
            var s_class = ''
            s_class = (!s_class && (i_ms < 100)) ? 'green' : s_class
            s_class = (!s_class && (i_ms < 300)) ? 'yellow' : s_class
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
            var s_width = (i_ms < 80) ? '80px' : (i_ms + 'px')
            e_ping.css({width: s_width})
        },


        // Default css rules
        default_css: function ()
        {
            selector = '#' + $(this).prop('id')
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




    $.fn[plugin_name_space] = function( method ) {
        //Logika pro volani metod
        if ( methods[ method ] ) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments , 1))
        }
        else if ((typeof method === 'object') || !method) {
            return methods.init.apply(this, arguments)
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.' + plugin_name_space)
        }
        return this
    }
})(jQuery)
