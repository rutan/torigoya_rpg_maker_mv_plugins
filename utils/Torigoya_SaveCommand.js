//=============================================================================
// Torigoya_SaveCommand.js
//=============================================================================

/*:
 * @plugindesc Add save command in Plugin Command
 * @author ru_shalm
 *
 * @help
 *
 * Plugin Command:
 *   SaveCommand save 1       # save to slot 1
 *   SaveCommand save [1]     # save to slot variables[1]
 *   SaveCommand save last    # save to last accessed file
 *   SaveCommand load 1       # load from slot 1
 *   SaveCommand load [1]     # load from slot variables[1]
 *   SaveCommand load last    # load from last accessed file
 *   SaveCommand remove 1     # remove save file of slot 1
 *   SaveCommand remove [1]   # remove save file of slot variables[1]
 *   SaveCommand remove last  # remove last accessed file
 *
 * (default last accessed file: 1)
 */

/*:ja
 * @plugindesc プラグインコマンドからセーブを実行できるようにします。
 * @author ru_shalm
 *
 * @help
 *
 * プラグインコマンド:
 *   SaveCommand save 1       # スロット1にセーブを実行します。
 *   SaveCommand save [1]     # 変数[1]番のスロットにセーブを実行します。
 *   SaveCommand save last    # 前回ロード/セーブしたスロットにセーブを実行します。
 *   SaveCommand load 1       # スロット1からロードを実行します。
 *   SaveCommand load [1]     # 変数[1]番のスロットからロードを実行します。
 *   SaveCommand load last    # 前回ロード/セーブしたスロットからロードを実行します。
 *   SaveCommand remove 1     # スロット1のセーブデータを削除します。
 *   SaveCommand remove [1]   # 変数[1]番のスロットのセーブデータを削除します。
 *   SaveCommand save last    # 前回ロード/セーブしたスロットのセーブデータを削除します。
 *
 * ※ 前回保存したスロットのデフォルト値は 1 です。
 */

(function (global) {
    var SaveCommand = {};

    SaveCommand.parseSlotId = function (str) {
        var slotId, matches;
        if (matches = str.match(/^\[(\d+)\]$/)) {
            slotId = $gameVariables.value(~~matches[1]);
        } else if (str.match(/^\d+$/)) {
            slotId = ~~str;
        } else {
            switch (str) {
                case 'last':
                    slotId = DataManager.lastAccessedSavefileId();
                    break;
                case 'latest':
                    slotId = DataManager.latestSavefileId();
                    break;
            }
        }

        if (~~slotId <= 0) {
            throw '[Torigoya_SaveCommand.js] invalid SlotId: ' + slotId;
        }

        return slotId;
    };

    SaveCommand.runCommand = function (gameInterpreter, type, slotId) {
        switch (type) {
            case 'load':
                this.runCommandLoad(gameInterpreter, slotId);
                break;
            case 'save':
                this.runCommandSave(gameInterpreter, slotId);
                break;
            case 'remove':
                this.runCommandRemove(gameInterpreter, slotId);
                break;
        }
    };

    // 無理やり感ある
    SaveCommand.runCommandLoad = function (gameInterpreter, slotId) {
        if (!DataManager.isThisGameFile(slotId)) return;

        var scene = SceneManager._scene;
        scene.fadeOutAll();
        DataManager.loadGame(slotId);
        gameInterpreter.command115(); // 今のイベントが継続しないように中断コマンドを実行する
        Scene_Load.prototype.reloadMapIfUpdated.apply(scene);
        SceneManager.goto(Scene_Map);
        $gameSystem.onAfterLoad();
    };

    SaveCommand.runCommandSave = function (_, slotId) {
        $gameSystem.onBeforeSave();
        DataManager.saveGame(slotId);
    };

    SaveCommand.runCommandRemove = function (_, slotId) {
        StorageManager.remove(slotId);
    };

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SaveCommand') {
            var type = (args[0] || '').trim();
            var slotId = SaveCommand.parseSlotId((args[1] || '').trim());
            SaveCommand.runCommand(this, type, slotId);
            return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.SaveCommand = SaveCommand;
})(this);
