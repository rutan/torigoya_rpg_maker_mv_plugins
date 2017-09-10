/*---------------------------------------------------------------------------*
 * Torigoya_ReplaceDeadMemberPlus.js
 *---------------------------------------------------------------------------*
 * 2017/09/11 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc 戦闘不能アクター自動入れ替えさんPlus
 * @author ru_shalm
 * @help
 * 戦闘中にアクターが戦闘不能になった際に
 * 自動的に控えメンバーと入れ替えるようにします。
 *
 * @param ■ 基本設定
 *
 * @param Save sort order
 * @desc 戦闘終了後、並び順を戦闘開始前の状態に戻すか？（ON または OFF）
 * @default ON
 *
 * @param Disable switch ID
 * @desc 指定IDのスイッチがONの場合、入れ替え機能を無効化します。無効化する必要がない場合は 0 にしてください。
 * @default 0
 *
 * @param ■ こだわり設定
 *
 * @param Can replace leader
 * @desc パーティ先頭のアクターも入れ替え可能にするか？（ON または OFF）
 * @default ON
 *
 * @param Wait: Dead
 * @desc 入れ替わり前（戦闘不能時）のウェイト時間（フレーム数）
 * @default 15
 *
 * @param Wait: Replace
 * @desc 入れ替わった後のウェイト時間（フレーム数）
 * @default 30
 */

