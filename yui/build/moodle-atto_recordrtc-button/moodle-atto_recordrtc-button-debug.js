YUI.add('moodle-atto_recordrtc-button', function (Y, NAME) {

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
    TEMPLATE = '' +
    '<div class="{{PLUGINNAME}} container-fluid">' +
      '<div class="{{bs_row}} hide">' +
        '<div class="{{bs_col}}12">' +
          '<div id="alert-warning" class="alert {{bs_al_warn}}">' +
            '<strong>{{browseralert_title}}</strong> {{browseralert}}' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="{{bs_row}} hide">' +
        '<div class="{{bs_col}}12">' +
          '<div id="alert-danger" class="alert {{bs_al_dang}}"></div>' +
        '</div>' +
      '</div>' +
      '<div class="{{bs_row}} hide">' +
        '{{#if audio}}' +
          '<div class="{{bs_col}}1"></div>' +
          '<div class="{{bs_col}}10">' +
            '<audio id="player"></audio>' +
          '</div>' +
          '<div class="{{bs_col}}1"></div>' +
          '{{else}}' +
          '<div class="{{bs_col}}12">' +
            '<video id="player"></video>' +
          '</div>' +
        '{{/if}}' +
      '</div>' +
      '<div class="{{bs_row}}">' +
        '<div class="{{bs_col}}1"></div>' +
        '<div class="{{bs_col}}10">' +
          '<button id="start-stop" class="{{bs_ss_btn}}">{{startrecording}}</button>' +
        '</div>' +
        '<div class="{{bs_col}}1"></div>' +
      '</div>' +
      '<div class="{{bs_row}} hide">' +
        '<div class="{{bs_col}}3"></div>' +
        '<div class="{{bs_col}}6">' +
          '<button id="upload" class="btn btn-primary btn-block">{{attachrecording}}</button>' +
        '</div>' +
        '<div class="{{bs_col}}3"></div>' +
      '</div>' +
    '</div>';

Y.namespace('M.atto_recordrtc').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * The current language en by default.
     */
    _lang: 'en',

    /**
     * A reference to the dialogue content.
     *
     * @property _content
     * @type Node
     * @private
     */
    _content: null,

    initializer: function() {
        //require(['bowser'], function(bowser) {
        //    console.log('INIT');
        //    console.log(bowser);
        //    console.log(bowser.bowser);
        //    console.log(bowser.firefox);
        //    console.log(bowser.bowser.firefox);

        //    return {
        //        init: function(data) {
        //            console.log(bowser);
        //            console.log(bowser.bowser);
        //            console.log(bowser.firefox);
        //            console.log(bowser.bowser.firefox);
        //        }
        //    };
        //});

        //jQuery.cachedScript = function(url, options) {
        //    options = jQuery.extend(options || {}, {
        //        dataType: 'script',
        //        cache: true,
        //        url: url
        //    });

        //    return jQuery.ajax(options);
        //};

        //jQuery.cachedScript('http://localhost/moodle/lib/editor/atto/plugins/recordrtc/vendor/js/bowser.js')
        //    .done(function(script, textStatus) {
        //        console.log(textStatus);
        //        console.log(script);
        //    });

        //var script =  document.createElement('script');
        //script.type = 'text/javascript';
        //script.onload = function() {
        //    console.log(bowser);
        //    console.log(bowser.firefox);
        //};
        //script.src = 'http://localhost/moodle/lib/editor/atto/plugins/recordrtc/vendor/js/bowser.js';
        //document.head.appendChild(script);

        //jQuery.getScript('http://localhost/moodle/lib/editor/atto/plugins/recordrtc/vendor/js/bowser.js')
        //    .done(function() {
        //        console.log(bowser.firefox);
        //    });
        //jQuery.ajax({
        //    url: '//localhost/moodle/lib/editor/atto/plugins/recordrtc/vendor/js/bowser.js',
        //    success: function() {
        //        console.log(bowser);
        //    }
        //});

        // Make necessary params globally accessible.
        M.atto_recordrtc = M.atto_recordrtc || {};
        M.atto_recordrtc.params = {};

        var requiredParams = [
                'contextid',
                'sesskey',
                'recordrtcroot',
                'audiobitrate',
                'videobitrate',
                'timelimit',
                'oldermoodle',
                'maxrecsize'
            ];

        for (var n in requiredParams) {
            M.atto_recordrtc.params[requiredParams[n]] = this.get(requiredParams[n]);
        }

        var allowedtypes = this.get('allowedtypes');
        if (allowedtypes === 'both' || allowedtypes === 'audio') {
            // Add the audio button.
            this._addButton('audio', this._audio);
        }
        if (allowedtypes === 'both' || allowedtypes === 'video') {
            // Add the video button.
            this._addButton('video', this._video);
        }
    },

    _addButton: function(type, callback) {
        this.addButton({
            buttonName: type,
            icon: this.get(type + 'rtcicon'),
            iconComponent: PLUGINNAME,
            callback: callback,
            title: type + 'rtc',
            tags: type + 'rtc',
            tagMatchRequiresAll: false
        });
    },

    /**
     * Toggle audiortc and normal display mode
     *
     * @method _audio
     * @private
     */
    _audio: function() {
        var dialogue = this.getDialogue({
            height: 260,
            width: 1000,
            headerContent: M.util.get_string('audiortc', 'atto_recordrtc'),
            focusAfterHide: true
        }, true);

        dialogue.set('bodyContent', this._createContent('audio'));
        dialogue.show();

        M.atto_recordrtc.audiomodule.init();
    },

    /**
     * Toggle videortc and normal display mode
     *
     * @method _video
     * @private
     */
    _video: function() {
        var dialogue = this.getDialogue({
            height: 700,
            width: 1000,
            headerContent: M.util.get_string('videortc', 'atto_recordrtc'),
            focusAfterHide: true
        }, true);

        dialogue.set('bodyContent', this._createContent('video'));
        dialogue.show();

        M.atto_recordrtc.videomodule.init();
    },

    /**
     * Create the HTML to be displayed in the dialogue box
     *
     * @method _createContent
     * @private
     */
    _createContent: function(type) {
        var audio = (type === 'audio'),
            bsRow = this.get('oldermoodle') ? 'row-fluid' : 'row',
            bsCol = this.get('oldermoodle') ? 'span' : 'col-xs-',
            bsAlWarn = this.get('oldermoodle') ? '' : 'alert-warning',
            bsAlDang = this.get('oldermoodle') ? 'alert-error' : 'alert-danger',
            bsSsBtn = this.get('oldermoodle') ? 'btn btn-large btn-danger btn-block'
                                              : 'btn btn-lg btn-outline-danger btn-block';

        var bodyContent = Y.Handlebars.compile(TEMPLATE)({
            PLUGINNAME: PLUGINNAME,
            vendor_js_path: this.get('recordrtcroot') + 'vendor/js',
            audio: audio,
            bs_row: bsRow,
            bs_col: bsCol,
            bs_al_warn: bsAlWarn,
            bs_al_dang: bsAlDang,
            bs_ss_btn: bsSsBtn,
            bs_ul_btn: 'btn btn-primary btn-block',
            browseralert_title: M.util.get_string('browseralert_title', 'atto_recordrtc'),
            browseralert: M.util.get_string('browseralert', 'atto_recordrtc'),
            startrecording: M.util.get_string('startrecording', 'atto_recordrtc'),
            attachrecording: M.util.get_string('attachrecording', 'atto_recordrtc')
        });

        return bodyContent;
    }
}, {
    ATTRS: {
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
         * The root to use when loading the recordrtc.
         *
         * @attribute recordrtcroot
         * @type String
         */
        recordrtcroot: {
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
        },

        /**
         * The audiortcicon to use when generating this recordrtc.
         *
         * @attribute audiortcicon
         * @type String
         */
        audiortcicon: {
            value: null
        },

        /**
         * The videortcicon to use when generating this recordrtc.
         *
         * @attribute videortcicon
         * @type String
         */
        videortcicon: {
            value: null
        },

        /**
         * True if Moodle is version < 3.2.
         *
         * @attribute oldermoodle
         * @type Boolean
         */
        oldermoodle: {
            value: null
        },

        /**
         * Maximum upload size set on server, in MB.
         *
         * @attribute maxrecsize
         * @type String
         */
        maxrecsize: {
            value: null
        }
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin", "moodle-atto_recordrtc-recording"]});
