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

/**
 * Atto recordrtc library functions
 *
 * @package    atto_recordrtc
 * @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com)
 * @author     Jacob Prud'homme (jacob [dt] prudhomme [at] blindsidenetworks [dt] com)
 * @copyright  2017 Blindside Networks Inc.
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/*jshint es5: true */
/*jshint onevar: false */
/*jshint shadow: true */
/*global M */
/*global MediaRecorder */
/*global URL */

M.atto_recordrtc = M.atto_recordrtc || {};

// Shorten access to M.atto_recordrtc.commonmodule namespace.
var cm = M.atto_recordrtc.commonmodule;

M.atto_recordrtc.audiomodule = {
    init: function(scope) {
        // Assignment of global variables.
        cm.editorScope = scope; // Allows access to the editor's "this" context.
        cm.alertWarning = Y.one('div#alert-warning');
        cm.alertDanger = Y.one('div#alert-danger');
        cm.player = Y.one('audio#player');
        cm.playerDOM = document.querySelector('audio#player');
        cm.startStopBtn = Y.one('button#start-stop');
        cm.uploadBtn = Y.one('button#upload');
        cm.recType = 'audio';
        cm.olderMoodle = scope.get('oldermoodle');
        // Extract the numbers from the string, and convert to bytes.
        cm.maxUploadSize = parseInt(scope.get('maxrecsize').match(/\d+/)[0], 10) * Math.pow(1024, 2);

        // Show alert and redirect user if connection is not secure.
        cm.check_secure();
        // Show alert if using non-ideal browser.
        cm.check_browser();

        // Run when user clicks on "record" button.
        cm.startStopBtn.on('click', function() {
            cm.startStopBtn.set('disabled', true);

            // If button is displaying "Start Recording" or "Record Again".
            if ((cm.startStopBtn.get('textContent') === M.util.get_string('startrecording', 'atto_recordrtc')) ||
                (cm.startStopBtn.get('textContent') === M.util.get_string('recordagain', 'atto_recordrtc')) ||
                (cm.startStopBtn.get('textContent') === M.util.get_string('recordingfailed', 'atto_recordrtc'))) {
                // Make sure the audio player and upload button are not shown.
                cm.player.ancestor().ancestor().addClass('hide');
                cm.uploadBtn.ancestor().ancestor().addClass('hide');

                // Change look of recording button.
                if (!cm.olderMoodle) {
                    cm.startStopBtn.replaceClass('btn-outline-danger', 'btn-danger');
                }

                // Empty the array containing the previously recorded chunks.
                cm.chunks = [];
                cm.blobSize = 0;

                // Initialize common configurations.
                var commonConfig = {
                    // When the stream is captured from the microphone/webcam.
                    onMediaCaptured: function(stream) {
                        // Make audio stream available at a higher level by making it a property of the common module.
                        cm.stream = stream;

                        cm.start_recording(cm.recType, cm.stream);
                    },

                    // Revert button to "Record Again" when recording is stopped.
                    onMediaStopped: function(btnLabel) {
                        cm.startStopBtn.set('textContent', btnLabel);
                    },

                    // Handle recording errors.
                    onMediaCapturingFailed: function(error) {
                        var btnLabel = null;

                        // Handle getUserMedia-thrown errors.
                        switch (error.name) {
                            case 'AbortError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumabort_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumabort', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                                break;
                            case 'NotAllowedError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumnotallowed_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumnotallowed', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                                break;
                            case 'NotFoundError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumnotfound_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumnotfound', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                                break;
                            case 'NotReadableError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumnotreadable_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumnotreadable', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                                break;
                            case 'OverConstrainedError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumoverconstrained_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumoverconstrained', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                                break;
                            case 'SecurityError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumsecurity_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumsecurity', 'atto_recordrtc')
                                    });
                                });

                                cm.editorScope.closeDialogue(cm.editorScope);
                                break;
                            case 'TypeError':
                                Y.use('moodle-core-notification-alert', function() {
                                    new M.core.alert({
                                        title: M.util.get_string('gumtype_title', 'atto_recordrtc'),
                                        message: M.util.get_string('gumtype', 'atto_recordrtc')
                                    });
                                });

                                btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                        }

                        // Proceed to treat as a stopped recording.
                        commonConfig.onMediaStopped(btnLabel);
                    }
                };

                // Capture audio stream from microphone.
                M.atto_recordrtc.audiomodule.capture_audio(commonConfig);
            } else { // If button is displaying "Stop Recording".
                // First of all clears the countdownTicker.
                clearInterval(cm.countdownTicker);

                // Disable "Record Again" button for 1s to allow background processing (closing streams).
                setTimeout(function() {
                    cm.startStopBtn.set('disabled', false);
                }, 1000);

                // Stop recording.
                M.atto_recordrtc.audiomodule.stop_recording(cm.stream);

                // Change button to offer to record again.
                cm.startStopBtn.set('textContent', M.util.get_string('recordagain', 'atto_recordrtc'));
                if (!cm.olderMoodle) {
                    cm.startStopBtn.replaceClass('btn-danger', 'btn-outline-danger');
                }
            }
        });
    },

    // Setup to get audio stream from microphone.
    capture_audio: function(config) {
        cm.capture_user_media(
            // Media constraints.
            {
                audio: true
            },

            // Success callback.
            function(audioStream) {
                // Set audio player source to microphone stream.
                cm.playerDOM.srcObject = audioStream;

                config.onMediaCaptured(audioStream);
            },

            // Error callback.
            function(error) {
                config.onMediaCapturingFailed(error);
            }
        );
    },

    stop_recording: function(stream) {
        // Stop recording microphone stream.
        cm.mediaRecorder.stop();

        // Stop each individual MediaTrack.
        stream.getTracks().forEach(function(track) {
            track.stop();
        });

        // Set source of audio player.
        var blob = new Blob(cm.chunks, {type: cm.mediaRecorder.mimeType});
        cm.player.set('src', URL.createObjectURL(blob));

        // Show audio player with controls enabled, and unmute.
        cm.player.set('muted', false);
        cm.player.set('controls', true);
        cm.player.ancestor().ancestor().removeClass('hide');

        // Show upload button.
        cm.uploadBtn.ancestor().ancestor().removeClass('hide');
        cm.uploadBtn.set('textContent', M.util.get_string('attachrecording', 'atto_recordrtc'));
        cm.uploadBtn.set('disabled', false);

        // Handle when upload button is clicked.
        cm.uploadBtn.on('click', function() {
            // Trigger error if no recording has been made.
            if (!cm.player.get('src') || cm.chunks === []) {
                Y.use('moodle-core-notification-alert', function() {
                    new M.core.alert({
                        title: M.util.get_string('norecordingfound_title', 'atto_recordrtc'),
                        message: M.util.get_string('norecordingfound', 'atto_recordrtc')
                    });
                });
            } else {
                cm.uploadBtn.set('disabled', true);

                // Upload recording to server.
                cm.upload_to_server(cm.recType, function(progress, fileURLOrError) {
                    if (progress === 'ended') { // Insert annotation in text.
                        cm.uploadBtn.set('disabled', false);
                        cm.insert_annotation(cm.recType, fileURLOrError);
                    } else if (progress === 'upload-failed') { // Show error message in upload button.
                        cm.uploadBtn.set('disabled', false);
                        cm.uploadBtn.set('textContent',
                            M.util.get_string('uploadfailed', 'atto_recordrtc') + ' ' + fileURLOrError);
                    } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                        cm.uploadBtn.set('disabled', false);
                        cm.uploadBtn.set('textContent', M.util.get_string('uploadfailed404', 'atto_recordrtc'));
                    } else if (progress === 'upload-aborted') {
                        cm.uploadBtn.set('disabled', false);
                        cm.uploadBtn.set('textContent',
                            M.util.get_string('uploadaborted', 'atto_recordrtc') + ' ' + fileURLOrError);
                    } else {
                        cm.uploadBtn.set('textContent', progress);
                    }
                });
            }
        });
    }
};
