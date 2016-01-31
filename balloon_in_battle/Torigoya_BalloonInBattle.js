//=============================================================================
// Torigoya_BalloonInBattle.js
//=============================================================================

/*:
 * @plugindesc Balloon Message in Battle
 * @author ru_shalm
 *
 * @param --- Basic ---
 *
 * @param Balloon Window Image
 * @desc Image of Balloon Window (default: Window)
 * @default Window
 *
 * @param --- Advanced ---
 *
 * @param Balloon Padding
 * @desc Padding of Balloon Message (recommend: 8)
 * @default 8
 *
 * @param Balloon Font Size
 * @desc Font Size of Balloon Message (recommend: 16)
 * @default 16
 *
 * @param Balloon Text Padding
 * @desc Text Padding of Balloon Message (recommend: 6)
 * @default 6
 *
 * @param Balloon Line Height
 * @desc Line Height of Balloon Message (recommend: 20)
 * @default 20
 *
 * @help
 * < This Plugin is usable in SideView-Mode >
 * Popup message balloon on actors in battle.
 *
 * < Basic Rule >
 *   <Speech/○○: Message>
 *   <Speech/○○[1]: Message of ○○'s ID:1>
 *   <Speech/○○[2]: Message 1, Message 2, Message 3>
 *
 * < Actor/Enemy Notes >
 *   <Speech/Skill: use Skill Message>
 *   <Speech/Skill[1]: use Skill ID.1 Message>
 *
 *   <Speech/Item: use Item Message>
 *   <Speech/Item[1]: use Item ID.1 Message>
 *
 *   <Speech/Damage: Damaged Message>
 *   <Speech/Miss: Missing from enemy Message>
 *   <Speech/Evasion: Evasion from enemy Message>
 *   <Speech/MagicEvasion: MagicEvasion from enemy Message>
 *   <Speech/Counter: Counter from enemy Message>
 *   <Speech/Reflection: Reflection from enemy Message>
 *   <Speech/Dead: Dying Message>
 *
 *   <Speech/Recovery: Repairing by friend Message>
 *   <Speech/Recovery[1]: Repairing by friend ID.1 Message>
 *
 *   <Speech/RecoveryByRival: Repairing by rival Message>
 *   <Speech/RecoveryByRival[1]: Repairing by rival ID.1 Message>
 *
 *   <Speech/Start: when Battle Start Message>
 *   <Speech/Start[1]: when Battle Start Message with Troop ID.1>
 *
 *   <Speech/Victory: when Winning Message>
 *   <Speech/Victory[1]: when Winning Message with Troop ID.1>
 *
 *   <SpeechBalloon/X: balloon position>
 *   <SpeechBalloon/Y: balloon position>
 *
 */

