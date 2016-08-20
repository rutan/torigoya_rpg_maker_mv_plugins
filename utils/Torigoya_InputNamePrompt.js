//=============================================================================
// Torigoya_InputNamePrompt.js
//=============================================================================

/*:
 * @plugindesc Input name with prompt
 * @author ru_shalm
 *
 * @param Max Length
 * @desc name of max length (default: 10)
 * @default 10
 *
 * @param Message
 * @desc input prompt message
 * @default Please, input name.
 *
 * @param Maximum Message
 * @desc maximum number of characters message (default: (%1 characters or less) )
 * %1 - max length value
 * @default (%1 characters or less)
 *
 * @help
 *
 * Plugin Command:
 *   InputNamePrompt 1      # display input name prompt of Actor ID: 1
 *   InputNamePrompt 1 100  # display input name prompt of Actor ID: 1 (max length: 100)
 *   InputNamePrompt 1 100 Please, input your name.  # display input name prompt with custom message
 */

/*:ja
 * @plugindesc 名前入力ダイアログ機能を追加します
 * @author ru_shalm
 *
 * @param Max Length
 * @desc 名前の最大の長さ (default: 10)
 * @default 10
 *
 * @param Message
 * @desc 入力時に表示するメッセージ (default: 名前を入力してください)
 * @default 名前を入力してください
 *
 * @param Maximum Message
 * @desc 最大文字数の表示 (default: (%1 文字以内) )
 * %1 - 上限文字数値
 * @default (%1 文字以内で入力)
 *
 * @help
 *
 * プラグインコマンド:
 *   InputNamePrompt 1      # アクター1番の名前入力ダイアログを表示する
 *   InputNamePrompt 1 100  # アクター1番の名前入力ダイアログを表示する (最大 100 文字)
 *   InputNamePrompt 1 100 名前を入力するのじゃ  # メッセージの変更
 */

(function (global) {
    'use strict';

    var PLUGIN_NAME = 'Torigoya_InputNamePrompt';
    var settings = (function () {
        var parameters = PluginManager.parameters(PLUGIN_NAME);
        return {
            maxLength: Number(parameters['Max Length'] || 10),
            message: String(parameters['Message']),
            maximumMessage: String(parameters['Maximum Message']),
            getMessage: function () {
                return this.message || ($gameSystem && $gameSystem.isJapanese() ? '名前を入力してください' : 'Please, input name.');
            },
            getMaximumMessage: function () {
                return this.maximumMessage || ($gameSystem && $gameSystem.isJapanese() ? '(%1 文字以内で入力)' : '(%1 characters or less)');
            }
        };
    })();

    var InputNamePrompt = {
        name: PLUGIN_NAME,
        settings: settings
    };

    InputNamePrompt.runCommand = function (args) {
        var actor = $gameActors.actor(~~args.shift());
        var max = Number(args.shift());
        if (isNaN(max)) max = InputNamePrompt.settings.maxLength;
        var message = args.join(' ') || InputNamePrompt.settings.getMessage();
        message += '\n' + InputNamePrompt.settings.getMaximumMessage().replace(/%1/g, '' + max);
        var name = window.prompt(message, actor.name());
        if (name) {
            name = name.trim();
            if (name.length > 0) {
                actor.setName(name.substr(0, max));
            }
        }
    };

    InputNamePrompt.afterCommand = function () {
        // キー入力状態が固定化されているので一旦初期化する
        Input.clear();
        TouchInput.clear();
    };

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'InputNamePrompt') {
            InputNamePrompt.runCommand(args);
            InputNamePrompt.afterCommand();
            return true;
        }
        return upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.InputNamePrompt = InputNamePrompt;
})(this);
