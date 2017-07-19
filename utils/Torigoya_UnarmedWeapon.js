/*---------------------------------------------------------------------------*
 * Torigoya_UnarmedWeapon.js
 *---------------------------------------------------------------------------*
 * 2017/07/20 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc 素手装備を設定します
 * @author ru_shalm
 * @help
 * 武器を外したときに自動的に「素手」設定をした武器を
 * 自動的に装備するようにします。
 *
 * ------------------------------------------------------------
 * ■ 基本ルール
 * ------------------------------------------------------------
 *
 * ・装備欄には特に素手は表示されません（アイテムとして見えない）
 * ・武器を外すと勝手に装備されます
 * ・プラグイン設定で指定した武器IDが「素手」として扱われます
 * 　└ おまけ機能として後述のメモコマンドを設定することで、
 * 　　 キャラクターごとに「素手」を別のものにすることも可能です。
 *
 * ------------------------------------------------------------
 * ■ メモ欄
 * ------------------------------------------------------------
 *
 * 「アクター」のメモ欄に以下のような記述をすることで
 * そのアクター専用の「素手」を設定することができます。
 *
 *      <素手: 123>
 *
 * 上のように設定すると、そのアクターは武器ID 123番 が
 * 素手装備として扱われます。
 *
 * @param UnarmedWeapon ID
 * @desc 共通の素手装備の武器ID
 * @default 1
 */

(function (global) {
    'use strict';

    var UnarmedWeapon = {
        name: 'Torigoya_UnarmedWeapon'
    };
    UnarmedWeapon.settings = (function () {
        var parameters = PluginManager.parameters(UnarmedWeapon.name);
        return {
            weaponID: Number(parameters['UnarmedWeapon ID'] || 1)
        };
    })();

    // -------------------------------------------------------------------------
    // Utils

    /**
     * 武器スロットであるか？
     * @param actor
     * @param slotId
     * @returns {*|boolean}
     */
    function isWeaponSlot(actor, slotId) {
        return (actor && actor.equipSlots()[slotId] === 1);
    }

    /**
     * 指定のitemが「素手」であるか？
     * @param actor
     * @param item
     * @returns {boolean}
     */
    function isUnarmedWeapon(actor, item) {
        return item === getUnarmedWeapon(actor);
    }

    /**
     * 指定アクターの「素手」を取得
     * @param actor
     * @returns {object}
     */
    function getUnarmedWeapon(actor) {
        var id = Number(actor.actor().meta['素手'] || UnarmedWeapon.settings.weaponID);
        return $dataWeapons[id];
    }

    // -------------------------------------------------------------------------
    // alias

    // 「素手」は誰でも装備可能
    var upstream_Game_Actor_canEquip = Game_Actor.prototype.canEquip;
    Game_Actor.prototype.canEquip = function(item) {
        if (item && item === getUnarmedWeapon(this)) return true;
        return upstream_Game_Actor_canEquip.apply(this, arguments);
    };

    // 「素手」だったらアイテム欄に入れず削除する
    var upstream_Game_Actor_tradeItemWithParty = Game_Actor.prototype.tradeItemWithParty;
    Game_Actor.prototype.tradeItemWithParty = function (newItem, oldItem) {
        var result = upstream_Game_Actor_tradeItemWithParty.apply(this, arguments);
        if (result && isUnarmedWeapon(this, oldItem)) {
            $gameParty.loseItem(oldItem, 1);
        }
        return result;
    };

    // 装備交換時に武器に無を装備したら「素手」に差し替える
    var upstream_Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function (slotId, item) {
        upstream_Game_Actor_changeEquip.call(this, slotId, item);
        if (isWeaponSlot(this, slotId) && item === null) {
            this._equips[slotId].setObject(getUnarmedWeapon(this));
            this.refresh();
        }
    };

    // 強制装備時に武器に無を装備したら「素手」を差し込む
    var upstream_Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
    Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
        if (isWeaponSlot(this, slotId) && item === null) item = getUnarmedWeapon(this);
        upstream_Game_Actor_forceChangeEquip.call(this, slotId, item);
    };

    // 最高の装備と「素手」を比較して、強い方を選ぶように
    var upstream_Game_Actor_bestEquipItem = Game_Actor.prototype.bestEquipItem;
    Game_Actor.prototype.bestEquipItem = function (slotId) {
        var bestItem = upstream_Game_Actor_bestEquipItem.apply(this, arguments);

        if (isWeaponSlot(this, slotId)) {
            var bestItemPerformance = this.calcEquipItemPerformance(bestItem);
            var unarmedItem = getUnarmedWeapon(this);
            var unarmedItemPerformance = this.calcEquipItemPerformance(unarmedItem);

            return bestItemPerformance >= unarmedItemPerformance ? bestItem : unarmedItem;
        } else {
            return bestItem;
        }
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.UnarmedWeapon = UnarmedWeapon;
})(window);
