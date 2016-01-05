//=============================================================================
// Torigoya_AddPrefixToStorageKey.js
//=============================================================================

/*:
 * @plugindesc Add prefix to webstorage key
 * @author ru_shalm
 *
 * @param Prefix
 * @desc prefix string (default: none)
 * @default
 *
 * @help
 *
 */

/*:ja
 * @plugindesc Webプレイ時のデータ保存先名にプレフィックスを付与します。
 * @author ru_shalm
 *
 * @param Prefix
 * @desc prefix string （デフォルト: 無し）
 * @default
 *
 * @help
 *
 * ■ どういうわけか？
 * MVではWeb版プレイでのデータ保存先はブラウザのLocalStorageという機能を使っています。
 * そして、LocalStorageはドメインごとに保存領域が分けられています。
 * （例えば http://toripota.com/game1 と http://toripota.com/game2 では
 *   両方とも「http://toripota.com」というドメインで公開されているため、
 *   ゲーム自体は別物でも保存領域は同じ場所になります。）
 *
 * セーブ一覧に他のゲームのセーブデータが表示されるのはどう考えてもジャマなので、
 * このプラグインでは保存時のキー名（ファイル名）に、
 * 作者の好きな文字列を追加して、混ざるのを防止できるようにします。
 *
 * 混ざるとどうなるのかを見たい方はWeb版のサンプルゲームをいっぱいプレイしましょう。
 * http://info.nicovideo.jp/gamemaga/mvsample/
 */

(function () {
    var settings = PluginManager.parameters('Torigoya_AddPrefixToStorageKey');
    var prefix = String(settings['Prefix'] || '');

    var upstream_StorageManager_webStorageKey = StorageManager.webStorageKey;
    StorageManager.webStorageKey = function (_) {
        var defaultKey = upstream_StorageManager_webStorageKey.apply(this, arguments);
        if (prefix.length > 0) {
            return prefix + '_' + defaultKey;
        } else {
            return defaultKey;
        }
    };
})();
