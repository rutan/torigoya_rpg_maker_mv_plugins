/*---------------------------------------------------------------------------*
 * Torigoya_RetryLoadPlus.js
 *---------------------------------------------------------------------------*
 * 2016/11/27 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc Retry loading the file, when file loading fails.
 * @author ru_shalm
 *
 * @param Retry Max
 * @desc Retry max (default: 3)
 * @default 3
 *
 * @param Retry Message Text
 * @desc Retry screen message
 * @default Failed to load file. Please retry.
 *
 * @param Retry Button Text
 * @desc Retry button message
 * @default Retry
 */

/*:ja
 * @plugindesc ファイルの読み込み失敗時にリトライします
 * @author ru_shalm
 * @help
 *   音声や画像の読み込み失敗時にリトライを実行します。
 *   リトライしてもダメだったときは、再読込表示、または無視することができます。
 *
 * @param Retry Max
 * @desc リトライする最大回数 (default: 3)
 * @default 3
 *
 * @param Retry Message Text
 * @desc リトライ画面に表示する文章
 * @default ファイルの読み込みに失敗しました。\nネットワーク状況を確認して、リトライしてください。
 *
 * @param Retry Button Text
 * @desc リトライ画面に表示するボタン
 * @default リトライする
 */

(function (global) {
    'use strict';

    var RetryLoadPlus = {
        name: 'Torigoya_RetryLoadPlus'
    };

    RetryLoadPlus.settings = (function () {
        var parameters = PluginManager.parameters(RetryLoadPlus.name);
        return {
            retryMax: Number(parameters['Retry Max'] || 3),
            errorMessageText: (parameters['Retry Message Text'] || '').replace('\\n', '\n'),
            errorButtonText: (parameters['Retry Button Text'] || '')
        };
    })();

    // -------------------------------------------------------------------------
    // JSON Loader

    function JSONLoader() {
        this.initialize.apply(this, arguments);
    }

    JSONLoader.prototype.constructor = JSONLoader;

    JSONLoader.prototype.initialize = function (name) {
        this._name = name;
    };

    JSONLoader.prototype.torigoya_retryFailed = function () {
        if (this.onerror) this.onerror();
    };

    JSONLoader.prototype.load = function (url) {
        this.url = url;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = function () {
            if (xhr.status < 400) this.onload(xhr);
        }.bind(this);
        xhr.onerror = function () {
            this.torigoya_challengeRetryLoad();
        }.bind(this);
        xhr.send();
    };

    JSONLoader.prototype.torigoya_startRetryLoad = JSONLoader.prototype.load;

    // -------------------------------------------------------------------------
    // Reload Function

    function challengeRetryLoad(resetCount) {
        this._torigoya_retryCount =
            resetCount ? 0 : (this._torigoya_retryCount || 0) + 1;
        this.torigoya_retryLoadError = false;

        if (this._torigoya_retryCount < RetryLoadPlus.settings.retryMax) {
            setTimeout(function () {
                var url = this._torigoya_retryURL || this.url;
                if (this.torigoya_startRetryLoad) {
                    this.torigoya_startRetryLoad(url);
                } else if (this._load) {
                    this._load(url);
                } else {
                    throw 'undefined';
                }
            }.bind(this), 1000 * this._torigoya_retryCount);
        } else if (this.torigoya_retryFailed) {
            this.torigoya_retryFailed();
        } else {
            // エラー表示(default)
            this._hasError = true;
        }
    }

    function resetLoading() {
        this._isLoading = false;
    }

    Html5Audio.torigoya_challengeRetryLoad = challengeRetryLoad;
    Html5Audio.torigoya_retryFailed = resetLoading;
    WebAudio.prototype.torigoya_challengeRetryLoad = challengeRetryLoad;
    WebAudio.prototype.torigoya_retryFailed = resetLoading;

    Bitmap.prototype.torigoya_challengeRetryLoad = challengeRetryLoad;
    Bitmap.prototype.torigoya_retryFailed = function () {
        this.torigoya_retryLoadError = true;
    };

    JSONLoader.prototype.torigoya_challengeRetryLoad = challengeRetryLoad;

    // -------------------------------------------------------------------------
    // WebAudio

    WebAudio.prototype._load = function (url) {
        if (WebAudio._context) {
            var xhr = new XMLHttpRequest();
            if (Decrypter.hasEncryptedAudio) url = Decrypter.extToEncryptExt(url);
            this._torigoya_retryURL = url; // 追加
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                if (xhr.status < 400) {
                    this._onXhrLoad(xhr);
                }
            }.bind(this);
            xhr.onerror = function () {
                this.torigoya_challengeRetryLoad(); // 変更
            }.bind(this);
            xhr.send();
        }
    };

    // -------------------------------------------------------------------------
    // HTML5Audio

    Html5Audio._onError = function () {
        this.torigoya_challengeRetryLoad();
    };

    // -------------------------------------------------------------------------
    // Bitmap

    Bitmap.prototype._onError = function () {
        this.torigoya_challengeRetryLoad();
    };

    Bitmap.prototype.torigoya_startRetryLoad = function (url) {
        this._image.src = url;
    };

    var upstream_ImageManager_isReady = ImageManager.isReady;
    ImageManager.isReady = function () {
        for (var key in this.cache._inner) {
            var bitmap = this.cache._inner[key].item;
            if (bitmap.torigoya_retryLoadError) {
                RetryManager.add(bitmap);
            }
        }
        return upstream_ImageManager_isReady.apply(this);
    };

    // -------------------------------------------------------------------------
    // JSON

    DataManager.torigoya_retryLoadErrors = [];

    DataManager.loadDataFile = function (name, src) {
        window[name] = null;

        var loader = new JSONLoader(name);
        loader.onload = function (xhr) {
            window[name] = JSON.parse(xhr.responseText);
            DataManager.onLoad(window[name]);
        };
        loader.onerror = function () {
            DataManager.torigoya_retryLoadErrors.push(loader);
        };
        loader.load('data/' + src);
    };

    var upstream_DataManager_checkError = DataManager.checkError;
    DataManager.checkError = function () {
        if (DataManager.torigoya_retryLoadErrors.length > 0) {
            DataManager.torigoya_retryLoadErrors.forEach(function (obj) {
                RetryManager.add(obj);
            });
            DataManager.torigoya_retryLoadErrors.length = 0;
        }
        return upstream_DataManager_checkError.apply(this);
    };

    // -------------------------------------------------------------------------
    // Retry Screen

    var SCREEN_ELEMENT_ID = 'torigoya-retryLoad-screen';

    function showRetryScreen() {
        removeRetryScreen();
        document.body.appendChild(createRetryScreen());
    }

    function removeRetryScreen() {
        var element = document.getElementById(SCREEN_ELEMENT_ID);
        if (element) element.remove();
    }

    function createRetryScreen() {
        var element = document.createElement('div');
        element.setAttribute('id', SCREEN_ELEMENT_ID);
        element.appendChild(createRetryContainer());
        element.style.position = 'absolute';
        element.style.zIndex = 100;
        element.style.left = 0;
        element.style.top = 0;
        element.style.right = 0;
        element.style.bottom = 0;
        element.style.margin = 'auto';
        element.style.width = '100%';
        element.style.display = 'table';
        return element;
    }

    function createRetryContainer() {
        var element = document.createElement('div');
        element.appendChild(createRetryMessage());
        element.appendChild(createRetryButton());
        element.style.display = 'table-cell';
        element.style.padding = '16px';
        element.style.backgroundColor = 'rgba(32, 32, 32, .85)';
        return element;
    }

    function createRetryMessage() {
        var element = document.createElement('p');
        element.innerText = RetryLoadPlus.settings.errorMessageText;
        element.style.margin = '16px auto';
        element.style.textAlign = 'center';
        element.style.color = '#ffffff';
        element.style.fontSize = '16px';
        element.style.fontFamily = 'GameFont, sans-serif';
        return element;
    }

    function createRetryButton() {
        var element = document.createElement('button');
        element.innerText = RetryLoadPlus.settings.errorButtonText;
        element.style.display = 'block';
        element.style.cursor = 'pointer';
        element.style.margin = '16px auto';
        element.style.padding = '5px 10px';
        element.style.color = '#ffffff';
        element.style.border = '1px solid #fff';
        element.style.background = 'rgba(255, 255, 255, .25)';
        element.style.fontSize = '20px';
        element.style.fontFamily = 'GameFont, sans-serif';
        element.onclick = function () {
            RetryManager.doRetry();
        };
        return element;
    }

    // -------------------------------------------------------------------------
    // Retry Manager

    function RetryManager() {
        throw new Error('This is a static class');
    }

    RetryManager._list = [];

    RetryManager.add = function (object) {
        if (this._list.indexOf(object) !== -1) return;
        this._list.push(object);
        if (this._list.length === 1) this.show();
    };

    RetryManager.show = function () {
        showRetryScreen();
    };

    RetryManager.doRetry = function () {
        removeRetryScreen();
        this._list.forEach(function (obj) {
            obj.torigoya_challengeRetryLoad(true);
        });
        this._list.length = 0;
    };

    RetryManager.isShow = function () {
        return this._list.length > 0;
    };

    // -------------------------------------------------------------------------
    // Insert Manager

    var upstream_SceneManager_updateMain = SceneManager.updateMain;
    SceneManager.updateMain = function () {
        if (RetryManager.isShow() && Input.isTriggered('ok')) {
            RetryManager.doRetry();
        }
        upstream_SceneManager_updateMain.apply(this);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.RetryLoadPlus = RetryLoadPlus;
})(this);
