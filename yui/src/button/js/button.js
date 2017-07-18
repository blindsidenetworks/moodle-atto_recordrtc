// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
//

/*
 * @package    atto_recordrtc
 * @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com)
 * @copyright  2017 Blindside Networks Inc.
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_recordrtc-button
 */

/**
 * Atto text editor recordrtc plugin.
 *
 * @namespace M.atto_recordrtc
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var PLUGINNAME = 'atto_recordrtc',
    RECORDRTC = 'recordrtc',
    STATE = false;

Y.namespace('M.atto_recordrtc').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    initializer: function() {
        var allowedtypes, button;
        allowedtypes = this.get('allowedtypes');
        if ( allowedtypes == 'both' || allowedtypes == 'audio') {
            console.info('Add button for audio');
            button = this.addButton({
                icon: 'icon',
                iconComponent: 'atto_recordrtc',
                callback: this._toggle
            });
            button.set('title', M.util.get_string('audiortc', PLUGINNAME));
            // If there is an event that may resize the editor, adjust the size of the recordrtc.
            Y.after('windowresize', Y.bind(this._fitToScreen, this));
            this.editor.on(['gesturemove', 'gesturemoveend'], Y.bind(this._fitToScreen, this), {
                standAlone: true
            }, this);
            this.toolbar.on('click', Y.bind(this._fitToScreen, this));
        }
        if ( allowedtypes == 'both' || allowedtypes == 'video') {
            console.info('Add button for video');
            button = this.addButton({
                icon: 'icon',
                iconComponent: 'atto_recordrtc',
                callback: this._toggle
            });
            button.set('title', M.util.get_string('videortc', PLUGINNAME));
            // If there is an event that may resize the editor, adjust the size of the recordrtc.
            Y.after('windowresize', Y.bind(this._fitToScreen, this));
            this.editor.on(['gesturemove', 'gesturemoveend'], Y.bind(this._fitToScreen, this), {
                standAlone: true
            }, this);
            this.toolbar.on('click', Y.bind(this._fitToScreen, this));
        }
    },

    /**
     * Toggle recordrtc and normal display mode
     *
     * @method _toggle
     * @param {EventFacade} e
     * @private
     */
    _toggle: function(e) {
        console.info('Toogle...');
        e.preventDefault();
        this._toggle_action();
    },

    /**
     * Toggle recordrtc and normal display mode (actual action)
     *
     * @method _toggle_action
     * @private
     */
    _toggle_action: function() {
        console.info('Toogle action...');
        var button = this.buttons[RECORDRTC];

        var id_submitbutton = Y.one('#id_submitbutton');
        if (button.getData(STATE)) {
            this.unHighlightButtons(RECORDRTC);
            this._setrecordrtc(button);
            id_submitbutton.set('disabled', false);
            id_submitbutton.removeClass('disabled');
        } else {
            this.highlightButtons(RECORDRTC);
            this._setrecordrtc(button, true);
            id_submitbutton.set('disabled', true);
            id_submitbutton.addClass('disabled');
        }
    },

    /**
     * Adjust editor to screen size
     *
     * @method _fitToScreen
     * @private
     */
    _fitToScreen: function() {
        console.info('Fit to screen...');
        var button = this.buttons[RECORDRTC];
        if (!button.getData(STATE)) {
            return;
        }
        var host = this.get('host');
        this.recordrtc.setStyles({
            position: "absolute",
            height: host.editor.getComputedStyle('height'),
            width: host.editor.getComputedStyle('width'),
            top: host.editor.getComputedStyle('top'),
            left: host.editor.getComputedStyle('left')
        });
        this.recordrtc.setY(this.editor.getY());
    },

    /**
     * Change recordrtc display state
     *
     * @method _setrecordrtc
     * @param {Node} button The recordrtc button
     * @param {Boolean} mode Whether the editor display recordrtc * @private
     */
    _setrecordrtc: function(button, mode) {
        console.info('Set recordRTC...');
        var host = this.get('host');

        if (mode) {
            this.recordrtc = Y.Node.create('<iframe src="'
                + this.get('recordrtcurl') + '?sesskey='
                + this.get('sesskey')
                + '&contextid=' + this.get('contextid')
                + '&content=' + encodeURIComponent(host.textarea.get('value'))
                + '" srcdoc=""></iframe');
            this.recordrtc.setStyles({
                backgroundColor: Y.one('body').getComputedStyle('backgroundColor'),
                backgroundImage: 'url(' + M.util.image_url('i/loading', 'core') + ')',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center'
            });
            host._wrapper.appendChild(this.recordrtc);

            // Now we try this using the io module.
            var params = {
                    sesskey: this.get('sesskey'),
                    contextid: this.get('contextid'),
                    content: host.textarea.get('value')
                };

            // Fetch content and load asynchronously.
            Y.io(this.get('recordrtcurl'), {
                    context: this,
                    data: params,
                    on: {
                            complete: this._loadContent
                        },
                    method: 'POST'
                });

            // Disable all plugins.
            host.disablePlugins();

            // And then re-enable this one.
            host.enablePlugins(this.name);

            // Enable fullscreen plugin if present.
            if (typeof Y.M.atto_fullscreen !== 'undefined') {
                host.enablePlugins('fullscreen');
            }

        } else {
            this.recordrtc.remove(true);

            // Enable all plugins.
            host.enablePlugins();
        }
        button.setData(STATE, !!mode);
        this._fitToScreen();

    },

    /**
     * Load filtered content into iframe
     *
     * @param {String} id
     * @param {EventFacade} e
     * @method _loadContent
     * @private
     */
    _loadContent: function(id, e) {
        console.info('Load content...');
        var content = e.responseText;

        this.recordrtc.setAttribute('srcdoc', content);
    }

}, {
    ATTRS: {
        /**
         * The url to use when loading the recordrtc.
         *
         * @attribute recordrtcurl
         * @type String
         */
        recordrtcurl: {
            value: null
        },

        /**
         * The contextid to use when generating this recordrtc.
         *
         * @attribute contextid
         * @type String
         */
        contextid: {
            value: null
        },

        /**
         * The sesskey to use when generating this recordrtc.
         *
         * @attribute sesskey
         * @type String
         */
        sesskey: {
            value: null
        },

        /**
         * The allowedtypes to use when generating this recordrtc.
         *
         * @attribute allowedtypes
         * @type String
         */
        allowedtypes: {
            value: null
        },

        /**
         * The audiobitrate to use when generating this recordrtc.
         *
         * @attribute audiobitrate
         * @type String
         */
        audiobitrate: {
            value: null
        },

        /**
         * The videobitrate to use when generating this recordrtc.
         *
         * @attribute videobitrate
         * @type String
         */
        videobitrate: {
            value: null
        },

        /**
         * The timelimit to use when generating this recordrtc.
         *
         * @attribute timelimit
         * @type String
         */
        timelimit: {
            value: null
        }
    }
});
