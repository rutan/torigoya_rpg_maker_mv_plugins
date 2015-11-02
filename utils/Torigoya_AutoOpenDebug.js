//=============================================================================
// Torigoya_AutoOpenDebug.js
//=============================================================================

/*:
 * @plugindesc auto open devtool
 * @author ru_shalm
 */

/*:ja
 * @plugindesc F8押す必要もなくDeveloperToolを開くよ
 * @author ru_shalm
 */

(function () {
    if (Utils.isNwjs() && Utils.isOptionValid('test')) {
        require('nw.gui').Window.get().showDevTools();
    }
})();
