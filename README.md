# vue-input-number
Vue を用いた書式指定可能な数値入力ボックス

# できること
1. 数値入力ボックスに、指定された書式で数値を表示する。(例: 書式指定: %.2f => 0.00 といった表記となる。)
2. 入力範囲指定可能。
3. スピンボタンにより、指定されたステップ刻みで数値の上下操作が可能。
4. スピンボタン長押し対応。


# 使い方
1. vue と vue-input-number の導入
```
<!-- スタイルシートの取り込み -->
<link rel="stylesheet" href="/path/to/vue-input-number.css">
```
```
<!-- JavaScript の取り込み -->
<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="/path/to/vue-input-number.js"></script>
```
2. 数値入力ボックスの配置と vue のデータとの連携
```
<div id="app">
  <input-number :value="tempValue" :format="'%.2f'" :min="-273.15" :max="1000.00" :step="1.0" @input="tempValue1 = $event"></input-number>
</div>
```
```
var app = new Vue({
  el: '#app',
  data : {
    tempValue : 0
  }
})
```

# オプションの指定について
1. format
フォーマットを指定します。C言語の printf のようなフォーマットが利用可能です。
```
[prefix]%[0padding][.padding-for-float][format][suffix]
prefix  : 前に付与する任意の文字列
padding : 整数の前に付与する 0パディング
padding-for-float: 小数点以下の 0 パディング
format  : d=整数、f=小数、b=2進数、o=8進数、x=16進数、X=16進数
suffix  : 後ろに付与する任意の文字列
例) 0x%08X  => 数値22 の場合、0x00000016 と表示されます。
```
2. min, max
入力可能な数値の最小値、最大値を指定します。
3. step
スピンボタンを押下した際の変化量を指定します。
