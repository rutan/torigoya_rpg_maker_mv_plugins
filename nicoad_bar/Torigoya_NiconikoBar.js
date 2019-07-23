/*---------------------------------------------------------------------------*
 * Torigoya_NiconikoBar.js
 *---------------------------------------------------------------------------*
 * 2019/07/24 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc ニコニ広告通知バー風表示プラグイン
 * @author ru_shalm
 * @help
 * ※このプラグインはRPGアツマール用の非公式プラグインです
 *
 * RPGアツマール上でゲームにニコニ広告された場合に、
 * 昔のニコ生っぽい広告バーを画面に表示をします。
 *
 * @param ■ テストプレイ用
 *
 * @param Use Debug Mode
 * @type select
 * @option ON
 * @option OFF
 * @desc ローカル実行時にダミー広告を表示するか？（アツマール上では強制OFFになります）
 * @default OFF
 *
 * @param ■ 基本設定
 *
 * @param Title
 * @type string
 * @desc タイトル部分に表示する文字列
 * @default ニコニ広告
 *
 * @param Thanks Message
 * @type string
 * @desc メッセージの最後につける感謝の言葉
 * @default 広告ありがとうございます！
 *
 * @param Bg Color
 * @type string
 * @desc 背景の色（※CSSと同様の指定方法です）
 * @default rgba(255, 229, 0, .8)
 *
 * @param Text Color
 * @type string
 * @desc 文字の色（※CSSと同様の指定方法です）
 * @default #000000
 *
 * @param Scroll Time
 * @type number
 * @desc 文字が流れきるのにかかる時間（秒）
 * @default 10
 *
 * @param ■ 詳しい人向け
 *
 * @param Expiration
 * @type number
 * @desc 何秒前の広告までを対象にするか？
 * @default 604800
 *
 * @param Auto Fetch
 * @type select
 * @option ON
 * @option OFF
 * @desc ニコニ広告表示を自動的に開始するか？
 * @default ON
 *
 * @param Fetch Interval
 * @type number
 * @desc ニコニ広告情報の自動取得の間隔（分）
 * @default 5
 */

