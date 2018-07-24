/*---------------------------------------------------------------------------*
 * Torigoya_LockOrientation.js
 *---------------------------------------------------------------------------*
 * 2018/07/20 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc フルスクリーン処理実行時に画面を縦 or 横に固定します
 * @author ru_shalm
 *
 * @param Orientation
 * @desc 画面の向き
 * @type select
 * @option landscape (横)
 * @option portrait (縦)
 * @default landscape (横)
 */

(function (global) {
    'use strict';

    var LockOrientation = {
        name: 'Torigoya_LockOrientation',
        isEnabled: (screen.orientation && screen.orientation.lock)
    };
    LockOrientation.settings = (function () {
        var parameters = PluginManager.parameters(LockOrientation.name);
        return {
            orientation: String(parameters['Orientation']).split(/\s+/)[0]
        };
    })();

    // -------------------------------------------------------------------------

    function registerEvents() {
        ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(function (name) {
            document.addEventListener(name, lock, false);
        });
        window.addEventListener('resize', lock, false);
    }

    function removeEvents() {
        LockOrientation.isEnabled = false;

        ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(function (name) {
            document.removeEventListener(name, lock);
        });
        window.removeEventListener('resize', lock);
    }

    function lock() {
        if (!LockOrientation.isEnabled) return;
        var name = LockOrientation.settings.orientation;
        screen.orientation.lock(name)
            .catch((e) => {
                if (e.name !== 'SecurityError') removeEvents();
            });
    }

    LockOrientation.lock = lock;

    if (LockOrientation.isEnabled) registerEvents();

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.LockOrientation = LockOrientation;
})(this);
