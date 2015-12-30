//=============================================================================
// Torigoya_NotRemoveWeapon.js
//=============================================================================

/*:
 * @plugindesc change to cannot remove weapon in Equip_Scene
 * @author ru_shalm
 */

/*:ja
 * @plugindesc 装備画面で武器は外せないようにします
 * @author ru_shalm
 */

(function () {
    var isWeaponSlot = function (actor, slotId) {
        return (actor && actor.equipSlots()[slotId] === 1);
    };

    // 武器のときは末尾空白を入れない
    var upstream_Window_EquipItem_includes = Window_EquipItem.prototype.includes;
    Window_EquipItem.prototype.includes = function (item) {
        if (!item && isWeaponSlot(this._actor, this._slotId)) {
            return false;
        }
        return upstream_Window_EquipItem_includes.apply(this, arguments);
    };

    // 武器のときは空白を選択できない
    var upstream_Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;
    Window_EquipItem.prototype.isEnabled = function (item) {
        if (!item && isWeaponSlot(this._actor, this._slotId)) {
            return false;
        }
        return upstream_Window_EquipItem_isEnabled.apply(this, arguments);
    };

    // [再定義] 全部外すで外れないようにする
    Game_Actor.prototype.clearEquipments = function () {
        var maxSlots = this.equipSlots().length;
        for (var i = 0; i < maxSlots; i++) {
            if (!isWeaponSlot(this, i) && this.isEquipChangeOk(i)) {
                this.changeEquip(i, null);
            }
        }
    };

    // 今の装備品とも比較するようにする
    // ※デフォだと事前に装備を解除することが前提になっていて、その作りは今は困る…
    var upstream_Game_Actor_bestEquipItem = Game_Actor.prototype.bestEquipItem;
    Game_Actor.prototype.bestEquipItem = function (slotId) {
        var bestItem = upstream_Game_Actor_bestEquipItem.apply(this, arguments),
            nowItem = this._equips[slotId].object(),
            bestPerformance = bestItem ? this.calcEquipItemPerformance(bestItem) : -1000,
            nowPerformance = nowItem ? this.calcEquipItemPerformance(nowItem) : -1000;
        if (nowPerformance > bestPerformance) {
            return nowItem;
        } else {
            return bestItem;
        }
    };
})();
