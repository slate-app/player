/*global jQuery, window, document, Error*/

/*!
 * Slate Embedded Player SDK (http://www.slateapp.com)
 * Copyright 2014-2014 Neverbland
 */
;
if (typeof jQuery === 'undefined') {
    throw new Error('Slate Embedded Player SDK requires jQuery');
}

!(function($, window, document, undefined) {
    'use strict';

    /**
     * Parses a URL and returns its "origin" in the form of protocol://hostname[:port] .
     * 
     * @param  {String} url URL to be parsed.
     * @return {String}
     */
    function parseOrigin(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.protocol + '//' + a.host;
    }

    /**
     * Player constructor.
     * 
     * @param {jQuery} $el jQuery DOM element (iframe) on which to bind with Slate Player.
     */
    var Player = function($el) {
        var self = this;
        this.$el = $el;

        // listen for messages on this window to relay events from the Slate Player
        window.addEventListener('message', function(msgEvent) {
            // verify the origin
            if (msgEvent.origin !== self.originAddress) {
                return;
            }
            
            var name = msgEvent.data.name,
                data = JSON.parse(msgEvent.data.data),
                token = msgEvent.data.token;

            // ignore if it's not this player's token
            if (self.handshakeToken === null || !token || self.handshakeToken !== token) {
                return;
            }

            // and simply trigger this event
            self._trigger(name, data);
        });
    };

    Player.prototype = {
        /** @var {String} Handshake token that helps to identify the player iframe. */
        handshakeToken : null,

        /** @var {String} Origin address for the link between the current page and the Slate Player in the iframe. */
        originAddress : null,

        /**
         * Set handshake token.
         * 
         * @param  {String} token Handshake token.
         */
        handshake : function(token) {
            // handshake token is read only
            if (this.handshakeToken !== null || !token) {
                throw "Cannot change a player's handshake token or unset it!";
            }

            this.handshakeToken = token;
        },

        /**
         * Set Slate Player origin.
         * 
         * @param  {String} origin Origin.
         */
        origin : function(origin) {
            // origin is read only
            if (this.originAddress !== null || !origin) {
                throw "Cannot change a player's origin or unset it!";
            }

            this.originAddress = parseOrigin(origin);
        },

        /**
         * Relays the call to a Slate Player method inside the iframe.
         * 
         * @param  {String} name Method name.
         * @param  {Array} args Method arguments.
         */
        _call : function(name, args) {
            if (name === 'handshake' || name === 'origin') {
                return this[name].apply(this, args);
            }

            // need to have origin and handshake set
            if (!this.handshakeToken || !this.originAddress) {
                throw "Handshake needs to be established between the iframe and the current page in order to call player's methods.";
            }

            var target = this.$el[0].contentWindow;
            if (!target) {
                throw "Could not get the player's iframe window!";
            }

            target.postMessage({
                action : 'call',
                method : name,
                args : args || [],
                handshake : this.handshakeToken
            }, this.originAddress);
        },

        /**
         * Triggers a DOM event on the player.
         * 
         * @param  {String} name Name of the event.
         * @param  {Array} data Event parameters.
         */
        _trigger : function(name, data) {
            this.$el.trigger(name, data || []);
        }
    };

    /*****************************************************
     * PLUGIN META
     *****************************************************/
    /**
     * Get the Player plugin from the given element (or initializes it).
     * 
     * @param  {jQuery} $el Element on which to get the Player plugin.
     * @return {Player}
     */
    function get($el) {
        var o = $.data($el[0], 'slatePlayer');
        if (!o) {
            o = new Player($el);
            $.data($el[0], 'slatePlayer', o);
        }
        return o;
    }

    // register as jQuery plugin
    $.fn.slatePlayer = function(options) {
        if (typeof options === 'string' && options.charAt(0) !== '_') {
            var args = Array.prototype.slice.call(arguments, 1);
            
            var r = null;
            this.each(function() {
                var o = get($(this));

                try {
                    r = o._call(options, args);
                } catch(e) {};

                if (r !== null && r !== undefined) {
                    return false; // break
                }
            });

            if (r !== null && r !== undefined) {
                return r;
            }

            return this;
        }

        return this.each(function() {
            get($(this));
        });
    };

    // add global window listener to identify all embeded players that are being loaded
    // upon load the Slate Player sends a handshake to the parent window
    // and that's how we will identify it
    window.addEventListener('message', function(msgEvent) {
        // handshake message goes through special process
        // and is here to help identify which iframe uses what player
        if (msgEvent.data && msgEvent.data.name && msgEvent.data.name === 'handshake' && msgEvent.data.token !== undefined) {
            // find iframe with the same window object
            $('iframe').each(function() {
                if (
                    this.contentWindow === msgEvent.source
                    // and origin must match as well
                    && msgEvent.origin === parseOrigin(this.src)
                ) {
                    $(this).slatePlayer('handshake', msgEvent.data.token)
                        .slatePlayer('origin', this.src);
                    return false; // break the search as we've found it already
                }
            });
        }
    }, false);

})(jQuery, window, document);