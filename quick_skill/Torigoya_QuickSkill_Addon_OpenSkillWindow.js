/*---------------------------------------------------------------------------*
 * Torigoya_QuickSkill_Addon_OpenSkillWindow.js
 *---------------------------------------------------------------------------*
 * 2020/05/06 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:ja
 * @plugindesc ターン消費なしスキル for MVアドオン：発動後、スキル選択画面を開く（β）
 * @author ru_shalm
 * @help
 * ※このプラグインは「ターン消費なしスキルさん for MV」のアドオンです
 * 　「ターン消費なしスキルさん for MV」より下に入れてください。
 *
 * スキル使用後にスキルウィンドウが開いた状態にします。
 * このプラグインは競合率が高いため、併用するプラグイン次第では動作しません。
 */

(function (global) {
    'use strict';

    if (!global.Torigoya || !global.Torigoya.QuickSkill) {
        var errorMessage = '「ターン消費なしスキル for MVアドオン：発動後、スキル選択画面を開く」より上に\n「ターン消費なしスキルさん for MV」が導入されていません。';
        alert(errorMessage);
        throw errorMessage;
    }

    var OpenSkillWindow = {
        name: 'Torigoya_QuickSkill_Addon_OpenSkillWindow',
        isQuickSkillTurn: false
    };

    // -------------------------------------------------------------------------
    // Scene_Battle

    var upstream_Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function () {
        if (OpenSkillWindow.isQuickSkillTurn) {
            this._statusWindow.select(BattleManager.actor().index());
            this._actorCommandWindow.open();
            this.commandSkill();

            OpenSkillWindow.isQuickSkillTurn = false;
        } else {
            upstream_Scene_Battle_startActorCommandSelection.apply(this);
        }
    };

    // -------------------------------------------------------------------------
    // BattleManager

    var upstream_BattleManager_updateEvent = BattleManager.updateEvent;
    BattleManager.updateEvent = function () {
        var isQuickSkill = this._phase === 'torigoya_quickSkill';
        var result = upstream_BattleManager_updateEvent.apply(this);

        if (isQuickSkill && this._phase === 'input') {
            OpenSkillWindow.isQuickSkillTurn = true;
        }

        return result;
    };

    // -------------------------------------------------------------------------
    global.Torigoya.QuickSkill.Addons = (global.Torigoya.QuickSkill.Addons || {});
    global.Torigoya.QuickSkill.Addons.OpenSkillWindow = OpenSkillWindow;
})(this);
