// Atto recordrtc library functions.
// @package    atto_recordrtc.
// @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/** global: M */
/** global: Y */
/** global: bowser */
/** global: recordrtc */
/** global: player */
/** global: startStopBtn */
/** global: uploadBtn */
/** global: countdownSeconds */
/** global: countdownTicker */
/** global: recType */
/** global: mediaRecorder */
/** global: chunks */
/** global: blobSize */
/** global: maxUploadSize */

M.atto_recordrtc = M.atto_recordrtc || {};

M.atto_recordrtc.audiomodule = {
    init: function() {
        // Assignment of global variables.
        player = document.querySelector('audio#player');
        startStopBtn = document.querySelector('button#start-stop');
        uploadBtn = document.querySelector('button#upload');
        recType = 'audio';
        // Extract the numbers from the string, and convert to bytes.
        maxUploadSize = parseInt(recordrtc.maxfilesize.match(/\d+/)[0]) * Math.pow(1024, 2);

        // Show alert and redirect user if connection is not secure.
        M.atto_recordrtc.commonmodule.check_secure();
        // Show alert if using non-ideal browser.
        M.atto_recordrtc.commonmodule.check_browser();

        // Run when user clicks on "record" button.
        startStopBtn.onclick = function() {
            var btn = this;
            btn.disabled = true;

            // If button is displaying "Start Recording" or "Record Again".
            if ((btn.textContent === M.util.get_string('startrecording', 'atto_recordrtc')) ||
                (btn.textContent === M.util.get_string('recordagain', 'atto_recordrtc')) ||
                (btn.textContent === M.util.get_string('recordingfailed', 'atto_recordrtc'))) {
                // Hide alert-danger if it is shown.
                var alert = document.querySelector('div[id=alert-danger]');
                alert.parentElement.parentElement.classList.add('hide');

                // Make sure the audio player and upload button are not shown.
                player.parentElement.parentElement.classList.add('hide');
                uploadBtn.parentElement.parentElement.classList.add('hide');

                // Change look of recording button.
                if (!recordrtc.oldermoodle) {
                    startStopBtn.classList.remove('btn-outline-danger');
                    startStopBtn.classList.add('btn-danger');
                }

                // Empty the array containing the previously recorded chunks.
                chunks = [];
                blobSize = 0;

                // Initialize common configurations.
                var commonConfig = {
                    // When the stream is captured from the microphone/webcam.
                    onMediaCaptured: function(stream) {
                        // Make audio stream available at a higher level by making it a property of btn.
                        btn.stream = stream;

                        if (btn.mediaCapturedCallback) {
                            btn.mediaCapturedCallback();
                        }
                    },

                    // Revert button to "Record Again" when recording is stopped.
                    onMediaStopped: function(btnLabel) {
                        btn.textContent = btnLabel;
                    },

                    // Handle recording errors.
                    onMediaCapturingFailed: function(error) {
                        var btnLabel = null;

                        // If Firefox and Permission Denied error.
                        if ((error.name === 'PermissionDeniedError') && bowser.firefox) {
                            InstallTrigger.install({
                                'Foo': {
                                    // Link: https://addons.mozilla.org/firefox/downloads/latest/655146/addon-655146...
                                    // ...-latest.xpi?src=dp-btn-primary.
                                    URL: 'https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/',
                                    toString: function() {
                                        return this.URL;
                                    }
                                }
                            });

                            btnLabel = M.util.get_string('startrecording', 'atto_recordrtc');
                        } else if ((error.name === 'DevicesNotFoundError') ||
                                   (error.name === 'NotFoundError')) { // If Device Not Found error.
                            var alert = document.querySelector('div[id=alert-danger]');
                            alert.parentElement.parentElement.classList.remove('hide');
                            alert.textContent = M.util.get_string('inputdevicealert_title', 'atto_recordrtc') + ' ' + M.util.get_string('inputdevicealert', 'atto_recordrtc');

                            btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                        }

                        // Proceed to treat as a stopped recording.
                        commonConfig.onMediaStopped(btnLabel);
                    }
                };

                // Capture audio stream from microphone.
                this.capture_audio(commonConfig);

                // When audio stream is successfully captured, start recording.
                btn.mediaCapturedCallback = function() {
                    M.atto_recordrtc.commonmodule.start_recording(recType, btn.stream);
                };
            } else { // If button is displaying "Stop Recording".
                // First of all clears the countdownTicker.
                clearInterval(countdownTicker);

                // Disable "Record Again" button for 1s to allow background processing (closing streams).
                setTimeout(function() {
                    btn.disabled = false;
                }, 1000);

                // Stop recording.
                M.atto_recordrtc.commonmodule.stop_recording_audio(btn.stream);

                // Change button to offer to record again.
                btn.textContent = M.util.get_string('recordagain', 'atto_recordrtc');
                if (!recordrtc.oldermoodle) {
                    startStopBtn.classList.remove('btn-danger');
                    startStopBtn.classList.add('btn-outline-danger');
                }
            }
        };
    },

    // Setup to get audio stream from microphone.
    capture_audio: function(config) {
        M.atto_recordrtc.commonmodule.capture_user_media(
            // Media constraints.
            {
                audio: true
            },

            // Success callback.
            function(audioStream) {
                // Set audio player source to microphone stream.
                player.srcObject = audioStream;

                config.onMediaCaptured(audioStream);
            },

            // Error callback.
            function(error) {
                config.onMediaCapturingFailed(error);
            }
        );
    },

    stop_recording_audio: function(stream) {
        // Stop recording microphone stream.
        mediaRecorder.stop();

        // Stop each individual MediaTrack.
        stream.getTracks().forEach(function(track) {
            track.stop();
        });

        // Set source of audio player.
        var blob = new Blob(chunks);
        player.src = URL.createObjectURL(blob);

        // Show audio player with controls enabled, and unmute.
        player.muted = false;
        player.controls = true;
        player.parentElement.parentElement.classList.remove('hide');

        // Show upload button.
        uploadBtn.parentElement.parentElement.classList.remove('hide');
        uploadBtn.textContent = M.util.get_string('attachrecording', 'atto_recordrtc');
        uploadBtn.disabled = false;

        // Handle when upload button is clicked.
        uploadBtn.onclick = function() {
            // Trigger error if no recording has been made.
            if (!player.src || chunks === []) {
                return window.alert(M.util.get_string('norecordingfound', 'atto_recordrtc'));
            } else {
                var btn = uploadBtn;
                btn.disabled = true;

                // Upload recording to server.
                M.atto_recordrtc.commonmodule.upload_to_server(recType, function(progress, fileURLOrError) {
                    if (progress === 'ended') { // Insert annotation in text.
                        btn.disabled = false;
                        M.atto_recordrtc.commonmodule.insert_annotation(recType, fileURLOrError);
                    } else if (progress === 'upload-failed') { // Show error message in upload button.
                        btn.disabled = false;
                        btn.textContent = M.util.get_string('uploadfailed', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                        btn.disabled = false;
                        btn.textContent = M.util.get_string('uploadfailed404', 'atto_recordrtc');
                    } else if (progress === 'upload-aborted') {
                        btn.disabled = false;
                        btn.textContent = M.util.get_string('uploadaborted', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else {
                        btn.textContent = progress;
                    }
                });

                return undefined;
            }
        };
    }
};
