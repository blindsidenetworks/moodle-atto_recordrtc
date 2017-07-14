<?php

/**
 * Atto recordrtc library functions
 *
 * @package    atto_recordrtc
 * @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com)
 * @copyright  2016 Blindside Networks Inc.
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

    $context = $options['context'];
    if (!$context) {
        $context = context_system::instance();
    }
    $sesskey = sesskey();

    return array('contextid' => $context->id,
                 'recordrtcurl' => $CFG->wwwroot . MOODLE_ATTO_RECORDRTC_URL,
                 'sesskey' => $sesskey);
}

/**
 * Initialise the js strings required for this module.
 */
function atto_recordrtc_strings_for_js() {
    global $PAGE;

    $PAGE->requires->strings_for_js(array('pluginname'), 'atto_recordrtc');
}
