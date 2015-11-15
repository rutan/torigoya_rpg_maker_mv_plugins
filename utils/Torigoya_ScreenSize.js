//=============================================================================
// Torigoya_ScreenSize.js
//=============================================================================

/*:
 * @plugindesc ScreenSize Settings
 * @author ru_shalm
 *
 * @param Screen Width
 * @desc Game Screen Width (default: 816)
 * @default 816
 *
 * @param Screen Height
 * @desc Game Screen Height (default: 624)
 * @default 624
 *
 * @param Window Ratio
 * @desc Game Window Size Ratio (only PC App) (default: 1.0)
 * @default 1.0
 */

/*:ja
 * @plugindesc 画面サイズの設定
 * @author ru_shalm
 *
 * @param Screen Width
 * @desc ゲーム画面の横幅の解像度 (default: 816)
 * @default 816
 *
 * @param Screen Height
 * @desc ゲーム画面の縦幅の解像度 (default: 624)
 * @default 624
 *
 * @param Window Ratio
 * @desc 画面の表示倍率 (exe版のみ) (default: 1.0)
 * @default 1.0
 */

(function () {
    var settings = PluginManager.parameters('Torigoya_ScreenSize');
    var w = Number(settings['Screen Width'] || 816);
    var h = Number(settings['Screen Height'] || 624);
    var r = Number(settings['Window Ratio'] || 1.0);

    SceneManager._screenWidth = SceneManager._boxWidth = w;
    SceneManager._screenHeight = SceneManager._boxHeight = h;
    if (Utils.isNwjs()) {
        var guiWindow = require('nw.gui').Window.get();
        var borderWidth = window.outerWidth - window.innerWidth;
        var borderHeight = window.outerHeight - window.innerHeight;
        guiWindow.resizeTo(w * r + borderWidth, h * r + borderHeight);
        guiWindow.show();
    }
})();
