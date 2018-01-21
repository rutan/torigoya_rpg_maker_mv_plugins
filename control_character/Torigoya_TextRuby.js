/*---------------------------------------------------------------------------*
 * Torigoya_TextRuby.js
 *---------------------------------------------------------------------------*
 * 2018/01/21 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc メッセージにルビ記法を追加します
 * @author ru_shalm
 *
 * @param ■ 基本設定
 *
 * @param Main Text Scale
 * @desc ルビを振る対象文字の拡大率 (default: 0.9)
 * @type number
 * @max 1.0
 * @min 0.5
 * @decimals 2
 * @default 0.9
 *
 * @param Sub Text Scale
 * @desc ルビとして振る小さい文字の拡大率 (default: 0.35)
 * @max 1.0
 * @min 0.1
 * @decimals 2
 * @default 0.35
 *
 * @param ■ 上級者向け設定
 *
 * @param Dictionaries
 * @desc ふりがなの事前登録
 * @type struct<Dictionary>[]
 *
 * @help
 * 文章中に
 *
 * \ruby[ルビを振りたい単語](ふりがな)
 *
 * のように書くことで、ルビを振ることができるようになります。
 *
 * ------------------------------------------------------------
 * ■ 上級者向け設定
 *
 * 事前に以下のどちらかの設定を行うことで、
 * ふりがなを省略することができます。
 *
 * (例)
 * \ruby[魔導書](グリモワール) → \ruby[魔導書]
 *
 * ※注意
 * 「ふりがな」を省略できるだけです。
 * 文章に自動的にふりがなを振る機能ではありません。
 *
 *
 * ふりがなを省略するためには、以下のどちらかの方法で、
 * ふりがなを事前登録しておく必要があります。
 *
 *
 * (方法1) プラグインの設定で「ふりがなの事前登録」をする
 *
 * 画面右側に表示されている「■ 上級者向け設定」の中にある
 * 「Dictionaries」から、ふりがなを事前に登録しておくことができます。
 *
 * (方法2) イベント中にプラグインコマンドでふりがなを登録する
 *
 * プラグインコマンドに以下のように入力することで、
 * ふりがなを省略できるようになります。
 *
 *     ふりがな登録 魔導書 グリモワール
 *
 * また、プラグインコマンドに以下のように入力することで、
 * プラグインコマンドで登録したふりがなを削除できます。
 *
 *     ふりがなリセット
 *
 */

/*~struct~Dictionary:
 * @param word
 * @desc ルビを振る対象の文字列
 * （ \ruby[ここに入れる文字] ）
 *
 * @param ruby
 * @desc その文字列に振るルビ
 */

(function (global) {
    'use strict';

    var TextRuby = {
        name: 'Torigoya_TextRuby'
    };
    TextRuby.settings = (function () {
        var parameters = PluginManager.parameters(TextRuby.name);
        return {
            mainTextScale: Number(parameters['Main Text Scale'] || 0.95),
            subTextScale: Number(parameters['Sub Text Scale'] || 0.4),
            dictionaries: (function () {
                var obj = {};
                JSON.parse(parameters['Dictionaries'] || '[]').forEach(function (str) {
                    var set = JSON.parse(str);
                    obj[set.word] = set.ruby;
                });
                return obj;
            })()
        };
    })();

    // -------------------------------------------------------------------------
    // Constant

    TextRuby.commandDictionaries = {};

    // -------------------------------------------------------------------------
    // TextRuby

    TextRuby.obtainRubyParams = function (textState) {
        var arr = /^\[([^\]]+)](?:\(([^\)]+)\))?/.exec(textState.text.slice(textState.index));
        if (!arr) return null;
        textState.index += arr[0].length;
        return arr.slice(1);
    };

    TextRuby.processDrawRuby = function (mainText, subText, textState) {
        var originalFontSize = this.contents.fontSize;

        var mainFontSize = originalFontSize * TextRuby.settings.mainTextScale;
        var mainY = textState.y + (textState.height - originalFontSize) / 2 + (originalFontSize - mainFontSize);
        var subFontSize = originalFontSize * TextRuby.settings.subTextScale;
        var subY = mainY - subFontSize;
        if (subY < 1) subY = 1; // 1行目のはみ出し防止

        this.contents.fontSize = mainFontSize;
        var mainWidth = this.textWidth(mainText);
        this.contents.fontSize = subFontSize;
        var subWidth = this.textWidth(subText);
        var w = Math.max(mainWidth, subWidth);

        this.contents.fontSize = mainFontSize;
        this.contents.drawText(mainText, textState.x, mainY, w, mainFontSize, 'center');

        this.contents.fontSize = subFontSize;
        this.contents.drawText(subText, textState.x, subY, w, this.contents.fontSize, 'center');

        textState.x += w;
        this.contents.fontSize = originalFontSize;
    };

    // -------------------------------------------------------------------------
    // alias

    var upstream_Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function (code, textState) {
        upstream_Window_Base_processEscapeCharacter.apply(this, arguments);
        if (code !== 'RUBY') return;
        var params = TextRuby.obtainRubyParams(textState);
        if (!params) return;
        params[1] = params[1] || TextRuby.commandDictionaries[params[0]] || TextRuby.settings.dictionaries[params[0]];
        TextRuby.processDrawRuby.call(this, params[0], params[1], textState);
    };

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        switch (command) {
            case 'RubyDictionary':
            case 'ふりがな登録': {
                var text = (args[0] || '').trim();
                var kana = (args[1] || '').trim();
                TextRuby.commandDictionaries[text] = kana;
                return;
            }
            case 'ふりがなリセット': {
                TextRuby.commandDictionaries = {};
                return;
            }
        }
        if (command === 'RubyDictionary') {
            return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.TextRuby = TextRuby;
})(window);
