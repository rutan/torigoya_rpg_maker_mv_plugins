//=============================================================================
// Torigoya_BSModule_SelectHelp.js
//=============================================================================

/*:
 * @plugindesc Battle Layout: Select Help
 * @author ru_shalm
 *
 * @help
 * This plugin is add-on of `torigoya_BSModule_Base.js`.
 * Require install `torigoya_BSModule_Base.js`.
 *
 * --------------------
 * This plugin add `torigoya_BSModule_Base.js` to display target name when select target.
 */

/*:ja
 * @plugindesc 戦闘表示モジュールさん - 対象選択ヘルプ表示
 * @author ru_shalm
 *
 * @param 設定項目はありません
 *
 * @help
 * このプラグインは「戦闘表示モジュールさん - 基本パック」
 * （torigoya_BSModule_Base.js）の追加アドオンです。
 * 導入の際は「戦闘表示モジュールさん - 基本パック」が
 * このプラグインより上に導入されている必要があります。
 *
 * --------------------
 *
 * スキル使用対象の選択時に選択中のキャラクターの名前を
 * ヘルプウィンドウに表示するようにします。
 */

(function (global) {
    'use strict';

    if (!global.Torigoya || !global.Torigoya.BSModule) {
        var errorMessage = 'missing plugin `Torigoya_BSModule_Base.js`\n「戦闘表示モジュールさん - 基本パック」が見つかりません';
        alert(errorMessage);
        throw errorMessage;
    }

    // ------------------------------------------------------------------------

    var BSModule = global.Torigoya.BSModule;
    BSModule.SelectHelp = {
        name: 'torigoya_BSModule_SelectHelp'
    };

    // ------------------------------------------------------------------------

    function Window_HelpForSelect() {
        this.initialize.apply(this, arguments);
    }

    BSModule.SelectHelp.Window_HelpForSelect = Window_HelpForSelect;
    Window_HelpForSelect.prototype = Object.create(Window_Help.prototype);
    Window_HelpForSelect.prototype.constructor = Window_HelpForSelect;

    Window_HelpForSelect.prototype.setBattler = function (battler) {
        this.setText(battler ? battler.name() : '');
    };

    Window_HelpForSelect.prototype.refresh = function () {
        this.contents.clear();
        this.drawText(this._text, 0, 0, this.contentsWidth(), 'center');
    };

    // ------------------------------------------------------------------------

    var upstream_Scene_Battle_createHelpWindow = Scene_Battle.prototype.createHelpWindow;
    Scene_Battle.prototype.createHelpWindow = function () {
        upstream_Scene_Battle_createHelpWindow.apply(this);
        this._torigoya_BSModuleSelectHelpWindow = new BSModule.SelectHelp.Window_HelpForSelect(1);
        this._torigoya_BSModuleSelectHelpWindow.visible = false;
        this.addWindow(this._torigoya_BSModuleSelectHelpWindow);
    };

    var upstream_Scene_Battle_createActorWindow = Scene_Battle.prototype.createActorWindow;
    Scene_Battle.prototype.createActorWindow = function () {
        upstream_Scene_Battle_createActorWindow.apply(this);
        this._actorWindow.setHelpWindow(this._torigoya_BSModuleSelectHelpWindow);
    };

    var upstream_Scene_Battle_createEnemyWindow = Scene_Battle.prototype.createEnemyWindow;
    Scene_Battle.prototype.createEnemyWindow = function () {
        upstream_Scene_Battle_createEnemyWindow.apply(this);
        this._enemyWindow.setHelpWindow(this._torigoya_BSModuleSelectHelpWindow);
    };

    var upstream_Window_BattleActor_show = Window_BattleActor.prototype.show;
    Window_BattleActor.prototype.show = function () {
        this.showHelpWindow();
        upstream_Window_BattleActor_show.apply(this);
    };

    var upstream_Window_BattleActor_hide = Window_BattleActor.prototype.hide;
    Window_BattleActor.prototype.hide = function () {
        this.hideHelpWindow();
        upstream_Window_BattleActor_hide.apply(this);
    };

    var upstream_Window_BattleActor_updateHelp = Window_BattleActor.prototype.updateHelp;
    Window_BattleActor.prototype.updateHelp = function () {
        upstream_Window_BattleActor_updateHelp.apply(this);
        this._helpWindow.setBattler($gameParty.battleMembers()[this.index()]);
    };

    var upstream_Window_BattleEnemy_show = Window_BattleEnemy.prototype.show;
    Window_BattleEnemy.prototype.show = function () {
        this.showHelpWindow();
        upstream_Window_BattleEnemy_show.apply(this);
    };

    var upstream_Window_BattleEnemy_hide = Window_BattleEnemy.prototype.hide;
    Window_BattleEnemy.prototype.hide = function () {
        this.hideHelpWindow();
        upstream_Window_BattleEnemy_hide.apply(this);
    };

    var upstream_Window_BattleEnemy_updateHelp = Window_BattleEnemy.prototype.updateHelp;
    Window_BattleEnemy.prototype.updateHelp = function () {
        upstream_Window_BattleEnemy_updateHelp.apply(this);
        this._helpWindow.setBattler(this.enemy());
    };

})(this);