/*:ja
 * @plugindesc 戦闘中セリフ表示さん for MV
 * @author ru_shalm
 *
 * @param --- 基本設定 ---
 *
 * @param Balloon Window Image
 * @desc 吹き出しに使用するウィンドウ画像のファイル名 (default: Window)
 * @default Window
 *
 * @param --- 上級者設定 ---
 *
 * @param Balloon Padding
 * @desc 吹き出しの余白のサイズ (推奨: 8)
 * @default 8
 *
 * @param Balloon Font Size
 * @desc 吹き出しの文字サイズ (推奨: 16)
 * @default 16
 *
 * @param Balloon Text Padding
 * @desc 吹き出しのテキスト両端の余白 (推奨: 6)
 * @default 6
 *
 * @param Balloon Line Height
 * @desc 吹き出しの1行あたりの高さ。文字サイズよりちょっと大きめがよいです。 (推奨: 20)
 * @default 20
 *
 * @help
 * ＜このプラグインはサイドビュー戦闘でのみ使用できます＞
 * 戦闘中にセリフを吹き出しでキャラクターの上に表示します。
 *
 * 表示したいアクター/エネミーのメモ欄に指定の記法でメッセージを書いてください。
 *
 * ＜基本ルール＞
 *   <Speech/○○:デフォルトのメッセージ>
 *   <Speech/○○[1]:○○のID:1番のメッセージ>
 *   <Speech/○○[2]:メッセージ1, メッセージ2, メッセージ3>
 *
 *   上のような設定をメモ欄に記述します。
 *   ○○の部分には表示したいタイミング（例: Skill）が入ります。
 *   複数の中からランダムに表示したい場合は半角カンマ( , )で区切ってください。
 *
 *   指定しなかった項目はセリフが表示されません。
 *
 * ＜設定できる項目＞
 *   <Speech/Skill: スキルを使ったときのメッセージ>
 *   <Speech/Skill[1]: スキル1番を使ったときのメッセージ>
 *       \1 と書くとその部分がスキル名に置き換わります
 *
 *   <Speech/Item: アイテムを使ったときのメッセージ>
 *   <Speech/Item[1]: アイテム1番を使ったときのメッセージ>
 *       \1 と書くとその部分がスキル名に置き換わります
 *
 *   <Speech/Damage: ダメージを受けたときのメッセージ>
 *   <Speech/Miss: 敵のダメージがミスのときのメッセージ>
 *   <Speech/Evasion: 敵の攻撃を回避したときのメッセージ>
 *   <Speech/MagicEvasion: 敵の攻撃を回避したときのメッセージ>
 *   <Speech/Counter: 敵の攻撃をカウンターしたときのメッセージ>
 *   <Speech/Reflection: 敵の攻撃を反射したときのメッセージ>
 *   <Speech/Dead: 戦闘不能になったときのメッセージ>
 *
 *   <Speech/Recovery: 仲間に回復してもらったときのメッセージ>
 *   <Speech/Recovery[1]: 仲間ID: 1番に回復してもらったときのメッセージ>
 *       \1 と書くとその部分が回復してくれた人の名前に置き換わります。
 *       仲間IDは「アクターの場合：アクターID」、「敵キャラの場合：敵キャラID」になります。
 *
 *   <Speech/RecoveryByRival: 対戦相手に回復してもらったときのメッセージ>
 *   <Speech/RecoveryByRival[1]: 対戦相手ID: 1番に回復してもらったときのメッセージ>
 *       \1 と書くとその部分が回復してくれた人の名前に置き換わります
 *       対戦相手IDは「アクターの場合：敵キャラID」、「敵キャラの場合：アクターID」になります。
 *
 *   <Speech/Start: 戦闘が始まったときのメッセージ>
 *   <Speech/Start[1]: トループ1番との戦闘が始まったときのメッセージ>
 *
 *   <Speech/Victory: 戦闘勝利時のメッセージ>
 *   <Speech/Victory[1]: トループ1番との戦闘勝利時のメッセージ>
 *
 *   <SpeechBalloon/X: 吹き出し表示位置のX座標>
 *   <SpeechBalloon/Y: 吹き出し表示位置のY座標>
 *       キャラクターのサイズによって吹き出しの位置が都合悪い場合は、
 *       アクター/エネミーごとに微調整できます。
 */

