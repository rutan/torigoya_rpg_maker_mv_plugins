//=============================================================================
// Torigoya_TextLastGet.js
//=============================================================================

/*:
 * @plugindesc add "last get item" to message. (\lastGet)
 * @author ru_shalm
 */

/*:ja
 * @plugindesc 制御文字に「最後に取得したアイテム名/金額」（\lastGet）を追加します
 * @author ru_shalm
 */

(function (global) {
    'use strict';

    var TextLastGet = {
        name: 'Torigoya_TextGetItem',
        item: null,
        stopResetColor: false
    };

    var upstream_Window_Base_resetTextColor = Window_Base.prototype.resetTextColor;
    Window_Base.prototype.resetTextColor = function() {
        if (TextLastGet.stopResetColor) return;
        upstream_Window_Base_resetTextColor.apply(this);
    };

    var upstream_Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        upstream_Game_Party_gainItem.apply(this, arguments);
        if (amount > 0) {
            TextLastGet.item = item;
        }
    };

    var upstream_Game_Party_gainGold = Game_Party.prototype.gainGold;
    Game_Party.prototype.gainGold = function (amount) {
        upstream_Game_Party_gainGold.apply(this, arguments);
        if (amount > 0) {
            TextLastGet.item = amount;
        }
    };

    var processDrawLastGetGold = function (amount, textState) {
        var originalColor = this.contents.textColor;
        var unit = TextManager.currencyUnit;
        var w = this.textWidth(String(TextLastGet.item)) + this.textWidth(unit) + 6;
        TextLastGet.stopResetColor = true;
        this.drawCurrencyValue(TextLastGet.item, unit, textState.x, textState.y, w);
        TextLastGet.stopResetColor = false;
        this.contents.textColor = originalColor;
        textState.x += w;
    };

    var processDrawLastGetItem = function (item, textState) {
        var w = Window_Base._iconWidth + 4 + this.textWidth(TextLastGet.item.name);
        TextLastGet.stopResetColor = true;
        this.drawItemName(TextLastGet.item, textState.x, textState.y, w);
        TextLastGet.stopResetColor = false;
        textState.x += w;
    };

    var upstream_Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function (code, textState) {
        if (code === 'LASTGET') {
            if (!TextLastGet.item) return;
            switch (typeof TextLastGet.item) {
                case 'number':
                    processDrawLastGetGold.call(this, TextLastGet.item, textState);
                    break;
                default:
                    processDrawLastGetItem.call(this, TextLastGet.item, textState);
            }
            return;
        }
        upstream_Window_Base_processEscapeCharacter.apply(this, arguments);
    };

    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.TextLastGet = TextLastGet;
})(this);
