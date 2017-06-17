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
 * 敵キャラについて、毒などで受ける最大ダメージを
 * 設定できるようになります。
 *
 * 「毒のダメージを最大HPの50%にしたらボスが2ターンで死んだ」
 * のような悲しい事件を防ぐことができます。
 *
 * ------------------------------------------------------------
 * ■ 設定方法
 * ------------------------------------------------------------
 * 敵キャラのメモ欄に以下のように設定してください。
 *
 * <MaxSlipDamage: 最大ダメージ数>
 *
 * <MaxSlipDamage: 50> のように設定すると、
 * 毒で50ダメージまでしか受けなくなります。
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
