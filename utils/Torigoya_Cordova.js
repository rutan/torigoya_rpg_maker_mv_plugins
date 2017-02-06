/*---------------------------------------------------------------------------*
 * Torigoya_Cordova.js
 *---------------------------------------------------------------------------*
 * 2017/02/07 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc Cordova対応さん（仮）
 * @author ru_shalm
 * @help
 *   **This plugin is W.I.P**
 *
 *   Cordovaで便利に動くためのヘルパーを提供します。
 */

(function (global) {
    'use strict';

    var launchMode = (function () {
        if (Utils.isNwjs()) {
            return 'nwjs';
        } else if (location.host === '') {
            return 'cordova';
        } else {
            return 'web';
        }
    })();

    function isCordova() {
        return launchMode === 'cordova';
    }

    function loadCordovaJS() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'cordova.js';
        document.body.appendChild(script);
    }

    if (isCordova()) {
        loadCordovaJS();
    }

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.Cordova = {
        isCordova: isCordova
    };
})(window);
