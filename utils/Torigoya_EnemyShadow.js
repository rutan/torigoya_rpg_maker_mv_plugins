/*---------------------------------------------------------------------------*
 * Torigoya_EnemyShadow.js
 *---------------------------------------------------------------------------*
 * 2019/08/24 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:ja
 * @plugindesc 敵の画像の下にも影を表示するようにします
 * @author ru_shalm
 * @help
 * アクターと同じように、エネミーにも影画像を設定できるようにします。
 *
 * ------------------------------------------------------------
 * ■ オプション設定
 * ------------------------------------------------------------
 * 敵ごとに設定を変える必要がある場合は、
 * エネミーのメモ欄に以下のような設定をしてください。
 *
 * <EnemyShadow/Scale: 数字>
 * 　影を指定した拡大率に変更します
 * 　（全体の拡大率を無視してこの値を使うようになります）
 *
 * <EnemyShadow/X: 数字>
 * 　影を指定した分、下方向にずらします
 *
 * <EnemyShadow/Y: 数字>
 * 　影を指定した分、下方向にずらします
 *
 * <EnemyShadow/Hidden>
 * 　このエネミーの影を非表示にします
 *
 * @param Image
 * @type file
 * @desc 影に使う画像
 * @default Shadow2
 * @require 1
 * @dir img/system/
 *
 * @param Scale
 * @type number
 * @desc 全体的な影の拡大率
 * @default 1.00
 * @min 0.1
 * @decimals 2
 */

(function (global) {
    'use strict';

    var EnemyShadow = {
        name: 'Torigoya_EnemyShadow',
        shadowWidth: 0
    };
    EnemyShadow.settings = (function () {
        var parameters = PluginManager.parameters(EnemyShadow.name);
        return {
            image: String(parameters['Image'] || 'Shadow2'),
            scale: Number(parameters['Scale'] || 1.00),
        };
    })();

    // -------------------------------------------------------------------------
    //

    EnemyShadow.initShadowBitmap = function () {
        var bitmap = ImageManager.loadSystem(EnemyShadow.settings.image);
        if (bitmap.isReady()) {
            EnemyShadow.shadowWidth = bitmap.width;
        } else {
            bitmap.addLoadListener(function () {
                EnemyShadow.shadowWidth = bitmap.width;
            });
        }
    };

    EnemyShadow.createShadowSprite = function() {
        this._torigoya_shadowSprite = new Sprite();
        this._torigoya_shadowSprite.bitmap = ImageManager.loadSystem(EnemyShadow.settings.image);
        this._torigoya_shadowSprite.bitmap.smooth = true;
        this._torigoya_shadowSprite.anchor.x = 0.5;
        this._torigoya_shadowSprite.anchor.y = 0.5;
        this.addChild(this._torigoya_shadowSprite);
    };

    EnemyShadow.refreshShadowSprite = function() {
        if (this.bitmap.isReady()) {
            EnemyShadow.resizeShadowSprite.apply(this);
        } else {
            this.bitmap.addLoadListener(EnemyShadow.resizeShadowSprite.bind(this));
        }
    };

    EnemyShadow.resizeShadowSprite = function() {
        var enemy = this._enemy.enemy();
        var rate = Number(enemy.meta['EnemyShadow/Scale'] || EnemyShadow.settings.scale);
        var scale = rate * this.bitmap.width / EnemyShadow.shadowWidth;
        this._torigoya_shadowSprite.scale.x = scale;
        this._torigoya_shadowSprite.scale.y = scale;
        this._torigoya_shadowSprite.x = Number(enemy.meta['EnemyShadow/X'] || 0);
        this._torigoya_shadowSprite.y = Number(enemy.meta['EnemyShadow/Y'] || 0);
        this._torigoya_shadowSprite.visible = !Boolean(enemy.meta['EnemyShadow/Hidden'] || false);
    };

    // -------------------------------------------------------------------------
    //

    var upstream_Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        upstream_Sprite_Enemy_initMembers.apply(this);
        EnemyShadow.createShadowSprite.apply(this);
    };

    var upstream_Sprite_Enemy_loadBitmap = Sprite_Enemy.prototype.loadBitmap;
    Sprite_Enemy.prototype.loadBitmap = function(name, hue) {
        upstream_Sprite_Enemy_loadBitmap.apply(this, arguments);
        EnemyShadow.refreshShadowSprite.apply(this);
    };

    var upstream_Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function () {
        upstream_Scene_Boot_loadSystemImages.apply(this);
        EnemyShadow.initShadowBitmap();
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.EnemyShadow = EnemyShadow;
})(this);
