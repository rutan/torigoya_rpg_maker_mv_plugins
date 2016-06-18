//=============================================================================
// Torigoya_AutoItems.js
//=============================================================================

/*:
 * @plugindesc Automatic use items or skills when damaged by enemy.
 * @author ru_shalm
 *
 * @help
 * Automatic use items or skills when damaged by enemy.
 * ( **This plugin cannot use Attack-skill** )
 *
 * Actor / Class / Weapon / Armor / Enemy / State Note:
 *   <AutoItemMe/hp[50%]: 1>        # use Item[1] to self, when HP is equal to or less than 30%
 *   <AutoItemMe/state[4]: 1>       # use Item[1] to self, when State[4] added
 *   <AutoItemFriend/hp[50%]: 1>    # use Item[1] to friend, when HP is equal to or less than 30%
 *   <AutoItemFriend/state[4]: 1>   # use Item[1] to friend, when State[4] added
 *
 *   <AutoSkillMe/hp[50%]: 8>       # use Skill[8] to self, when HP is equal to or less than 30%
 *   <AutoSkillMe/state[4]: 8>      # use Skill[8] to self, when State[4] added
 *   <AutoSkillFriend/hp[50%]: 8>   # use Skill[8] to friend, when HP is equal to or less than 30%
 *   <AutoSkillFriend/state[4]: 8>  # use Skill[8] to friend, when State[4] added
 */

/*:ja
 * @plugindesc ダメージ時自動アイテム/スキル使用さん
 * @author ru_shalm
 *
 * @help
 * 戦闘中に攻撃を受けた際、自動的に発動するスキル/アイテムを設定できます。
 * いわゆる「オートポーション」です。
 * （注：攻撃技を設定することはできません）
 *
 * アクター/職業/武器/防具/敵キャラ/ステートのメモ:
 *   <AutoItemMe/hp[50%]: 1>        # 自分の HP が 50% を下回ったら自分に アイテム:1番 を使用
 *   <AutoItemMe/state[4]: 1>       # 自分が ステート:4番 になったら自分に アイテム:1番 を使用
 *   <AutoItemFriend/hp[50%]: 1>    # 仲間の誰かが HP が 50% を下回ったら対象に アイテム:1番 を使用
 *   <AutoItemFriend/state[4]: 1>   # 仲間の誰かが ステート:4番 になったら対象に アイテム:1番 を使用
 *
 *   <AutoSkillMe/hp[50%]: 8>       # 自分の HP が 50% を下回ったら自分に スキル:8番 を使用
 *   <AutoSkillMe/state[4]: 8>      # 自分が ステート:4番 になったら自分に スキル:8番 を使用
 *   <AutoSkillFriend/hp[50%]: 8>   # 仲間の誰かが HP が 50% を下回ったら対象に スキル:8番 を使用
 *   <AutoSkillFriend/state[4]: 8>  # 仲間の誰かが ステート:4番 になったら対象に スキル:8番 を使用
 *
 * ＜使用可能条件について＞
 * 以下の条件を満たしていないとき、オートアイテム・スキルは発動しません
 *
 * ・スキルの場合: 「MPなどが足りている」 かつ 「そのスキルを覚えている」こと
 * ・アイテムの場合: 「そのアイテムを持っている」こと
 *
 * なお、アイテムやスキルのID番号の後ろに半角の「!」を付けると、
 * MP消費やアイテム消費なしで発動するように設定できます。
 * この場合は上の条件を満たしていなくても発動します。
 *
 *   <AutoItemMe/hp[10%]: 8!>       # 自分の HP が 10% を下回ったら自分に アイテム:1番 を使用（アイテムの消費なし）
 *
 */

