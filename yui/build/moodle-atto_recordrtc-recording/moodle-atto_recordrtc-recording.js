YUI.add('moodle-atto_recordrtc-recording', function (Y, NAME) {

// Atto recordrtc library functions.
// @package    atto_recordrtc.
// @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/*jshint es5: true */
/*jshint onevar: false */
/*jshint shadow: true */
/*global M */
/*global MediaRecorder */
/*global URL */
/*global InstallTrigger */

M.atto_recordrtc = M.atto_recordrtc || {};

// Shorten access to M.atto_recordrtc.commonmodule namespace.
var cm = M.atto_recordrtc.commonmodule;

// Require Bowser and adapter.js libraries.
require(['atto_recordrtc/adapter'], function(adapter) {
    window.adapter = adapter;
});
require(['atto_recordrtc/bowser'], function(bowser) {
    window.bowser = bowser;
});

M.atto_recordrtc.commonmodule = {
    // Unitialized variables to be used by the other modules.
    editorScope: null,
    player: null,
    startStopBtn: null,
    uploadBtn: null,
    countdownSeconds: null,
    countdownTicker: null,
    recType: null,
    stream: null,
    mediaRecorder: null,
    chunks: null,
    blobSize: null,
    olderMoodle: null,
    maxUploadSize: null,

    // Notify and redirect user if plugin is used from insecure location.
    check_secure: function() {
        var isSecureOrigin = (window.location.protocol === 'https:') ||
                             (window.location.host.indexOf('localhost') !== -1);

        if (!isSecureOrigin) {
            Y.use('moodle-core-notification-alert', function() {
                new M.core.alert({
                    title: M.util.get_string('insecurealert_title', 'atto_recordrtc'),
                    message: M.util.get_string('insecurealert', 'atto_recordrtc')
                });
            });
        }
    },

    // Display "consider switching browsers" message if not using:
    // - Firefox 29+;
    // - Chrome 49+;
    // - Opera 36+.
    check_browser: function() {
        if (!((window.bowser.firefox && window.bowser.version >= 29) ||
              (window.bowser.chrome && window.bowser.version >= 49) ||
              (window.bowser.opera && window.bowser.version >= 36))) {
            var alert = document.querySelector('div#alert-warning');
            alert.parentElement.parentElement.classList.remove('hide');
        }
    },

    // Capture webcam/microphone stream.
    capture_user_media: function(mediaConstraints, successCallback, errorCallback) {
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    },

    // Add chunks of audio/video to array when made available.
    handle_data_available: function(event) {
        // Size of all recorded data so far.
        cm.blobSize += event.data.size;

        // Push recording slice to array.
        // If total size of recording so far exceeds max upload limit, stop recording.
        // An extra condition exists to avoid displaying alert twice.
        if ((cm.blobSize >= cm.maxUploadSize) && (!localStorage.getItem('alerted'))) {
            localStorage.setItem('alerted', 'true');

            cm.startStopBtn.click();
            Y.use('moodle-core-notification-alert', function() {
                new M.core.alert({
                    title: M.util.get_string('nearingmaxsize_title', 'atto_recordrtc'),
                    message: M.util.get_string('nearingmaxsize', 'atto_recordrtc')
                });
            });
        } else if ((cm.blobSize >= cm.maxUploadSize) && (localStorage.getItem('alerted') === 'true')) {
            localStorage.removeItem('alerted');
        } else {
            cm.chunks.push(event.data);
        }
    },

    // Get everything set up to start recording.
    start_recording: function(type, stream) {
        // The options for the recording codecs and bitrates.
        var options = null;
        if (type === 'audio') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = {
                    audioBitsPerSecond: cm.editorScope.get('audiobitrate'),
                    mimeType: 'audio/webm;codecs=opus'
                };
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                options = {
                    audioBitsPerSecond: cm.editorScope.get('audiobitrate'),
                    mimeType: 'audio/ogg;codecs=opus'
                };
            }
        } else {
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                options = {
                    audioBitsPerSecond: cm.editorScope.get('audiobitrate'),
                    videoBitsPerSecond: cm.editorScope.get('videobitrate'),
                    mimeType: 'video/webm;codecs=vp9,opus'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
                options = {
                    audioBitsPerSecond: cm.editorScope.get('audiobitrate'),
                    videoBitsPerSecond: cm.editorScope.get('videobitrate'),
                    mimeType: 'video/webm;codecs=h264,opus'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                options = {
                    audioBitsPerSecond: cm.editorScope.get('audiobitrate'),
                    videoBitsPerSecond: cm.editorScope.get('videobitrate'),
                    mimeType: 'video/webm;codecs=vp8,opus'
                };
            }
        }

        // If none of the options above are supported, fall back on browser defaults.
        cm.mediaRecorder = options ? new MediaRecorder(stream, options)
                                   : new MediaRecorder(stream);

        // Initialize MediaRecorder events and start recording.
        cm.mediaRecorder.ondataavailable = cm.handle_data_available;
        cm.mediaRecorder.start(1000); // Capture in 1s chunks. Must be set to work with Firefox.

        // Mute audio, distracting while recording.
        cm.player.muted = true;

        // Set recording timer to the time specified in the settings.
        cm.countdownSeconds = cm.editorScope.get('timelimit');
        cm.countdownSeconds++;
        cm.startStopBtn.innerHTML = M.util.get_string('stoprecording', 'atto_recordrtc');
        cm.startStopBtn.innerHTML += ' (<span id="minutes"></span>:<span id="seconds"></span>)';
        cm.set_time();
        cm.countdownTicker = setInterval(cm.set_time, 1000);

        // Make button clickable again, to allow stopping recording.
        cm.startStopBtn.disabled = false;
    },

    // Upload recorded audio/video to server.
    upload_to_server: function(type, callback) {
        var xhr = new XMLHttpRequest();

        // Get src media of audio/video tag.
        xhr.open('GET', cm.player.src, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) { // If src media was successfully retrieved.
                // blob is now the media that the audio/video tag's src pointed to.
                var blob = this.response;

                // Generate filename with random ID and file extension.
                var fileName = (Math.random() * 1000).toString().replace('.', '');
                if (type === 'audio') {
                    fileName += '-audio.ogg';
                } else {
                    fileName += '-video.webm';
                }

                // Create FormData to send to PHP upload/save script.
                var formData = new FormData();
                formData.append('contextid', cm.editorScope.get('contextid'));
                formData.append('sesskey', cm.editorScope.get('sesskey'));
                formData.append(type + '-filename', fileName);
                formData.append(type + '-blob', blob);

                // Pass FormData to PHP script using XHR.
                cm.make_xmlhttprequest(cm.editorScope.get('recordrtcroot') + 'save.php', formData,
                    function(progress, responseText) {
                        if (progress === 'upload-ended') {
                            var initialURL = cm.editorScope.get('recordrtcroot') + 'uploads.php/';
                            return callback('ended', initialURL + responseText);
                        }
                        return callback(progress);
                    }
                );
            }
        };

        xhr.send();
    },

    // Handle XHR sending/receiving/status.
    make_xmlhttprequest: function(url, data, callback) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if ((xhr.readyState === 4) && (xhr.status === 200)) { // When request is finished and successful.
                callback('upload-ended', xhr.responseText);
            } else if (xhr.status === 404) { // When request returns 404 Not Found.
                callback('upload-failed-404');
            }
        };

        xhr.upload.onprogress = function(event) {
            callback(Math.round(event.loaded / event.total * 100) + "% " + M.util.get_string('uploadprogress', 'atto_recordrtc'));
        };

        xhr.upload.onerror = function(error) {
            callback('upload-failed', error);
        };

        xhr.upload.onabort = function(error) {
            callback('upload-aborted', error);
        };

        // POST FormData to PHP script that handles uploading/saving.
        xhr.open('POST', url);
        xhr.send(data);
    },

    // Makes 1min and 2s display as 1:02 on timer instead of 1:2, for example.
    pad: function(val) {
        var valString = val + "";

        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    },

    // Functionality to make recording timer count down.
    // Also makes recording stop when time limit is hit.
    set_time: function() {
        cm.countdownSeconds--;

        cm.startStopBtn.querySelector('span#seconds').textContent = cm.pad(cm.countdownSeconds % 60);
        cm.startStopBtn.querySelector('span#minutes').textContent = cm.pad(parseInt(cm.countdownSeconds / 60, 10));

        if (cm.countdownSeconds === 0) {
            cm.startStopBtn.click();
        }
    },

    // Generates link to recorded annotation to be inserted.
    create_annotation: function(type, recording_url) {
        var linkText = window.prompt(M.util.get_string('annotationprompt', 'atto_recordrtc'),
                                     M.util.get_string('annotation:' + type, 'atto_recordrtc'));

        // Return HTML for annotation link, if user did not press "Cancel".
        if (!linkText) {
            return undefined;
        } else {
            var annotation = '<a target="_blank" href="' + recording_url + '">' + linkText + '</a>';
            return annotation;
        }
    },

    // Inserts link to annotation in editor text area.
    insert_annotation: function(type, recording_url) {
        var annotation = cm.create_annotation(type, recording_url);

        // Insert annotation link.
        // If user pressed "Cancel", just go back to main recording screen.
        if (!annotation) {
            cm.uploadBtn.textContent = M.util.get_string('attachrecording', 'atto_recordrtc');
        } else {
            cm.editorScope.setLink(cm.editorScope, annotation);
        }
    }
};
// Atto recordrtc library functions.
// @package    atto_recordrtc.
// @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/*jshint es5: true */
/*jshint onevar: false */
/*jshint shadow: true */
/*global M */
/*global MediaRecorder */
/*global URL */
/*global InstallTrigger */

