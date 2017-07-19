YUI.add('moodle-atto_recordrtc-recording', function (Y, NAME) {

// TinyMCE recordrtc library functions.
// @package    tinymce_recordrtc.
// @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/** global: M */
/** global: tinyMCEPopup */
/** global: bowser */
/** global: params */
/** global: recordrtc */

Y.M.atto_recordrtc = Y.M.atto_recordrtc || {};

// Extract plugin settings to params hash.
(function() {
    var params = {};
    var r = /([^&=]+)=?([^&]*)/g;

    var d = function(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    };

    var search = window.location.search;
    var match = r.exec(search.substring(1));
    while (match) {
        params[d(match[1])] = d(match[2]);

        if (d(match[2]) === 'true' || d(match[2]) === 'false') {
            params[d(match[1])] = d(match[2]) === 'true' ? true : false;
        }
        match = r.exec(search.substring(1));
    }

    window.params = params;
})();

// Initialize some variables.
var player = null;
var startStopBtn = null;
var uploadBtn = null;
var countdownSeconds = null;
var countdownTicker = null;
var recType = null;
var mediaRecorder = null;
var chunks = null;
var blobSize = null;
var maxUploadSize = null;

// Notify and redirect user if plugin is used from insecure location.
Y.M.atto_recordrtc.check_secure = function() {
    var isSecureOrigin = (window.location.protocol === 'https:') ||
                         (window.location.host.indexOf('localhost') !== -1);

    if (!isSecureOrigin) {
        window.alert(M.util.get_string('insecurealert', 'tinymce_recordrtc'));
        tinyMCEPopup.close();
    }
}

// Display "consider switching browsers" message if not using:
// - Firefox 29+;
// - Chrome 49+;
// - Opera 36+.
Y.M.atto_recordrtc.check_browser = function() {
    if (!((bowser.firefox && bowser.version >= 29) ||
          (bowser.chrome && bowser.version >= 49) ||
          (bowser.opera && bowser.version >= 36))) {
        var alert = document.querySelector('div[id=alert-warning]');
        alert.parentElement.parentElement.classList.remove('hide');
    }
};

// Capture webcam/microphone stream.
Y.M.atto_recordrtc.captureUserMedia = function(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
};

// Add chunks of audio/video to array when made available.
Y.M.atto_recordrtc.handleDataAvailable = function(event) {
    // Size of all recorded data so far.
    blobSize += event.data.size;

    // Push recording slice to array.
    // If total size of recording so far exceeds max upload limit, stop recording.
    // An extra condition exists to avoid displaying alert twice.
    if ((blobSize >= maxUploadSize) && (!localStorage.getItem('alerted'))) {
        localStorage.setItem('alerted', 'true');

        startStopBtn.click();
        window.alert(M.util.get_string('nearingmaxsize', 'tinymce_recordrtc'));
    } else if ((blobSize >= maxUploadSize) && (localStorage.getItem('alerted') === 'true')) {
        localStorage.removeItem('alerted');
    } else {
        chunks.push(event.data);
    }
};

// Get everything set up to start recording.
Y.M.atto_recordrtc.startRecording = function(type, stream) {
    // The options for the recording codecs and bitrates.
    var options = null;
    if (type === 'audio') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = {
                audioBitsPerSecond: params['audiobitrate'],
                mimeType: 'audio/webm;codecs=opus'
            };
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            options = {
                audioBitsPerSecond: params['audiobitrate'],
                mimeType: 'audio/ogg;codecs=opus'
            };
        }
    } else {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
            options = {
                audioBitsPerSecond: params['audiobitrate'],
                videoBitsPerSecond: params['videobitrate'],
                mimeType: 'video/webm;codecs=vp9,opus'
            };
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
            options = {
                audioBitsPerSecond: params['audiobitrate'],
                videoBitsPerSecond: params['videobitrate'],
                mimeType: 'video/webm;codecs=h264,opus'
            };
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
            options = {
                audioBitsPerSecond: params['audiobitrate'],
                videoBitsPerSecond: params['videobitrate'],
                mimeType: 'video/webm;codecs=vp8,opus'
            };
        }
    }

    // If none of the options above are supported, fall back on browser defaults.
    mediaRecorder = options ? new MediaRecorder(stream)
                            : new MediaRecorder(stream, options);

    // Initialize MediaRecorder events and start recording.
    mediaRecorder.ondataavailable = Y.M.atto_recordrtc.handleDataAvailable;
    mediaRecorder.start(1000); // Capture in 10ms chunks. Must be set to work with Firefox.

    // Mute audio, distracting while recording.
    player.muted = true;

    // Set recording timer to the time specified in the settings.
    countdownSeconds = params['timelimit'];
    countdownSeconds++;
    startStopBtn.innerHTML = M.util.get_string('stoprecording', 'tinymce_recordrtc') + ' (<span id="minutes"></span>:<span id="seconds"></span>)';
    Y.M.atto_recordrtc.setTime();
    countdownTicker = setInterval(Y.M.atto_recordrtc.setTime, 1000);

    // Make button clickable again, to allow stopping recording.
    startStopBtn.disabled = false;
};