(function (global) {
    'use strict';

    var AutoItems = {
        name: 'Torigoya_AutoItems'
    };

    // -------------------------------------------------------------------------
    // AutoItems_Manager

    /**
     * オートアイテム周りの全体の処理
     * @note このクラスはシングルトンとして使う
     * @constructor
     */
    function AutoItems_Manager() {
        this.initialize.apply(this, arguments);
    }

    Object.defineProperties(AutoItems_Manager.prototype, {
        phase: {
            get: function () {
                return this._phase;
            },
            set: function (n) {
                this._phase = n;
            },
            configurable: true
        }
    });

    /**
     * 初期化処理
     */
    AutoItems_Manager.prototype.initialize = function () {
        this.reset();
    };

    /**
     * 内部情報のリセット
     * @note ターン終了時に呼び出す
     */
    AutoItems_Manager.prototype.reset = function () {
        this._phase = 'none';
        this._recordLogs = [];
        this._ruleIndex = 0;
        this._movedBattlers = [];
        this._applyedBattlers = [];
        this._nowPlayingActionSet = null;
    };

    /**
     * 割り込み行動を挿入する
     * @param {AutoItems_ActionSet} actionSet
     */
    AutoItems_Manager.prototype.insertInterruptAction = function (actionSet) {
        this._nowPlayingActionSet = actionSet;
        actionSet.subject.torigoya_autoItemsInterruptAction(actionSet.item, actionSet.target);
        BattleManager.torigoya_autoItemsInterruptAction(actionSet.subject);
    };

    /**
     * スキル/アイテムのコスト支払い処理をスキップするか？
     * @returns {boolean}
     */
    AutoItems_Manager.prototype.isSkipUseItem = function () {
        var actionSet = this._nowPlayingActionSet;
        if (!actionSet) return false;
        if (actionSet.forceFlag) return true;
        if (actionSet.subject.isEnemy() && DataManager.isItem(actionSet.item)) return true;
        return false;
    };

    /**
     * 行動結果を記録する
     * @param {Game_Actor, Game_Enemy} subject 攻撃側
     * @param {Game_Actor, Game_Enemy} target  防御側
     */
    AutoItems_Manager.prototype.recordLog = function (subject, target) {
        this._recordLogs.push(new AutoItems.AutoItems_RecordLog(subject, target));
    };

    /**
     * 行動結果ログを元に実行される可能性のあるルールセットを生成し、優先度順にソートする
     */
    AutoItems_Manager.prototype.initRules = function () {
        this._rules = Array.prototype.concat.apply(
            [],
            this._recordLogs.map(function (recordLog) {
                return this._readApplicableRulesByRecordLog(recordLog);
            }.bind(this))
        );

        this._rules.sort(function (a, b) {
            // 項目優先度: ステート > HP > MP > TP
            if (a.rule.conditionType !== b.rule.conditionType) return a.rule.conditionType - b.rule.conditionType;

            // 実行者優先度: 本人 > 仲間
            if (a.rule.subjectType !== b.rule.subjectType) return a.rule.subjectType - b.rule.subjectType;

            // 種別優先度: スキル > アイテム
            if (a.rule.type !== b.rule.type) return a.rule.type - b.rule.type;

            // 発動条件優先度
            var aValue, bValue;
            switch (a.rule.conditionType) {
                // ステート優先度
                case AutoItems_Rule.conditionTypes.state:
                    return $dataStates[b.rule.conditionValue].priority - $dataStates[a.rule.conditionValue].priority;

                // 境界線優先度
                case AutoItems_Rule.conditionTypes.hp:
                    aValue = a.rule.conditionIsPercentage ? a.target.mhp * a.rule.conditionValue / 100 : a.rule.conditionValue;
                    bValue = b.rule.conditionIsPercentage ? b.target.mhp * b.rule.conditionValue / 100 : b.rule.conditionValue;
                    break;
                case AutoItems_Rule.conditionTypes.mp:
                    aValue = a.rule.conditionIsPercentage ? a.target.mmp * a.rule.conditionValue / 100 : a.rule.conditionValue;
                    bValue = b.rule.conditionIsPercentage ? b.target.mmp * b.rule.conditionValue / 100 : b.rule.conditionValue;
                    break;
                case AutoItems_Rule.conditionTypes.tp:
                    aValue = a.rule.conditionIsPercentage ? a.target.maxTp() * a.rule.conditionValue / 100 : a.rule.conditionValue;
                    bValue = b.rule.conditionIsPercentage ? b.target.maxTp() * b.rule.conditionValue / 100 : b.rule.conditionValue;
                    break;
            }
            return aValue - bValue;
        });
    };

    /**
     * ルールセットから次に実行されるオートアイテムの行動情報を生成する。
     * @returns {Object, Boolean} 行動情報。実行する行動がない場合はfalseを返す。
     */
    AutoItems_Manager.prototype.pickActionableRuleSet = function () {
        var ruleSet;
        while (ruleSet = this._rules[this._ruleIndex]) {
            if (this._isApplicableRuleSet(ruleSet)) {
                var itemInfo = this._pickUsableItemInfo(ruleSet.subject, ruleSet.rule.itemInfoList);
                if (itemInfo) {
                    this._movedBattlers.push(ruleSet.subject);
                    this._applyedBattlers.push(ruleSet.target);
                    this._ruleIndex++;
                    return new AutoItems.AutoItems_ActionSet(
                        ruleSet.subject,
                        ruleSet.target,
                        itemInfo.item,
                        itemInfo.forceFlag
                    );
                }
            }
            this._ruleIndex++;
        }
        return null;
    };

    /**
     * 現在適用可能なルールセットであるか？
     * @param {AutoItems_RuleSet} ruleSet
     * @returns {boolean}
     * @private
     */
    AutoItems_Manager.prototype._isApplicableRuleSet = function (ruleSet) {
        return (
            ruleSet.subject.canMove() &&
            this._movedBattlers.indexOf(ruleSet.subject) === -1 &&
            this._applyedBattlers.indexOf(ruleSet.target) === -1 &&
            (ruleSet.target.isAlive() || ruleSet.rule.isResurrection())
        );
    };

    /**
     * アイテム情報リストから現在使用可能であるものを選択する
     * @param {Game_Actor, Game_Enemy} subject  アイテムの使用者
     * @param {Array.<ItemInfo>} itemInfoList   アイテム情報の配列
     * @returns {ItemInfo, Boolean}             使用できるアイテム情報。使用できるものがない場合はfalse
     * @private
     */
    AutoItems_Manager.prototype._pickUsableItemInfo = function (subject, itemInfoList) {
        for (var i = 0; i < itemInfoList.length; ++i) {
            var itemInfo = itemInfoList[i];
            if (itemInfo.forceFlag || this._isUsableItem(subject, itemInfo.item)) {
                return itemInfo;
            }
        }
        return false;
    };

    /**
     * そのアイテムが使用可能であるか？
     * @param {Game_Actor, Game_Enemy} subject  使用者
     * @param {Object} item                     スキル or アイテム
     * @returns {Boolean}
     * @private
     */
    AutoItems_Manager.prototype._isUsableItem = function (subject, item) {
        if (DataManager.isSkill(item)) {
            subject.canUse(item);
            if (subject.isActor()) {
                return subject.canUse(item) && subject.isLearnedSkill(item);
            } else {
                return subject.canUse(item);
            }
        } else if (DataManager.isItem(item)) {
            if (subject.isActor()) {
                return subject.canUse(item);
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * 行動ログをもとに、被弾パーティから行動する可能性があるルール一覧を生成する。
     * @param {AutoItems_RecordLog} recordLog   行動ログ
     * @returns {Array.<AutoItems_RuleSet>}     ルールセットの配列
     * @private
     */
    AutoItems_Manager.prototype._readApplicableRulesByRecordLog = function (recordLog) {
        var target = recordLog.target;
        var unit = target.friendsUnit();

        return Array.prototype.concat.apply(
            [],
            unit.movableMembers().map(function (battler) {
                return battler.torigoya_autoItemsSettings().map(function (rule) {
                    if (rule.isApplicable(target, recordLog.actionResult) &&
                        (rule.subjectType === AutoItems_Rule.subjectTypes.friend || battler === target)) {
                        return new AutoItems.AutoItems_RuleSet(battler, target, rule);
                    } else {
                        return null;
                    }
                }).filter(function (n) {
                    return !!n;
                });
            })
        );
    };

    AutoItems.AutoItems_Manager = AutoItems_Manager;
    AutoItems.manager = new AutoItems.AutoItems_Manager();

    // -------------------------------------------------------------------------
    // AutoItems_RecordLog

    function AutoItems_RecordLog() {
        this.initialize.apply(this, arguments);
    }

    AutoItems_RecordLog.prototype.initialize = function (subject, target) {
        this.from = subject;
        this.target = target;
        this.actionResult = this._cloneActionResult(target.result());
    };

    AutoItems_RecordLog.prototype._cloneActionResult = function (actionResult) {
        var obj = new Game_ActionResult();
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = actionResult[key];
            }
        }
        return obj;
    };

    AutoItems.AutoItems_RecordLog = AutoItems_RecordLog;

    // -------------------------------------------------------------------------
    // AutoItems_Rule

    /**
     * オートアイテムのルール
     * @constructor
     */
    function AutoItems_Rule() {
        this.initialize.apply(this, arguments);
    }

    AutoItems_Rule.types = {
        skill: 0,
        item: 1
    };

    AutoItems_Rule.subjectTypes = {
        me: 0,
        friend: 1
    };

    AutoItems_Rule.conditionTypes = {
        state: 0,
        hp: 1,
        mp: 2,
        tp: 3
    };

    Object.defineProperties(AutoItems_Rule.prototype, {
        type: {
            get: function () {
                return this._type;
            },
            configurable: true
        },
        conditionType: {
            get: function () {
                return this._conditionType;
            },
            configurable: true
        },
        conditionIsPercentage: {
            get: function () {
                return this._conditionIsPercentage;
            },
            configurable: true
        },
        conditionValue: {
            get: function () {
                return this._conditionValue;
            },
            configurable: true
        },
        subjectType: {
            get: function () {
                return this._subjectType;
            },
            configurable: true
        },
        itemInfoList: {
            get: function () {
                return this._itemInfoList;
            },
            configurable: true
        }
    });

    /**
     * 初期化
     * @param {String} type             発動するもの(skill or item)
     * @param {String} subjectType      被弾対象(me or friend)
     * @param {String} conditionType    発動要因(state, hp, mp or tp)
     * @param {String} conditionValue   発動する境界値
     * @param {Array.<String>} itemIDs  発動するスキル/アイテムのID配列
     */
    AutoItems_Rule.prototype.initialize = function (type, subjectType, conditionType, conditionValue, itemIDs) {
        this._type = AutoItems_Rule.types[type];
        this._subjectType = AutoItems_Rule.subjectTypes[subjectType];
        this._conditionType = AutoItems_Rule.conditionTypes[conditionType];
        this._itemInfoList = itemIDs.map(function (idStr) {
            var id, forceFlag;
            if (idStr.match(/^\d+\!$/)) {
                id = ~~(idStr.slice(0, -1));
                forceFlag = true;
            } else {
                id = ~~idStr;
                forceFlag = false;
            }
            if (id <= 0) return null;

            switch (this._type) {
                case AutoItems_Rule.types.skill:
                    return new AutoItems.AutoItems_ItemInfo($dataSkills[id], forceFlag);
                case AutoItems_Rule.types.item:
                    return new AutoItems.AutoItems_ItemInfo($dataItems[id], forceFlag);
            }
        }.bind(this)).filter(function (n) {
            return !!n;
        });

        if (conditionValue.indexOf('%') !== -1) {
            this._conditionIsPercentage = true;
            this._conditionValue = Number(conditionValue.slice(0, -1));
        } else {
            this._conditionIsPercentage = false;
            this._conditionValue = Number(conditionValue);
        }
    };

    /**
     * ルールが適用可能であるか？
     * @param {Game_BattlerBase} target         被弾対象
     * @param {Game_ActionResult} actionResult  行動結果の情報
     * @returns {boolean}
     */
    AutoItems_Rule.prototype.isApplicable = function (target, actionResult) {
        switch (this._conditionType) {
            case AutoItems_Rule.conditionTypes.hp:
                return this._isApplicableHP(target, actionResult);
            case AutoItems_Rule.conditionTypes.mp:
                return this._isApplicableMP(target, actionResult);
            case AutoItems_Rule.conditionTypes.tp:
                return this._isApplicableTP(target, actionResult);
            case AutoItems_Rule.conditionTypes.state:
                return this._isApplicableState(target, actionResult);
            default:
                return false;
        }
    };

    /**
     * [HP] ルールが適用可能であるか？
     * @param {Game_BattlerBase} target         被弾対象
     * @param {Game_ActionResult} actionResult  行動結果の情報
     * @returns {boolean}
     * @private
     */
    AutoItems_Rule.prototype._isApplicableHP = function (target, actionResult) {
        if (actionResult.hpDamage < 0) return false;
        if (this._conditionIsPercentage) {
            return (target.hp < target.mhp * this._conditionValue / 100);
        } else {
            return (target.hp < this._conditionValue);
        }
    };

    /**
     * [MP] ルールが適用可能であるか？
     * @param {Game_BattlerBase} target         被弾対象
     * @param {Game_ActionResult} actionResult  行動結果の情報
     * @returns {boolean}
     * @private
     */
    AutoItems_Rule.prototype._isApplicableMP = function (target, actionResult) {
        if (actionResult.mpDamage < 0) return false;
        if (this._conditionIsPercentage) {
            return (target.mp < target.mmp * this._conditionValue / 100);
        } else {
            return (target.mp < this._conditionValue);
        }
    };

    /**
     * [TP] ルールが適用可能であるか？
     * @param {Game_BattlerBase} target         被弾対象
     * @param {Game_ActionResult} actionResult  行動結果の情報
     * @returns {boolean}
     * @private
     */
    AutoItems_Rule.prototype._isApplicableTP = function (target, actionResult) {
        if (actionResult.tpDamage < 0) return false;
        if (this._conditionIsPercentage) {
            return (target.tp < target.maxTp() * this._conditionValue / 100);
        } else {
            return (target.tp < this._conditionValue);
        }
    };

    /**
     * [State] ルールが適用可能であるか？
     * @param {Game_BattlerBase} target         被弾対象
     * @param {Game_ActionResult} actionResult  行動結果の情報
     * @returns {boolean}
     * @private
     */
    AutoItems_Rule.prototype._isApplicableState = function (target, actionResult) {
        return actionResult.isStateAdded(this._conditionValue);
    };

    /**
     * 戦闘不能を理由に発動するルールであるか？
     * @returns {boolean}
     */
    AutoItems_Rule.prototype.isResurrection = function () {
        return this._conditionType === AutoItems_Rule.conditionTypes.state && this._conditionValue === Game_BattlerBase.prototype.deathStateId();
    };

    /**
     * メモ欄に設定されるメタ文字列を元にルールを生成する
     * @param {String} key      メモ欄のキー名
     * @param {String} value    メモ欄の値
     * @returns {*}
     */
    AutoItems_Rule.parse = function (key, value) {
        var matches = key.match(this.metaRegexp);
        if (matches) {
            var items = value.split(AutoItems_Rule.likeCSVRegexp).map(function (n) {
                return n.trim();
            });
            return new AutoItems_Rule(
                (matches[1] === 'AutoItem' ? 'item' : 'skill'),
                (matches[2] === 'Me' ? 'me' : 'friend'),
                matches[3],
                matches[4],
                items
            );
        } else {
            return null;
        }
    };

    AutoItems_Rule.metaRegexp = /^(AutoItem|AutoSkill)(Me|Friend)\/(hp|mp|tp|state)\[(\d+%?)\]$/;
    AutoItems_Rule.likeCSVRegexp = new RegExp('\\s*,\\s*');
    AutoItems.AutoItems_Rule = AutoItems_Rule;

    // -------------------------------------------------------------------------
    // AutoItems_RuleSet

    function AutoItems_RuleSet() {
        this.initialize.apply(this, arguments);
    }

    AutoItems_RuleSet.prototype.initialize = function (subject, target, rule) {
        this.subject = subject;
        this.target = target;
        this.rule = rule;
    };

    AutoItems.AutoItems_RuleSet = AutoItems_RuleSet;

    // -------------------------------------------------------------------------
    // AutoItems_ActionSet

    function AutoItems_ActionSet() {
        this.initialize.apply(this, arguments);
    }

    AutoItems_ActionSet.prototype.initialize = function (subject, target, item, forceFlag) {
        this.subject = subject;
        this.target = target;
        this.item = item;
        this.forceFlag = forceFlag;
    };

    AutoItems.AutoItems_ActionSet = AutoItems_ActionSet;

    // -------------------------------------------------------------------------
    // AutoItems_ItemInfo

    function AutoItems_ItemInfo() {
        this.initialize.apply(this, arguments);
    }

    AutoItems_ItemInfo.prototype.initialize = function (item, forceFlag) {
        this.item = item;
        this.forceFlag = forceFlag;
    };

    AutoItems.AutoItems_ItemInfo = AutoItems_ItemInfo;

    // -------------------------------------------------------------------------
    // Utils

    /**
     * 対象のメモ欄からルール配列を取得する
     * @param {*} object メモ欄を持つオブジェクト
     * @returns {Array.<AutoItems_Rule>}
     */
    AutoItems.readSettingFromMeta = function (object) {
        if (!object) return [];

        if (!object.torigoya_autoItemsCacheSetting) {
            object.torigoya_autoItemsCacheSetting = Object.keys(object.meta).map(function (key) {
                return AutoItems_Rule.parse(key, object.meta[key]);
            }).filter(function (n) {
                return !!n;
            });
        }

        return object.torigoya_autoItemsCacheSetting;
    };

    // -------------------------------------------------------------------------
    // BattleManagerに差し込む処理

    /**
     * 行動開始処理。オートアイテム処理が始まっていなければ初期化する。
     */
    AutoItems.startAction = function () {
        if (AutoItems.manager.phase === 'none') {
            AutoItems.manager.reset();
            AutoItems.manager.phase = 'record';
        }
    };

    /**
     * 行動の記録。記録フェーズ以外はスキップする。
     * @param subject
     * @param target
     */
    AutoItems.recordAction = function (subject, target) {
        if (AutoItems.manager.phase === 'record') {
            AutoItems.manager.recordLog(subject, target);
        }
    };

    /**
     * 行動終了処理。
     * フェーズに合わせて、オートアイテム処理を挿入する
     */
    AutoItems.endAction = function () {
        if (AutoItems.manager.phase === 'record') {
            AutoItems.manager.initRules();
            AutoItems.manager.phase = 'play';
        }

        if (AutoItems.manager.phase === 'play') {
            var actionSet = AutoItems.manager.pickActionableRuleSet();
            if (actionSet) {
                AutoItems.manager.insertInterruptAction(actionSet);
            } else {
                AutoItems.manager.reset();
            }
        }
    };

    /**
     * 行動開始処理。オートアイテム処理が始まっていなければ初期化する。
     */
    AutoItems.startAction = function () {
        if (AutoItems.manager.phase === 'none') {
            AutoItems.manager.reset();
            AutoItems.manager.phase = 'record';
        }
    };

    // -------------------------------------------------------------------------
    // 独自定義

    /**
     * ルールセットの取得
     * @returns {Array.<AutoItem_Rule>}
     */
    Game_Battler.prototype.torigoya_autoItemsSettings = function () {
        var settings = [];
        this.states().forEach(function (state) {
            if (state) {
                settings = settings.concat(AutoItems.readSettingFromMeta(state));
            }
        });
        return settings;
    };

    /**
     * ルールセットの取得
     * @returns {Array.<AutoItem_Rule>}
     */
    Game_Actor.prototype.torigoya_autoItemsSettings = function () {
        var settings = Game_Battler.prototype.torigoya_autoItemsSettings.call(this);
        settings = settings.concat(AutoItems.readSettingFromMeta(this.actor()));
        settings = settings.concat(AutoItems.readSettingFromMeta(this.currentClass()));
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item) {
                settings = settings.concat(AutoItems.readSettingFromMeta(item));
            }
        }
        return settings;
    };

    /**
     * ルールセットの取得
     * @returns {Array.<AutoItem_Rule>}
     */
    Game_Enemy.prototype.torigoya_autoItemsSettings = function () {
        var settings = Game_Battler.prototype.torigoya_autoItemsSettings.call(this);
        settings = settings.concat(AutoItems.readSettingFromMeta(this.enemy()));
        return settings;
    };

    /**
     * 割り込み処理の挿入
     * @param {Game_Item} item                   スキル/アイテム情報
     * @param {Game_Actor, Game_Enemy} target    スキル/アイテム対象
     */
    Game_Battler.prototype.torigoya_autoItemsInterruptAction = function (item, target) {
        var action = new Game_Action(this, true);
        action.setItemObject(item);
        action.setTarget(target.index());
        this._actions.unshift(action);
    };

    /**
     * 割り込み処理の挿入
     * @param {Game_BattlerBase} battler 割り込み行動を行うバトラー
     */
    BattleManager.torigoya_autoItemsInterruptAction = function (battler) {
        this._actionForcedBattler = battler;
    };

    // -------------------------------------------------------------------------
    // エイリアス

    var upstream_Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function (item) {
        if (AutoItems.manager.isSkipUseItem()) return;
        upstream_Game_Battler_useItem.apply(this, arguments);
    };

    var upstream_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        AutoItems.startAction();
        upstream_BattleManager_startAction.apply(this);
    };

    var upstream_BattleManager_invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function (subject, target) {
        upstream_BattleManager_invokeAction.apply(this, arguments);
        AutoItems.recordAction(subject, target);
    };

    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        upstream_BattleManager_endAction.apply(this);
        AutoItems.endAction();
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.AutoItems = AutoItems;
})(this);
