/*---------------------------------------------------------------------------*
 * Torigoya_SkillChangeTo.js
 *---------------------------------------------------------------------------*
 * 2017/03/18 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

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
 * そのスキルを発動した際に、設定した条件を満たしている場合は
 * 別のスキルに変化するようにできます。
 *
 * 例えば、普段は2連続攻撃だが、HPが25%以下になると
 * 超必殺技に変化する！のようなスキルがつくれます。
 *
 * ------------------------------------------------------------
 * ■ 設定方法
 * ------------------------------------------------------------
 * スキルのメモ欄に以下のように記述します
 *
 * <ChangeTo[変化先のスキル番号]: 条件式>
 *
 * ● 変化先のスキル番号？
 * 条件を満たしたときに代わりに発動するスキルの番号を設定してください。
 *
 * ● 条件式？
 * ダメージ計算式の欄と同じような記述ができます。
 *
 * a という変数にスキルを使った本人のsubjectが入っています。
 * ※ただし b はありません
 *
 * ------------------------------------------------------------
 * ■ 設定の例
 * ------------------------------------------------------------
 *
 * ● 使用者のHPが100未満だったらスキルID: 10番に変化
 * <ChangeTo[10]: a.hp < 100>
 *
 * ● 使用者のHPが25%以下だったらスキルID: 11番に変化
 * <ChangeTo[11]: a.hp < (a.mhp * 0.25)>
 *
 * ● ランダムに10%の確率でスキルID: 12番に変化
 * <ChangeTo[12]: Math.random() < 0.10>
 */

(function (global) {
    'use strict';

    var SkillChangeTo = {
        name: 'Torigoya_SkillChangeTo'
    };
    var skillCache = {};
    var itemCache = {};

    /**
     * obtain ChangeTo list from item note
     * @param item
     * @returns {Array}
     */
    SkillChangeTo.obtainChangeList = function (item) {
        var isSkill = item.hasOwnProperty('stypeId');
        var cache = isSkill ? skillCache : itemCache;
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

        var ifList = SkillChangeTo.obtainChangeList(item);
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