(function (global) {
    'use strict';

    var Niconiko = {
        name: 'Torigoya_NiconikoBar'
    };
    Niconiko.settings = (function () {
        var parameters = PluginManager.parameters(Niconiko.name);
        return {
            debugMode: String(parameters['Use Debug Mode'] || 'OFF') === 'ON',
            title: String(parameters['Title'] || ''),
            message: String(parameters['Thanks Message'] || ''),
            bgColor: String(parameters['Bg Color'] || 'rgba(255, 229, 0, .8)'),
            textColor: String(parameters['Text Color'] || '#000'),
            scrollTime: Number(parameters['Scroll Time'] || 10),
            expiration: Number(parameters['Expiration'] || 604800),
            autoFetch: String(parameters['Auto Fetch'] || 'ON') === 'ON',
            fetchInterval: Number(parameters['Fetch Interval'] || 5)
        };
    })();

    // -------------------------------------------------------------------------
    // Utils

    function findByArray(array, func) {
        for (var i = 0; i < array.length; ++i) {
            if (func(array[i])) return array[i];
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // AtsumaruAPI

    Niconiko.APIClient = {
        lastStartedTime: Math.floor(Date.now() / 1000) - Niconiko.settings.expiration,
        fetchNewHistories: function (callback) {
            if (!window.RPGAtsumaru ||
                !window.RPGAtsumaru.experimental ||
                !window.RPGAtsumaru.experimental.nicoad ||
                !window.RPGAtsumaru.experimental.nicoad.getHistories) {
                if (Niconiko.settings.debugMode) {
                    var time = Math.floor(Date.now() / 1000);
                    callback([
                        {
                            advertiserName: 'ハロルド',
                            nicoadId: 1,
                            adPoint: 1000,
                            contribution: 1000,
                            startedAt: time,
                            endedAt: time + 86400
                        },
                        {
                            advertiserName: 'テレーゼ',
                            nicoadId: 1,
                            adPoint: 500,
                            contribution: 2500,
                            startedAt: time,
                            endedAt: time + 86400
                        },
                        {
                            advertiserName: 'マーシャ',
                            nicoadId: 1,
                            adPoint: 250,
                            contribution: 500,
                            startedAt: time,
                            endedAt: time + 86400
                        },
                        {
                            advertiserName: 'ルキウス',
                            nicoadId: 1,
                            adPoint: 100,
                            contribution: 100,
                            startedAt: time,
                            endedAt: time + 86400
                        }
                    ])
                } else {
                    callback([]);
                }
                return;
            }

            var self = this;
            window.RPGAtsumaru.experimental.nicoad.getHistories()
                .then(function (resp) {
                    var newItems = resp.histories.reduce(function (ret, item) {
                        if (item.startedAt > self.lastStartedTime) {
                            var obj = findByArray(ret, function (n) {
                                return n.advertiserName === item.advertiserName;
                            });
                            if (obj) {
                                obj.adPoint += item.adPoint;
                            } else {
                                ret.push(item);
                            }
                        }
                        return ret;
                    }, []);
                    if (newItems.length === 0) {
                        callback([]);
                        return;
                    }
                    self.lastStartedTime = newItems[0].startedAt;
                    callback(newItems);
                });
        }
    };

    // -------------------------------------------------------------------------
    // ViewBuilder

    Niconiko.ViewBuilder = {
        element: null,
        barElement: null,
        titleElement: null,
        messageElement: null,
        messageTextElement: null,
        isShow: false,
        createElement: function () {
            this.element = this.createLayerElement();
            document.body.appendChild(this.element);

            this.barElement = this.createBarElement();
            this.element.appendChild(this.barElement);
            this.titleElement = this.createTitleElement();
            this.barElement.appendChild(this.titleElement);
            this.messageElement = this.createMessageElement();
            this.barElement.appendChild(this.messageElement);
            this.messageTextElement = this.createMessageTextElement();
            this.messageElement.appendChild(this.messageTextElement);

            this.resetStyle();
            this.updateElement();
        },
        createLayerElement: function () {
            var element = document.createElement('div');
            element.id = 'nicoko-layer';
            element.classList.add('nicoko-layer');
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.left = '0';
            element.style.right = '0';
            element.style.bottom = '0';
            element.style.margin = 'auto';
            element.style.zIndex = 10;
            element.style.overflow = 'hidden';
            element.style.pointerEvents = 'none';
            return element;
        },
        createBarElement: function () {
            var element = document.createElement('div');
            element.classList.add('nicoko-bar');
            element.style.position = 'absolute';
            element.style.left = '0';
            element.style.width = '100%';
            element.style.height = '2em';
            element.style.overflow = 'hidden';
            element.style.background = Niconiko.settings.bgColor;
            element.style.color = Niconiko.settings.textColor;
            element.style.fontFamily = 'GameFont sans-serif';
            element.style.opacity = '0';
            element.style.transition = 'all ease-in-out .5s';
            return element;
        },
        createTitleElement: function () {
            var element = document.createElement('div');
            element.classList.add('nicoko-title');
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.lineHeight = (2 / 0.8) + 'em';
            element.style.padding = '0 10px';
            element.style.fontSize = '0.8em';
            element.style.fontWeight = 'bold';
            element.style.transition = 'all ease-in-out .5s 1s';
            element.innerText = Niconiko.settings.title;
            return element;
        },
        createMessageElement: function () {
            var element = document.createElement('div');
            element.classList.add('nicoko-message');
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.right = '0';
            element.style.height = '2em';
            element.style.overflow = 'hidden';
            return element;
        },
        createMessageTextElement: function () {
            var element = document.createElement('div');
            element.classList.add('nicoko-message-text');
            element.style.whiteSpace = 'pre';
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.lineHeight = (2 / 0.8) + 'em';
            element.style.fontSize = '0.8em';
            element.style.padding = '0 10px';
            element.addEventListener('transitionend', this.onTextTransitionEnd.bind(this));
            return element;
        },
        updateElement: function () {
            this.element.width = Graphics._width;
            this.element.height = Graphics._height;
            var size = Math.min(Math.max(Math.floor(20 * Graphics._realScale), 10), 20);
            this.element.style.fontSize = size + 'px';
            Graphics._centerElement(this.element);
        },
        showMessage: function (message) {
            if (this.isShow) return;
            this.isShow = true;

            this.barElement.style.bottom = '0';
            this.barElement.style.opacity = '1';

            this.titleElement.style.left = '0';
            this.titleElement.style.transform = 'translateX(0)';

            var rect = this.titleElement.getBoundingClientRect();
            this.messageElement.style.width = 'calc(100% - ' + rect.width + 'px)';

            this.messageTextElement.innerText = message;
            this.messageTextElement.style.left = '0';
            this.messageTextElement.style.transform = 'translateX(-100%)';
            this.messageTextElement.style.transition = 'left linear ' + Niconiko.settings.scrollTime + 's 2s, transform linear ' + Niconiko.settings.scrollTime + 's 2s';
        },
        showHistories: function (histories) {
            if (histories.length === 0) return;
            var message = histories.slice(0).sort(function (a, b) {
                return b.adPoint - a.adPoint;
            }).map(function (item) {
                return item.advertiserName + 'さん（' + item.adPoint + 'pt）';
            }).join(' / ');
            message += ' ' + Niconiko.settings.message;

            this.showMessage(message);
        },
        onTextTransitionEnd: function () {
            this.isShow = false;
            this.resetStyle();
        },
        resetStyle: function () {
            this.barElement.style.bottom = '-2em';
            this.barElement.style.opacity = '0';

            this.titleElement.style.left = '50%';
            this.titleElement.style.transform = 'translateX(-50%)';

            this.messageElement.style.width = '0';

            this.messageTextElement.style.transition = 'initial';
            this.messageTextElement.style.left = '100%';
            this.messageTextElement.style.transform = 'translateX(0%)';
        }
    };

    // -------------------------------------------------------------------------
    // Watcher

    Niconiko.Watcher = {
        time: null,
        start: function () {
            if (this.time) clearTimeout(this.time);
            this.time = null;

            var self = this;
            Niconiko.APIClient.fetchNewHistories(function (list) {
                Niconiko.ViewBuilder.showHistories(list);
                self.time = setTimeout(function () {
                    self.time = null;
                    self.start();
                }, 1000 * 60 * Niconiko.settings.fetchInterval);
            });
        },
        stop: function () {
            if (this.time) clearTimeout(this.time);
            this.time = null;
        }
    };

    // -------------------------------------------------------------------------
    // hook

    var upstream_Graphics_createAllElements = Graphics._createAllElements;
    Graphics._createAllElements = function () {
        upstream_Graphics_createAllElements.apply(this);
        Niconiko.ViewBuilder.createElement();
    };

    var upstream_Graphics_updateAllElements = Graphics._updateAllElements;
    Graphics._updateAllElements = function () {
        upstream_Graphics_updateAllElements.apply(this);
        Niconiko.ViewBuilder.updateElement();
    };

    if (Niconiko.settings.autoFetch) {
        var upstream_Scene_Boot_start = Scene_Boot.prototype.start;
        Scene_Boot.prototype.start = function () {
            upstream_Scene_Boot_start.apply(this);
            Niconiko.Watcher.start();
        };
    }

    // -------------------------------------------------------------------------
    // プラグインコマンド

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        switch (command) {
            case 'ニコニ広告バー開始':
                Niconiko.Watcher.start();
                return;
            case 'ニコニ広告バー停止':
                Niconiko.Watcher.stop();
                return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.Niconiko = Niconiko;
})(window);
