/*---------------------------------------------------------------------------*
 * Torigoya_AddStateSkill.js
 *---------------------------------------------------------------------------*
 * 2017/07/21 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc add/remove state to subject when using the skill
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <AddState:1>     # add state[1] when using the skill
 *   <RemoveState:2>  # remove state[2] when using the skill
 */

/*:ja
 * @plugindesc スキル使用時に使用者にステートを追加/削除できるようにします
 * @author ru_shalm
 *
 * @help
 *
 * スキルのメモ:
 *   <AddState:1>     # スキル使用時にステート1番(戦闘不能)を付与
 *   <AddState:2,3>   # スキル使用時にステート2番と3番を付与
 *   <RemoveState:2>  # スキル使用時にステート2番(防御)を解除
 */

(function (global) {
    'use strict';

    var AddStateSkill = {
        name: 'Torigoya_AddStateSkill'
    };

    AddStateSkill.addState = function () {
        var stateIds = this._action.item() ? this._action.item().meta['AddState'] : null;
        if (stateIds && this._subject.isAlive()) {
            stateIds.split(/\s*,\s*/).filter(Boolean).forEach(function (id) {
                this._subject.addState(~~id);
            }.bind(this));
            return 1;
        } else {
            return 0;
        }
    };

    AddStateSkill.removeState = function () {
        var stateIds = this._action.item() ? this._action.item().meta['RemoveState'] : null;
        if (stateIds) {
            stateIds.split(/\s*,\s*/).filter(Boolean).forEach(function (id) {
                this._subject.removeState(~~id);
            }.bind(this));
            return 1;
        } else {
            return 0;
        }
    };

    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        var n = AddStateSkill.addState.apply(this) + AddStateSkill.removeState.apply(this);
        if (n > 0) {
            this._logWindow.displayAutoAffectedStatus(this._subject);
            if (this._subject.isDead()) {
                this._subject.performCollapse();
            }
        }

        upstream_BattleManager_endAction.apply(this);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.AddStateSkill = AddStateSkill;
})(window);
