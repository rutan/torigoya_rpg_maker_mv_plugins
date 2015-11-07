//=============================================================================
// Torigoya_ChangeInputRepeatWait.js
//=============================================================================

/*:
 * @plugindesc Settings for Input.repeat / TouchInput.repeat wait
 * @author ru_shalm
 *
 * @param [Key] wait
 * @desc [Input.repeat] wait in first time (default: 24)
 * @default 24
 *
 * @param [Key] interval
 * @desc [Input.repeat] wait of interval (default: 6)
 * @default 6
 *
 * @param [Touch] wait
 * @desc [TouchInput.repeat] wait in first time (default: 24)
 * @default 24
 *
 * @param [Touch] interval
 * @desc [TouchInput.repeat] wait of interval (default: 6)
 * @default 6
 */

/*:ja
 * @plugindesc Input.repeat / TouchInput.repeat のウェイトを設定
 * @author ru_shalm
 *
 * @param [Key] wait
 * @desc Input.repeatの初回のウェイト (default: 24)
 * @default 24
 *
 * @param [Key] interval
 * @desc Input.repeatの2回目以降のウェイト (default: 6)
 * @default 6
 *
 * @param [Touch] wait
 * @desc TouchInput.repeatの初回のウェイト (default: 24)
 * @default 24
 *
 * @param [Touch] interval
 * @desc TouchInput.repeatの2回目以降のウェイト (default: 6)
 * @default 6
 */

(function () {
    var settings = PluginManager.parameters('Torigoya_ChangeInputRepeatWait');
    Input.keyRepeatWait = Number(settings['[Key] wait'] || 24);
    Input.keyRepeatInterval = Number(settings['[Key] interval'] || 6);
    TouchInput.keyRepeatWait = Number(settings['[Touch] wait'] || 24);
    TouchInput.keyRepeatInterval = Number(settings['[Touch] interval'] || 6);
})();
