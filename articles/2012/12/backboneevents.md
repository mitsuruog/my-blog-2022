---
layout: post
title: "Backbone.Eventsの機能テスト"
date: 2012-12-24 00:37:00 +0900
comments: true
tags:
  - backbone
  - jasmine
---

[Backbone.js Advent Calendar 2012](http://www.adventar.org/calendars/15)の 22 日目の記事です。

今見たら 22 日目の担当がいなかったので、慌てて書いています。ネタが無くなってきました（汗）。

本日は Backbone.Events について Jasmine で機能テストを書いたので公開します。
Jasmine 使った Backbone のテストの書き方について、参考になれば幸いです。

<!-- more -->

コードはこちらにあります。
（1 時間くらいで書きました。Jasmine だからできたと言っておきます ww）

[https://github.com/mitsuruog/Learning_JS/tree/master/backbone/functional_test](https://github.com/mitsuruog/Learning_JS/tree/master/backbone/functional_test)

一式ダウンロードして「SpecRunner ～」をブラウザで実行すると Jasmine のテストが実行されます。
ちなみに「0.9.2」とかは Backbone の Version です。
（0.9.9 のみ once をテストしてます。）

で、きっかけは
[@ahomu](http://twitter.com/ahomu "http://twitter.com/ahomu")さんの「[render と presenter の分離パターン](http://havelog.ayumusato.com/develop/javascript/e541-backbone_patterns_tips.html)」を読んで、いいなと思ったのですが、その前に Backbone.Events 自体あまり理解して無いと思ったので、自分の認識が合っているかテストをして確認してみた次第です。

テストしてみた結果、少し知っていると便利だなと思ったところを 2 つだけ紹介します。

1.  イベント名フラグ値のようなものを付けて、別のイベントのように発火できる。
2.  イベント名の間にスペースを入れて、複数のイベントを発火できる。

こちらが、コードのサンプルです。

```js
var obj = {};

//Mixin
_.extend(obj, Backbone.Events);

//on
obj.on("hello:me", callback);
obj.on("hello:you", callback);

//フラグのようなものを付けた呼び出し
obj.trigger("hello:me");
obj.trigger("hello:you");

//スペース区切りで複数呼び出し
obj.trigger("hello:me hello:you");
```

Backbone の 0.9.9 では Events 周辺でも機能の追加がありました。「once」以外については時間切れでテストできていません、時間があったらテスト追加しておきます。
