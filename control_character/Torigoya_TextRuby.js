//=============================================================================
// Torigoya_TextRuby.js
//=============================================================================

/*:
 * @plugindesc add ruby-format to message
 * @author ru_shalm
 *
 * @param Main Text Scale
 * @desc set scale of ruby-text (default: 0.9)
 * @default 0.9
 *
 * @param Sub Text Scale
 * @desc set scale of kana (default: 0.35)
 * @default 0.35
 */

/*:ja
 * @plugindesc メッセージにルビ記法を追加します
 * @author ru_shalm
 *
 * @param Main Text Scale
 * @desc ルビを振る対象文字の拡大率 (default: 0.9)
 * @default 0.9
 *
 * @param Sub Text Scale
 * @desc ルビとして振る小さい文字の拡大率 (default: 0.35)
 * @default 0.35
 */

(function (global) {
    'use strict';

    var TextRuby = {
        name: 'Torigoya_TextRuby',
        dictionary: {}
    };
    var settings = (function () {
        var parameters = PluginManager.parameters(TextRuby.name);
        return {
            mainTextScale: Number(parameters['Main Text Scale'] || 0.95),
            mainTextHorizontalMargin: Number(parameters['Main Text Horizontal Margin'] || 0.95),
            subTextScale: Number(parameters['Sub Text Scale'] || 0.4),
            subTextHorizontalMargin: Number(parameters['Sub Text Horizontal Margin'] || -10)
        };
    })();

    TextRuby.obtainRubyParams = function (textState) {
        var arr = /^\[([^\]]+)](?:\(([^\)]+)\))?/.exec(textState.text.slice(textState.index));
        if (!arr) return null;
        textState.index += arr[0].length;
        return arr.slice(1);
    };

    TextRuby.processDrawRuby = function (mainText, subText, textState) {
        var originalFontSize = this.contents.fontSize;

        var mainFontSize = originalFontSize * settings.mainTextScale;
        var mainY = textState.y + (textState.height - originalFontSize) / 2 + (originalFontSize - mainFontSize);
        var subFontSize = originalFontSize * settings.subTextScale;
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

    var upstream_Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function (code, textState) {
        upstream_Window_Base_processEscapeCharacter.apply(this, arguments);
        if (code !== 'RUBY') return;
        var params = TextRuby.obtainRubyParams(textState);
        if (!params) return;
        params[1] = params[1] || TextRuby.dictionary[params[0]];
        TextRuby.processDrawRuby.call(this, params[0], params[1], textState);
    };


    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'RubyDictionary') {
            var text = (args[0] || '').trim();
            var kana = (args[1] || '').trim();
            TextRuby.dictionary[text] = kana;
            return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.TextRuby = TextRuby;
})(this);
