//=============================================================================
// Torigoya_BSModule_Preset01.js
//=============================================================================

/*:ja
 * @plugindesc 戦闘表示モジュールさん - プリセット01
 * @author ru_shalm
 *
 * @param ■ 背景
 *
 * @param Back: Image
 * @desc 背景の画像ファイル名(img/system/○○.png)
 * @default bsmodule_back
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Back: X
 * @desc 背景画像の X 座標（横）
 * @default 0
 *
 * @param Back: Y
 * @desc 背景画像の Y 座標（縦）
 * @default 16
 *
 * @param Back: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 10
 *
 * @param ■ 装飾(文字など)
 *
 * @param Front: Image
 * @desc 装飾画像のファイル名(img/system/○○.png)
 * @default bsmodule_front
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Front: X
 * @desc 装飾画像の X 座標（横）
 * @default 0
 *
 * @param Front: Y
 * @desc 装飾画像の Y 座標（縦）
 * @default 16
 *
 * @param Front: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 255
 *
 * @param ■ 顔グラフィック
 *
 * @param Face: X
 * @desc 顔グラフィックの X 座標（横）
 * @default 72
 *
 * @param Face: Y
 * @desc 顔グラフィックの Y 座標（縦）
 * @default 144
 *
 * @param Face: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 0
 *
 * @param Face: Opacity
 * @desc 顔グラフィックの透明度(0〜255。数値が小さいほど透明)
 * @default 128
 *
 * @param ■ HPゲージ表示
 *
 * @param HP Gauge: Type
 * @desc HPゲージの形状（0: 左から右に伸びるゲージ / 1: 下から上に伸びるゲージ / 3: 専用画像）
 * @default 0
 *
 * @param HP Gauge: Image
 * @desc HPゲージ画像のファイル名(img/system/○○.png)
 * @default bsmodule_gauge_hp
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param HP Gauge: Size
 * @desc ゲージ画像の分割数（形状の設定で `3: 専用画像` を選んだ場合のみ使用します）
 * @default 1
 *
 * @param HP Gauge: X
 * @desc HPゲージの X 座標（横）
 * @default 64
 *
 * @param HP Gauge: Y
 * @desc HPゲージの Y 座標（縦）
 * @default 102
 *
 * @param HP Gauge: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 100
 *
 * @param HP Counter: Image
 * @desc HP表示の数字画像ファイル名(img/system/○○.png)
 * @default bsmodule_counter_normal
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param HP Counter: BasePosition
 * @desc 表示基準位置(1〜9)
 * @default 3
 *
 * @param HP Counter: X
 * @desc HP表示の X 座標（横）
 * @default 190
 *
 * @param HP Counter: Y
 * @desc HP表示の Y 座標（縦）
 * @default 110
 *
 * @param HP Counter: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 110
 *
 * @param ■ MPゲージ表示
 *
 * @param MP Gauge: Type
 * @desc MPゲージの形状（0: 左から右に伸びるゲージ / 1: 下から上に伸びるゲージ / 3: 専用画像）
 * @default 0
 *
 * @param MP Gauge: Image
 * @desc MPゲージ画像のファイル名(img/system/○○.png)
 * @default bsmodule_gauge_mp
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param MP Gauge: Size
 * @desc ゲージ画像の分割数（形状の設定で `3: 専用画像` を選んだ場合のみ使用します）
 * @default 1
 *
 * @param MP Gauge: X
 * @desc MPゲージの X 座標（横）
 * @default 64
 *
 * @param MP Gauge: Y
 * @desc MPゲージの Y 座標（縦）
 * @default 125
 *
 * @param MP Gauge: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 100
 *
 * @param MP Counter: Image
 * @desc MP表示の数字画像ファイル名(img/system/○○.png)
 * @default bsmodule_counter_normal
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param MP Counter: BasePosition
 * @desc 表示基準位置(1〜9)
 * @default 3
 *
 * @param MP Counter: X
 * @desc MP表示の X 座標（横）
 * @default 190
 *
 * @param MP Counter: Y
 * @desc MP表示の Y 座標（縦）
 * @default 134
 *
 * @param MP Counter: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 110
 *
 * @param ■ TPゲージ表示
 *
 * @param TP Gauge: Type
 * @desc TPゲージの形状（0: 左から右に伸びるゲージ / 1: 下から上に伸びるゲージ / 3: 専用画像）
 * @default 1
 *
 * @param TP Gauge: Image
 * @desc TPゲージ画像のファイル名(img/system/○○.png)
 * @default bsmodule_gauge_tp
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param TP Gauge: Size
 * @desc ゲージ画像の分割数（形状の設定で `3: 専用画像` を選んだ場合のみ使用します）
 * @default 1
 *
 * @param TP Gauge: X
 * @desc TPゲージの X 座標（横）
 * @default 8
 *
 * @param TP Gauge: Y
 * @desc TPゲージの Y 座標（縦）
 * @default 136
 *
 * @param TP Gauge: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 100
 *
 * @param TP Counter: Image
 * @desc TP表示の数字画像ファイル名(img/system/○○.png)
 * @default bsmodule_counter_small
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param TP Counter: BasePosition
 * @desc 表示基準位置(1〜9)
 * @default 2
 *
 * @param TP Counter: X
 * @desc TP表示の X 座標（横）
 * @default 20
 *
 * @param TP Counter: Y
 * @desc TP表示の Y 座標（縦）
 * @default 138
 *
 * @param TP Counter: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 110
 *
 * @param ■ ステート表示
 *
 * @param States: X
 * @desc TP表示の X 座標（横）
 * @default 164
 *
 * @param States: Y
 * @desc TP表示の Y 座標（縦）
 * @default 52
 *
 * @param States: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 255
 *
 * @param States: Wait
 * @desc ステートの表示時間( 60 ＝ 約1秒 )
 * @default 60
 *
 * @param ■ 選択中の背景
 *
 * @param Selector: gradient start
 * @desc 選択中背景グラデーションの開始色
 * @default rgba(255, 255, 255, 0)
 *
 * @param Selector: gradient end
 * @desc 選択中背景グラデーションの終了色
 * @default rgba(255, 255, 255, 1)
 *
 * @param Selector: opacity
 * @desc 選択中背景の透明度(0〜255。数値が小さいほど透明)
 * @default 128
 *
 * @param Selector: Z
 * @desc 表示優先度(数値が大きいほど手前に表示)
 * @default 128
 *
 * @help
 * このプラグインは「戦闘表示モジュールさん - 基本パック」
 * （Torigoya_BSModule_Base.js）の追加アドオンです。
 * 導入の際は「戦闘表示モジュールさん - 基本パック」が
 * このプラグインより上に導入されている必要があります。
 *
 * --------------------
 *
 * 戦闘表示モジュールさんにHP表示などを設定したプリセットプラグインです。
 */

