# Skill change conditional - スキル変化条件設定さん for MV

指定の条件を満たした際にスキルを別のものに変化させる設定をできるようにします。

## Example

スキルのメモ欄で設定をすることができます。

```
# change skill when subject hp is less than 100
# HPが100未満のとき、スキルID: 10に変化
<ChangeTo[10]: a.hp < 100>

# change skill with 10% chance
# 10%の確率でスキルID: 10に変化
<ChangeTo[10]: Math.random() < 0.1>
```

## About conditional
the subject assign to variable `a`. (likely damage formula. but cannot use `b`.)

`a` という変数にスキルを使った本人のsubjectが入っています。
（※ダメージ計算式と一緒。ただし`b` はありません。）

## Video
https://youtu.be/cqBrq9uwXWU

