// Atto recordrtc library functions.
// @package    atto_recordrtc.
// @author     Jesus Federico (jesus [at] blindsidenetworks [dt] com).
// @copyright  2016 to present, Blindside Networks Inc.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/** global: M */

M.atto_recordrtc = M.atto_recordrtc || {};

M.atto_recordrtc.commonmodule = {
    // Unitialized variables to be used by the other modules.
    player: null,
    startStopBtn: null,
    uploadBtn: null,
    countdownSeconds: null,
    countdownTicker: null,
    recType: null,
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
            window.alert(M.util.get_string('insecurealert', 'atto_recordrtc'));
            // TODO: Convert TinyMCE to Atto
            //tinyMCEPopup.close();
        }
    },

    // Display "consider switching browsers" message if not using:
    // - Firefox 29+;
    // - Chrome 49+;
    // - Opera 36+.
    check_browser: function() {
        if (!((bowser.firefox && bowser.version >= 29) ||
              (bowser.chrome && bowser.version >= 49) ||
              (bowser.opera && bowser.version >= 36))) {
            var alert = document.querySelector('div[id=alert-warning]');
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
        M.atto_recordrtc.commonmodule.blobSize += event.data.size;

        // Push recording slice to array.
        // If total size of recording so far exceeds max upload limit, stop recording.
        // An extra condition exists to avoid displaying alert twice.
        if ((M.atto_recordrtc.commonmodule.blobSize >= M.atto_recordrtc.commonmodule.maxUploadSize) && (!localStorage.getItem('alerted'))) {
            localStorage.setItem('alerted', 'true');

            M.atto_recordrtc.commonmodule.startStopBtn.click();
            window.alert(M.util.get_string('nearingmaxsize', 'atto_recordrtc'));
        } else if ((M.atto_recordrtc.commonmodule.blobSize >= M.atto_recordrtc.commonmodule.maxUploadSize) && (localStorage.getItem('alerted') === 'true')) {
            localStorage.removeItem('alerted');
        } else {
            M.atto_recordrtc.commonmodule.chunks.push(event.data);
        }
    },

    // Get everything set up to start recording.
    start_recording: function(type, stream) {
        // The options for the recording codecs and bitrates.
        var options = null;
        if (type === 'audio') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = {
                    audioBitsPerSecond: M.atto_recordrtc.params['audiobitrate'],
                    mimeType: 'audio/webm;codecs=opus'
                };
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                options = {
                    audioBitsPerSecond: M.atto_recordrtc.params['audiobitrate'],
                    mimeType: 'audio/ogg;codecs=opus'
                };
            }
        } else {
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                options = {
                    audioBitsPerSecond: M.atto_recordrtc.params['audiobitrate'],
                    videoBitsPerSecond: M.atto_recordrtc.params['videobitrate'],
                    mimeType: 'video/webm;codecs=vp9,opus'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
                options = {
                    audioBitsPerSecond: M.atto_recordrtc.params['audiobitrate'],
                    videoBitsPerSecond: M.atto_recordrtc.params['videobitrate'],
                    mimeType: 'video/webm;codecs=h264,opus'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                options = {
                    audioBitsPerSecond: M.atto_recordrtc.params['audiobitrate'],
                    videoBitsPerSecond: M.atto_recordrtc.params['videobitrate'],
                    mimeType: 'video/webm;codecs=vp8,opus'
                };
            }
        }

        // If none of the options above are supported, fall back on browser defaults.
        M.atto_recordrtc.commonmodule.mediaRecorder = options ? new MediaRecorder(stream)
                                : new MediaRecorder(stream, options);

        // Initialize MediaRecorder events and start recording.
        M.atto_recordrtc.commonmodule.mediaRecorder.ondataavailable = this.handle_data_available;
        M.atto_recordrtc.commonmodule.mediaRecorder.start(1000); // Capture in 1s chunks. Must be set to work with Firefox.

        // Mute audio, distracting while recording.
        M.atto_recordrtc.commonmodule.player.muted = true;

        // Set recording timer to the time specified in the settings.
        M.atto_recordrtc.commonmodule.countdownSeconds = M.atto_recordrtc.params['timelimit'];
        M.atto_recordrtc.commonmodule.countdownSeconds++;
        M.atto_recordrtc.commonmodule.startStopBtn.innerHTML = M.util.get_string('stoprecording', 'atto_recordrtc') + ' (<span id="minutes"></span>:<span id="seconds"></span>)';
        this.set_time();
        M.atto_recordrtc.commonmodule.countdownTicker = setInterval(this.set_time, 1000);

        // Make button clickable again, to allow stopping recording.
        M.atto_recordrtc.commonmodule.startStopBtn.disabled = false;
    },

    // Upload recorded audio/video to server.
    upload_to_server: function(type, callback) {
        var xhr = new XMLHttpRequest();

        // Get src media of audio/video tag.
        xhr.open('GET', M.atto_recordrtc.commonmodule.player.src, true);
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
                formData.append('contextid', M.atto_recordrtc.params['contextid']);
                formData.append('sesskey', M.atto_recordrtc.params['sesskey']);
                formData.append(type + '-filename', fileName);
                formData.append(type + '-blob', blob);

                // Pass FormData to PHP script using XHR.
                this.make_xmlhttprequest('save.php', formData, function(progress, responseText) {
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
        M.atto_recordrtc.commonmodule.countdownSeconds--;

        M.atto_recordrtc.commonmodule.startStopBtn.querySelector('span#seconds').textContent = this.pad(countdownSeconds % 60);
        M.atto_recordrtc.commonmodule.startStopBtn.querySelector('span#minutes').textContent = this.pad(parseInt(countdownSeconds / 60));

        if (M.atto_recordrtc.commonmodule.countdownSeconds === 0) {
            M.atto_recordrtc.commonmodule.startStopBtn.click();
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
            var annotation = '<div id="recordrtc_annotation" class="text-center"><a target="_blank" href="' + recording_url + '">' + linkText + '</a></div>';
            return annotation;
        }
    },

    // Inserts link to annotation in editor text area.
    insert_annotation: function(type, recording_url) {
        var annotation = this.create_annotation(type, recording_url);

        // Insert annotation link.
        // If user pressed "Cancel", just go back to main recording screen.
        if (!annotation) {
            M.atto_recordrtc.commonmodule.uploadBtn.textContent = M.util.get_string('attachrecording', 'atto_recordrtc');
        } else {
            // TODO: Convert TinyMCE to Atto
            //tinyMCEPopup.editor.execCommand('mceInsertContent', false, annotation);
            //tinyMCEPopup.close();
        }
    }
};