M.atto_recordrtc = M.atto_recordrtc || {};

// Shorten access to M.atto_recordrtc.commonmodule namespace.
var cm = M.atto_recordrtc.commonmodule;

M.atto_recordrtc.audiomodule = {
    init: function(scope) {
        // Assignment of global variables.
        cm.editorScope = scope; // Allows access to the editor's "this" context.
        cm.player = document.querySelector('audio#player');
        cm.startStopBtn = document.querySelector('button#start-stop');
        cm.uploadBtn = document.querySelector('button#upload');
        cm.recType = 'audio';
        cm.olderMoodle = scope.get('oldermoodle');
        // Extract the numbers from the string, and convert to bytes.
        cm.maxUploadSize = parseInt(scope.get('maxrecsize').match(/\d+/)[0], 10) * Math.pow(1024, 2);

        // Show alert and redirect user if connection is not secure.
        cm.check_secure();
        // Show alert if using non-ideal browser.
        cm.check_browser();

        // Run when user clicks on "record" button.
        cm.startStopBtn.onclick = function() {
            cm.startStopBtn.disabled = true;

            // If button is displaying "Start Recording" or "Record Again".
            if ((cm.startStopBtn.textContent === M.util.get_string('startrecording', 'atto_recordrtc')) ||
                (cm.startStopBtn.textContent === M.util.get_string('recordagain', 'atto_recordrtc')) ||
                (cm.startStopBtn.textContent === M.util.get_string('recordingfailed', 'atto_recordrtc'))) {
                // Hide alert-danger if it is shown.
                var alert = document.querySelector('div[id=alert-danger]');
                alert.parentElement.parentElement.classList.add('hide');

                // Make sure the audio player and upload button are not shown.
                cm.player.parentElement.parentElement.classList.add('hide');
                cm.uploadBtn.parentElement.parentElement.classList.add('hide');

                // Change look of recording button.
                if (!cm.olderMoodle) {
                    cm.startStopBtn.classList.remove('btn-outline-danger');
                    cm.startStopBtn.classList.add('btn-danger');
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

                        if (cm.startStopBtn.mediaCapturedCallback) {
                            cm.startStopBtn.mediaCapturedCallback();
                        }
                    },

                    // Revert button to "Record Again" when recording is stopped.
                    onMediaStopped: function(btnLabel) {
                        cm.startStopBtn.textContent = btnLabel;
                    },

                    // Handle recording errors.
                    onMediaCapturingFailed: function(error) {
                        var btnLabel = null;

                        // If Firefox and Permission Denied error.
                        if ((error.name === 'PermissionDeniedError') && window.bowser.firefox) {
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
                            alert.textContent = M.util.get_string('inputdevicealert_title', 'atto_recordrtc') + ' ';
                            alert.textContent += M.util.get_string('inputdevicealert', 'atto_recordrtc');

                            btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                        }

                        // Proceed to treat as a stopped recording.
                        commonConfig.onMediaStopped(btnLabel);
                    }
                };

                // Capture audio stream from microphone.
                M.atto_recordrtc.audiomodule.capture_audio(commonConfig);

                // When audio stream is successfully captured, start recording.
                cm.startStopBtn.mediaCapturedCallback = function() {
                    cm.start_recording(cm.recType, cm.stream);
                };
            } else { // If button is displaying "Stop Recording".
                // First of all clears the countdownTicker.
                clearInterval(cm.countdownTicker);

                // Disable "Record Again" button for 1s to allow background processing (closing streams).
                setTimeout(function() {
                    cm.startStopBtn.disabled = false;
                }, 1000);

                // Stop recording.
                M.atto_recordrtc.audiomodule.stop_recording(cm.stream);

                // Change button to offer to record again.
                cm.startStopBtn.textContent = M.util.get_string('recordagain', 'atto_recordrtc');
                if (!cm.olderMoodle) {
                    cm.startStopBtn.classList.remove('btn-danger');
                    cm.startStopBtn.classList.add('btn-outline-danger');
                }
            }
        };
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
                cm.player.srcObject = audioStream;

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
        cm.player.src = URL.createObjectURL(blob);

        // Show audio player with controls enabled, and unmute.
        cm.player.muted = false;
        cm.player.controls = true;
        cm.player.parentElement.parentElement.classList.remove('hide');

        // Show upload button.
        cm.uploadBtn.parentElement.parentElement.classList.remove('hide');
        cm.uploadBtn.textContent = M.util.get_string('attachrecording', 'atto_recordrtc');
        cm.uploadBtn.disabled = false;

        // Handle when upload button is clicked.
        cm.uploadBtn.onclick = function() {
            // Trigger error if no recording has been made.
            if (!cm.player.src || cm.chunks === []) {
                Y.use('moodle-core-notification-alert', function() {
                    new M.core.alert({
                        title: M.util.get_string('norecordingfound_title', 'atto_recordrtc'),
                        message: M.util.get_string('norecordingfound', 'atto_recordrtc')
                    });
                });
            } else {
                cm.uploadBtn.disabled = true;

                // Upload recording to server.
                cm.upload_to_server(cm.recType, function(progress, fileURLOrError) {
                    if (progress === 'ended') { // Insert annotation in text.
                        cm.uploadBtn.disabled = false;
                        cm.insert_annotation(cm.recType, fileURLOrError);
                    } else if (progress === 'upload-failed') { // Show error message in upload button.
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadfailed', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadfailed404', 'atto_recordrtc');
                    } else if (progress === 'upload-aborted') {
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadaborted', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else {
                        cm.uploadBtn.textContent = progress;
                    }
                });
            }
        };
    }
};
// Atto recordrtc library functions.
// @package    atto_recordrtc.
// @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/*jshint es5: true */
/*jshint onevar: false */
/*jshint shadow: true */
/*global M */
/*global MediaRecorder */
/*global URL */
/*global InstallTrigger */

