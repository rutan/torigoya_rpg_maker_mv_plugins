//=============================================================================
// Torigoya_OneButtonSkill.js
//=============================================================================

/*:
 * @plugindesc One Button SKill for MV plugin
 * @author ru_shalm
 *
 * @param Key Name
 * @desc use key name (default: shift)
 * @default shift
 *
 * @param Hide One Button Skill
 * @desc hide one button skill in skill menu (default: false)
 * @default false
 *
 * @help
 *
 * If the actor has several one-button-skills,
 * it is selected in order of priority.
 *
 * And, skills that do not meet the conditions of use are excluded.
 *
 * Skill Note:
 *   <OneButtonSkill>           # set one button skill（primary: 0）
 *   <OneButtonSkill:100>       # set one button skill（primary: 100）
 */

/*:ja
 * @plugindesc ワンボタンスキルさん for MV
 * @author ru_shalm
 *
 * @param Key Name
 * @desc ワンボタンスキルに使用するキー名を設定します (デフォルト: shift)
 * @default shift
 *
 * @param Hide One Button Skill
 * @desc ワンボタンスキルをスキル一覧に表示するか？（true → する / false → しない） (default: false)
 * @default false
 *
 * @help
 *
 * 行動選択画面でワンボタンで選択できるスキルを設定します。
 *
 * 同じアクターが複数のワンボタンスキルを習得している場合、
 * 優先度が高いものが選択されます。
 * また、MPなどが不足している場合は選択対象から除外されます。
 *
 * スキルのメモ:
 *   <OneButtonSkill>           # ワンボタンスキルに設定（優先度: 0）
 *   <OneButtonSkill:100>       # ワンボタンスキルに設定（優先度: 100）
 */


(function (global) {
    'use strict';

    var OneButtonSkill = {
        name: 'Torigoya_OneButtonSkill',
        selectSkill: null
    };
    var settings = (function () {
        var parameters = PluginManager.parameters(OneButtonSkill.name);
        return {
            keyName: String(parameters['Key Name'] || 'shift'),
            hideSkill: (String(parameters['Hide One Button Skill']) === 'true')
        };
    })();

    OneButtonSkill.onCommand = function () {
        var skill = OneButtonSkill.selectSkill;
        OneButtonSkill.selectSkill = null;

        if (!skill) return;
        var action = BattleManager.inputtingAction();
        action.setSkill(skill.id);
        BattleManager.actor().setLastBattleSkill(skill);
        this.onSelectAction();
    };

    OneButtonSkill.selectOneButtonSkill = function (actor) {
        return actor.skills().filter(function (item) {
            return item && item.meta['OneButtonSkill'] && actor.canUse(item);
        }).sort(function (a, b) {
            return ~~b.meta['OneButtonSkill'] - ~~a.meta['OneButtonSkill'];
        })[0];
    };

    var upstream_Window_ActorCommand_processHandling = Window_ActorCommand.prototype.processHandling;
    Window_ActorCommand.prototype.processHandling = function () {
        upstream_Window_ActorCommand_processHandling.apply(this);
        if (this.isOpenAndActive()) {
            if (Input.isTriggered(settings.keyName)) {
                this.processOneButtonSkill();
            }
        }
    };

    Window_ActorCommand.prototype.processOneButtonSkill = function () {
        if (!this._actor) return;
        if (!$gameParty.inBattle()) return;

        var skill = OneButtonSkill.selectOneButtonSkill(this._actor);
        if (skill) {
            OneButtonSkill.selectSkill = skill;
            this.playOkSound();
            this.updateInputData();
            this.deactivate();
            this.callHandler('torigoya_onebuttonskill');
        } else {
            this.playBuzzerSound();
        }
    };

    var upstream_Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function () {
        upstream_Scene_Battle_createActorCommandWindow.apply(this);
        this._actorCommandWindow.setHandler('torigoya_onebuttonskill', OneButtonSkill.onCommand.bind(this));
    };

    // スキル一覧に載せない場合
    if (settings.hideSkill) {
        var upstream_Window_SkillList_includes = Window_SkillList.prototype.includes;
        Window_SkillList.prototype.includes = function (item) {
            return upstream_Window_SkillList_includes.apply(this, arguments) && !item.meta['OneButtonSkill'];
        };
    }

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.OneButtonSkill = OneButtonSkill;
})(this);