// Upload recorded audio/video to server.
Y.M.atto_recordrtc.uploadToServer = function(type, callback) {
    var xhr = new XMLHttpRequest();

    // Get src media of audio/video tag.
    xhr.open('GET', player.src, true);
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
            formData.append('contextid', recordrtc.contextid);
            formData.append('sesskey', parent.M.cfg.sesskey);
            formData.append(type + '-filename', fileName);
            formData.append(type + '-blob', blob);

            // Pass FormData to PHP script using XHR.
            Y.M.atto_recordrtc.makeXMLHttpRequest('save.php', formData, function(progress, responseText) {
                if (progress === 'upload-ended') {
                    var initialURL = location.href.replace(location.href.split('/').pop(), '') + 'uploads.php/';
                    callback('ended', initialURL + responseText);
                } else {
                    callback(progress);
                }
            });
        }
    };

    xhr.send();
};

// Handle XHR sending/receiving/status.
Y.M.atto_recordrtc.makeXMLHttpRequest = function(url, data, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if ((xhr.readyState === 4) && (xhr.status === 200)) { // When request is finished and successful.
            callback('upload-ended', xhr.responseText);
        } else if (xhr.status === 404) { // When request returns 404 Not Found.
            callback('upload-failed-404');
        }
    };

    xhr.upload.onprogress = function(event) {
        callback(Math.round(event.loaded / event.total * 100) + "% " + M.util.get_string('uploadprogress', 'tinymce_recordrtc'));
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
};

// Makes 1min and 2s display as 1:02 on timer instead of 1:2, for example.
Y.M.atto_recordrtc.pad = function(val) {
    var valString = val + "";

    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
};

// Functionality to make recording timer count down.
// Also makes recording stop when time limit is hit.
Y.M.atto_recordrtc.setTime = function() {
    countdownSeconds--;

    startStopBtn.querySelector('span#seconds').textContent = Y.M.atto_recordrtc.pad(countdownSeconds % 60);
    startStopBtn.querySelector('span#minutes').textContent = Y.M.atto_recordrtc.pad(parseInt(countdownSeconds / 60));

    if (countdownSeconds === 0) {
        startStopBtn.click();
    }
};

// Generates link to recorded annotation to be inserted.
Y.M.atto_recordrtc.create_annotation = function(type, recording_url) {
    var linkText = window.prompt(M.util.get_string('annotationprompt', 'tinymce_recordrtc'),
                                 M.util.get_string('annotation:' + type, 'tinymce_recordrtc'));

    // Return HTML for annotation link, if user did not press "Cancel".
    if (!linkText) {
        return undefined;
    } else {
        var annotation = '<div id="recordrtc_annotation" class="text-center"><a target="_blank" href="' + recording_url + '">' + linkText + '</a></div>';
        return annotation;
    }
};

// Inserts link to annotation in editor text area.
Y.M.atto_recordrtc.insert_annotation = function(type, recording_url) {
    var annotation = Y.M.atto_recordrtc.create_annotation(type, recording_url);

    // Insert annotation link.
    // If user pressed "Cancel", just go back to main recording screen.
    if (!annotation) {
        uploadBtn.textContent = M.util.get_string('attachrecording', 'tinymce_recordrtc');
    } else {
        tinyMCEPopup.editor.execCommand('mceInsertContent', false, annotation);
        tinyMCEPopup.close();
    }
};
// TinyMCE recordrtc library functions.
// @package    tinymce_recordrtc.
// @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/** global: M */
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

/**
 * This function is initialized from PHP
 *
 * @param {Object}
 *            Y YUI instance
 */
