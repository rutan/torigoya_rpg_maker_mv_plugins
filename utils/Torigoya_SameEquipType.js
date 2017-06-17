//=============================================================================
// Torigoya_SameEquipType.js
//=============================================================================

/*:
 * @plugindesc If equip slot name is the same, it can have an item of the same type
 * @author ru_shalm
 */

/*:ja
 * @plugindesc 装備タイプ名が同じならば、同じ種別のアイテムを装備できるようにします
 * @author ru_shalm
 *
 * @help
 *
 * データベースの「タイプ」→「装備タイプ」設定で
 * 同じ名前を設定した場合は、同じ種別のアイテムを装備できるようにします。
 *
 * 例えば
 *
 *   01 武器
 *   02 盾
 *   03 装飾品
 *   04 装飾品
 *   05 装飾品
 *
 * のように設定した場合、装備の3段目〜5段目が全て
 * 「03 装飾品」が装備できるスロットになります。
 *
 * ※装備の設定をする際は必ず同じ名前でも
 * 　一番上にあるものにしてください。
 * 　上記の例の場合であれば装飾品はすべて「03 装飾品」になります。
 */

(function () {
    var upstream_Game_Actor_equipSlots = Game_Actor.prototype.equipSlots;
    Game_Actor.prototype.equipSlots = function() {
        var slots = upstream_Game_Actor_equipSlots.apply(this);
        var n;
        for (var i = 1; i < $dataSystem.equipTypes.length; i++) {
            n = $dataSystem.equipTypes.indexOf($dataSystem.equipTypes[i]);
            if (n !== i) { slots[i - 1] = n; }
        }
        return slots;
    };
})();
