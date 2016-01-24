//=============================================================================
// Torigoya_MaxSlipDamageSetting.js
//=============================================================================

/*:
 * @plugindesc Max slip damage setting for enemies.
 * @author ru_shalm
 *
 * @help
 *
 * Enemy Note:
 *   <MaxSlipDamage: 50>   # max slip damage value: 50
 */

/*:ja
 * @plugindesc 毒などのスリップダメージの最大値を敵ごとに設定できるようにします。
 * @author ru_shalm
 *
 * @help
 *
 * 敵キャラのメモ:
 *   <MaxSlipDamage: 50>   # スリップダメージの最大を50にします
 */

(function (_) {
    var upstream_Game_Enemy_maxSlipDamage = Game_Enemy.prototype.maxSlipDamage;
    Game_Enemy.prototype.maxSlipDamage = function () {
        var defaultValue = upstream_Game_Enemy_maxSlipDamage.apply(this);
        var maxSlipDamage = this.enemy().meta['MaxSlipDamage'];
        if (maxSlipDamage) {
            return Math.min(defaultValue, ~~maxSlipDamage);
        } else {
            return defaultValue;
        }
    };
})(this);