Y.M.atto_recordrtc.view_init = function() {
    // Assignment of global variables.
    player = document.querySelector('audio#player');
    startStopBtn = document.querySelector('button#start-stop');
    uploadBtn = document.querySelector('button#upload');
    recType = 'audio';
    // Extract the numbers from the string, and convert to bytes.
    maxUploadSize = parseInt(recordrtc.maxfilesize.match(/\d+/)[0]) * Math.pow(1024, 2);

    // Show alert and redirect user if connection is not secure.
    Y.M.atto_recordrtc.check_secure();
    // Show alert if using non-ideal browser.
    Y.M.atto_recordrtc.check_browser();

    // Run when user clicks on "record" button.
    startStopBtn.onclick = function() {
        var btn = this;
        btn.disabled = true;

        // If button is displaying "Start Recording" or "Record Again".
        if ((btn.textContent === M.util.get_string('startrecording', 'tinymce_recordrtc')) ||
            (btn.textContent === M.util.get_string('recordagain', 'tinymce_recordrtc')) ||
            (btn.textContent === M.util.get_string('recordingfailed', 'tinymce_recordrtc'))) {
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

                        btnLabel = M.util.get_string('startrecording', 'tinymce_recordrtc');
                    } else if ((error.name === 'DevicesNotFoundError') ||
                               (error.name === 'NotFoundError')) { // If Device Not Found error.
                        var alert = document.querySelector('div[id=alert-danger]');
                        alert.parentElement.parentElement.classList.remove('hide');
                        alert.textContent = M.util.get_string('inputdevicealert_title', 'tinymce_recordrtc') + ' ' + M.util.get_string('inputdevicealert', 'tinymce_recordrtc');

                        btnLabel = M.util.get_string('recordingfailed', 'tinymce_recordrtc');
                    }

                    // Proceed to treat as a stopped recording.
                    commonConfig.onMediaStopped(btnLabel);
                }
            };

            // Capture audio stream from microphone.
            Y.M.atto_recordrtc.captureAudio(commonConfig);

            // When audio stream is successfully captured, start recording.
            btn.mediaCapturedCallback = function() {
                Y.M.atto_recordrtc.startRecording(recType, btn.stream);
            };
        } else { // If button is displaying "Stop Recording".
            // First of all clears the countdownTicker.
            clearInterval(countdownTicker);

            // Disable "Record Again" button for 1s to allow background processing (closing streams).
            setTimeout(function() {
                btn.disabled = false;
            }, 1000);

            // Stop recording.
            Y.M.atto_recordrtc.stopRecording(btn.stream);

            // Change button to offer to record again.
            btn.textContent = M.util.get_string('recordagain', 'tinymce_recordrtc');
            if (!recordrtc.oldermoodle) {
                startStopBtn.classList.remove('btn-danger');
                startStopBtn.classList.add('btn-outline-danger');
            }
        }
    };
};

// Setup to get audio stream from microphone.
Y.M.atto_recordrtc.captureAudio = function(config) {
    Y.M.atto_recordrtc.captureUserMedia(
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
};

Y.M.atto_recordrtc.stopRecording = function(stream) {
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
    uploadBtn.textContent = M.util.get_string('attachrecording', 'tinymce_recordrtc');
    uploadBtn.disabled = false;

    // Handle when upload button is clicked.
    uploadBtn.onclick = function() {
        // Trigger error if no recording has been made.
        if (!player.src || chunks === []) {
            return window.alert(M.util.get_string('norecordingfound', 'tinymce_recordrtc'));
        } else {
            var btn = uploadBtn;
            btn.disabled = true;

            // Upload recording to server.
            Y.M.atto_recordrtc.uploadToServer(recType, function(progress, fileURLOrError) {
                if (progress === 'ended') { // Insert annotation in text.
                    btn.disabled = false;
                    Y.M.atto_recordrtc.insert_annotation(recType, fileURLOrError);
                } else if (progress === 'upload-failed') { // Show error message in upload button.
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadfailed', 'tinymce_recordrtc') + ' ' + fileURLOrError;
                } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadfailed404', 'tinymce_recordrtc');
                } else if (progress === 'upload-aborted') {
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadaborted', 'tinymce_recordrtc') + ' ' + fileURLOrError;
                } else {
                    btn.textContent = progress;
                }
            });

            return undefined;
        }
    };
};
// TinyMCE recordrtc library functions.
// @package    tinymce_recordrtc.
// @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/** global: M */
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

/**
 * This function is initialized from PHP
 *
 * @param {Object}
 *            Y YUI instance
 */
