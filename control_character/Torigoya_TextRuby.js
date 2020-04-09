/*---------------------------------------------------------------------------*
 * Torigoya_TextRuby.js
 *---------------------------------------------------------------------------*
 * 2019/01/30 ru_shalm
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
 * @param Ignore Escape Characters
 * @desc ルビを振りたい単語やふりがなに含まれる制御文字を無視します
 * @type boolean
 * @default false
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
 * ------------------------------------------------------------
 * ■その他のプラグインコマンド
 *
 * 以下のプラグインコマンドで、
 * ルビを振りたい単語とふりがなの色を変更できます。
 * XにはRPGツクールMVの色番号を入力してください。
 *
 *     ふりがな色 X
 *
 * ルビを振りたい単語のみ色を変えたい場合は以下のコマンドを、
 *
 *     ふりがな色メイン X
 *
 * ふりがなのみ色を変えたい場合は以下のコマンドを利用してください。
 *
 *     ふりがな色サブ X
 *
 * つけた色をリセットしたい場合は以下のコマンドを利用してください。
 *
 *     ふりがな色リセット
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
            ignoreEscapeCharacters: String(parameters['Ignore Escape Characters'] || 'false') === 'true',
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
    // TextColorDetector

    function Window_TextColorDetector() {
        this.initialize.apply(this, arguments);
    }

    Window_TextColorDetector.prototype = Object.create(Window_Base.prototype);
    Window_TextColorDetector.prototype.constructor = Window_TextColorDetector;

    Window_TextColorDetector.prototype.initialize = function ()  {
        Window.prototype.initialize.call(this);
        this.loadWindowskin();
    };

    // -------------------------------------------------------------------------
    // Constant

    TextRuby.commandDictionaries = {};
    TextRuby.strictParsePhaseMain = 0;
    TextRuby.strictParsePhaseSub = 1;
    TextRuby.strictParsePhaseEnd = 2;
    TextRuby.delimiter = [];
    TextRuby.delimiter[TextRuby.strictParsePhaseMain] = {
        start: '\[', end: '\]'
    };
    TextRuby.delimiter[TextRuby.strictParsePhaseSub] = {
        start: '\(', end: '\)'
    };
    TextRuby.textColorDetector = new Window_TextColorDetector();
    TextRuby.mainTextColor = null;
    TextRuby.subTextColor = null;

    // -------------------------------------------------------------------------
    // TextRuby

    TextRuby.obtainRubyParams = function (textState) {
        var arr = /^\[([^\]]+)](?:\(([^\)]+)\))?/.exec(textState.text.slice(textState.index));
        if (!arr) return null;
        textState.index += arr[0].length;
        return arr.slice(1);
    };


    TextRuby.strictParseRubyParams = function (textState) {
        var text = textState.text.slice(textState.index);
        if (text[0] !== TextRuby.delimiter[TextRuby.strictParsePhaseMain].start) {
            return null;
        }

        var nest = 0;
        var result = ['', ''];
        var phase = TextRuby.strictParsePhaseMain;
        var subTextExists = /^\[.+\]\(.+\)/.test(text);
        var parseTextState = { index: 0, text: text };
        for (; parseTextState.index < parseTextState.text.length; parseTextState.index++) {
            switch (phase) {
                case TextRuby.strictParsePhaseMain:
                case TextRuby.strictParsePhaseSub:
                    switch (text[parseTextState.index]) {
                        case TextRuby.delimiter[phase].start:
                            nest++;
                            break;
                        case TextRuby.delimiter[phase].end:
                            nest--;
                            if (nest === 0) {
                                phase = subTextExists ? phase + 1 : TextRuby.strictParsePhaseEnd;
                            }
                            break;
                        case '\x1b':
                            Window_Base.prototype.obtainEscapeCode.call(null, parseTextState);
                            Window_Base.prototype.obtainEscapeParam.call(null, parseTextState);
                            parseTextState.index--;
                            break;
                        case '\n':
                        case '\f':
                            break;
                        default:
                            if (nest === 1) {
                                result[phase] += text[parseTextState.index];
                            }
                            break;
                    }
                    break;
                case TextRuby.strictParsePhaseEnd:
                    textState.index += parseTextState.index;
                    return result;
            }
        }
        textState.index += parseTextState.index;
        return result;
    };

    TextRuby.processDrawRuby = function (mainText, subText, textState) {
        var originalFontSize = this.contents.fontSize;
        var originalTextColor = this.contents.textColor;

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

        this.contents.textColor = TextRuby.mainTextColor === null ? originalTextColor : TextRuby.mainTextColor;
        this.contents.fontSize = mainFontSize;
        this.contents.drawText(mainText, textState.x, mainY, w, mainFontSize, 'center');

        this.contents.textColor = TextRuby.subTextColor === null ? originalTextColor : TextRuby.subTextColor;
        this.contents.fontSize = subFontSize;
        this.contents.drawText(subText, textState.x, subY, w, this.contents.fontSize, 'center');

        textState.x += w;
        this.contents.fontSize = originalFontSize;
        this.contents.textColor = originalTextColor;
    };

    TextRuby.setMainTextColor = function (colorNumber) {
        this.mainTextColor = this.textColorDetector.textColor(colorNumber);
    };

    TextRuby.setSubTextColor = function (colorNumber) {
        this.subTextColor = this.textColorDetector.textColor(colorNumber);
    };

    TextRuby.resetTextColor = function () {
        this.mainTextColor = null;
        this.subTextColor = null;
    };

    // -------------------------------------------------------------------------
    // alias

    var upstream_Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function (code, textState) {
        upstream_Window_Base_processEscapeCharacter.apply(this, arguments);
        if (code !== 'RUBY') return;
        var params = (TextRuby.settings.ignoreEscapeCharacters) ? TextRuby.strictParseRubyParams(textState) : TextRuby.obtainRubyParams(textState);
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
            case 'ふりがな色': {
                var color = Number(args[0] || 0);
                TextRuby.setMainTextColor(color);
                TextRuby.setSubTextColor(color);
                return;
            }
            case 'ふりがな色メイン': {
                var color = Number(args[0] || 0);
                TextRuby.setMainTextColor(color);
                return;
            }
            case 'ふりがな色サブ': {
                var color = Number(args[0] || 0);
                TextRuby.setSubTextColor(color);
                return;
            }
            case 'ふりがな色リセット': {
                TextRuby.resetTextColor();
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