(function (global) {
    'use strict';

    if (!global.Torigoya || !global.Torigoya.BSModule) {
        var errorMessage = 'missing plugin `Torigoya_BSModule_Base.js`\n「戦闘表示モジュールさん - 基本パック」が見つかりません';
        alert(errorMessage);
        throw errorMessage;
    }

    // -------------------------------------------------------------------------
    // settings

    var BSModule = global.Torigoya.BSModule;
    BSModule.Preset01 = {
        name: 'Torigoya_BSModule_Preset01'
    };
    BSModule.Preset01.settings = (function () {
        var parameters = PluginManager.parameters(BSModule.Preset01.name);
        return {
            selector: {
                gradientStart: String(parameters['Selector: gradient start'] || 'rgba(255, 255, 255, 0)'),
                gradientEnd: String(parameters['Selector: gradient end'] || 'rgba(255, 255, 255, 255)'),
                opacity: Number(parameters['Selector: opacity'] || 128),
                z: Number(parameters['Selector: Z'] || 0)
            },
            back: {
                image: String(parameters['Back: Image'] || 'bsmodule_back'),
                x: Number(parameters['Back: X'] || 0),
                y: Number(parameters['Back: Y'] || 16),
                z: Number(parameters['Back: Z'] || 10)
            },
            front: {
                image: String(parameters['Front: Image'] || 'bsmodule_front'),
                x: Number(parameters['Front: X'] || 0),
                y: Number(parameters['Front: Y'] || 16),
                z: Number(parameters['Front: Z'] || 255)
            },
            face: {
                x: Number(parameters['Face: X'] || 72),
                y: Number(parameters['Face: Y'] || 144),
                z: Number(parameters['Face: Z'] || 5),
                opacity: Number(parameters['Face: Opacity'] || 128)
            },
            hp: {
                gauge: {
                    type: Number(parameters['HP Gauge: Type'] || 0),
                    image: String(parameters['HP Gauge: Image'] || 'bsmodule_gauge_hp'),
                    x: Number(parameters['HP Gauge: X'] || 64),
                    y: Number(parameters['HP Gauge: Y'] || 102),
                    z: Number(parameters['HP Gauge: Z'] || 100)
                },
                counter: {
                    image: String(parameters['HP Counter: Image'] || 'bsmodule_counter_normal'),
                    x: Number(parameters['HP Counter: X'] || 190),
                    y: Number(parameters['HP Counter: Y'] || 110),
                    z: Number(parameters['HP Counter: Z'] || 150),
                    basePosition: Number(parameters['HP Counter: BasePosition'] || 3)
                }
            },
            mp: {
                gauge: {
                    type: Number(parameters['MP Gauge: Type'] || 0),
                    image: String(parameters['MP Gauge: Image'] || 'bsmodule_gauge_mp'),
                    x: Number(parameters['MP Gauge: X'] || 64),
                    y: Number(parameters['MP Gauge: Y'] || 125),
                    z: Number(parameters['MP Gauge: Z'] || 100)
                },
                counter: {
                    image: String(parameters['MP Counter: Image'] || 'bsmodule_counter_normal'),
                    x: Number(parameters['MP Counter: X'] || 190),
                    y: Number(parameters['MP Counter: Y'] || 134),
                    z: Number(parameters['MP Counter: Z'] || 150),
                    basePosition: Number(parameters['MP Counter: BasePosition'] || 3)
                }
            },
            tp: {
                gauge: {
                    type: Number(parameters['TP Gauge: Type'] || 1),
                    image: String(parameters['TP Gauge: Image'] || 'bsmodule_gauge_tp'),
                    x: Number(parameters['TP Gauge: X'] || 8),
                    y: Number(parameters['TP Gauge: Y'] || 136),
                    z: Number(parameters['TP Gauge: Z'] || 100)
                },
                counter: {
                    image: String(parameters['TP Counter: Image'] || 'bsmodule_counter_small'),
                    x: Number(parameters['TP Counter: X'] || 20),
                    y: Number(parameters['TP Counter: Y'] || 138),
                    z: Number(parameters['TP Counter: Z'] || 150),
                    basePosition: Number(parameters['TP Counter: BasePosition'] || 2)
                }
            },
            states: {
                x: Number(parameters['States: X'] || 164),
                y: Number(parameters['States: Y'] || 52),
                z: Number(parameters['States: Z'] || 255),
                wait: Number(parameters['States: Wait'] || 60)
            }
        };
    })();

    // -------------------------------------------------------------------------
    // DisplayModule_Selector

    var DisplayModule_Selector = BSModule.createModule({
        onCreate: function () {
            var bitmap = new Bitmap(this.parent.width, this.parent.height);
            bitmap.gradientFillRect(
                0, 0, bitmap.width, bitmap.height,
                BSModule.Preset01.settings.selector.gradientStart,
                BSModule.Preset01.settings.selector.gradientEnd,
                true
            );
            this._sprite = new Sprite(bitmap);
            this._sprite.opacity = BSModule.Preset01.settings.selector.opacity;
            this._sprite.visible = false;
            this.reserveAddChild(this._sprite, BSModule.Preset01.settings.selector.z);
        },
        onUpdate: function (_actor) {
            if (this.parent.isSelected()) {
                this._sprite.visible = true;
            } else {
                this._sprite.visible = false;
            }
        }
    });

    BSModule.registerModule(DisplayModule_Selector);

    // -------------------------------------------------------------------------
    // DisplayModule_Back

    var DisplayModule_Back = BSModule.createModule({
        onCreate: function () {
            var bitmap = ImageManager.loadSystem(BSModule.Preset01.settings.back.image);
            this._sprite = new Sprite(bitmap);
            this._sprite.x = BSModule.Preset01.settings.back.x;
            this._sprite.y = BSModule.Preset01.settings.back.y;
            this.reserveAddChild(this._sprite, BSModule.Preset01.settings.back.z);
        }
    });

    BSModule.registerModule(DisplayModule_Back);

    // -------------------------------------------------------------------------
    // DisplayModule_Front

    var DisplayModule_Front = BSModule.createModule({
        onCreate: function () {
            var bitmap = ImageManager.loadSystem(BSModule.Preset01.settings.front.image);
            this._sprite = new Sprite(bitmap);
            this._sprite.x = BSModule.Preset01.settings.front.x;
            this._sprite.y = BSModule.Preset01.settings.front.y;
            this.reserveAddChild(this._sprite, BSModule.Preset01.settings.front.z);
        }
    });

    BSModule.registerModule(DisplayModule_Front);

    // -------------------------------------------------------------------------
    // DisplayModule_Face

    var DisplayModule_Face = BSModule.createModule({
        onCreate: function () {
            this._sprite = new Sprite();
            this._sprite.x = BSModule.Preset01.settings.face.x;
            this._sprite.y = BSModule.Preset01.settings.face.y;
            this._sprite.opacity = BSModule.Preset01.settings.face.opacity;
            this._sprite.anchor.x = 0.5;
            this._sprite.anchor.y = 1;
            this.reserveAddChild(this._sprite, BSModule.Preset01.settings.face.z);
            this._changed = false;
            this._dead = false;
        },
        onRefresh: function (actor) {
            this._faceBitmap = ImageManager.loadFace(actor.faceName());
            this._changed = true;
        },
        onUpdate: function (actor) {
            if (this._changed && this._faceBitmap && this._faceBitmap.isReady()) {
                this._updateImage(actor);
                this._changed = false;
            }
            if (this._dead !== actor.isDead()) {
                this._dead = actor.isDead();
                this._changed = true;
            }
        },
        _updateImage: function (actor) {
            var faceIndex = actor.faceIndex();
            var bitmap = new Bitmap(this._faceBitmap.width / 4, this._faceBitmap.height / 2);
            bitmap.blt(
                this._faceBitmap,
                this._faceBitmap.width * ~~(faceIndex % 4) / 4,
                this._faceBitmap.height * ~~(faceIndex / 4) / 2,
                this._faceBitmap.width / 4,
                this._faceBitmap.height / 2,
                0,
                0
            );
            this._sprite.bitmap = bitmap;
            var tone = this._dead ? [0, -160, -160, 0] : [0, 0, 0, 0];
            this._sprite.setColorTone(tone);
        }
    });

    BSModule.registerModule(DisplayModule_Face);

    // -------------------------------------------------------------------------
    // DisplayModule_HP

    var DisplayModule_HP = BSModule.createModule({
        onCreate: function () {
            // ゲージ
            var bitmapGauge = ImageManager.loadSystem(BSModule.Preset01.settings.hp.gauge.image);
            switch (BSModule.Preset01.settings.hp.gauge.type) {
                case 0:
                    this._gauge = new BSModule.Sprite_GaugeHorizontal(bitmapGauge);
                    break;
                case 1:
                    this._gauge = new BSModule.Sprite_GaugeVertical(bitmapGauge);
                    break;
                case 2:
                    this._gauge = new BSModule.Sprite_GaugeSheet(bitmapGauge, BSModule.Preset01.settings.hp.gauge.size);
                    break;
            }
            this._gauge.x = BSModule.Preset01.settings.hp.gauge.x;
            this._gauge.y = BSModule.Preset01.settings.hp.gauge.y;
            this.reserveAddChild(this._gauge, BSModule.Preset01.settings.hp.gauge.z);

            // 数値
            var bitmapNumber = ImageManager.loadSystem(BSModule.Preset01.settings.hp.counter.image);
            this._numbers = new BSModule.Sprite_Numbers(bitmapNumber);
            this._numbers.x = BSModule.Preset01.settings.hp.counter.x;
            this._numbers.y = BSModule.Preset01.settings.hp.counter.y;
            this._numbers.basePosition = BSModule.Preset01.settings.hp.counter.basePosition;
            this.reserveAddChild(this._numbers, BSModule.Preset01.settings.hp.counter.z);
        },
        onRefresh: function (actor) {
            this._numbers.setValue(actor.hp, actor.mhp * 0.3);
            this._gauge.setValue(actor.hp, actor.mhp);
            this._numbers.update();
            this._gauge.update();
        },
        onUpdate: function (actor) {
            this._numbers.value = (actor.hp);
            this._numbers.borderValue = actor.mhp * 0.3;
            this._gauge.value = actor.hp;
            this._gauge.maxValue = actor.mhp;
            this._numbers.update();
            this._gauge.update();
        }
    });

    BSModule.registerModule(DisplayModule_HP);

    // -------------------------------------------------------------------------
    // DisplayModule_MP

    var DisplayModule_MP = BSModule.createModule({
        onCreate: function () {
            // ゲージ
            var bitmapGauge = ImageManager.loadSystem(BSModule.Preset01.settings.mp.gauge.image);
            switch (BSModule.Preset01.settings.mp.gauge.type) {
                case 0:
                    this._gauge = new BSModule.Sprite_GaugeHorizontal(bitmapGauge);
                    break;
                case 1:
                    this._gauge = new BSModule.Sprite_GaugeVertical(bitmapGauge);
                    break;
                case 2:
                    this._gauge = new BSModule.Sprite_GaugeSheet(bitmapGauge, BSModule.Preset01.settings.mp.gauge.size);
                    break;
            }
            this._gauge.x = BSModule.Preset01.settings.mp.gauge.x;
            this._gauge.y = BSModule.Preset01.settings.mp.gauge.y;
            this.reserveAddChild(this._gauge, BSModule.Preset01.settings.mp.gauge.z);

            // 数値
            var bitmapNumber = ImageManager.loadSystem(BSModule.Preset01.settings.mp.counter.image);
            this._numbers = new BSModule.Sprite_Numbers(bitmapNumber);
            this._numbers.x = BSModule.Preset01.settings.mp.counter.x;
            this._numbers.y = BSModule.Preset01.settings.mp.counter.y;
            this._numbers.basePosition = BSModule.Preset01.settings.mp.counter.basePosition;
            this.reserveAddChild(this._numbers, BSModule.Preset01.settings.mp.counter.z);
        },
        onRefresh: function (actor) {
            this._numbers.setValue(actor.mp, actor.mmp * 0.3);
            this._gauge.setValue(actor.mp, actor.mmp);
            this._gauge.value = actor.mp;
            this._gauge.maxValue = actor.mmp;
            this._numbers.update();
            this._gauge.update();
        },
        onUpdate: function (actor) {
            this._numbers.value = (actor.mp);
            this._numbers.borderValue = actor.mmp * 0.3;
            this._gauge.value = actor.mp;
            this._gauge.maxValue = actor.mmp;
            this._numbers.update();
            this._gauge.update();
        }
    });

    BSModule.registerModule(DisplayModule_MP);

    // -------------------------------------------------------------------------
    // DisplayModule_TP

    var DisplayModule_TP = BSModule.createModule({
        onCreate: function () {
            if ($dataSystem.optDisplayTp) {
                // ゲージ
                var bitmapGauge = ImageManager.loadSystem(BSModule.Preset01.settings.tp.gauge.image);
                switch (BSModule.Preset01.settings.tp.gauge.type) {
                    case 0:
                        this._gauge = new BSModule.Sprite_GaugeHorizontal(bitmapGauge);
                        break;
                    case 1:
                        this._gauge = new BSModule.Sprite_GaugeVertical(bitmapGauge);
                        break;
                    case 2:
                        this._gauge = new BSModule.Sprite_GaugeSheet(bitmapGauge, BSModule.Preset01.settings.tp.gauge.size);
                        break;
                }
                this._gauge.x = BSModule.Preset01.settings.tp.gauge.x;
                this._gauge.y = BSModule.Preset01.settings.tp.gauge.y;
                this.reserveAddChild(this._gauge, BSModule.Preset01.settings.tp.gauge.z);

                // 数値
                var bitmapNumber = ImageManager.loadSystem(BSModule.Preset01.settings.tp.counter.image);
                this._numbers = new BSModule.Sprite_Numbers(bitmapNumber);
                this._numbers.x = BSModule.Preset01.settings.tp.counter.x;
                this._numbers.y = BSModule.Preset01.settings.tp.counter.y;
                this._numbers.basePosition = BSModule.Preset01.settings.tp.counter.basePosition;
                this.reserveAddChild(this._numbers, BSModule.Preset01.settings.tp.counter.z);
            }
        },
        onRefresh: function (actor) {
            if ($dataSystem.optDisplayTp) {
                this._numbers.setValue(actor.tp, -1);
                this._gauge.setValue(actor.tp, actor.maxTp());
                this._numbers.update();
                this._gauge.update();
            }
        },
        onUpdate: function (actor) {
            if ($dataSystem.optDisplayTp) {
                this._numbers.value = (actor.tp);
                this._gauge.value = actor.tp;
                this._gauge.maxValue = actor.maxTp();
                this._numbers.update();
                this._gauge.update();
            }
        }
    });

    BSModule.registerModule(DisplayModule_TP);

    // -------------------------------------------------------------------------
    // DisplayModule_States

    var DisplayModule_States = BSModule.createModule({
        onCreate: function () {
            var bitmap = ImageManager.loadSystem('IconSet');
            this._sprite = new Sprite(bitmap);
            this._sprite.visible = false;
            this._sprite.x = BSModule.Preset01.settings.states.x;
            this._sprite.y = BSModule.Preset01.settings.states.y;
            this.reserveAddChild(this._sprite, BSModule.Preset01.settings.states.z);
            this._index = 0;
            this._timer = 0;
        },
        onUpdate: function (actor) {
            var icons = actor.allIcons();
            if (icons.length > 0) {
                var index = icons[this._index];
                this._sprite.setFrame(32 * (index % 16), 32 * ~~(index / 16), 32, 32);
                if (this._timer % BSModule.Preset01.settings.states.wait == 0) {
                    this._index = (this._index + 1) % icons.length;
                    this._timer = 0;
                }
                this._timer++;
                this._sprite.visible = true;
            } else {
                this._sprite.visible = false;
            }
        }
    });

    BSModule.registerModule(DisplayModule_States);
})(this);
