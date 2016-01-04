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
 * @help
 *
 * Plugin Command:
 *   InputNamePrompt 1     # display input name prompt of Actor ID: 1
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
 * @help
 *
 * プラグインコマンド:
 *   InputNamePrompt 1     # アクター1番の名前入力ダイアログを表示する
 */

(function () {
    var settings = PluginManager.parameters('Torigoya_InputNamePrompt');
    var maxLength = Number(settings['Max Length'] || 10);
    var message = String(settings['Message']);

    var getMessage = function () {
        if (message.length > 0) return message;
        if ($gameSystem && $gameSystem.isJapanese()) {
            return '名前を入力してください';
        } else {
            return 'Please, input name.';
        }
    };

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'InputNamePrompt') {
            var actor = $gameActors.actor(~~args[0]);
            var name = window.prompt(getMessage(), actor.name());
            if (name) {
                name = name.trim();
                if (name.length > 0) {
                    actor.setName(name.substr(0, maxLength));
                }
            }
            return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };
})();
