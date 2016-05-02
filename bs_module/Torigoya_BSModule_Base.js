//=============================================================================
// Torigoya_BSModule_Base.js
//=============================================================================

/*:
 * @plugindesc BattleStatus Module: Base
 * @author ru_shalm
 *
 * @param ■ general
 *
 * @param PartyWindow: background
 * @desc Party window type (0: transparent / 1: normal window / 2: image)
 * @default 0
 *
 * @param PartyWindow: image
 * @desc party window image file (if choice `2` in `PartyWindow: background`)
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param PartyWindow: padding
 * @desc padding of Party window
 * @default 8
 *
 * @param ■ Actor Status
 *
 * @param ActorStatus: width
 * @desc width of ActorStatus area
 * @default 200
 *
 * @param ActorStatus: height
 * @desc height of ActorStatus area
 * @default 144
 *
 * @param ActorStatus: margin
 * @desc margin of ActorStatus area
 * @default 0
 *
 * @help
 *   the base plugin of customize battle status.
 */

/*:ja
 * @plugindesc 戦闘表示モジュールさん - 基本パック
 * @author ru_shalm
 *
 * @param ■ 全般
 *
 * @param PartyWindow: background
 * @desc パーティ表示の背景表示 (0: なし / 1: ウィンドウ / 2: 画像)
 * @default 0
 *
 * @param PartyWindow: image
 * @desc パーティ表示の背景画像ファイル (パーティ表示の背景表示で 2 を選択した場合のみ)
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param PartyWindow: padding
 * @desc パーティ表示の余白
 * @default 8
 *
 * @param ■ アクター表示部
 *
 * @param ActorStatus: width
 * @desc アクター表示欄の幅
 * @default 200
 *
 * @param ActorStatus: height
 * @desc アクター表示欄の高さ
 * @default 144
 *
 * @param ActorStatus: margin
 * @desc アクター表示同士の間隔
 * @default 0
 *
 * @help
 *   戦闘画面のステータス表示を変更するためのベースプラグインです。
 */

