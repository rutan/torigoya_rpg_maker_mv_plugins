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
    var isWeaponSlot = function () {
        return (this._actor && this._actor.equipSlots()[this._slotId] === 1);
    };

    // 武器のときは末尾空白を入れない
    var upstream_Window_EquipItem_includes = Window_EquipItem.prototype.includes;
    Window_EquipItem.prototype.includes = function (item) {
        if (!item && isWeaponSlot.apply(this)) {
            return false;
        }
        return upstream_Window_EquipItem_includes.apply(this, arguments);
    };

    // 武器のときは空白を選択できない
    var upstream_Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;
    Window_EquipItem.prototype.isEnabled = function (item) {
        if (!item && isWeaponSlot.apply(this)) {
            return false;
        }
        return upstream_Window_EquipItem_isEnabled.apply(this, arguments);
    };
})();
