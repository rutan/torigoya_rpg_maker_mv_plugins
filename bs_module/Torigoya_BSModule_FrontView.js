//=============================================================================
// Torigoya_BSModule_FrontView.js
//=============================================================================

/*:
 * @plugindesc Battle Layout: Base
 * @author ru_shalm
 *
 * @help
 * This plugin is add-on of `Torigoya_BSModule_Base.js`.
 * Require install `Torigoya_BSModule_Base.js`.
 *
 * --------------------
 * This plugin add `Torigoya_BSModule_Base.js` to support in the front-view.
 *
 * - display animation of actor
 * - display damage popup of actor
 */

/*:ja
 * @plugindesc 戦闘表示モジュールさん - フロントビュー対応アドオン
 * @author ru_shalm
 *
 * @param 設定項目はありません
 *
 * @help
 * このプラグインは「戦闘表示モジュールさん - 基本パック」
 * （Torigoya_BSModule_Base.js）の追加アドオンです。
 * 導入の際は「戦闘表示モジュールさん - 基本パック」が
 * このプラグインより上に導入されている必要があります。
 *
 * --------------------
 *
 * 「戦闘表示モジュールさん」の表示をフロントビュー戦闘に対応します。
 *
 * - 味方に対する戦闘アニメを表示するようにします
 * - 味方被弾時にダメージポップアップを表示するようにします
 */

(function (global) {
    'use strict';

    if (!global.Torigoya || !global.Torigoya.BSModule) {
        var errorMessage = 'missing plugin `Torigoya_BSModule_Base.js`\n「戦闘表示モジュールさん - 基本パック」が見つかりません';
        alert(errorMessage);
        throw errorMessage;
    }

    // -------------------------------------------------------------------------

    var BSModule = global.Torigoya.BSModule;
    BSModule.FrontView = {
        name: 'Torigoya_BSModule_FrontView'
    };

    // -------------------------------------------------------------------------

    // フロントビューでもアクターが存在することにする
    var upstream_Game_Actor_isSpriteVisible = Game_Actor.prototype.isSpriteVisible;
    Game_Actor.prototype.isSpriteVisible = function () {
        if ($gameSystem.isSideView()) {
            return upstream_Game_Actor_isSpriteVisible.apply(this);
        } else {
            return true;
        }
    };

    // アクターに対する戦闘アニメの位置を補正
    var upstream_Sprite_Animation_updatePosition = Sprite_Animation.prototype.updatePosition;
    Sprite_Animation.prototype.updatePosition = function () {
        upstream_Sprite_Animation_updatePosition.apply(this);
        if ($gameSystem.isSideView()) return;

        if (this._target && this._target.parent instanceof global.Sprite_Actor) {
            switch (this._animation.position) {
                case 0: // 頭上
                    this.y -= BSModule.settings.actorStatus.height;
                    break;
                case 1: // 中央
                    this.y -= BSModule.settings.actorStatus.height / 2;
                    break;
                case 3: // 全体
                    this.y = this.parent.height * 3 / 4;
                    break;
            }
        }
    };

    // が、アクターは非表示にする
    var upstream_Sprite_Battler_updateVisibility = Sprite_Battler.prototype.updateVisibility;
    Sprite_Battler.prototype.updateVisibility = function () {
        upstream_Sprite_Battler_updateVisibility.apply(this);
        if (!$gameSystem.isSideView() && this._battler && this._battler.isActor()) {
            this.visible = false;
        }
    };

    // アクターが動かないように制限する
    var upstream_Sprite_Battler_startMove = Sprite_Battler.prototype.startMove;
    Sprite_Battler.prototype.startMove = function(x, y, duration) {
        if ($gameSystem.isSideView()) {
            upstream_Sprite_Battler_startMove.apply(this, arguments);
        }
    };

    // アクター画像はなし
    var upstream_Sprite_Actor_updateBitmap = Sprite_Actor.prototype.updateBitmap;
    Sprite_Actor.prototype.updateBitmap = function () {
        if ($gameSystem.isSideView()) {
            upstream_Sprite_Actor_updateBitmap.apply(this);
        }
    };

    // ダメージポップアップ: X
    var upstream_Sprite_Actor_damageOffsetX = Sprite_Actor.prototype.damageOffsetX;
    Sprite_Actor.prototype.damageOffsetX = function () {
        if ($gameSystem.isSideView()) {
            return upstream_Sprite_Actor_damageOffsetX.apply(this);
        } else {
            return 0;
        }
    };

    // ダメージポップアップ: Y
    var upstream_Sprite_Actor_damageOffsetY = Sprite_Actor.prototype.damageOffsetY;
    Sprite_Actor.prototype.damageOffsetY = function () {
        if ($gameSystem.isSideView()) {
            return upstream_Sprite_Actor_damageOffsetY.apply(this);
        } else {
            return -BSModule.settings.actorStatus.height / 2;
        }
    };

    // 基準位置をステータスウィンドウの位置に合わせる
    var upstream_Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
    Sprite_Actor.prototype.setActorHome = function (index) {
        if ($gameSystem.isSideView()) {
            upstream_Sprite_Actor_setActorHome.apply(this, arguments);
        } else {
            var partyWindow = BattleManager.torigoyaBSModule_battlePartyWindow();
            var actorWindow = partyWindow.getSprite(index);
            this.setHome(partyWindow.x + actorWindow.x + actorWindow.width / 2, partyWindow.y + actorWindow.y + actorWindow.height);
        }
    };

    // パーティウィンドウ更新のタイミングでsetActorHomeを呼び出す
    var upstream_Spriteset_Battle_createActors = Spriteset_Battle.prototype.createActors;
    Spriteset_Battle.prototype.createActors = function () {
        upstream_Spriteset_Battle_createActors.apply(this);

        var partyWindow = BattleManager.torigoyaBSModule_battlePartyWindow();
        partyWindow.addHandler('refresh', function () {
            if (!$gameSystem.isSideView()) {
                this._actorSprites.forEach(function (actorSprite) {
                    if (actorSprite._actor) {
                        actorSprite.setActorHome(actorSprite._actor.index());
                    }
                });
            }
        }.bind(this));
    };
})(this);