(function (global) {
    'use strict';

    var BSModule = {
        name: 'Torigoya_BSModule_Base'
    };
    BSModule.settings = (function () {
        var parameters = PluginManager.parameters(BSModule.name);
        return {
            partyWindow: {
                background: Number(parameters['PartyWindow: background'] || 0),
                image: String(parameters['PartyWindow: image'] || 'bsmodule_party_back'),
                padding: Number(parameters['PartyWindow: padding'] || 8)
            },
            actorStatus: {
                width: Number(parameters['ActorStatus: width'] || 200),
                height: Number(parameters['ActorStatus: height'] || 144),
                margin: Number(parameters['ActorStatus: margin'] || 0)
            }
        };
    })();

    //-----------------------------------------------------------------------------
    // EasingController

    /**
     * EasingController
     * @constructor
     */
    function EasingController() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 初期化
     * @param {Object} obj 変更対象オブジェクト
     * @param {String} keyName 変更対象のキー名
     */
    EasingController.prototype.initialize = function (obj, keyName) {
        this._obj = obj;
        this._keyName = keyName;
        this._playing = false;
    };

    /**
     * イージングの開始
     * @param {Number} value 変更値
     * @param {Number} time 完了までのフレーム数
     */
    EasingController.prototype.start = function (value, time) {
        if (this._playing && value === this._endValue) return;
        if (!this._playing && value === this._obj[this._keyName]) return;
        if (!time) time = 30;

        this._playing = true;
        this._timer = 0;
        this._timerMax = time;
        this._startValue = this._obj[this._keyName];
        this._endValue = value;
    };

    /**
     * イージングの中断
     */
    EasingController.prototype.stop = function () {
        if (!this._playing) return;
        this._playing = false;
        this._obj[this._keyName] = this._endValue;
    };

    /**
     * 更新処理
     */
    EasingController.prototype.update = function () {
        if (!this._playing) return;

        if (this._timer < this._timerMax) {
            var n = this._startValue + (this._endValue - this._startValue) * Math.sin((this._timer / this._timerMax) * (Math.PI / 2));
            this._obj[this._keyName] = n;
            this._timer++;
        } else {
            this._obj[this._keyName] = this._endValue;
            this._playing = false;
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_Number

    /**
     * Sprite_Number
     * @constructor
     */
    function Sprite_Number() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Number.prototype = Object.create(Sprite.prototype);
    Sprite_Number.prototype.constructor = Sprite_Number;

    Object.defineProperties(Sprite_Number.prototype, {
        value: {
            get: function () {
                return this._value;
            },
            set: function (n) {
                if (n < 0) return;
                if (n > 9) return;
                if (this._value != n) {
                    this._value = n;
                    this._changed = true;
                }
            },
            configurable: true
        },
        color: {
            get: function () {
                return this._color;
            },
            set: function (n) {
                if (this._color != n) {
                    this._color = n;
                    this._changed = true;
                }
            },
            configurable: true
        }
    });

    /**
     * 初期化
     * @param {Bitmap} bitmap 数字用の画像
     */
    Sprite_Number.prototype.initialize = function (bitmap) {
        Sprite.prototype.initialize.call(this, bitmap);
        this._value = 0;
        this._color = 0;
        this._changed = true;
    };

    /**
     * 更新処理
     */
    Sprite_Number.prototype.update = function () {
        if (this._changed && this._bitmap.isReady()) {
            this._updateFrame();
            this._changed = false;
        }
    };

    /**
     * フレームの設定
     * @private
     */
    Sprite_Number.prototype._updateFrame = function () {
        var w = this._bitmap.width / 10;
        var h = this._bitmap.height / 2;
        this.setFrame(w * this._value, h * this._color, w, h);
    };

    //-----------------------------------------------------------------------------
    // Sprite_Numbers

    /**
     * Sprite_Numbers
     * @constructor
     */
    function Sprite_Numbers() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Numbers.prototype = Object.create(Sprite.prototype);
    Sprite_Numbers.prototype.constructor = Sprite_Numbers;

    Object.defineProperties(Sprite_Numbers.prototype, {
        value: {
            get: function () {
                return this._rawValue;
            },
            set: function (n) {
                n = ~~n;
                if (n < 0) n = 0;
                if (this._rawValue != n) {
                    this._startAnimation(n);
                }
            },
            configurable: true
        },
        displayValue: {
            get: function () {
                return this._displayValue;
            },
            set: function (n) {
                n = ~~n;
                if (n < 0) n = 0;
                if (this._displayValue !== n) {
                    this._displayValue = n;
                    this._changed = true;
                }
            },
            configurable: true
        },
        borderValue: {
            get: function () {
                return this._borderValue;
            },
            set: function (n) {
                if (this._borderValue !== n) {
                    this._borderValue = n;
                    this._changed = true;
                }
            },
            configurable: true
        },
        basePosition: {
            get: function () {
                return this._basePosition;
            },
            set: function (n) {
                if (this._basePosition != n) {
                    this._basePosition = n;
                    this._changed = true;
                }
            },
            configurable: true
        }
    });

    /**
     * 初期化
     * @param {Bitmap} bitmap 数字用の画像
     */
    Sprite_Numbers.prototype.initialize = function (bitmap) {
        Sprite.prototype.initialize.call(this);

        this._srcBitmap = bitmap;

        this._container = new Sprite();
        this.addChild(this._container);
        this._sprites = [];
        this._addSprite();

        this._rawValue = 0;
        this._displayValue = 0;
        this._borderValue = -1;
        this._basePosition = 7;
        this._easingController = new EasingController(this, 'displayValue');
    };

    /**
     * 更新処理
     */
    Sprite_Numbers.prototype.update = function () {
        this._easingController.update();
        if (this._changed && this._srcBitmap.isReady()) {
            this._changed = false;
            this._updateChildren();
        }
    };

    /**
     * 値の設定
     * @note このメソッドで値を設定した場合、イージング処理はスキップされる
     * @param {Number} value 値
     * @param {Number} borderValue 色変更を行う境界値
     */
    Sprite_Numbers.prototype.setValue = function (value, borderValue) {
        if (value === this._rawValue) return;
        this._easingController.stop();
        this._rawValue = value;
        this._displayValue = value;
        this._borderValue = borderValue;
    };

    /**
     * 子要素の更新
     * @private
     */
    Sprite_Numbers.prototype._updateChildren = function () {
        var nums = String(this._displayValue).split('').map(function (n) {
            return ~~n;
        });
        while (this._sprites.length < nums.length) this._addSprite();

        var w = this._srcBitmap.width / 10;
        var h = this._srcBitmap.height / 2;
        var totalWidth = w * nums.length;

        this._container.x = 0;
        this._container.y = 0;
        if (this._basePosition % 3 == 2) this._container.x -= totalWidth / 2;
        if (this._basePosition % 3 == 0) this._container.x -= totalWidth;
        if (this._basePosition / 3 <= 1) this._container.y -= h;
        else if (this._basePosition / 3 <= 2) this._container.y -= h / 2;

        for (var i = 0; i < this._sprites.length; ++i) {
            var num = nums[i];
            var sprite = this._sprites[i];
            if (num === undefined) {
                sprite.visible = false;
            } else {
                sprite.x = i * w;
                sprite.value = num;
                sprite.color = (this._displayValue < this._borderValue) ? 1 : 0;
                sprite.visible = true;
            }
            sprite.update();
        }
    };

    /**
     * 子要素の追加
     * @private
     */
    Sprite_Numbers.prototype._addSprite = function () {
        var sprite = new Sprite_Number(this._srcBitmap);
        this._container.addChild(sprite);
        this._sprites.push(sprite);
    };

    /**
     * イージングの開始
     * @param {Number} value
     * @private
     */
    Sprite_Numbers.prototype._startAnimation = function (value) {
        if (value === this._rawValue) return;
        this._rawValue = value;
        this._easingController.start(this._rawValue, 30);
    };

    BSModule.Sprite_Numbers = Sprite_Numbers;

    //-----------------------------------------------------------------------------
    // Sprite_GaugeBase

    /**
     * Sprite_GaugeBase
     * @constructor
     */
    function Sprite_GaugeBase() {
        this.initialize.apply(this, arguments);
    }

    Sprite_GaugeBase.prototype = Object.create(Sprite.prototype);
    Sprite_GaugeBase.prototype.constructor = Sprite_GaugeBase;

    Object.defineProperties(Sprite_GaugeBase.prototype, {
        value: {
            get: function () {
                return this._rawValue;
            },
            set: function (n) {
                n = ~~n;
                if (n < 0) n = 0;
                if (this._rawValue !== n) {
                    this._startAnimation(n);
                }
            },
            configurable: true
        },
        displayValue: {
            get: function () {
                return this._displayValue;
            },
            set: function (n) {
                n = ~~n;
                if (n < 0) n = 0;
                if (this._displayValue !== n) {
                    this._displayValue = n;
                    this._changed = true;
                }
            },
            configurable: true
        },
        maxValue: {
            get: function () {
                return this._max;
            },
            set: function (n) {
                if (n < 1) n = 1;
                if (this._max !== n) {
                    this._max = n;
                    this._changed = true;
                }
            },
            configurable: true
        }
    });

    /**
     * 初期化処理
     * @param {Bitmap} bitmap ゲージ用の画像
     */
    Sprite_GaugeBase.prototype.initialize = function (bitmap) {
        Sprite.prototype.initialize.call(this, bitmap);
        this._displayValue = 100;
        this._rawValue = 100;
        this._max = 100;
        this._changed = true;
        this._easingController = new EasingController(this, 'displayValue');
    };

    /**
     * 更新処理
     */
    Sprite_GaugeBase.prototype.update = function () {
        Sprite.prototype.update.call(this);
        this._easingController.update();
        if (this._changed && this._bitmap.isReady()) {
            this._updateBitmap();
            this._changed = false;
        }
    };

    /**
     * 値の設定
     * @note このメソッドで値を設定した場合、イージング処理はスキップされる
     * @param {Number} value 値
     * @param {Number} max 最大値
     */
    Sprite_GaugeBase.prototype.setValue = function (value, max) {
        if (value === this._rawValue) return;
        this._easingController.stop();
        this._rawValue = value;
        this._displayValue = value;
        this._max = max;
    };

    /**
     * 画像の更新処理
     * @note 継承先で再定義すること
     * @private
     */
    Sprite_GaugeBase.prototype._updateBitmap = function () {
        throw 'override me';
    };

    /**
     * イージングの開始
     * @param {Number} value
     * @private
     */
    Sprite_GaugeBase.prototype._startAnimation = function (value) {
        if (value === this._rawValue) return;
        this._rawValue = value;
        this._easingController.start(value, 30);
    };

    BSModule.Sprite_GaugeBase = Sprite_GaugeBase;

    //-----------------------------------------------------------------------------
    // Sprite_GaugeHorizontal

    /**
     * Sprite_GaugeHorizontal
     * @constructor
     */
    function Sprite_GaugeHorizontal() {
        this.initialize.apply(this, arguments);
    }

    Sprite_GaugeHorizontal.prototype = Object.create(Sprite_GaugeBase.prototype);
    Sprite_GaugeHorizontal.prototype.constructor = Sprite_GaugeHorizontal;

    /**
     * 初期化処理
     * @param {Bitmap} bitmap ゲージ用の画像
     */
    Sprite_GaugeHorizontal.prototype.initialize = function (bitmap) {
        Sprite_GaugeBase.prototype.initialize.call(this, bitmap);
        this.anchor.x = 0;
        this.anchor.y = 0;
    };

    /**
     * 画像の更新処理
     * @private
     */
    Sprite_GaugeHorizontal.prototype._updateBitmap = function () {
        var ratio = this._displayValue / this._max;
        if (ratio < 0) ratio = 0;
        if (ratio > 100) ratio = 100;
        var w = this.bitmap.width * ratio;
        var h = this.bitmap.height;
        this.setFrame(0, 0, w, h);
    };

    BSModule.Sprite_GaugeHorizontal = Sprite_GaugeHorizontal;

    //-----------------------------------------------------------------------------
    // Sprite_GaugeVertical

    function Sprite_GaugeVertical() {
        this.initialize.apply(this, arguments);
    }

    Sprite_GaugeVertical.prototype = Object.create(Sprite_GaugeBase.prototype);
    Sprite_GaugeVertical.prototype.constructor = Sprite_GaugeVertical;

    /**
     * 初期化処理
     * @param {Bitmap} bitmap ゲージ用の画像
     */
    Sprite_GaugeVertical.prototype.initialize = function (bitmap) {
        Sprite_GaugeBase.prototype.initialize.call(this, bitmap);
        this.anchor.x = 0;
        this.anchor.y = 1;
    };

    /**
     * 画像の更新処理
     * @private
     */
    Sprite_GaugeVertical.prototype._updateBitmap = function () {
        var ratio = this._displayValue / this._max;
        if (ratio < 0) ratio = 0;
        if (ratio > 100) ratio = 100;
        var w = this.bitmap.width;
        var h = this.bitmap.height * ratio;
        this.setFrame(0, this.bitmap.height - h, w, h);
    };

    BSModule.Sprite_GaugeVertical = Sprite_GaugeVertical;

    //-----------------------------------------------------------------------------
    // Sprite_GaugeSheet

    /**
     * Sprite_GaugeSheet
     * @constructor
     */
    function Sprite_GaugeSheet() {
        this.initialize.apply(this, arguments);
    }

    Sprite_GaugeSheet.prototype = Object.create(Sprite_GaugeBase.prototype);
    Sprite_GaugeSheet.prototype.constructor = Sprite_GaugeSheet;

    /**
     * 初期化処理
     * @param {Bitmap} bitmap ゲージ用の画像
     * @param {Number} size 画像の分割数
     */
    Sprite_GaugeSheet.prototype.initialize = function (bitmap, size) {
        Sprite_GaugeBase.prototype.initialize.call(this, bitmap);
        this._size = size;
    };

    /**
     * 画像の更新処理
     * @private
     */
    Sprite_GaugeSheet.prototype._updateBitmap = function () {
        var n = ~~(this._size * this._displayValue / this._max);
        var w = this.bitmap.width;
        var h = this.bitmap.height / this._size;
        this.setFrame(0, h * n, w, h);
    };

    BSModule.Sprite_GaugeSheet = Sprite_GaugeSheet;

    // -------------------------------------------------------------------------
    // DisplayModule

    function DisplayModule() {
        this.initialize.apply(this, arguments);
    }

    Object.defineProperties(DisplayModule.prototype, {
        parent: {
            get: function () {
                return this._parent;
            },
            configurable: true
        },
        reservedChildren: {
            get: function () {
                return this._reservedChildren;
            },
            configurable: true
        }
    });

    /**
     * 初期化処理
     * @param {Sprite_ActorStatus} parent 表示元
     */
    DisplayModule.prototype.initialize = function (parent) {
        this._parent = parent;
        this._reservedChildren = [];
    };

    /**
     * addChildの予約
     * @param {DisplayObject} displayObject 表示オブジェクト
     * @param {Number} zIndex 表示優先度（高いものほど前面に表示）
     */
    DisplayModule.prototype.reserveAddChild = function (displayObject, zIndex) {
        this._reservedChildren.push({
            displayObject: displayObject,
            zIndex: zIndex
        });
    };

    /**
     * 生成時に呼び出される処理
     */
    DisplayModule.prototype.onCreate = function () {
    };

    /**
     * アクターが設定/変更されたときに呼び出される処理
     * @param {Game_Actor} actor
     */
    DisplayModule.prototype.onRefresh = function (actor) {
    };

    /**
     * 毎フレーム呼び出される処理
     * @param {Game_Actor} actor
     */
    DisplayModule.prototype.onUpdate = function (actor) {
        this._reservedChildren.forEach(function (child) {
            child.displayObject.update();
        });
    };

    BSModule.DisplayModule = DisplayModule;

    /**
     * DisplayModuleの登録
     * @param {Function} displayModuleConstructor
     */
    BSModule.registerModule = function (displayModuleConstructor) {
        this.moduleClasses.push(displayModuleConstructor);
    };
    BSModule.moduleClasses = [];

    /**
     * DisplayModuleの作成
     */
    BSModule.createModule = function (funcs) {
        function ChildModule() {
            this.initialize.apply(this, arguments);
        }

        ChildModule.prototype = Object.create(BSModule.DisplayModule.prototype);
        ChildModule.prototype.constructor = ChildModule;

        var keys = Object.keys(funcs);
        for (var i = 0; i < keys.length; ++i) {
            ChildModule.prototype[keys[i]] = funcs[keys[i]];
        }

        return ChildModule;
    };

    //-----------------------------------------------------------------------------
    // Sprite_ActorStatus

    /**
     * Sprite_ActorStatus
     * @constructor
     */
    function Sprite_ActorStatus() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ActorStatus.prototype = Object.create(Sprite.prototype);
    Sprite_ActorStatus.prototype.constructor = Sprite_ActorStatus;

    Object.defineProperties(Sprite_ActorStatus.prototype, {
        width: {
            get: function () {
                return BSModule.settings.actorStatus.width;
            },
            configurable: true
        },
        height: {
            get: function () {
                return BSModule.settings.actorStatus.height;
            },
            configurable: true
        },
        actor: {
            get: function () {
                return this._actor;
            },
            set: function (actor) {
                if (actor != this._actor) {
                    this._actor = actor;
                    this.refresh();
                }
            },
            configurable: true
        }
    });

    /**
     * 初期化
     */
    Sprite_ActorStatus.prototype.initialize = function () {
        Sprite.prototype.initialize.call(this);
        this.visible = false;
        this._actor = null;
        this._selected = false;
        this._initModules();
    };

    /**
     * フレーム毎の更新
     */
    Sprite_ActorStatus.prototype.update = function () {
        var actor = this._actor;
        if (actor) {
            this._modules.forEach(function (module) {
                module.onUpdate(actor);
            });
        }
    };

    /**
     * 再生成
     * @note アクター変更時に実行
     */
    Sprite_ActorStatus.prototype.refresh = function () {
        var actor = this._actor;
        if (actor) {
            this._modules.forEach(function (module) {
                module.onRefresh(actor);
            });
            this.visible = true;
        } else {
            this.visible = false;
        }
    };

    /**
     * 選択状態にする
     */
    Sprite_ActorStatus.prototype.select = function () {
        this._selected = true;
    };

    /**
     * 選択状態を解除する
     */
    Sprite_ActorStatus.prototype.deselect = function () {
        this._selected = false;
    };

    /**
     * 選択状態であるか？
     * @returns {boolean}
     */
    Sprite_ActorStatus.prototype.isSelected = function () {
        return this._selected;
    };

    /**
     * モジュールの初期化
     * @private
     */
    Sprite_ActorStatus.prototype._initModules = function () {
        var self = this;

        this._modules = BSModule.moduleClasses.map(function (klass) {
            return new klass(self);
        });

        this._modules.forEach(function (module) {
            module.onCreate();
        });

        Array.prototype.concat.apply([], this._modules.map(function (module) {
            return module.reservedChildren;
        })).sort(function (a, b) {
            return a.zIndex - b.zIndex;
        }).forEach(function (child) {
            this.addChild(child.displayObject);
        }.bind(this));
    };

    BSModule.Sprite_ActorStatus = Sprite_ActorStatus;

    //-----------------------------------------------------------------------------
    // Window_BattleParty

    /**
     * Window_BattleParty
     * @constructor
     */
    function Window_BattleParty() {
        this.initialize.apply(this, arguments);
    }

    Window_BattleParty.prototype = Object.create(Window_Selectable.prototype);
    Window_BattleParty.prototype.constructor = Window_BattleParty;

    /**
     * 初期化
     */
    Window_BattleParty.prototype.initialize = function () {
        this._battlePartyHandlers = {};
        Window_Selectable.prototype.initialize.call(this);
        this._openness = 0;
        this._initBackground();
        this._createSprites();
    };

    /**
     * 実在する要素数の取得
     * @returns {Number}
     */
    Window_BattleParty.prototype.maxItems = function () {
        return $gameParty.battleMembers().length;
    };

    /**
     * 仕様上の最大要素数
     * @returns {number}
     */
    Window_BattleParty.prototype.maxCols = function () {
        return $gameParty.maxBattleMembers();
    };

    /**
     * 更新
     */
    Window_BattleParty.prototype.update = function () {
        // 位置設定
        var actorLength = this._actorSprites.filter(function (sprite) {
            return !!sprite._actor;
        }).length;
        if (actorLength > 0) {
            var topSprite = this._actorSprites[0];
            var realTotalWidth = topSprite.width * actorLength + BSModule.settings.actorStatus.margin * (actorLength - 1);

            // 全体座標
            var padding = BSModule.settings.partyWindow.padding;
            this.x = (Graphics.boxWidth - realTotalWidth - padding * 2) / 2;
            this.y = Graphics.boxHeight - topSprite.height - padding * 2;
            if (this.opacity > 0) {
                this.width = realTotalWidth + padding * 2;
                this.height = topSprite.height + padding * 2;
            }
            for (var i = 0; i < actorLength; ++i) {
                this._actorSprites[i].x = i * (topSprite.width + BSModule.settings.actorStatus.margin) + padding;
                this._actorSprites[i].y = padding;
            }
        }

        // アサイン
        if (this._assignWindow) {
            if (this._index !== this._assignWindow._index) {
                this.select(this._assignWindow._index);
            }
        }

        // 元の処理
        Window_Selectable.prototype.update.apply(this);
    };

    /**
     * 再描画
     */
    Window_BattleParty.prototype.refresh = function () {
        var battleMembers = $gameParty.battleMembers();
        for (var i = 0; i < this._actorSprites.length; ++i) {
            this._actorSprites[i].actor = battleMembers[i];
        }
        this.update();

        if (this._battlePartyHandlers['refresh']) {
            this._battlePartyHandlers['refresh'].forEach(function (func) {
                func();
            });
        }
    };

    /**
     * カーソルの更新
     * @note 子ウィンドウにカーソルを描画する
     */
    Window_BattleParty.prototype.updateCursor = function () {
        if (!this._actorSprites) return;

        if (this._cursorAll) {
            for (var i = 0; i < this._actorSprites.length; ++i) {
                this._actorSprites[i].select(0);
            }
        } else if (this.isCursorVisible()) {
            for (var i = 0; i < this._actorSprites.length; ++i) {
                if (i === this._index) {
                    this._actorSprites[i].select(0);
                } else {
                    this._actorSprites[i].deselect();
                }
            }
        } else {
            for (var i = 0; i < this._actorSprites.length; ++i) {
                this._actorSprites[i].deselect();
            }
        }
    };

    /**
     * 監視対象のウィンドウを設定
     * @param {Window_Selectable} window
     */
    Window_BattleParty.prototype.assignWindow = function (window) {
        this._assignWindow = window;
        this.updateCursor();
    };

    /**
     * 指定indexのアクタースプライトを取得
     * @param {Number} index
     * @returns {Sprite_ActorStatus}
     */
    Window_BattleParty.prototype.getSprite = function (index) {
        return this._actorSprites[index];
    };

    /**
     * 指定名のハンドラを設定
     * @param {String} name
     * @param {Function} callback
     */
    Window_BattleParty.prototype.addHandler = function (name, callback) {
        if (!this._battlePartyHandlers[name]) {
            this._battlePartyHandlers[name] = [];
        }
        this._battlePartyHandlers[name].push(callback);
    };

    /**
     * 背景の初期化
     * @private
     */
    Window_BattleParty.prototype._initBackground = function () {
        switch (BSModule.settings.partyWindow.background) {
            case 0: // なし
                this.opacity = 0;
                break;
            case 1: // ウィンドウ表示
                this.opacity = 255;
                break;
            case 2: // 画像
                this.opacity = 0;
                break;
        }
    };

    /**
     * 子スプライトの作成
     * @private
     */
    Window_BattleParty.prototype._createSprites = function () {
        this._actorSprites = [];
        for (var i = 0; i < this.maxCols(); ++i) {
            var sprite = new Sprite_ActorStatus();
            this._actorSprites.push(sprite);
            this.addChild(sprite);
        }
    };

    BSModule.Window_BattleParty = Window_BattleParty;

    // -------------------------------------------------------------------------
    // BattleManager

    var upstream_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function () {
        this._torigoya_BSModule_battlePartyWindow.refresh();
        upstream_BattleManager_startBattle.apply(this);
    };

    var upstream_BattleManager_refreshStatus = BattleManager.refreshStatus;
    BattleManager.refreshStatus = function () {
        upstream_BattleManager_refreshStatus.apply(this);
        this._torigoya_BSModule_battlePartyWindow.refresh();
    };

    /**
     * 現在使用中の Window_BattleParty を設定
     * @param {WindowBattleParty} window
     */
    BattleManager.torigoyaBSModule_setBattlePartyWindow = function (window) {
        this._torigoya_BSModule_battlePartyWindow = window;
    };

    /**
     * 現在使用中の Window_BattleParty を取得
     * @returns {WindowBattleParty}
     */
    BattleManager.torigoyaBSModule_battlePartyWindow = function () {
        return this._torigoya_BSModule_battlePartyWindow;
    };

    // -------------------------------------------------------------------------
    // Window_BattleActor
    //
    // 左右キーでも選択を変更できるように

    Window_BattleActor.prototype.cursorRight = function (wrap) {
        this.cursorDown(wrap);
    };

    Window_BattleActor.prototype.cursorLeft = function (wrap) {
        this.cursorUp(wrap);
    };

    // -------------------------------------------------------------------------
    // Window_BattleEnemy
    //
    // 左右キーでも選択を変更できるように

    Window_BattleEnemy.prototype.cursorRight = function (wrap) {
        this.cursorDown(wrap);
    };

    Window_BattleEnemy.prototype.cursorLeft = function (wrap) {
        this.cursorUp(wrap);
    };

    Window_BattleEnemy.prototype.maxCols = function () {
        return 1;
    };

    // -------------------------------------------------------------------------
    // Window_PartyCommand
    //
    // 横並びに変更

    Window_PartyCommand.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };

    Window_PartyCommand.prototype.numVisibleRows = function () {
        return 1;
    };

    Window_PartyCommand.prototype.maxCols = function () {
        return this.maxItems();
    };

    Window_PartyCommand.prototype.itemTextAlign = function () {
        return 'center';
    };

    // -------------------------------------------------------------------------
    // Spriteset_Battle

    var upstream_Spriteset_Battle_createActors = Spriteset_Battle.prototype.createActors;
    Spriteset_Battle.prototype.createActors = function () {
        upstream_Spriteset_Battle_createActors.apply(this);

        // add image
        if (BSModule.settings.partyWindow.background === 2) {
            var bitmap = ImageManager.loadSystem(BSModule.settings.partyWindow.image);
            this._torigoya_BSModule_backSprite = new Sprite(bitmap);
            this._torigoya_BSModule_backSprite.x = 0;
            this._torigoya_BSModule_backSprite.y = Graphics.boxHeight;
            this._torigoya_BSModule_backSprite.anchor.y = 1;
            this.addChild(this._torigoya_BSModule_backSprite);
        }

        // add window
        this._torigoya_BSModule_battlePartyWindow = new Window_BattleParty();
        this._torigoya_BSModule_battlePartyWindow.update();
        this._battleField.addChild(this._torigoya_BSModule_battlePartyWindow);
        BattleManager.torigoyaBSModule_setBattlePartyWindow(this._torigoya_BSModule_battlePartyWindow);
    };

    // -------------------------------------------------------------------------
    // Scene_Battle

    var forceHideWindow = function (window) {
        window.x = Graphics.width + 100;
        window.y = Graphics.height + 100;
        window.width = 0;
        window.height = 0;
        window.opacity = 0;
        window.hide();
    };

    var upstream_Scene_Battle_createStatusWindow = Scene_Battle.prototype.createStatusWindow;
    Scene_Battle.prototype.createStatusWindow = function () {
        upstream_Scene_Battle_createStatusWindow.apply(this);

        // 本来のステータスウィンドウを隠す
        forceHideWindow(this._statusWindow);
    };

    var upstream_Scene_Battle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
    Scene_Battle.prototype.createPartyCommandWindow = function () {
        upstream_Scene_Battle_createPartyCommandWindow.apply(this);

        // 画面最上部に表示するように
        this._partyCommandWindow.y = 0;
    };

    var upstream_Scene_Battle_createSkillWindow = Scene_Battle.prototype.createSkillWindow;
    Scene_Battle.prototype.createSkillWindow = function () {
        upstream_Scene_Battle_createSkillWindow.apply(this);

        // スキルウィンドウを2003的に表示するように
        this._skillWindow.height = this._skillWindow.fittingHeight(4);
        this._skillWindow.y = Graphics.boxHeight - this._skillWindow.height;
    };

    var upstream_Scene_Battle_createItemWindow = Scene_Battle.prototype.createItemWindow;
    Scene_Battle.prototype.createItemWindow = function () {
        upstream_Scene_Battle_createItemWindow.apply(this);

        // アイテムウィンドウを2003的に表示するように
        this._itemWindow.height = this._itemWindow.fittingHeight(4);
        this._itemWindow.y = Graphics.boxHeight - this._itemWindow.height;
    };

    var upstream_Scene_Battle_createActorWindow = Scene_Battle.prototype.createActorWindow;
    Scene_Battle.prototype.createActorWindow = function () {
        upstream_Scene_Battle_createActorWindow.apply(this);

        // 本来のアクターウィンドウを隠す
        forceHideWindow(this._actorWindow);
    };

    var upstream_Scene_Battle_createEnemyWindow = Scene_Battle.prototype.createEnemyWindow;
    Scene_Battle.prototype.createEnemyWindow = function () {
        upstream_Scene_Battle_createEnemyWindow.apply(this);

        // 本来のエネミーウィンドウを隠す
        forceHideWindow(this._enemyWindow);
    };

    var upstream_Scene_Battle_refreshStatus = Scene_Battle.prototype.refreshStatus;
    Scene_Battle.prototype.refreshStatus = function () {
        upstream_Scene_Battle_refreshStatus.apply(this);

        // 一緒に更新
        BattleManager.torigoyaBSModule_battlePartyWindow().refresh();
    };

    var upstream_Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function () {
        upstream_Scene_Battle_startActorCommandSelection.apply(this);

        // 追従先をステータスウィンドウに
        BattleManager.torigoyaBSModule_battlePartyWindow().assignWindow(this._statusWindow);

        // アクターコマンドの位置をキャラクターの上に移動
        var partyWindow = BattleManager.torigoyaBSModule_battlePartyWindow();
        var window = partyWindow.getSprite(BattleManager.actor().index());
        this._actorCommandWindow.x = partyWindow.x + window.x + (window.width - this._actorCommandWindow.width) / 2;
        this._actorCommandWindow.y = partyWindow.y + window.y - this._actorCommandWindow.height - (10);
        this._actorCommandWindow.show();
    };

    var upstream_Scene_Battle_selectActorSelection = Scene_Battle.prototype.selectActorSelection;
    Scene_Battle.prototype.selectActorSelection = function () {
        upstream_Scene_Battle_selectActorSelection.apply(this);

        // 追従先をアクターウィンドウに
        BattleManager.torigoyaBSModule_battlePartyWindow().assignWindow(this._actorWindow);
    };

    var upstream_Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function () {
        upstream_Scene_Battle_onActorCancel.apply(this);

        // 追従先をステータスウィンドウに
        BattleManager.torigoyaBSModule_battlePartyWindow().assignWindow(this._statusWindow);
    };

    var upstream_Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
    Scene_Battle.prototype.commandAttack = function () {
        upstream_Scene_Battle_commandAttack.apply(this);

        // アクターコマンドを非表示
        this._actorCommandWindow.hide();
    };

    var upstream_Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function () {
        upstream_Scene_Battle_onEnemyCancel.apply(this);

        // アクターウィンドウを再表示
        if (this._actorCommandWindow.currentSymbol() === 'attack') {
            this._actorCommandWindow.show();
        }
    };

    var upstream_Scene_Battle_commandSkill = Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function () {
        upstream_Scene_Battle_commandSkill.apply(this);

        // アクターコマンドを非表示
        this._actorCommandWindow.hide();
    };

    var upstream_Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function () {
        upstream_Scene_Battle_onSkillCancel.apply(this);

        // アクターウィンドウを再表示
        this._actorCommandWindow.show();
    };

    var upstream_Scene_Battle_commandItem = Scene_Battle.prototype.commandItem;
    Scene_Battle.prototype.commandItem = function () {
        upstream_Scene_Battle_commandItem.apply(this);

        // アクターコマンドを非表示
        this._actorCommandWindow.hide();
    };

    var upstream_Scene_Battle_onItemCancel = Scene_Battle.prototype.onItemCancel;
    Scene_Battle.prototype.onItemCancel = function () {
        upstream_Scene_Battle_onItemCancel.apply(this);

        // アクターウィンドウを再表示
        this._actorCommandWindow.show();
    };

    var upstream_Scene_Battle_endCommandSelection = Scene_Battle.prototype.endCommandSelection;
    Scene_Battle.prototype.endCommandSelection = function () {
        upstream_Scene_Battle_endCommandSelection.apply(this);

        // 追従先をステータスウィンドウに
        BattleManager.torigoyaBSModule_battlePartyWindow().assignWindow(this._statusWindow);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.BSModule = BSModule;
})(this);
