//=============================================================================
// Torigoya_SkillChangeTo.js
//=============================================================================

/*:
 * @plugindesc skill change conditional plugin
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <ChangeTo[2]: ...>   # change to skill[2], when conditional (...)is true.
 *
 * about conditional:
 *   the subject assign to variable `a`. (likely damage formula. but cannot use `b`.)
 *
 *   ex)
 *      <ChangeTo[10]: a.hp < 100>          # change skill when subject hp is less than 100
 *      <ChangeTo[10]: Math.random() < 0.1> # change skill with 10% chance
 */

/*:ja
 * @plugindesc スキル変化条件設定さん for MV
 * @author ru_shalm
 *
 * @help
 *
 * スキルのメモ:
 *   <ChangeTo[2]: 条件式>   # 条件式が真のとき、技をスキルID:2番に変化させます
 *
 * 条件式について:
 *   a という変数にスキルを使った本人のsubjectが入っています。
 *   （※ダメージ計算式と一緒。ただし b はありません。）
 *
 *   例）
 *      <ChangeTo[10]: a.hp < 100>          # 使用者のHPが100未満だったらスキルID: 10番に変化
 *      <ChangeTo[10]: Math.random() < 0.1> # 10%の確率でスキルID: 10番に変化
 */

(function (global) {
    'use strict';

    var SkillChangeTo = {
        name: 'Torigoya_SkillChangeTo'
    };
    var cache = {};

    /**
     * obtain ChangeTo list from item note
     * @param item
     * @returns {Array}
     */
    SkillChangeTo.obtainChnageList = function (item) {
        if (cache[item.id] === undefined) {
            if (item.note.indexOf('<ChangeTo[') !== -1) {
                cache[item.id] = item.note.split(/\r?\n/).map(function (n) {
                    var match = n.match(/^<ChangeTo\[(\d+)\]:(.+)\>$/);
                    if (match) {
                        return {
                            id: ~~match[1],
                            conditional: match[2]
                        };
                    } else {
                        return null;
                    }
                }).filter(function (n) {
                    return n;
                });
            } else {
                cache[item.id] = [];
            }
        }
        return cache[item.id];
    };

    /**
     * eval message
     * @param evalText
     * @param a
     * @returns {*}
     */
    SkillChangeTo.evalConditional = function (evalText, a) {
        try {
            return eval(evalText);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    /**
     * run skill change to command
     */
    SkillChangeTo.run = function () {
        var subject = this._subject;
        var action = subject.currentAction();
        var item = action.item();
        if (!item) return;

        var ifList = SkillChangeTo.obtainChnageList(item);
        for (var i = 0; i < ifList.length; ++i) {
            if (!SkillChangeTo.evalConditional(ifList[i].conditional, subject)) continue;

            if (action.isSkill()) {
                action.setSkill(ifList[i].id);
            } else if (action.isItem()) {
                action.setItem(ifList[i].id);
            }
            break;
        }
    };

    var upstream_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        SkillChangeTo.run.apply(this);
        upstream_BattleManager_startAction.apply(this);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.SkillChangeTo = SkillChangeTo;
})(this);