M.atto_recordrtc = M.atto_recordrtc || {};

// Shorten access to M.atto_recordrtc.commonmodule namespace.
var cm = M.atto_recordrtc.commonmodule;

M.atto_recordrtc.videomodule = {
    init: function(scope) {
        // Assignment of global variables.
        cm.editorScope = scope; // Allows access to the editor's "this" context.
        cm.player = document.querySelector('video#player');
        cm.startStopBtn = document.querySelector('button#start-stop');
        cm.uploadBtn = document.querySelector('button#upload');
        cm.recType = 'video';
        cm.olderMoodle = scope.get('oldermoodle');
        // Extract the numbers from the string, and convert to bytes.
        cm.maxUploadSize = parseInt(scope.get('maxrecsize').match(/\d+/)[0], 10) * Math.pow(1024, 2);

        // Show alert and redirect user if connection is not secure.
        cm.check_secure();
        // Show alert if using non-ideal browser.
        cm.check_browser();

        // Run when user clicks on "record" button.
        cm.startStopBtn.onclick = function() {
            cm.startStopBtn.disabled = true;

            // If button is displaying "Start Recording" or "Record Again".
            if ((cm.startStopBtn.textContent === M.util.get_string('startrecording', 'atto_recordrtc')) ||
                (cm.startStopBtn.textContent === M.util.get_string('recordagain', 'atto_recordrtc')) ||
                (cm.startStopBtn.textContent === M.util.get_string('recordingfailed', 'atto_recordrtc'))) {
                // Hide alert-danger if it is shown.
                var alert = document.querySelector('div[id=alert-danger]');
                alert.parentElement.parentElement.classList.add('hide');

                // Make sure the upload button is not shown.
                cm.uploadBtn.parentElement.parentElement.classList.add('hide');

                // Change look of recording button.
                if (!cm.olderMoodle) {
                    cm.startStopBtn.classList.remove('btn-outline-danger');
                    cm.startStopBtn.classList.add('btn-danger');
                }

                // Empty the array containing the previously recorded chunks.
                cm.chunks = [];
                cm.blobSize = 0;

                // Initialize common configurations.
                var commonConfig = {
                    // When the stream is captured from the microphone/webcam.
                    onMediaCaptured: function(stream) {
                        // Make video stream available at a higher level by making it a property of the common module.
                        cm.stream = stream;

                        if (cm.startStopBtn.mediaCapturedCallback) {
                            cm.startStopBtn.mediaCapturedCallback();
                        }
                    },

                    // Revert button to "Record Again" when recording is stopped.
                    onMediaStopped: function(btnLabel) {
                        cm.startStopBtn.textContent = btnLabel;
                    },

                    // Handle recording errors.
                    onMediaCapturingFailed: function(error) {
                        var btnLabel = null;

                        // If Firefox and Permission Denied error.
                        if ((error.name === 'PermissionDeniedError') && window.bowser.firefox) {
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
                            alert.textContent = M.util.get_string('inputdevicealert_title', 'atto_recordrtc') + ' ';
                            alert.textContent += M.util.get_string('inputdevicealert', 'atto_recordrtc');

                            btnLabel = M.util.get_string('recordingfailed', 'atto_recordrtc');
                        }

                        // Proceed to treat as a stopped recording.
                        commonConfig.onMediaStopped(btnLabel);
                    }
                };

                // Show video tag without controls to view webcam stream.
                cm.player.parentElement.parentElement.classList.remove('hide');
                cm.player.controls = false;

                // Capture audio+video stream from webcam/microphone.
                M.atto_recordrtc.videomodule.capture_audio_video(commonConfig);

                // When audio+video stream is successfully captured, start recording.
                cm.startStopBtn.mediaCapturedCallback = function() {
                    cm.start_recording(cm.recType, cm.stream);
                };
            } else { // If button is displaying "Stop Recording".
                // First of all clears the countdownTicker.
                clearInterval(cm.countdownTicker);

                // Disable "Record Again" button for 1s to allow background processing (closing streams).
                setTimeout(function() {
                    cm.startStopBtn.disabled = false;
                }, 1000);

                // Stop recording.
                M.atto_recordrtc.videomodule.stop_recording(cm.stream);

                // Change button to offer to record again.
                cm.startStopBtn.textContent = M.util.get_string('recordagain', 'atto_recordrtc');
                if (!cm.olderMoodle) {
                    cm.startStopBtn.classList.remove('btn-danger');
                    cm.startStopBtn.classList.add('btn-outline-danger');
                }
            }
        };
    },

    // Setup to get audio+video stream from microphone/webcam.
    capture_audio_video: function(config) {
        cm.capture_user_media(
            // Media constraints.
            {
                audio: true,
                video: {
                    width: {ideal: 640},
                    height: {ideal: 480}
                }
            },

            // Success callback.
            function(audioVideoStream) {
                // Set video player source to microphone+webcam stream, and play it back as it's recording.
                cm.player.srcObject = audioVideoStream;
                cm.player.play();

                config.onMediaCaptured(audioVideoStream);
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

        // Set source of video player.
        var blob = new Blob(cm.chunks, {type: cm.mediaRecorder.mimeType});
        cm.player.src = URL.createObjectURL(blob);

        // Enable controls for video player, and unmute.
        cm.player.muted = false;
        cm.player.controls = true;

        // Show upload button.
        cm.uploadBtn.parentElement.parentElement.classList.remove('hide');
        cm.uploadBtn.textContent = M.util.get_string('attachrecording', 'atto_recordrtc');
        cm.uploadBtn.disabled = false;

        // Handle when upload button is clicked.
        cm.uploadBtn.onclick = function() {
            // Trigger error if no recording has been made.
            if (!cm.player.src || cm.chunks === []) {
                Y.use('moodle-core-notification-alert', function() {
                    new M.core.alert({
                        title: M.util.get_string('norecordingfound_title', 'atto_recordrtc'),
                        message: M.util.get_string('norecordingfound', 'atto_recordrtc')
                    });
                });
            } else {
                cm.uploadBtn.disabled = true;

                // Upload recording to server.
                cm.upload_to_server(cm.recType, function(progress, fileURLOrError) {
                    if (progress === 'ended') { // Insert annotation in text.
                        cm.uploadBtn.disabled = false;
                        cm.insert_annotation(cm.recType, fileURLOrError);
                    } else if (progress === 'upload-failed') { // Show error message in upload button.
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadfailed', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadfailed404', 'atto_recordrtc');
                    } else if (progress === 'upload-aborted') {
                        cm.uploadBtn.disabled = false;
                        cm.uploadBtn.textContent = M.util.get_string('uploadaborted', 'atto_recordrtc') + ' ' + fileURLOrError;
                    } else {
                        cm.uploadBtn.textContent = progress;
                    }
                });
            }
        };
    }
};


}, '@VERSION@', {"requires": ["moodle-atto_recordrtc-button"]});
