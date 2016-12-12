﻿/**
 * @preserve  ping
 * @name      jquery.ping.js
 * @author    hshhhhh
 * @version   0.0.1
 * @date      2016-11-10
 * @license   DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * @homepage  
 * @example   
 */
(function( $ ) {
    // plugin name
    var plugin_name_space = 'ping'

    // Interval id storage
    var interval_id = null

    /**
     * Default settings
     */
    var defaults = {
        endpoint        : document.location.protocol + '//' + document.location.host + '/favicon.ico',
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
                var settings = $.extend({}, defaults, {render_callback: f_render}, options)
                $(this).data('ping.settings', settings)

                // Generate css
                if (settings.use_default_css) {
                    f_css.apply($(this))
                }

                if (settings.pause_on_blur) {
                    $(window).on('focus', methods.start.bind($(this)))
                    $(window).on('blur',  methods.pause.bind($(this)))
                }

                // Run
                methods.start.apply($(this))
            })
        },


        // Create interval for ajax call
        start: function ()
        {
            return this.each(function() {
                if (interval_id) {
                    return
                }
                interval_id = setInterval(f_do_request.bind(this), 1000)
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

    }


    ////////// INTERNAL HELPERS ////////////
    var f_render = function (i_start, i_ms)
    {
        var e_ping = $(this);

        // Label : "ping ~42"
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
    }


    // Do ajax call
    var f_do_request = function()
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
    }
    ////////// INTERNAL HELPERS ////////////



    // Default css rules
    var f_css = function ()
    {
        selector = '#' + $(this).prop('id')
        var css = "\
            /* Dynamically generated by hshhhhh/jquery.ping.js */\n\
            " + selector + " { position: fixed; top: 10px; left: 4px; height: 14px; padding-left: 2px; font-family: monospace; font-size: 10px; line-height: 14px; z-index: 1; transition: width 0.8s, background 0.2s; } \n \
            " + selector + ".green    { background: rgba(0,   255, 0,    0.5); } \n \
            " + selector + ".yellow   { background: rgba(255, 255, 0,    0.5); } \n \
            " + selector + ".red      { background: rgba(255, 0,   0,    0.5); } \n \
            " + selector + ".disabled { background: rgba(192, 192, 192 , 0.5); transition: initial !important; } \n \
        "
        $('head').append("<style type='text/css'>\n" + css + "\n</style>")
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

		/**
		 * Calculates which size the font can get resized,
		 * according to constrains.
		 *
		 * @param {String} prefix Gets shown on the console before
		 *                        all the arguments, if debug mode is on.
		 * @param {Object} ourText The DOM element to resize,
		 *                         that contains the text.
		 * @param {function} func Function called on `ourText` that's
		 *                        used to compare with `max`.
		 * @param {number} max Maximum value, that gets compared with
		 *                     `func` called on `ourText`.
		 * @param {number} minFontPixels Minimum value the font can
		 *                               get resized to (in pixels).
		 * @param {number} maxFontPixels Maximum value the font can
		 *                               get resized to (in pixels).
		 *
		 * @return Size (in pixels) that the font can be resized.
		 */





