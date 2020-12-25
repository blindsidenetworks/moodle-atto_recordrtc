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

// ESLint directives.
/* eslint-disable camelcase, no-alert, spaced-comment, no-bitwise */

// JSHint directives.
/*global M */
/*jshint es5: true */
/*jshint onevar: false */
/*jshint shadow: true */

// Scrutinizer CI directives.
/** global: M */
/** global: Y */

M.atto_recordrtc = M.atto_recordrtc || {};

// Shorten access to M.atto_recordrtc.commonmodule namespace.
var cm = M.atto_recordrtc.commonmodule,
    am = M.atto_recordrtc.abstractmodule;

(function (name, definition) {
                window.ysFixWebmDuration = definition();
        })('fix-webm-duration', function () {
            /*
             * This is the list of possible WEBM file sections by their IDs.
             * Possible types: Container, Binary, Uint, Int, String, Float, Date
             */
            var sections = {
                0xa45dfa3: { name: 'EBML', type: 'Container' },
                0x286: { name: 'EBMLVersion', type: 'Uint' },
                0x2f7: { name: 'EBMLReadVersion', type: 'Uint' },
                0x2f2: { name: 'EBMLMaxIDLength', type: 'Uint' },
                0x2f3: { name: 'EBMLMaxSizeLength', type: 'Uint' },
                0x282: { name: 'DocType', type: 'String' },
                0x287: { name: 'DocTypeVersion', type: 'Uint' },
                0x285: { name: 'DocTypeReadVersion', type: 'Uint' },
                0x6c: { name: 'Void', type: 'Binary' },
                0x3f: { name: 'CRC-32', type: 'Binary' },
                0xb538667: { name: 'SignatureSlot', type: 'Container' },
                0x3e8a: { name: 'SignatureAlgo', type: 'Uint' },
                0x3e9a: { name: 'SignatureHash', type: 'Uint' },
                0x3ea5: { name: 'SignaturePublicKey', type: 'Binary' },
                0x3eb5: { name: 'Signature', type: 'Binary' },
                0x3e5b: { name: 'SignatureElements', type: 'Container' },
                0x3e7b: { name: 'SignatureElementList', type: 'Container' },
                0x2532: { name: 'SignedElement', type: 'Binary' },
                0x8538067: { name: 'Segment', type: 'Container' },
                0x14d9b74: { name: 'SeekHead', type: 'Container' },
                0xdbb: { name: 'Seek', type: 'Container' },
                0x13ab: { name: 'SeekID', type: 'Binary' },
                0x13ac: { name: 'SeekPosition', type: 'Uint' },
                0x549a966: { name: 'Info', type: 'Container' },
                0x33a4: { name: 'SegmentUID', type: 'Binary' },
                0x3384: { name: 'SegmentFilename', type: 'String' },
                0x1cb923: { name: 'PrevUID', type: 'Binary' },
                0x1c83ab: { name: 'PrevFilename', type: 'String' },
                0x1eb923: { name: 'NextUID', type: 'Binary' },
                0x1e83bb: { name: 'NextFilename', type: 'String' },
                0x444: { name: 'SegmentFamily', type: 'Binary' },
                0x2924: { name: 'ChapterTranslate', type: 'Container' },
                0x29fc: { name: 'ChapterTranslateEditionUID', type: 'Uint' },
                0x29bf: { name: 'ChapterTranslateCodec', type: 'Uint' },
                0x29a5: { name: 'ChapterTranslateID', type: 'Binary' },
                0xad7b1: { name: 'TimecodeScale', type: 'Uint' },
                0x489: { name: 'Duration', type: 'Float' },
                0x461: { name: 'DateUTC', type: 'Date' },
                0x3ba9: { name: 'Title', type: 'String' },
                0xd80: { name: 'MuxingApp', type: 'String' },
                0x1741: { name: 'WritingApp', type: 'String' },
                // 0xf43b675: { name: 'Cluster', type: 'Container' },
                0x67: { name: 'Timecode', type: 'Uint' },
                0x1854: { name: 'SilentTracks', type: 'Container' },
                0x18d7: { name: 'SilentTrackNumber', type: 'Uint' },
                0x27: { name: 'Position', type: 'Uint' },
                0x2b: { name: 'PrevSize', type: 'Uint' },
                0x23: { name: 'SimpleBlock', type: 'Binary' },
                0x20: { name: 'BlockGroup', type: 'Container' },
                0x21: { name: 'Block', type: 'Binary' },
                0x22: { name: 'BlockVirtual', type: 'Binary' },
                0x35a1: { name: 'BlockAdditions', type: 'Container' },
                0x26: { name: 'BlockMore', type: 'Container' },
                0x6e: { name: 'BlockAddID', type: 'Uint' },
                0x25: { name: 'BlockAdditional', type: 'Binary' },
                0x1b: { name: 'BlockDuration', type: 'Uint' },
                0x7a: { name: 'ReferencePriority', type: 'Uint' },
                0x7b: { name: 'ReferenceBlock', type: 'Int' },
                0x7d: { name: 'ReferenceVirtual', type: 'Int' },
                0x24: { name: 'CodecState', type: 'Binary' },
                0x35a2: { name: 'DiscardPadding', type: 'Int' },
                0xe: { name: 'Slices', type: 'Container' },
                0x68: { name: 'TimeSlice', type: 'Container' },
                0x4c: { name: 'LaceNumber', type: 'Uint' },
                0x4d: { name: 'FrameNumber', type: 'Uint' },
                0x4b: { name: 'BlockAdditionID', type: 'Uint' },
                0x4e: { name: 'Delay', type: 'Uint' },
                0x4f: { name: 'SliceDuration', type: 'Uint' },
                0x48: { name: 'ReferenceFrame', type: 'Container' },
                0x49: { name: 'ReferenceOffset', type: 'Uint' },
                0x4a: { name: 'ReferenceTimeCode', type: 'Uint' },
                0x2f: { name: 'EncryptedBlock', type: 'Binary' },
                0x654ae6b: { name: 'Tracks', type: 'Container' },
                0x2e: { name: 'TrackEntry', type: 'Container' },
                0x57: { name: 'TrackNumber', type: 'Uint' },
                0x33c5: { name: 'TrackUID', type: 'Uint' },
                0x3: { name: 'TrackType', type: 'Uint' },
                0x39: { name: 'FlagEnabled', type: 'Uint' },
                0x8: { name: 'FlagDefault', type: 'Uint' },
                0x15aa: { name: 'FlagForced', type: 'Uint' },
                0x1c: { name: 'FlagLacing', type: 'Uint' },
                0x2de7: { name: 'MinCache', type: 'Uint' },
                0x2df8: { name: 'MaxCache', type: 'Uint' },
                0x3e383: { name: 'DefaultDuration', type: 'Uint' },
                0x34e7a: { name: 'DefaultDecodedFieldDuration', type: 'Uint' },
                0x3314f: { name: 'TrackTimecodeScale', type: 'Float' },
                0x137f: { name: 'TrackOffset', type: 'Int' },
                0x15ee: { name: 'MaxBlockAdditionID', type: 'Uint' },
                0x136e: { name: 'Name', type: 'String' },
                0x2b59c: { name: 'Language', type: 'String' },
                0x6: { name: 'CodecID', type: 'String' },
                0x23a2: { name: 'CodecPrivate', type: 'Binary' },
                0x58688: { name: 'CodecName', type: 'String' },
                0x3446: { name: 'AttachmentLink', type: 'Uint' },
                0x1a9697: { name: 'CodecSettings', type: 'String' },
                0x1b4040: { name: 'CodecInfoURL', type: 'String' },
                0x6b240: { name: 'CodecDownloadURL', type: 'String' },
                0x2a: { name: 'CodecDecodeAll', type: 'Uint' },
                0x2fab: { name: 'TrackOverlay', type: 'Uint' },
                0x16aa: { name: 'CodecDelay', type: 'Uint' },
                0x16bb: { name: 'SeekPreRoll', type: 'Uint' },
                0x2624: { name: 'TrackTranslate', type: 'Container' },
                0x26fc: { name: 'TrackTranslateEditionUID', type: 'Uint' },
                0x26bf: { name: 'TrackTranslateCodec', type: 'Uint' },
                0x26a5: { name: 'TrackTranslateTrackID', type: 'Binary' },
                0x60: { name: 'Video', type: 'Container' },
                0x1a: { name: 'FlagInterlaced', type: 'Uint' },
                0x13b8: { name: 'StereoMode', type: 'Uint' },
                0x13c0: { name: 'AlphaMode', type: 'Uint' },
                0x13b9: { name: 'OldStereoMode', type: 'Uint' },
                0x30: { name: 'PixelWidth', type: 'Uint' },
                0x3a: { name: 'PixelHeight', type: 'Uint' },
                0x14aa: { name: 'PixelCropBottom', type: 'Uint' },
                0x14bb: { name: 'PixelCropTop', type: 'Uint' },
                0x14cc: { name: 'PixelCropLeft', type: 'Uint' },
                0x14dd: { name: 'PixelCropRight', type: 'Uint' },
                0x14b0: { name: 'DisplayWidth', type: 'Uint' },
                0x14ba: { name: 'DisplayHeight', type: 'Uint' },
                0x14b2: { name: 'DisplayUnit', type: 'Uint' },
                0x14b3: { name: 'AspectRatioType', type: 'Uint' },
                0xeb524: { name: 'ColourSpace', type: 'Binary' },
                0xfb523: { name: 'GammaValue', type: 'Float' },
                0x383e3: { name: 'FrameRate', type: 'Float' },
                0x61: { name: 'Audio', type: 'Container' },
                0x35: { name: 'SamplingFrequency', type: 'Float' },
                0x38b5: { name: 'OutputSamplingFrequency', type: 'Float' },
                0x1f: { name: 'Channels', type: 'Uint' },
                0x3d7b: { name: 'ChannelPositions', type: 'Binary' },
                0x2264: { name: 'BitDepth', type: 'Uint' },
                0x62: { name: 'TrackOperation', type: 'Container' },
                0x63: { name: 'TrackCombinePlanes', type: 'Container' },
                0x64: { name: 'TrackPlane', type: 'Container' },
                0x65: { name: 'TrackPlaneUID', type: 'Uint' },
                0x66: { name: 'TrackPlaneType', type: 'Uint' },
                0x69: { name: 'TrackJoinBlocks', type: 'Container' },
                0x6d: { name: 'TrackJoinUID', type: 'Uint' },
                0x40: { name: 'TrickTrackUID', type: 'Uint' },
                0x41: { name: 'TrickTrackSegmentUID', type: 'Binary' },
                0x46: { name: 'TrickTrackFlag', type: 'Uint' },
                0x47: { name: 'TrickMasterTrackUID', type: 'Uint' },
                0x44: { name: 'TrickMasterTrackSegmentUID', type: 'Binary' },
                0x2d80: { name: 'ContentEncodings', type: 'Container' },
                0x2240: { name: 'ContentEncoding', type: 'Container' },
                0x1031: { name: 'ContentEncodingOrder', type: 'Uint' },
                0x1032: { name: 'ContentEncodingScope', type: 'Uint' },
                0x1033: { name: 'ContentEncodingType', type: 'Uint' },
                0x1034: { name: 'ContentCompression', type: 'Container' },
                0x254: { name: 'ContentCompAlgo', type: 'Uint' },
                0x255: { name: 'ContentCompSettings', type: 'Binary' },
                0x1035: { name: 'ContentEncryption', type: 'Container' },
                0x7e1: { name: 'ContentEncAlgo', type: 'Uint' },
                0x7e2: { name: 'ContentEncKeyID', type: 'Binary' },
                0x7e3: { name: 'ContentSignature', type: 'Binary' },
                0x7e4: { name: 'ContentSigKeyID', type: 'Binary' },
                0x7e5: { name: 'ContentSigAlgo', type: 'Uint' },
                0x7e6: { name: 'ContentSigHashAlgo', type: 'Uint' },
                0xc53bb6b: { name: 'Cues', type: 'Container' },
                0x3b: { name: 'CuePoint', type: 'Container' },
                0x33: { name: 'CueTime', type: 'Uint' },
                0x37: { name: 'CueTrackPositions', type: 'Container' },
                0x77: { name: 'CueTrack', type: 'Uint' },
                0x71: { name: 'CueClusterPosition', type: 'Uint' },
                0x70: { name: 'CueRelativePosition', type: 'Uint' },
                0x32: { name: 'CueDuration', type: 'Uint' },
                0x1378: { name: 'CueBlockNumber', type: 'Uint' },
                0x6a: { name: 'CueCodecState', type: 'Uint' },
                0x5b: { name: 'CueReference', type: 'Container' },
                0x16: { name: 'CueRefTime', type: 'Uint' },
                0x17: { name: 'CueRefCluster', type: 'Uint' },
                0x135f: { name: 'CueRefNumber', type: 'Uint' },
                0x6b: { name: 'CueRefCodecState', type: 'Uint' },
                0x941a469: { name: 'Attachments', type: 'Container' },
                0x21a7: { name: 'AttachedFile', type: 'Container' },
                0x67e: { name: 'FileDescription', type: 'String' },
                0x66e: { name: 'FileName', type: 'String' },
                0x660: { name: 'FileMimeType', type: 'String' },
                0x65c: { name: 'FileData', type: 'Binary' },
                0x6ae: { name: 'FileUID', type: 'Uint' },
                0x675: { name: 'FileReferral', type: 'Binary' },
                0x661: { name: 'FileUsedStartTime', type: 'Uint' },
                0x662: { name: 'FileUsedEndTime', type: 'Uint' },
                0x43a770: { name: 'Chapters', type: 'Container' },
                0x5b9: { name: 'EditionEntry', type: 'Container' },
                0x5bc: { name: 'EditionUID', type: 'Uint' },
                0x5bd: { name: 'EditionFlagHidden', type: 'Uint' },
                0x5db: { name: 'EditionFlagDefault', type: 'Uint' },
                0x5dd: { name: 'EditionFlagOrdered', type: 'Uint' },
                0x36: { name: 'ChapterAtom', type: 'Container' },
                0x33c4: { name: 'ChapterUID', type: 'Uint' },
                0x1654: { name: 'ChapterStringUID', type: 'String' },
                0x11: { name: 'ChapterTimeStart', type: 'Uint' },
                0x12: { name: 'ChapterTimeEnd', type: 'Uint' },
                0x18: { name: 'ChapterFlagHidden', type: 'Uint' },
                0x598: { name: 'ChapterFlagEnabled', type: 'Uint' },
                0x2e67: { name: 'ChapterSegmentUID', type: 'Binary' },
                0x2ebc: { name: 'ChapterSegmentEditionUID', type: 'Uint' },
                0x23c3: { name: 'ChapterPhysicalEquiv', type: 'Uint' },
                0xf: { name: 'ChapterTrack', type: 'Container' },
                0x9: { name: 'ChapterTrackNumber', type: 'Uint' },
                0x0: { name: 'ChapterDisplay', type: 'Container' },
                0x5: { name: 'ChapString', type: 'String' },
                0x37c: { name: 'ChapLanguage', type: 'String' },
                0x37e: { name: 'ChapCountry', type: 'String' },
                0x2944: { name: 'ChapProcess', type: 'Container' },
                0x2955: { name: 'ChapProcessCodecID', type: 'Uint' },
                0x50d: { name: 'ChapProcessPrivate', type: 'Binary' },
                0x2911: { name: 'ChapProcessCommand', type: 'Container' },
                0x2922: { name: 'ChapProcessTime', type: 'Uint' },
                0x2933: { name: 'ChapProcessData', type: 'Binary' },
                0x254c367: { name: 'Tags', type: 'Container' },
                0x3373: { name: 'Tag', type: 'Container' },
                0x23c0: { name: 'Targets', type: 'Container' },
                0x28ca: { name: 'TargetTypeValue', type: 'Uint' },
                0x23ca: { name: 'TargetType', type: 'String' },
                0x23c5: { name: 'TagTrackUID', type: 'Uint' },
                0x23c9: { name: 'TagEditionUID', type: 'Uint' },
                0x23c4: { name: 'TagChapterUID', type: 'Uint' },
                0x23c6: { name: 'TagAttachmentUID', type: 'Uint' },
                0x27c8: { name: 'SimpleTag', type: 'Container' },
                0x5a3: { name: 'TagName', type: 'String' },
                0x47a: { name: 'TagLanguage', type: 'String' },
                0x484: { name: 'TagDefault', type: 'Uint' },
                0x487: { name: 'TagString', type: 'String' },
                0x485: { name: 'TagBinary', type: 'Binary' }
            };

            function doInherit(newClass, baseClass) {
                newClass.prototype = Object.create(baseClass.prototype);
                newClass.prototype.constructor = newClass;
            }

            function WebmBase(name, type) {
                this.name = name || 'Unknown';
                this.type = type || 'Unknown';
            }
            WebmBase.prototype.updateBySource = function() { };
            WebmBase.prototype.setSource = function(source) {
                this.source = source;
                this.updateBySource();
            };
            WebmBase.prototype.updateByData = function() { };
            WebmBase.prototype.setData = function(data) {
                this.data = data;
                this.updateByData();
            };

            function WebmUint(name, type) {
                WebmBase.call(this, name, type || 'Uint');
            }
            doInherit(WebmUint, WebmBase);
            function padHex(hex) {
                return hex.length % 2 === 1 ? '0' + hex : hex;
            }
            WebmUint.prototype.updateBySource = function() {
                // use hex representation of a number instead of number value
                this.data = '';
                for (var i = 0; i < this.source.length; i++) {
                    var hex = this.source[i].toString(16);
                    this.data += padHex(hex);
                }
            };
            WebmUint.prototype.updateByData = function() {
                var length = this.data.length / 2;
                this.source = new Uint8Array(length);
                for (var i = 0; i < length; i++) {
                    var hex = this.data.substr(i * 2, 2);
                    this.source[i] = parseInt(hex, 16);
                }
            };
            WebmUint.prototype.getValue = function() {
                return parseInt(this.data, 16);
            };
            WebmUint.prototype.setValue = function(value) {
                this.setData(padHex(value.toString(16)));
            };

            function WebmFloat(name, type) {
                WebmBase.call(this, name, type || 'Float');
            }
            doInherit(WebmFloat, WebmBase);
            WebmFloat.prototype.getFloatArrayType = function() {
                return this.source && this.source.length === 4 ? Float32Array : Float64Array;
            };
            WebmFloat.prototype.updateBySource = function() {
                var byteArray = this.source.reverse();
                var floatArrayType = this.getFloatArrayType();
                var floatArray = new floatArrayType(byteArray.buffer);
                this.data = floatArray[0];
            };
            WebmFloat.prototype.updateByData = function() {
                var floatArrayType = this.getFloatArrayType();
                var floatArray = new floatArrayType([ this.data ]);
                var byteArray = new Uint8Array(floatArray.buffer);
                this.source = byteArray.reverse();
            };
            WebmFloat.prototype.getValue = function() {
                return this.data;
            };
            WebmFloat.prototype.setValue = function(value) {
                this.setData(value);
            };

            function WebmContainer(name, type) {
                WebmBase.call(this, name, type || 'Container');
            }
            doInherit(WebmContainer, WebmBase);
            WebmContainer.prototype.readByte = function() {
                return this.source[this.offset++];
            };
            WebmContainer.prototype.readUint = function() {
                var firstByte = this.readByte();
                var bytes = 8 - firstByte.toString(2).length;
                var value = firstByte - (1 << (7 - bytes));
                for (var i = 0; i < bytes; i++) {
                    // don't use bit operators to support x86
                    value *= 256;
                    value += this.readByte();
                }
                return value;
            };
            WebmContainer.prototype.updateBySource = function() {
                this.data = [];
                for (this.offset = 0; this.offset < this.source.length; this.offset = end) {
                    var id = this.readUint();
                    var len = this.readUint();
                    var end = Math.min(this.offset + len, this.source.length);
                    var data = this.source.slice(this.offset, end);

                    var info = sections[id] || { name: 'Unknown', type: 'Unknown' };
                    var ctr = WebmBase;
                    switch (info.type) {
                        case 'Container':
                            ctr = WebmContainer;
                            break;
                        case 'Uint':
                            ctr = WebmUint;
                            break;
                        case 'Float':
                            ctr = WebmFloat;
                            break;
                    }
                    var section = new ctr(info.name, info.type);
                    section.setSource(data);
                    this.data.push({
                        id: id,
                        idHex: id.toString(16),
                        data: section
                    });
                }
            };
            WebmContainer.prototype.writeUint = function(x, draft) {
                for (var bytes = 1, flag = 0x80; x >= flag && bytes < 8; bytes++, flag *= 0x80) { }

                if (!draft) {
                    var value = flag + x;
                    for (var i = bytes - 1; i >= 0; i--) {
                        // don't use bit operators to support x86
                        var c = value % 256;
                        this.source[this.offset + i] = c;
                        value = (value - c) / 256;
                    }
                }

                this.offset += bytes;
            };
            WebmContainer.prototype.writeSections = function(draft) {
                this.offset = 0;
                for (var i = 0; i < this.data.length; i++) {
                    var section = this.data[i],
                        content = section.data.source,
                        contentLength = content.length;
                    this.writeUint(section.id, draft);
                    this.writeUint(contentLength, draft);
                    if (!draft) {
                        this.source.set(content, this.offset);
                    }
                    this.offset += contentLength;
                }
                return this.offset;
            };
            WebmContainer.prototype.updateByData = function() {
                // run without accessing this.source to determine total length - need to know it to create Uint8Array
                var length = this.writeSections('draft');
                this.source = new Uint8Array(length);
                // now really write data
                this.writeSections();
            };
            WebmContainer.prototype.getSectionById = function(id) {
                for (var i = 0; i < this.data.length; i++) {
                    var section = this.data[i];
                    if (section.id === id) {
                        return section.data;
                    }
                }
                return null;
            };

            function WebmFile(source) {
                WebmContainer.call(this, 'File', 'File');
                this.setSource(source);
            }
            doInherit(WebmFile, WebmContainer);
            WebmFile.prototype.fixDuration = function(duration) {
                var segmentSection = this.getSectionById(0x8538067);
                if (!segmentSection) {
                    window.console.log('[fix-webm-duration] Segment section is missing');
                    return false;
                }

                var infoSection = segmentSection.getSectionById(0x549a966);
                if (!infoSection) {
                    window.console.log('[fix-webm-duration] Info section is missing');
                    return false;
                }

                var timeScaleSection = infoSection.getSectionById(0xad7b1);
                if (!timeScaleSection) {
                    window.console.log('[fix-webm-duration] TimecodeScale section is missing');
                    return false;
                }

                var durationSection = infoSection.getSectionById(0x489);
                if (durationSection) {
                    if (durationSection.getValue() <= 0) {
                        window.console.log('[fix-webm-duration] Duration section is present, but the value is empty');
                        durationSection.setValue(duration);
                    } else {
                        window.console.log('[fix-webm-duration] Duration section is present');
                        return false;
                    }
                } else {
                    window.console.log('[fix-webm-duration] Duration section is missing');
                    // append Duration section
                    durationSection = new WebmFloat('Duration', 'Float');
                    durationSection.setValue(duration);
                    infoSection.data.push({
                        id: 0x489,
                        data: durationSection
                    });
                }

                // set default time scale to 1 millisecond (1000000 nanoseconds)
                timeScaleSection.setValue(1000000);
                infoSection.updateByData();
                segmentSection.updateByData();
                this.updateByData();

                return true;
            };
            WebmFile.prototype.toBlob = function() {
                return new Blob([ this.source.buffer ], { type: 'audio/webm' });
            };

            return function(blob, duration, callback) {
                try {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        try {
                            var file = new WebmFile(new Uint8Array(reader.result));
                            if (file.fixDuration(duration)) {
                                blob = file.toBlob();
                            }
                        } catch (ex) {
                            // ignore
                        }
                        callback(blob);
                    };
                    reader.readAsArrayBuffer(blob);
                } catch (ex) {
                    callback(blob);
                }
            };
        });

