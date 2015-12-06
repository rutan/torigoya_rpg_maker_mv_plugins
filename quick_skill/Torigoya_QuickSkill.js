//=============================================================================
// Torigoya_QuickSkill.js
//=============================================================================

/*:
 * @plugindesc usable Quick skill (select and action!)
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <QuickSkill>           # set quick skill
 */

/*:ja
 * @plugindesc 選択するとターンを消費せずに即発動するスキルを追加します。
 * @author ru_shalm
 *
 * @help
 *
 * スキルのメモ:
 *   <QuickSkill>           # ターン消費無しスキルにする
 */

(function (global) {
    var QuickSkill = {
        currentActionActor: null,
        originalSubject: null
    };

    // ターン消費なしスキル中はActionを減らさないようにしないと死ぬ
    Game_Battler.prototype.removeCurrentAction = function () {
        if (QuickSkill.currentActionActor) {
            this._actions[0] = new Game_Action(this);
        } else {
            this._actions.shift();
        }
    };

    // Actionが決定されたら、Actionの中にターン消費なしスキルがないか調べる
    var upstream_Scene_Battle_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
    Scene_Battle.prototype.selectNextCommand = function () {
        QuickSkill.currentActionActor = BattleManager.actor();
        if (QuickSkill.currentActionActor) {
            var actions = QuickSkill.currentActionActor._actions;
            for (var i = 0; i < actions.length; ++i) {
                if (actions[i]._item.isNull()) continue;
                if (actions[i]._item.object().meta['QuickSkill']) {
                    actions.unshift(actions.splice(i, 1)[0]);
                    QuickSkill.originalSubject = BattleManager._subject;
                    BattleManager._subject = BattleManager.actor();
                    BattleManager.processTurn();
                    return;
                }
            }
            QuickSkill.currentActionActor = null;
        }
        upstream_Scene_Battle_selectNextCommand.bind(this)();
    };

    // ターン消費なしスキル中なら後片付け
    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        if (QuickSkill.currentActionActor) {
            this._logWindow.endAction(this._subject);
            this._subject = QuickSkill.originalSubject;
            this.changeActor(this._actorIndex, 'undecided');
            QuickSkill.currentActionActor = null;
            if (QuickSkill.isBattleEnd()) {
                this._phase = 'turn';
            } else {
                this._phase = 'input';
            }
        } else {
            upstream_BattleManager_endAction.bind(this)();
        }
    };

    QuickSkill.isBattleEnd = function () {
        return $gameParty.isEmpty() || $gameParty.isAllDead() || $gameTroop.isAllDead();
    }

    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.QuickSkill = QuickSkill;
})(this);
