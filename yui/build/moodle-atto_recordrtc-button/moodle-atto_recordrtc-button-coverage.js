if (typeof __coverage__ === 'undefined') { __coverage__ = {}; }
if (!__coverage__['build/moodle-atto_recordrtc-button/moodle-atto_recordrtc-button.js']) {
   __coverage__['build/moodle-atto_recordrtc-button/moodle-atto_recordrtc-button.js'] = {"path":"build/moodle-atto_recordrtc-button/moodle-atto_recordrtc-button.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0],"4":[0,0],"5":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":40},"end":{"line":1,"column":59}}},"2":{"name":"(anonymous_2)","line":70,"loc":{"start":{"line":70,"column":17},"end":{"line":70,"column":28}}},"3":{"name":"(anonymous_3)","line":101,"loc":{"start":{"line":101,"column":16},"end":{"line":101,"column":41}}},"4":{"name":"(anonymous_4)","line":119,"loc":{"start":{"line":119,"column":12},"end":{"line":119,"column":23}}},"5":{"name":"(anonymous_5)","line":148,"loc":{"start":{"line":148,"column":12},"end":{"line":148,"column":23}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":286,"column":96}},"2":{"start":{"line":38,"column":0},"end":{"line":53,"column":13}},"3":{"start":{"line":55,"column":0},"end":{"line":283,"column":3}},"4":{"start":{"line":72,"column":8},"end":{"line":72,"column":50}},"5":{"start":{"line":73,"column":8},"end":{"line":73,"column":37}},"6":{"start":{"line":75,"column":8},"end":{"line":84,"column":14}},"7":{"start":{"line":86,"column":8},"end":{"line":88,"column":9}},"8":{"start":{"line":87,"column":12},"end":{"line":87,"column":85}},"9":{"start":{"line":90,"column":8},"end":{"line":90,"column":52}},"10":{"start":{"line":91,"column":8},"end":{"line":94,"column":9}},"11":{"start":{"line":93,"column":12},"end":{"line":93,"column":50}},"12":{"start":{"line":95,"column":8},"end":{"line":98,"column":9}},"13":{"start":{"line":97,"column":12},"end":{"line":97,"column":50}},"14":{"start":{"line":102,"column":8},"end":{"line":110,"column":11}},"15":{"start":{"line":120,"column":8},"end":{"line":125,"column":17}},"16":{"start":{"line":127,"column":8},"end":{"line":134,"column":11}},"17":{"start":{"line":136,"column":8},"end":{"line":136,"column":49}},"18":{"start":{"line":137,"column":8},"end":{"line":137,"column":24}},"19":{"start":{"line":149,"column":8},"end":{"line":154,"column":17}},"20":{"start":{"line":156,"column":8},"end":{"line":163,"column":11}},"21":{"start":{"line":165,"column":8},"end":{"line":165,"column":49}},"22":{"start":{"line":166,"column":8},"end":{"line":166,"column":24}}},"branchMap":{"1":{"line":72,"type":"binary-expr","locations":[{"start":{"line":72,"column":27},"end":{"line":72,"column":43}},{"start":{"line":72,"column":47},"end":{"line":72,"column":49}}]},"2":{"line":91,"type":"if","locations":[{"start":{"line":91,"column":8},"end":{"line":91,"column":8}},{"start":{"line":91,"column":8},"end":{"line":91,"column":8}}]},"3":{"line":91,"type":"binary-expr","locations":[{"start":{"line":91,"column":12},"end":{"line":91,"column":35}},{"start":{"line":91,"column":39},"end":{"line":91,"column":63}}]},"4":{"line":95,"type":"if","locations":[{"start":{"line":95,"column":8},"end":{"line":95,"column":8}},{"start":{"line":95,"column":8},"end":{"line":95,"column":8}}]},"5":{"line":95,"type":"binary-expr","locations":[{"start":{"line":95,"column":12},"end":{"line":95,"column":35}},{"start":{"line":95,"column":39},"end":{"line":95,"column":63}}]}},"code":["(function () { YUI.add('moodle-atto_recordrtc-button', function (Y, NAME) {","","// This file is part of Moodle - http://moodle.org/","//","// Moodle is free software: you can redistribute it and/or modify","// it under the terms of the GNU General Public License as published by","// the Free Software Foundation, either version 3 of the License, or","// (at your option) any later version.","//","// Moodle is distributed in the hope that it will be useful,","// but WITHOUT ANY WARRANTY; without even the implied warranty of","// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the","// GNU General Public License for more details.","//","// You should have received a copy of the GNU General Public License","// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.","//","","/*"," * @package    atto_recordrtc"," * @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com)"," * @copyright  2017 Blindside Networks Inc."," * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later"," */","","/**"," * @module moodle-atto_recordrtc-button"," */","","/**"," * Atto text editor recordrtc plugin."," *"," * @namespace M.atto_recordrtc"," * @class button"," * @extends M.editor_atto.EditorPlugin"," */","","var PLUGINNAME = 'atto_recordrtc',","    TEMPLATE = '' +","    '<div class=\"container-fluid\">' +","      '<div class=\"{{bs_row}} hide\">' +","        '<div class=\"{{bs_col}}12\">' +","          '<div id=\"alert-warning\" class=\"alert {{bs_al_warn}}\">' +","            '<strong>{{browseralert_title}}</strong> {{browseralert}}' +","          '</div>' +","        '</div>' +","      '</div>' +","      '<div class=\"{{bs_row}} hide\">' +","        '<div class=\"{{bs_col}}12\">' +","          '<div id=\"alert-danger\" class=\"alert {{bs_al_dang}}\"></div>' +","        '</div>' +","      '</div>' +","    '</div>';","","Y.namespace('M.atto_recordrtc').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {","    /**","     * The current language en by default.","     */","    _lang: 'en',","","    /**","     * A reference to the dialogue content.","     *","     * @property _content","     * @type Node","     * @private","     */","    _content: null,","","    initializer: function() {","        // Make necessary params globally accessible.","        M.atto_recordrtc = M.atto_recordrtc || {};","        M.atto_recordrtc.params = {};","","        var requiredParams = [","                'contextid',","                'sesskey',","                'recordrtcroot',","                'audiobitrate',","                'videobitrate',","                'timelimit',","                'oldermoodle',","                'maxrecsize'","            ];","","        for (var n in requiredParams) {","            M.atto_recordrtc.params[requiredParams[n]] = this.get(requiredParams[n]);","        }","","        var allowedtypes = this.get('allowedtypes');","        if (allowedtypes === 'both' || allowedtypes === 'audio') {","            // Add the audio button.","            this._addButton('audio', this._audio);","        }","        if (allowedtypes === 'both' || allowedtypes === 'video') {","            // Add the video button.","            this._addButton('video', this._video);","        }","    },","","    _addButton: function(type, callback) {","        this.addButton({","            buttonName: type,","            icon: this.get(type + 'rtcicon'),","            iconComponent: PLUGINNAME,","            callback: callback,","            title: type + 'rtc',","            tags: type + 'rtc',","            tagMatchRequiresAll: false","        });","    },","","    /**","     * Toggle audiortc and normal display mode","     *","     * @method _audio","     * @private","     */","    _audio: function() {","        var dialogue = this.getDialogue({","            height: 500,","            width: 1000,","            headerContent: M.util.get_string('audiortc', 'atto_recordrtc'),","            focusAfterHide: true","        }, true);","","        var bodyContent = Y.Handlebars.compile(TEMPLATE)({","            bs_row: 'row',","            bs_col: 'col-xs-',","            bs_al_warn: 'alert-warning',","            bs_al_dang: 'alert-danger',","            browseralert_title: 'BOBBY',","            browseralert: 'JOE'","        });","","        dialogue.set('bodyContent', bodyContent);","        dialogue.show();","","        //M.atto_recordrtc.audiomodule.init();","    },","","    /**","     * Toggle videortc and normal display mode","     *","     * @method _video","     * @private","     */","    _video: function() {","        var dialogue = this.getDialogue({","            height: 500,","            width: 1000,","            headerContent: M.util.get_string('videortc', 'atto_recordrtc'),","            focusAfterHide: true","        }, true);","","        var bodyContent = Y.Handlebars.compile(TEMPLATE)({","            bs_row: 'row',","            bs_col: 'col-xs-',","            bs_al_warn: 'alert-warning',","            bs_al_dang: 'alert-danger',","            browseralert_title: 'BOBBY',","            browseralert: 'JOE'","        });","","        dialogue.set('bodyContent', bodyContent);","        dialogue.show();","","        //M.atto_recordrtc.videomodule.init();","    }","","}, {","    ATTRS: {","        /**","         * The contextid to use when generating this recordrtc.","         *","         * @attribute contextid","         * @type String","         */","        contextid: {","            value: null","        },","","        /**","         * The sesskey to use when generating this recordrtc.","         *","         * @attribute sesskey","         * @type String","         */","        sesskey: {","            value: null","        },","","        /**","         * The root to use when loading the recordrtc.","         *","         * @attribute recordrtcroot","         * @type String","         */","        recordrtcroot: {","            value: null","        },","","        /**","         * The allowedtypes to use when generating this recordrtc.","         *","         * @attribute allowedtypes","         * @type String","         */","        allowedtypes: {","            value: null","        },","","        /**","         * The audiobitrate to use when generating this recordrtc.","         *","         * @attribute audiobitrate","         * @type String","         */","        audiobitrate: {","            value: null","        },","","        /**","         * The videobitrate to use when generating this recordrtc.","         *","         * @attribute videobitrate","         * @type String","         */","        videobitrate: {","            value: null","        },","","        /**","         * The timelimit to use when generating this recordrtc.","         *","         * @attribute timelimit","         * @type String","         */","        timelimit: {","            value: null","        },","","        /**","         * The audiortcicon to use when generating this recordrtc.","         *","         * @attribute audiortcicon","         * @type String","         */","        audiortcicon: {","            value: null","        },","","        /**","         * The videortcicon to use when generating this recordrtc.","         *","         * @attribute videortcicon","         * @type String","         */","        videortcicon: {","            value: null","        },","","        /**","         * True if Moodle is version < 3.2.","         *","         * @attribute oldermoodle","         * @type Boolean","         */","        oldermoodle: {","            value: null","        },","","        /**","         * Maximum upload size set on server, in MB.","         *","         * @attribute maxrecsize","         * @type String","         */","        maxrecsize: {","            value: null","        }","    }","});","","","}, '@VERSION@', {\"requires\": [\"moodle-editor_atto-plugin\", \"moodle-atto_recordrtc-recording\"]});","","}());"]};
}
var __cov_rsJHo0SLJfm3n07rFSmtCA = __coverage__['build/moodle-atto_recordrtc-button/moodle-atto_recordrtc-button.js'];
__cov_rsJHo0SLJfm3n07rFSmtCA.s['1']++;YUI.add('moodle-atto_recordrtc-button',function(Y,NAME){__cov_rsJHo0SLJfm3n07rFSmtCA.f['1']++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['2']++;var PLUGINNAME='atto_recordrtc',TEMPLATE=''+'<div class="container-fluid">'+'<div class="{{bs_row}} hide">'+'<div class="{{bs_col}}12">'+'<div id="alert-warning" class="alert {{bs_al_warn}}">'+'<strong>{{browseralert_title}}</strong> {{browseralert}}'+'</div>'+'</div>'+'</div>'+'<div class="{{bs_row}} hide">'+'<div class="{{bs_col}}12">'+'<div id="alert-danger" class="alert {{bs_al_dang}}"></div>'+'</div>'+'</div>'+'</div>';__cov_rsJHo0SLJfm3n07rFSmtCA.s['3']++;Y.namespace('M.atto_recordrtc').Button=Y.Base.create('button',Y.M.editor_atto.EditorPlugin,[],{_lang:'en',_content:null,initializer:function(){__cov_rsJHo0SLJfm3n07rFSmtCA.f['2']++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['4']++;M.atto_recordrtc=(__cov_rsJHo0SLJfm3n07rFSmtCA.b['1'][0]++,M.atto_recordrtc)||(__cov_rsJHo0SLJfm3n07rFSmtCA.b['1'][1]++,{});__cov_rsJHo0SLJfm3n07rFSmtCA.s['5']++;M.atto_recordrtc.params={};__cov_rsJHo0SLJfm3n07rFSmtCA.s['6']++;var requiredParams=['contextid','sesskey','recordrtcroot','audiobitrate','videobitrate','timelimit','oldermoodle','maxrecsize'];__cov_rsJHo0SLJfm3n07rFSmtCA.s['7']++;for(var n in requiredParams){__cov_rsJHo0SLJfm3n07rFSmtCA.s['8']++;M.atto_recordrtc.params[requiredParams[n]]=this.get(requiredParams[n]);}__cov_rsJHo0SLJfm3n07rFSmtCA.s['9']++;var allowedtypes=this.get('allowedtypes');__cov_rsJHo0SLJfm3n07rFSmtCA.s['10']++;if((__cov_rsJHo0SLJfm3n07rFSmtCA.b['3'][0]++,allowedtypes==='both')||(__cov_rsJHo0SLJfm3n07rFSmtCA.b['3'][1]++,allowedtypes==='audio')){__cov_rsJHo0SLJfm3n07rFSmtCA.b['2'][0]++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['11']++;this._addButton('audio',this._audio);}else{__cov_rsJHo0SLJfm3n07rFSmtCA.b['2'][1]++;}__cov_rsJHo0SLJfm3n07rFSmtCA.s['12']++;if((__cov_rsJHo0SLJfm3n07rFSmtCA.b['5'][0]++,allowedtypes==='both')||(__cov_rsJHo0SLJfm3n07rFSmtCA.b['5'][1]++,allowedtypes==='video')){__cov_rsJHo0SLJfm3n07rFSmtCA.b['4'][0]++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['13']++;this._addButton('video',this._video);}else{__cov_rsJHo0SLJfm3n07rFSmtCA.b['4'][1]++;}},_addButton:function(type,callback){__cov_rsJHo0SLJfm3n07rFSmtCA.f['3']++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['14']++;this.addButton({buttonName:type,icon:this.get(type+'rtcicon'),iconComponent:PLUGINNAME,callback:callback,title:type+'rtc',tags:type+'rtc',tagMatchRequiresAll:false});},_audio:function(){__cov_rsJHo0SLJfm3n07rFSmtCA.f['4']++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['15']++;var dialogue=this.getDialogue({height:500,width:1000,headerContent:M.util.get_string('audiortc','atto_recordrtc'),focusAfterHide:true},true);__cov_rsJHo0SLJfm3n07rFSmtCA.s['16']++;var bodyContent=Y.Handlebars.compile(TEMPLATE)({bs_row:'row',bs_col:'col-xs-',bs_al_warn:'alert-warning',bs_al_dang:'alert-danger',browseralert_title:'BOBBY',browseralert:'JOE'});__cov_rsJHo0SLJfm3n07rFSmtCA.s['17']++;dialogue.set('bodyContent',bodyContent);__cov_rsJHo0SLJfm3n07rFSmtCA.s['18']++;dialogue.show();},_video:function(){__cov_rsJHo0SLJfm3n07rFSmtCA.f['5']++;__cov_rsJHo0SLJfm3n07rFSmtCA.s['19']++;var dialogue=this.getDialogue({height:500,width:1000,headerContent:M.util.get_string('videortc','atto_recordrtc'),focusAfterHide:true},true);__cov_rsJHo0SLJfm3n07rFSmtCA.s['20']++;var bodyContent=Y.Handlebars.compile(TEMPLATE)({bs_row:'row',bs_col:'col-xs-',bs_al_warn:'alert-warning',bs_al_dang:'alert-danger',browseralert_title:'BOBBY',browseralert:'JOE'});__cov_rsJHo0SLJfm3n07rFSmtCA.s['21']++;dialogue.set('bodyContent',bodyContent);__cov_rsJHo0SLJfm3n07rFSmtCA.s['22']++;dialogue.show();}},{ATTRS:{contextid:{value:null},sesskey:{value:null},recordrtcroot:{value:null},allowedtypes:{value:null},audiobitrate:{value:null},videobitrate:{value:null},timelimit:{value:null},audiortcicon:{value:null},videortcicon:{value:null},oldermoodle:{value:null},maxrecsize:{value:null}}});},'@VERSION@',{'requires':['moodle-editor_atto-plugin','moodle-atto_recordrtc-recording']});
