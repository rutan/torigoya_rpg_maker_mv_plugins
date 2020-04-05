/*---------------------------------------------------------------------------*
 * Torigoya_BalloonInBattle_Addon_DisplayTime.js
 *---------------------------------------------------------------------------*
 * 2020/04/05 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:ja
 * @plugindesc 戦闘中セリフ表示さん for MVアドオン：時間で消去
 * @author ru_shalm
 *
 * @param --- 基本設定 ---
 *
 * @param DisplayTime
 * @desc 吹き出しを表示する時間(ms)を設定します。（※1000＝1秒）
 * @type number
 * @default 2500
 * @min 1
 *
 * @help
 * ※このプラグインは「戦闘中セリフ表示さん for MV」のアドオンです
 * 　「戦闘中セリフ表示さん for MV」より下に入れてください。
 *
 * スキル使用時に指定時間経過で自動的に吹き出しを閉じます。
 * 指定した時間より先に行動が終了した場合は、その時点で吹き出しが消えます。
 */

(function(global) {
    'use strict';

    if (!global.Torigoya || !global.Torigoya.BalloonInBattle) {
        var errorMessage = '「戦闘中セリフ表示さん for MVアドオン：時間で消去」より上に\n「戦闘中セリフ表示さん for MV」が導入されていません。';
        alert(errorMessage);
        throw errorMessage;
    }

    var DisplayTime = {
        name: 'Torigoya_BalloonInBattle_Addon_DisplayTime'
    };
    DisplayTime.settings = (function () {
        var parameters = PluginManager.parameters(DisplayTime.name);
        return {
            displayTime: Number(parameters['DisplayTime'] || 2500),
        };
    })();

    // -------------------------------------------------------------------------
    // BattleManager

    var upstream_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        upstream_BattleManager_startAction.apply(this);
        var subject = this._subject;
        subject.torigoya_delayClearSpeech(DisplayTime.settings.displayTime);
    };

    // -------------------------------------------------------------------------
    global.Torigoya.BalloonInBattle.Addons = (global.Torigoya.BalloonInBattle.Addons || {});
    global.Torigoya.BalloonInBattle.Addons.DisplayTime = DisplayTime;

})(window);