(function (global) {
    'use strict';

    // -------------------------------------------------------------------------
    // variables

    var ReplaceDeadMember = {
        name: 'Torigoya_ReplaceDeadMemberPlus'
    };
    ReplaceDeadMember.settings = (function () {
        var parameters = PluginManager.parameters(ReplaceDeadMember.name);
        return {
            saveSortOrder: String(parameters['Save sort order'] || 'ON') === 'ON',
            disableSwitchID: Number(parameters['Disable switch ID'] || 0),
            canReplaceLeader: String(parameters['Can replace leader'] || 'OFF') === 'ON',
            waitDead: Number(parameters['Wait: Dead'] || 15),
            waitReplace: Number(parameters['Wait: Replace'] || 30)
        };
    })();

    // 入れ替えフェーズのwait時間
    var swapPhaseCounter = 0;
    var SWAP_PHASE_TIME_CHANGE = ReplaceDeadMember.settings.waitDead;
    var SWAP_PHASE_TIME_FINISH = SWAP_PHASE_TIME_CHANGE + ReplaceDeadMember.settings.waitReplace;

    // 入れ替え後コールバック
    // ※呼び出し元によって分岐したい！
    var onSwappedCallback = null;

    // ソート順の記憶
    var sortOrder = null;
    var sortOrderBattleMembers = null;

    // -------------------------------------------------------------------------
    // functions

    /**
     * 機能を利用するか？
     * @returns {boolean}
     */
    ReplaceDeadMember.isEnabled = function () {
        if (ReplaceDeadMember.settings.disableSwitchID === 0) return true;
        return !$gameSwitches.value(ReplaceDeadMember.settings.disableSwitchID);
    };

    /**
     * 並び順保持をするか？
     * @returns {boolean}
     */
    ReplaceDeadMember.isSaveSortOrder = function () {
        return ReplaceDeadMember.settings.saveSortOrder;
    };

    /**
     * 並び順を保存
     */
    ReplaceDeadMember.saveSortOrder = function () {
        sortOrder = $gameParty.allMembers().map(function (actor) {
            return actor.actorId();
        });
        sortOrderBattleMembers = $gameParty.battleMembers().map(function (actor) {
            return actor.actorId();
        });
    };

    /**
     * 並び順を復元
     */
    ReplaceDeadMember.restoreSortOrder = function () {
        if (!sortOrder || sortOrder.length === 0) return;
        $gameParty.torigoya__replaceDeadMember__restoreSort(sortOrder);
        sortOrder = null;
        sortOrderBattleMembers = null;
    };

    /**
     * 入れ替え可能かチェック
     * @returns {boolean}
     */
    ReplaceDeadMember.isReplaceable = function () {
        if (!ReplaceDeadMember.isEnabled()) return false;

        var deadBattleMember = false;
        var aliveBenchMember = false;
        var members = $gameParty.allMembers();
        for (var i = 0; i < members.length; ++i) {
            if (i < $gameParty.maxBattleMembers()) {
                if (members[i].isDead()) deadBattleMember = true;
            } else {
                if (members[i].isAlive()) aliveBenchMember = true;
            }
        }

        return deadBattleMember && aliveBenchMember;
    };

    /**
     * 生存メンバーが先頭に集まるように並び替え
     */
    ReplaceDeadMember.sortDeadMember = function () {
        var allMembers = $gameParty.allMembers();
        for (var i = ReplaceDeadMember.getPartyStartIndex(); i < allMembers.length - 1; ++i) {
            if (!allMembers[i].isDead()) continue;

            for (var j = i + 1; j < allMembers.length; ++j) {
                if (allMembers[j].isDead()) continue;
                $gameParty.swapOrder(i, j);
                allMembers = $gameParty.allMembers(); // 取り直す
                break;
            }
        }
    };

    /**
     * 死んだ戦闘参加中メンバーを控えと入れ替え
     * @returns {boolean} 入れ替えが発生したか？
     */
    ReplaceDeadMember.swapDeadMember = function () {
        var changed = false;
        var allMembers = $gameParty.allMembers();
        for (var i = ReplaceDeadMember.getPartyStartIndex(); i < $gameParty.maxBattleMembers(); ++i) {
            if (!allMembers[i]) break;
            if (!allMembers[i].isDead()) continue;

            for (var j = $gameParty.maxBattleMembers(); j < allMembers.length; ++j) {
                if (allMembers[j].isDead()) continue;

                changed = true;
                $gameParty.swapOrder(i, j);
                allMembers = $gameParty.allMembers(); // 取り直す

                // 入れ替え後アクター
                var changedActor = allMembers[i];
                changedActor.onBattleStart();
                changedActor.torigoya__replaceDeadMember__prevActor = allMembers[j];

                break;
            }
        }
        return changed;
    };

    /**
     * 入れ替え対象範囲にするアクターの位置
     * @returns {number}
     */
    ReplaceDeadMember.getPartyStartIndex = function () {
        return ReplaceDeadMember.settings.canReplaceLeader ? 0 : 1;
    };

    /**
     * 入れ替え表示フェーズ
     */
    ReplaceDeadMember.updateSwap = function () {
        // isBusyだけだとYEP_BattleEngineCoreで死に至る＞＜；
        if (this._spriteset.isBusy() || this._spriteset.isAnyoneMoving()) return;

        switch (swapPhaseCounter) {
            case SWAP_PHASE_TIME_CHANGE: {
                ReplaceDeadMember.swapDeadMember();
                break;
            }
            case SWAP_PHASE_TIME_FINISH: {
                // 戦闘中吹き出し表示さん連携
                if (global.Torigoya.BalloonInBattle) {
                    global.Torigoya.BalloonInBattle.clearSpeechOfAllMember();
                }

                if (onSwappedCallback) {
                    onSwappedCallback();
                    onSwappedCallback = null;
                }

                swapPhaseCounter = 0;
                return;
            }
        }

        swapPhaseCounter++;
    };

    // -------------------------------------------------------------------------
    // Game_Party

    Game_Party.prototype.torigoya__replaceDeadMember__restoreSort = function (memory) {
        this._actors.sort(function (a, b) {
            var index1 = memory.indexOf(a);
            var index2 = memory.indexOf(b);
            if (index2 === -1) return -1;
            if (index1 === -1) return 1;
            return index1 - index2;
        });
        $gamePlayer.refresh();
    };

    // 戦闘開始時にソート順を保持 && 前に詰める
    var upstream_Game_Party_onBattleStart = Game_Party.prototype.onBattleStart;
    Game_Party.prototype.onBattleStart = function () {
        if (ReplaceDeadMember.isSaveSortOrder()) ReplaceDeadMember.saveSortOrder();
        ReplaceDeadMember.sortDeadMember();
        upstream_Game_Party_onBattleStart.apply(this);
    };

    // 戦闘終了時にソート順を元に戻す
    var upstream_Game_Party_onBattleEnd = Game_Party.prototype.onBattleEnd;
    Game_Party.prototype.onBattleEnd = function () {
        upstream_Game_Party_onBattleEnd.apply(this);
        if (ReplaceDeadMember.isSaveSortOrder()) ReplaceDeadMember.restoreSortOrder();
    };

    // -------------------------------------------------------------------------
    // BattleManager

    // 入れ替えアニメフェーズの追加
    var upstream_BattleManager_update = BattleManager.update;
    BattleManager.update = function () {
        upstream_BattleManager_update.apply(this);
        if (!this.isBusy() && !this.updateEvent()) {
            switch (this._phase) {
                case 'torigoya__replaceDeadMember__swap':
                    ReplaceDeadMember.updateSwap.apply(this);
                    break;
            }
        }
    };

    // 戦闘不能による入れ替えが発生する場合、入れ替えフェーズに遷移
    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        upstream_BattleManager_endAction.bind(this)();
        if (ReplaceDeadMember.isReplaceable()) {
            this._phase = 'torigoya__replaceDeadMember__swap';
            onSwappedCallback = function () {
                this._phase = 'turn';
            }.bind(this);
        }
    };

    // ターン終了時に入れ替えチェック
    // ※毒で死ぬ場合はここで入れ替わり
    var upstream_BattleManager_updateTurnEnd = BattleManager.updateTurnEnd;
    BattleManager.updateTurnEnd = function () {
        if (ReplaceDeadMember.isReplaceable()) {
            this._phase = 'torigoya__replaceDeadMember__swap';
            onSwappedCallback = upstream_BattleManager_updateTurnEnd.bind(this);
        } else {
            upstream_BattleManager_updateTurnEnd.apply(this);
        }
    };

    // バトルイベント終了時などに全滅判定されないようにする
    var upstream_BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if (this._phase && $gameParty.isAllDead() && ReplaceDeadMember.isReplaceable()) {
            return false;
        }
        return upstream_BattleManager_checkBattleEnd.apply(this);
    };

    // -------------------------------------------------------------------------
    // SpriteActor

    // 入れ替えメンバーフラグが立っている場合は入れ替えモーションを実行する
    var upstream_Sprite_Actor_setBattler = Sprite_Actor.prototype.setBattler;
    Sprite_Actor.prototype.setBattler = function (battler) {
        upstream_Sprite_Actor_setBattler.apply(this, arguments);
        if (this._actor && this._actor.torigoya__replaceDeadMember__prevActor) {
            this.moveToStartPosition();
            this.startEntryMotion();

            // 戦闘中吹き出し表示さん連携
            if (global.Torigoya.BalloonInBattle) {
                var msg =
                    this._actor.torigoya_pickSpeech(
                        'Change',
                        this._actor.torigoya__replaceDeadMember__prevActor.actorId(),
                        this._actor.torigoya__replaceDeadMember__prevActor.name()
                    ) || this._actor.torigoya_pickSpeech('Start', $gameTroop._troopId);
                this._actor.torigoya_setSpeech(msg);
            }

            this._actor.torigoya__replaceDeadMember__prevActor = null;
        }
    };

    // -------------------------------------------------------------------------
    // check Conflict

    // for YEP_PartySystem.js
    if (global.Yanfly && global.Yanfly.Party) {
        var upstream_Scene_Party_terminate = Scene_Party.prototype.terminate;
        Scene_Party.prototype.terminate = function () {
            upstream_Scene_Party_terminate.apply(this);
            if (ReplaceDeadMember.isEnabled()) {
                ReplaceDeadMember.sortDeadMember();
                if (ReplaceDeadMember.isSaveSortOrder()) ReplaceDeadMember.saveSortOrder();
                ReplaceDeadMember.swapDeadMember();
            }
        };

        var upstream_Game_Party_torigoya__replaceDeadMember__restoreSort = Game_Party.prototype.torigoya__replaceDeadMember__restoreSort;
        Game_Party.prototype.torigoya__replaceDeadMember__restoreSort = function (memory) {
            this._battleMembers.sort(function (a, b) {
                var index1 = memory.indexOf(a);
                var index2 = memory.indexOf(b);
                if (index2 === -1) return -1;
                if (index1 === -1) return 1;
                return index1 - index2;
            });
            upstream_Game_Party_torigoya__replaceDeadMember__restoreSort.apply(this, arguments);
        };

        var upstream_ReplaceDeadMember_sortDeadMember = ReplaceDeadMember.sortDeadMember;
        ReplaceDeadMember.sortDeadMember = function () {
            upstream_ReplaceDeadMember_sortDeadMember.apply(this);
            $gameParty._battleMembers = $gameParty._battleMembers.filter(function (id) {
                return id > 0;
            });

            var battleMembers = $gameParty._battleMembers;
            for (var i = ReplaceDeadMember.getPartyStartIndex(); i < battleMembers.length - 1; ++i) {
                var actor = $gameActors.actor(battleMembers[i]);
                if (!actor) break;
                if (!actor.isDead()) continue;

                for (var j = i + 1; j < battleMembers.length; ++j) {
                    var actor2 = $gameActors.actor(battleMembers[j]);
                    if (actor2.isDead()) continue;
                    $gameParty._battleMembers[i] = actor2.actorId();
                    $gameParty._battleMembers[j] = actor.actorId();
                    battleMembers = $gameParty._battleMembers; // 取り直す
                    break;
                }
            }
        };

        ReplaceDeadMember.swapDeadMember = function () {
            var changed = false;
            var battleMemberIds = $gameParty._battleMembers;
            var allMembers = $gameParty.allMembers();
            for (var i = ReplaceDeadMember.getPartyStartIndex(); i < $gameParty.maxBattleMembers(); ++i) {
                var actor = $gameActors.actor(battleMemberIds[i]);
                if (actor && !actor.isDead()) continue;

                for (var j = 0; j < allMembers.length; ++j) {
                    if (battleMemberIds.indexOf(allMembers[j].actorId()) !== -1) continue;
                    if (allMembers[j].isDead()) continue;

                    changed = true;
                    $gameParty._battleMembers[i] = allMembers[j].actorId();

                    // 入れ替え後アクター
                    var changedActor = allMembers[j];
                    changedActor.onBattleStart();
                    changedActor.torigoya__replaceDeadMember__prevActor = actor;

                    // 更新する
                    battleMemberIds = $gameParty._battleMembers;

                    break;
                }
            }
            return changed;
        };
    }

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.ReplaceDeadMember = {};
})(this);