(function (global) {
    var settings = PluginManager.parameters('Torigoya_BalloonInBattle');
    settings['Balloon Window Image'] = String(settings['Balloon Window Image'] || 'Window');
    settings['Balloon Padding'] = Number(settings['Balloon Padding'] || 8);
    settings['Balloon Font Size'] = Number(settings['Balloon Font Size'] || 16);
    settings['Balloon Text Padding'] = Number(settings['Balloon Text Padding'] || 6);
    settings['Balloon Line Height'] = Number(settings['Balloon Line Height'] || 20);

    /**
     * オレオレCSVの読み取り
     * @param str
     * @returns {Array}
     */
    var splitMessage = function (str) {
        var result = [];
        var startPos = 0;
        for (var i = 0; i < str.length; ++i) {
            if (str[i] === ',' && str[i - 1] !== '\\') {
                result.push(str.substr(startPos, i - startPos));
                startPos = i + 1;
            }
        }
        result.push(str.substr(startPos, str.length - startPos));
        return result.map(function (n) {
            return n.replace(/\\,/g, ',').trim();
        });
    };

    /**
     * 生存メンバーからランダムに1人選択
     * @returns {*}
     */
    var choiseAliveMember = function () {
        var members = $gameParty.battleMembers().filter(function (actor) {
            return actor.isAlive();
        });
        return members[Math.randomInt(members.length)];
    }

    /**
     * 全メンバーのセリフを削除
     */
    var clearSpeechOfAllMember = function () {
        $gameParty.allMembers().forEach(function (actor) {
            actor.torigoya_clearSpeech();
        });
        $gameTroop.members().forEach(function (enemy) {
            enemy.torigoya_clearSpeech();
        });
    }

    // -------------------------------------------------------------------------
    // 吹き出しウィンドウ
    // -------------------------------------------------------------------------
    var Window_Balloon = function () {
        this.initialize.apply(this, arguments);
        this.message = null;
    };
    Window_Balloon.prototype = Object.create(Window_Base.prototype);
    Window_Balloon.prototype.constructor = Window_Balloon;

    Window_Balloon.prototype.standardFontSize = function () {
        return settings['Balloon Font Size'];
    };

    Window_Balloon.prototype.textPadding = function () {
        return settings['Balloon Text Padding'];
    };

    Window_Balloon.prototype.lineHeight = function () {
        return settings['Balloon Line Height'];
    };

    Window_Balloon.prototype.standardPadding = function () {
        return settings['Balloon Padding'];
    };

    Window_Balloon.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem(settings['Balloon Window Image']);
    };

    /**
     * メッセージ内容の設定
     * @param message
     */
    Window_Balloon.prototype.setSpeech = function (message) {
        if (message == this.message) return;

        if (!message || message.length == 0) {
            this.message = null;
        } else {
            this.message = message;
        }
        this.refreshMessage();
    };

    /**
     * メッセージ内容の生成
     */
    Window_Balloon.prototype.refreshMessage = function () {
        if (this.message) {
            var self = this;
            var messages = this.message.split(/\\n/);

            var width = 64;
            var height = this.lineHeight() * messages.length;
            this.resetFontSettings();
            messages.forEach(function (message) {
                var t = self.textWidth(message) + self.textPadding() * 2;
                if (t > width) {
                    width = t;
                }
            });

            this.contents.resize(width, height);
            this.move(this.x, this.y, width + this.standardPadding() * 2, height + this.standardPadding() * 2);
            messages.forEach(function (message, i) {
                self.drawText(message, 0, i * self.lineHeight(), width, 'center');
            });

            this.open();
        } else {
            this.close();
            this.contents.clear();
        }
    };

    /**
     * 指定されたBattlerのスプライトの位置に合わせる
     * @param spriteBattler
     */
    Window_Balloon.prototype.track = function (spriteBattler) {
        var actorOrEnemy = spriteBattler._battler ? (spriteBattler._battler.actor || spriteBattler._battler.enemy).apply(spriteBattler._battler) : null;
        this.x = spriteBattler.x - (this._width / 2) +
            (actorOrEnemy ? (~~actorOrEnemy.meta['SpeechBalloon/X']) : 0);
        this.y = spriteBattler.y - (spriteBattler.torigoya_getBattleHeight() + this._height) +
            (actorOrEnemy ? (~~actorOrEnemy.meta['SpeechBalloon/Y']) : 0);
    };

    // -------------------------------------------------------------------------
    // Battlerに吹き出し用メッセージ領域を追加
    // -------------------------------------------------------------------------
    var upstream_Game_BattlerBase_initialize = Game_BattlerBase.prototype.initialize;
    Game_BattlerBase.prototype.initialize = function () {
        upstream_Game_BattlerBase_initialize.apply(this);
        this._torigoya_speech = null;
    };

    /**
     * メッセージ内容の設定
     * @param message
     */
    Game_BattlerBase.prototype.torigoya_setSpeech = function (message) {
        this._torigoya_speech = message;
    };

    /**
     * メッセージ内容の取得
     * @returns {null|*}
     */
    Game_BattlerBase.prototype.torigoya_getSpeech = function () {
        return this._torigoya_speech;
    };

    /**
     * メッセージの消去
     */
    Game_BattlerBase.prototype.torigoya_clearSpeech = function () {
        this._torigoya_speech = null;
    };

    /**
     * 指定形式のセリフパターンの中からランダムに取得
     * @param type
     * @param id
     * @returns {*}
     */
    Game_BattlerBase.prototype.torigoya_pickSpeech = function (type, id, name) {
        if (id === undefined) {
            id = 0;
        }
        if (name === undefined) {
            name = '';
        }

        var battler = (this.actor || this.enemy).apply(this);
        var key = 'Speech/' + type;
        var patternString =
            battler.meta[key + '[' + id + ']'] ||
            (Number(id) < 0 ? battler.meta[key + '[-]'] : false) ||
            battler.meta[key];
        if (patternString === true) { // セリフ空欄の場合
            return '';
        } else if (patternString) {
            var array = splitMessage(patternString);
            if (array.length > 0) {
                return array[Math.randomInt(array.length)].replace('\\1', name);
            }
        }
        return null;
    };

    // -------------------------------------------------------------------------
    // Sprite_Battlerに吹き出しを追加
    // -------------------------------------------------------------------------
    var upstream_Sprite_Battler_initialize = Sprite_Battler.prototype.initialize;
    Sprite_Battler.prototype.initialize = function (battler) {
        upstream_Sprite_Battler_initialize.bind(this)(battler);
        this.torigoya_balloonWindow = new Window_Balloon(0, 0, 0, 0);
        this.torigoya_balloonWindow.close();
    };

    var upstream_Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function () {
        upstream_Sprite_Battler_update.bind(this)();
        this.torigoya_balloonWindow.setSpeech(this._battler ? this._battler.torigoya_getSpeech() : null);
        this.torigoya_balloonWindow.track(this);
    };

    /**
     * Battlerの高さを取得
     * @returns {Number}
     */
    Sprite_Battler.prototype.torigoya_getBattleHeight = function () {
        return this.bitmap ? this.bitmap.height : 0;
    };

    /**
     * Actorの高さを取得
     * @returns {Number}
     */
    Sprite_Actor.prototype.torigoya_getBattleHeight = function () {
        var bitmap = this._mainSprite.bitmap;
        return bitmap ? (bitmap.height / 6) : Sprite_Battler.prototype.torigoya_getBattleHeight.apply(this);
    };

    // -------------------------------------------------------------------------
    // Battlerの持つ吹き出しをSpritesetに追加
    // -------------------------------------------------------------------------
    var upstream_Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
    Spriteset_Battle.prototype.createLowerLayer = function () {
        upstream_Spriteset_Battle_createLowerLayer.apply(this);
        this.battlerSprites().forEach((function (battlerSprite) {
            this.addChild(battlerSprite.torigoya_balloonWindow);
        }).bind(this));
    };

    // -------------------------------------------------------------------------
    // 吹き出し発生イベントの設定
    // -------------------------------------------------------------------------

    // 行動時
    var upstream_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        clearSpeechOfAllMember();
        upstream_BattleManager_startAction.apply(this);
        var subject = this._subject;
        var action = subject.currentAction();
        var item = action.item();
        var speech = null;

        if (action.isSkill()) {
            speech = subject.torigoya_pickSpeech('Skill', item.id, item.name)
        } else if (action.isItem()) {
            speech = subject.torigoya_pickSpeech('Item', item.id, item.name)
        }
        subject.torigoya_setSpeech(speech);
    };

    // 行動完了時（吹き出し削除）
    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        upstream_BattleManager_endAction.apply(this);
        clearSpeechOfAllMember();
    };

    // 回復系
    // @note 自分で回復したのか他人が回復したのかを取るためにここでチェックする
    var upstream_Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
    Window_BattleLog.prototype.displayActionResults = function (subject, target) {
        upstream_Window_BattleLog_displayActionResults.apply(this, [subject, target]);
        if (target.result().used && target.result().hpAffected && subject !== target && target.canMove()) {
            if (target.result().hpDamage < 0 || target.result().mpDamage < 0 || target.result().tpDamage < 0) {
                var subjectID = subject.isActor() ? subject.actorId() : subject.enemyId();
                if (subject.isEnemy() === target.isEnemy()) { // 味方同士 or 敵同士
                    target.torigoya_setSpeech(target.torigoya_pickSpeech('Recovery', subjectID, subject.name()));
                } else {
                    target.torigoya_setSpeech(target.torigoya_pickSpeech('RecoveryByRival', subjectID, subject.name()));
                }
            }
        }
    };

    // 相手の情報とかいらない系は↓の方法で

    // 被ダメージ時
    var upstream_Game_Battler_performDamage = Game_Battler.prototype.performDamage;
    Game_Battler.prototype.performDamage = function () {
        upstream_Game_Battler_performDamage.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('Damage'));
        }
    };

    // MISS時
    var upstream_Game_Battler_performMiss = Game_Battler.prototype.performMiss;
    Game_Battler.prototype.performMiss = function () {
        upstream_Game_Battler_performMiss.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('Miss'));
        }
    };

    // 回避時
    // @note 未指定時はMISSと一緒
    var upstream_Game_Battler_performEvasion = Game_Battler.prototype.performEvasion;
    Game_Battler.prototype.performEvasion = function () {
        upstream_Game_Battler_performEvasion.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('Evasion') || this.torigoya_pickSpeech('Miss'));
        }
    };

    // 魔法回避時
    // @note 未指定時は回避 or MISSと一緒
    var upstream_Game_Battler_performMagicEvasion = Game_Battler.prototype.performMagicEvasion;
    Game_Battler.prototype.performMagicEvasion = function () {
        upstream_Game_Battler_performMagicEvasion.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('MagicEvasion') || this.torigoya_pickSpeech('Evasion') || this.torigoya_pickSpeech('Miss'));
        }
    };

    // カウンター時
    var upstream_Game_Battler_performCounter = Game_Battler.prototype.performCounter;
    Game_Battler.prototype.performCounter = function () {
        upstream_Game_Battler_performCounter.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('Counter'));
        }
    };

    // 反射時
    var upstream_Game_Battler_performReflection = Game_Battler.prototype.performReflection;
    Game_Battler.prototype.performReflection = function () {
        upstream_Game_Battler_performReflection.apply(this);
        if (this.canMove()) {
            this.torigoya_setSpeech(this.torigoya_pickSpeech('Reflection'));
        }
    };

    // 戦闘不能時
    var upstream_Game_Battler_performCollapse = Game_Battler.prototype.performCollapse;
    Game_Battler.prototype.performCollapse = function () {
        upstream_Game_Battler_performCollapse.apply(this);
        this.torigoya_setSpeech(this.torigoya_pickSpeech('Dead'));
    };

    // 戦闘開始時
    var upstream_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function () {
        clearSpeechOfAllMember();
        upstream_BattleManager_startBattle.apply(this);

        // 味方
        var member = choiseAliveMember();
        if (member) {
            member.torigoya_setSpeech(member.torigoya_pickSpeech('Start', $gameTroop._troopId));
        }

        // 敵
        $gameTroop.members().forEach(function (enemy) {
            if (enemy.isAlive()) {
                enemy.torigoya_setSpeech(enemy.torigoya_pickSpeech('Start', $gameTroop._troopId));
            }
        });
    };

    // 行動選択時（吹き出し削除）
    var upstream_BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function () {
        clearSpeechOfAllMember();
        upstream_BattleManager_startInput.apply(this);
    };

    // 戦闘終了時
    var upstream_BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function () {
        var member = choiseAliveMember();
        if (member) {
            member.torigoya_setSpeech(member.torigoya_pickSpeech('Victory', $gameTroop._troopId));
        }
        upstream_BattleManager_processVictory.apply(this);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.BalloonInBattle = {
        settings: settings,
        Window_Balloon: Window_Balloon,
        clearSpeechOfAllMember: clearSpeechOfAllMember
    };
})(this);
