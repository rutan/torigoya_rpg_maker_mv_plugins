//=============================================================================
// Torigoya_RetryLoad.js
//=============================================================================

/*:
 * @plugindesc [Deprecated] Retry load on error Audio, and Image.
 * @author ru_shalm
 *
 * @param Retry Max
 * @desc Retry max (default: 3)
 * @default 3
 *
 * @param Ignore Error: Audio
 * @desc Ignore error of missing audio files (true / false) (default: false)
 * @default false
 *
 * @param Ignore Error: Image
 * @desc Ignore error of missing image files (true / false) (default: false)
 * @default false
 */

/*:ja
 * @plugindesc 【非推奨】音声や画像の読み込み失敗時にリトライします
 * @author ru_shalm
 * @help
 *   このプラグインは非推奨です。
 *   後継バージョンの Torigoya_RetryLoadPlus.js をご利用ください。
 *
 * @param Retry Max
 * @desc リトライする最大回数 (default: 3)
 * @default 3
 *
 * @param Ignore Error: Audio
 * @desc 音声読み込み失敗時にエラーを無視するか？ (true / false) (default: false)
 * @default false
 *
 * @param Ignore Error: Image
 * @desc 画像読み込み失敗時にエラーを無視するか？ (true / false) (default: false)
 * @default false
 */

(function (global) {
    var settings = PluginManager.parameters('Torigoya_RetryLoad');
    var RetryLoad = {
        retryMax: Number(settings['Retry Max'] || 3),
        ignoreAudioError: (settings['Ignore Error: Audio'] || 'false') !== 'false',
        ignoreImageError: (settings['Ignore Error: Image'] || 'false') !== 'false',
        onError: null
    };

    // WebAudio
    WebAudio.prototype._load = function (url) {
        if (!WebAudio._context) return;

        var self = this;
        var count = 0;
        var request = function () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                if (xhr.status < 400) {
                    self._onXhrLoad(xhr);
                }
            };
            xhr.onerror = function () {
                console.error('load failed (' + (count + 1) + ' times):' + url);
                if (count < RetryLoad.retryMax) {
                    count++;
                    setTimeout(function () {
                        request();
                    }, count * 1000);
                } else {
                    if (RetryLoad.ignoreAudioError) {
                        console.error('missing files:' + url);
                    } else {
                        self._hasError = true;
                    }
                    if (RetryLoad.onError) {
                        RetryLoad.onError(url);
                    }
                }
            };
            xhr.send();
        };
        request();
    };

    // HTML5Audio
    Html5Audio._onError = function () {
        var self = this;
        this.torigoya_retry = (this.torigoya_retry || 0);
        if (this.torigoya_retry < RetryLoad.retryMax) {
            this.torigoya_retry++;
            setTimeout(function () {
                self._load(self.url);
            }, this.torigoya_retry * 1000);
        } else {
            if (RetryLoad.ignoreAudioError) {
                console.error('missing files:' + self.url);
                self.torigoya_retry = 0;
                self._isLoading = false;
            } else {
                self._hasError = true;
            }
            if (RetryLoad.onError) {
                RetryLoad.onError(self.url);
            }
        }
    };

    // Bitmap
    Bitmap.prototype._onError = function() {
        var self = this;
        this.torigoya_retry = (this.torigoya_retry || 0);
        if (this.torigoya_retry < RetryLoad.retryMax) {
            this.torigoya_retry++;
            setTimeout(function () {
                self._image.src = self.url;
            }, this.torigoya_retry * 1000);
        } else {
            if (RetryLoad.ignoreImageError) {
                console.error('missing files:' + self.url);
                self.torigoya_retry = 0;
                self._isLoading = false;
            } else {
                self._hasError = true;
            }
            if (RetryLoad.onError) {
                RetryLoad.onError(self.url);
            }
        }
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.RetryLoad = RetryLoad;
})(this);
