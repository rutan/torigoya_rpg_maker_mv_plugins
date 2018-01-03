/*---------------------------------------------------------------------------*
 * Torigoya_CustomRetryMessage.js
 *---------------------------------------------------------------------------*
 * 2018/01/03 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc カスタムリトライメッセージさん
 * @author ru_shalm
 *
 * @param Title Text
 * @desc リトライ画面のタイトルに表示する言葉
 * @default 読み込みエラー
 *
 * @param Message Text
 * @desc リトライ画面に表示する文章
 * @default ファイルの読み込みに失敗しました。\nネットワーク状況を確認して、リトライしてください。
 *
 * @param Button Text
 * @desc リトライ画面に表示するボタン
 * @default リトライする
 *
 * @help
 * RPGツクールMV 1.5から追加されたファイル読み込みリトライ機能について
 * 見た目とメッセージをいい感じにします。
 *
 * ------------------------------------------------------------
 *
 * ■ 「コアスクリプトのバージョンが対応していません」と表示される場合
 *
 * このプラグインを使用するためには、
 * コアスクリプト（rpg_core.js などのファイル）について
 * 以下のどちらかのバージョンを使用する必要があります。

 * ・RPGツクールMV バージョン 1.5 以上
 * ・コアスクリプト community-1.2 以上
 *
 * コアスクリプトの更新方法は各公式サイトをご覧ください。
 *
 * アップデート方法 - RPGツクールMV(Win) アップデート
 * https://tkool.jp/support/download/rpgmv/rpgmv_update
 *
 * コアスクリプトの更新方法 - RPGアツマール お知らせブログ
 * http://blog.nicovideo.jp/atsumaru/atsumaru-corescript/guide.html
 */

(function (global) {
    'use strict';

    if (!global.ResourceHandler) {
        var error = '[Torigoya_CustomRetryMessage.js - カスタムリトライメッセージさん]\nコアスクリプトのバージョンが対応していません。\n詳しくはプラグインの説明をご覧ください。';
        window.alert(error);
        throw error;
    }

    var CustomRetryMessage = {
        name: 'Torigoya_CustomRetryMessage'
    };
    CustomRetryMessage.settings = (function () {
        var parameters = PluginManager.parameters(CustomRetryMessage.name);
        return {
            titleText: (parameters['Title Text'] || '').replace('\\n', '\n'),
            messageText: (parameters['Message Text'] || '').replace('\\n', '\n'),
            buttonText: (parameters['Button Text'] || 'Retry')
        };
    })();

    // -------------------------------------------------------------------------
    // 生成処理の定義

    function createRetryContainer(url) {
        var element = document.createElement('div');
        element.appendChild(createRetryWindow(url));
        element.style.display = 'table';
        element.style.width = '100%';
        element.style.position = 'fixed';
        element.style.left = '0';
        element.style.top = '0';
        element.style.right = '0';
        element.style.bottom = '0';
        element.style.margin = 'auto';
        return element;
    }

    function createRetryWindow(url) {
        var element = document.createElement('div');
        element.appendChild(createRetryTitle(url));
        element.appendChild(createRetryMessage());
        element.appendChild(createRetryButton());
        element.style.display = 'table-cell';
        element.style.width = '100%';
        element.style.padding = '16px';
        element.style.boxSizing = 'border-box';
        element.style.backgroundColor = 'rgba(32, 32, 32, .85)';
        return element;
    }

    function createRetryTitle(url) {
        var element = document.createElement('p');
        element.innerText = CustomRetryMessage.settings.titleText + ': ' + url;
        element.style.margin = '16px auto';
        element.style.textAlign = 'center';
        element.style.color = '#ffff00';
        element.style.fontSize = '16px';
        element.style.lineHeight = '1.5';
        element.style.fontFamily = 'GameFont, sans-serif';
        element.style.wordBreak = 'break-all';
        return element;
    }

    function createRetryMessage() {
        var element = document.createElement('p');
        element.innerText = CustomRetryMessage.settings.messageText;
        element.style.margin = '16px auto';
        element.style.textAlign = 'center';
        element.style.color = '#ffffff';
        element.style.fontSize = '16px';
        element.style.lineHeight = '1.5';
        element.style.fontFamily = 'GameFont, sans-serif';
        return element;
    }

    function createRetryButton() {
        var element = document.createElement('button');
        element.innerText = CustomRetryMessage.settings.buttonText;
        element.style.display = 'block';
        element.style.cursor = 'pointer';
        element.style.margin = '16px auto';
        element.style.padding = '5px 10px';
        element.style.color = '#ffffff';
        element.style.border = '1px solid #fff';
        element.style.background = 'rgba(255, 255, 255, .25)';
        element.style.fontSize = '20px';
        element.style.fontFamily = 'GameFont, sans-serif';
        element.onclick = ResourceHandler.retry.bind(ResourceHandler);
        return element;
    }

    // -------------------------------------------------------------------------
    // エイリアス

    var upstream_Graphics_printLoadingError = Graphics.printLoadingError;
    Graphics.printLoadingError = function (url) {
        var flag = (this._errorPrinter && !this._errorShowed);
        upstream_Graphics_printLoadingError.apply(this, arguments);
        if (!flag) return;

        this._errorPrinter.innerHTML = '';
        this._errorPrinter.appendChild(createRetryContainer(url));
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.CustomRetryMessage = CustomRetryMessage;
})(window);