Y.M.atto_recordrtc.view_init = function() {
    // Assignment of global variables.
    player = document.querySelector('video#player');
    startStopBtn = document.querySelector('button#start-stop');
    uploadBtn = document.querySelector('button#upload');
    recType = 'video';
    // Extract the numbers from the string, and convert to bytes.
    maxUploadSize = parseInt(recordrtc.maxfilesize.match(/\d+/)[0]) * Math.pow(1024, 2);

    // Show alert and redirect user if connection is not secure.
    Y.M.atto_recordrtc.check_secure();
    // Show alert if using non-ideal browser.
    Y.M.atto_recordrtc.check_browser();

    // Run when user clicks on "record" button.
    startStopBtn.onclick = function() {
        var btn = this;
        btn.disabled = true;

        // If button is displaying "Start Recording" or "Record Again".
        if ((btn.textContent === M.util.get_string('startrecording', 'tinymce_recordrtc')) ||
            (btn.textContent === M.util.get_string('recordagain', 'tinymce_recordrtc')) ||
            (btn.textContent === M.util.get_string('recordingfailed', 'tinymce_recordrtc'))) {
            // Hide alert-danger if it is shown.
            var alert = document.querySelector('div[id=alert-danger]');
            alert.parentElement.parentElement.classList.add('hide');

            // Make sure the upload button is not shown.
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
                    // Make video stream available at a higher level by making it a property of btn.
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

                        btnLabel = M.util.get_string('startrecording', 'tinymce_recordrtc');
                    } else if ((error.name === 'DevicesNotFoundError') ||
                               (error.name === 'NotFoundError')) { // If Device Not Found error.
                        var alert = document.querySelector('div[id=alert-danger]');
                        alert.parentElement.parentElement.classList.remove('hide');
                        alert.textContent = M.util.get_string('inputdevicealert', 'tinymce_recordrtc') + ' ' + M.util.get_string('inputdevicealert', 'tinymce_recordrtc');

                        btnLabel = M.util.get_string('recordingfailed', 'tinymce_recordrtc');
                    }

                    // Proceed to treat as a stopped recording.
                    commonConfig.onMediaStopped(btnLabel);
                }
            };

            // Show video tag without controls to view webcam stream.
            player.parentElement.parentElement.classList.remove('hide');
            player.controls = false;

            // Capture audio+video stream from webcam/microphone.
            Y.M.atto_recordrtc.captureAudioVideo(commonConfig);

            // When audio+video stream is successfully captured, start recording.
            btn.mediaCapturedCallback = function() {
                Y.M.atto_recordrtc.startRecording(recType, btn.stream);
            };
        } else { // If button is displaying "Stop Recording".
            // First of all clears the countdownTicker.
            clearInterval(countdownTicker);

            // Disable "Record Again" button for 1s to allow background processing (closing streams).
            setTimeout(function() {
                btn.disabled = false;
            }, 1000);

            // Stop recording.
            Y.M.atto_recordrtc.stopRecording(btn.stream);

            // Change button to offer to record again.
            btn.textContent = M.util.get_string('recordagain', 'tinymce_recordrtc');
            if (!recordrtc.oldermoodle) {
                startStopBtn.classList.remove('btn-danger');
                startStopBtn.classList.add('btn-outline-danger');
            }
        }
    };
};

// Setup to get audio+video stream from microphone/webcam.
Y.M.atto_recordrtc.captureAudioVideo = function(config) {
    Y.M.atto_recordrtc.captureUserMedia(
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
            player.srcObject = audioVideoStream;
            player.play();

            config.onMediaCaptured(audioVideoStream);
        },

        // Error callback.
        function(error) {
            config.onMediaCapturingFailed(error);
        }
    );
};

Y.M.atto_recordrtc.stopRecording = function(stream) {
    // Stop recording microphone stream.
    mediaRecorder.stop();

    // Stop each individual MediaTrack.
    stream.getTracks().forEach(function(track) {
        track.stop();
    });

    // Set source of video player.
    var blob = new Blob(chunks);
    player.src = URL.createObjectURL(blob);

    // Enable controls for video player, and unmute.
    player.muted = false;
    player.controls = true;

    // Show upload button.
    uploadBtn.parentElement.parentElement.classList.remove('hide');
    uploadBtn.textContent = M.util.get_string('attachrecording', 'tinymce_recordrtc');
    uploadBtn.disabled = false;

    // Handle when upload button is clicked.
    uploadBtn.onclick = function() {
        // Trigger error if no recording has been made.
        if (!player.src || chunks === []) {
            return window.alert(M.util.get_string('norecordingfound', 'tinymce_recordrtc'));
        } else {
            var btn = uploadBtn;
            btn.disabled = true;

            // Upload recording to server.
            Y.M.atto_recordrtc.uploadToServer(recType, function(progress, fileURLOrError) {
                if (progress === 'ended') { // Insert annotation in text.
                    btn.disabled = false;
                    Y.M.atto_recordrtc.insert_annotation(recType, fileURLOrError);
                } else if (progress === 'upload-failed') { // Show error message in upload button.
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadfailed', 'tinymce_recordrtc') + ' ' + fileURLOrError;
                } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadfailed404', 'tinymce_recordrtc');
                } else if (progress === 'upload-aborted') {
                    btn.disabled = false;
                    btn.textContent = M.util.get_string('uploadaborted', 'tinymce_recordrtc') + ' ' + fileURLOrError;
                } else {
                    btn.textContent = progress;
                }
            });

            return undefined;
        }
    };
};


}, '@VERSION@', {"requires": []});
