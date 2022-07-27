---
layout: post
title: "話題のFluxアーキテクチャをES5のAngularJSで書いてみた"
date: 2014-10-29 00:10:00 +0900
comments: true
tags:
  - AngularJs
  - Flux
  - SPA
---

先日、HTML5j エンタープライズ部のメンバーと最近気になっていた Flux アーキテクチャについて味見してみました。
巷の AngularJS のサンプルは ES6 で書かれたもの多いので、実務でも使える ES5 で書きなおしてみました。

- デモはこちら [Angular Flux ES5](http://mitsuruog.github.io/angular-flux-es5/)
- コードはこちら [mitsuruog/angular-flux-es5](https://github.com/mitsuruog/angular-flux-es5)

<!-- more -->

Flux の概要については[@albatrosary](https://twitter.com/albatrosary)さんのブログを参照してください。

[What’s Flux? - albatrosary's blog](http://albatrosary.hateblo.jp/entry/2014/10/22/131302)

## 雑感

フレームワークの書き方が一通りわかると、次はもっと効率的に書くにはどうするかとか考え出します。
Backbone の時もそうだったのですが、SPA でフロント側を作った場合、model の変更を複数ある view 側にどう伝えるのがいいか、悩んで手が止まります。
(Backbone の時はグローバルの Mediator を通して model の変更を通知してました。当時の残骸はこちら[mitsuruog/SPA-with-Backbone](https://github.com/mitsuruog/SPA-with-Backbone))

AngularJS の場合は`shared services`を使うか、`$rootScope.$broadcast`を使うことが王道かなと思います。
個人的には`shared services`の方が小さくて好みです。

[AngularJS - Angular JS で複数のコントローラ間でモデル（状態や値）を共有する方法 3 種類 - Qiita](http://qiita.com/sunny4381/items/aeae1e154346b5cf6009)

Flux アーキテクチャを使った場合は、Angular way にならないので、これはこれでありかなと思いました。
ただ、Observer の制御を間違えるとメッセージパッシングが無限ループしだして死にます。(参加メンバーはもれなく無限ループを体験していました w)

## まとめ

Angular の場合は、無理して Flux 使うより`shared services`の方がコードは読みやすくなると思います。
そろそろ SPA のアーキテクチャについても、かなり出尽くした感がしますね。
