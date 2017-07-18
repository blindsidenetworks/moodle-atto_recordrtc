<?php
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

/**
 * Atto recordrtc library functions
 *
 * @package    atto_recordrtc
 * @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com)
 * @copyright  2017 Blindside Networks Inc.
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

const MOODLE_ATTO_RECORDRTC_ROOT = '/lib/editor/atto/plugins/recordrtc/';
const MOODLE_ATTO_RECORDRTC_URL = '/lib/editor/atto/plugins/recordrtc/recordrtc.php';

/**
 * Set params for this plugin.
 *
 * @param string $elementid
 * @param stdClass $options - the options for the editor, including the context.
 * @param stdClass $fpoptions - unused.
 */
function atto_recordrtc_params_for_js($elementid, $options, $fpoptions) {
    global $CFG;

    $moodleversion = get_moodle_version_major();
    $context = $options['context'];
    if (!$context) {
        $context = context_system::instance();
    }
    $sesskey = sesskey();
    $allowedtypes = get_config('atto_recordrtc', 'allowedtypes');
    $audiobitrate = get_config('atto_recordrtc', 'audiobitrate');
    $videobitrate = get_config('atto_recordrtc', 'videobitrate');
    $timelimit = get_config('atto_recordrtc', 'videobitrate');
    $audiortcicon = 'e/insert_edit_video';
    $videortcicon = 'e/insert_edit_video';
    if ($moodleversion >= '2017051500') {
        $audiortcicon = 'i/audiortc';
        $videortcicon = 'i/videortc';
    }

    return array('contextid' => $context->id,
                 'recordrtcurl' => $CFG->wwwroot . MOODLE_ATTO_RECORDRTC_URL,
                 'sesskey' => $sesskey,
                 'allowedtypes' => $allowedtypes,
                 'audiobitrate' => $audiobitrate,
                 'videobitrate' => $videobitrate,
                 'timelimit' => $timelimit,
                 'audiortcicon' => $audiortcicon,
                 'videortcicon' => $videortcicon
               );
}

/**
 * Initialise the js strings required for this module.
 */
function atto_recordrtc_strings_for_js() {
    global $PAGE;

    $PAGE->requires->strings_for_js(array('pluginname'), 'atto_recordrtc');
    $PAGE->requires->strings_for_js(array('audiortc'), 'atto_recordrtc');
    $PAGE->requires->strings_for_js(array('videortc'), 'atto_recordrtc');
}

/**
 * Get icon mapping for font-awesome.
 */
function atto_recordrtc_get_fontawesome_icon_map() {
    return [
        'atto_recordrtc:i/audiortc' => 'fa-file-audio-o',
        'atto_recordrtc:i/videortc' => 'fa-file-video-o'
    ];
}

/**
 * Get Moodle version
 * @return string
 */
function get_moodle_version_major() {
    global $CFG;

    $versionarray = explode('.', $CFG->version);

    return $versionarray[0];
}
