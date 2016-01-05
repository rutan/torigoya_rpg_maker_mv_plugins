//=============================================================================
// Torigoya_AddStateSkill.js
//=============================================================================

/*:
 * @plugindesc add state to subject when using the skill
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <AddState:1>  # add state[1] when using the skill
 *
 */

/*:ja
 * @plugindesc スキル使用時に使用者にステートを追加できるようにします
 * @author ru_shalm
 *
 * @help
 *
 * スキルのメモ:
 *   <AddState:1>  # スキル使用時にステート1番(戦闘不能)を付与
 *
 */

(function (_) {
    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        var stateId = this._action.item() ? this._action.item().meta['AddState'] : null;
        if (stateId && this._subject.isAlive()) {
            this._subject.addState(~~stateId);
            this._logWindow.displayAutoAffectedStatus(this._subject);
            if (this._subject.isDead()) {
                this._subject.performCollapse();
            }
        }

        upstream_BattleManager_endAction.apply(this);
    };
})(this);