M.atto_recordrtc.commonmodule = {
    // Unitialized variables to be used by the other modules.
    editorScope: null,
    alertWarning: null,
    alertDanger: null,
    player: null,
    playerDOM: null, // Used to manipulate DOM directly.
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
    recordStartTime: null,
    recordStopTime: null,

    // Capture webcam/microphone stream.
    capture_user_media: function(mediaConstraints, successCallback, errorCallback) {
        window.navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    },

    // Add chunks of audio/video to array when made available.
    handle_data_available: function(event) {
        // Push recording slice to array.
        cm.chunks.push(event.data);
        // Size of all recorded data so far.
        cm.blobSize += event.data.size;

        // If total size of recording so far exceeds max upload limit, stop recording.
        // An extra condition exists to avoid displaying alert twice.
        if (cm.blobSize >= cm.maxUploadSize) {
            if (!window.localStorage.getItem('alerted')) {
                window.localStorage.setItem('alerted', 'true');

                cm.startStopBtn.simulate('click');
                am.show_alert('nearingmaxsize');
            } else {
                window.localStorage.removeItem('alerted');
            }

            cm.chunks.pop();
        }
    },
    // Handle recording end.
    handle_stop: function() {
      cm.recordStopTime = Date.now();
      // Set source of audio player.
      var rawBlob = new window.Blob(cm.chunks, {type: cm.mediaRecorder.mimeType});
      ysFixWebmDuration(rawBlob, /* eslint-disable-line no-undef */
        (cm.recordStopTime - cm.recordStartTime),
        function(fixedBlob) {
          cm.handle_stop_callback(fixedBlob);
      });
    },
    // Callback for fixed blob header.
    // Handle recording end.
    handle_stop_callback: function(fixedBlob) {

        cm.player.set('srcObject', null);
        cm.player.set('src', window.URL.createObjectURL(fixedBlob));

        // Show audio player with controls enabled, and unmute.
        cm.player.set('muted', false);
        cm.player.set('controls', true);
        cm.player.ancestor().ancestor().removeClass('hide');

        // Show upload button.
        cm.uploadBtn.ancestor().ancestor().removeClass('hide');
        cm.uploadBtn.set('textContent', M.util.get_string('attachrecording', 'atto_recordrtc'));
        cm.uploadBtn.set('disabled', false);

        // Get dialogue centered.
        cm.editorScope.getDialogue().centered();

        // Handle when upload button is clicked.
        cm.uploadBtn.on('click', function() {
            // Trigger error if no recording has been made.
            if (cm.chunks.length === 0) {
                am.show_alert('norecordingfound');
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
    },

    // Get everything set up to start recording.
    start_recording: function(type, stream) {
        // The options for the recording codecs and bitrates.
        var options = am.select_rec_options(type);
        cm.mediaRecorder = new window.MediaRecorder(stream, options);

        // Initialize MediaRecorder events and start recording.
        cm.mediaRecorder.ondataavailable = cm.handle_data_available;
        cm.mediaRecorder.onstop = cm.handle_stop;
        cm.recordStartTime = Date.now();
        cm.mediaRecorder.start(1000); // Capture in 1s chunks. Must be set to work with Firefox.

        // Mute audio, distracting while recording.
        cm.player.set('muted', true);

        // Set recording timer to the time specified in the settings.
        cm.countdownSeconds = cm.editorScope.get('timelimit');
        cm.countdownSeconds++;
        var timerText = M.util.get_string('stoprecording', 'atto_recordrtc');
        timerText += ' (<span id="minutes"></span>:<span id="seconds"></span>)';
        cm.startStopBtn.setHTML(timerText);
        cm.set_time();
        cm.countdownTicker = window.setInterval(cm.set_time, 1000);

        // Make button clickable again, to allow stopping recording.
        cm.startStopBtn.set('disabled', false);
    },

    // Get everything set up to stop recording.
    stop_recording: function(stream) {
        // Stop recording stream.
        cm.mediaRecorder.stop();

        // Stop each individual MediaTrack.
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
    },

    // Upload recorded audio/video to server.
    upload_to_server: function(type, callback) {
        var xhr = new window.XMLHttpRequest();

        // Get src media of audio/video tag.
        xhr.open('GET', cm.player.get('src'), true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) { // If src media was successfully retrieved.
                // blob is now the media that the audio/video tag's src pointed to.
                var blob = this.response;

                // Generate filename with random ID and file extension.
                var fileName = (Math.random() * 1000).toString().replace('.', '');
                fileName += (type === 'audio') ? '-audio.ogg'
                                               : '-video.webm';

                // Create FormData to send to PHP filepicker-upload script.
                var formData = new window.FormData(),
                    filepickerOptions = cm.editorScope.get('host').get('filepickeroptions').link,
                    repositoryKeys = window.Object.keys(filepickerOptions.repositories);

                formData.append('repo_upload_file', blob, fileName);
                formData.append('itemid', filepickerOptions.itemid);

                for (var i = 0; i < repositoryKeys.length; i++) {
                    if (filepickerOptions.repositories[repositoryKeys[i]].type === 'upload') {
                        formData.append('repo_id', filepickerOptions.repositories[repositoryKeys[i]].id);
                        break;
                    }
                }

                formData.append('env', filepickerOptions.env);
                formData.append('sesskey', M.cfg.sesskey);
                formData.append('client_id', filepickerOptions.client_id);
                formData.append('savepath', '/');
                formData.append('ctx_id', filepickerOptions.context.id);

                // Pass FormData to PHP script using XHR.
                var uploadEndpoint = M.cfg.wwwroot + '/repository/repository_ajax.php?action=upload';
                cm.make_xmlhttprequest(uploadEndpoint, formData,
                    function(progress, responseText) {
                        if (progress === 'upload-ended') {
                            callback('ended', window.JSON.parse(responseText).url);
                        } else {
                            callback(progress);
                        }
                    }
                );
            }
        };

        xhr.send();
    },

    // Handle XHR sending/receiving/status.
    make_xmlhttprequest: function(url, data, callback) {
        var xhr = new window.XMLHttpRequest();

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

        cm.startStopBtn.one('span#seconds').set('textContent', cm.pad(cm.countdownSeconds % 60));
        cm.startStopBtn.one('span#minutes').set('textContent', cm.pad(window.parseInt(cm.countdownSeconds / 60, 10)));

        if (cm.countdownSeconds === 0) {
            cm.startStopBtn.simulate('click');
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
            cm.uploadBtn.set('textContent', M.util.get_string('attachrecording', 'atto_recordrtc'));
        } else {
            cm.editorScope.setLink(cm.editorScope, annotation);
        }
    }
};
