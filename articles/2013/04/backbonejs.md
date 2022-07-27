---
layout: post
title: "Backbone.jsともっと仲良くなるためのヒント"
date: 2013-04-09 17:44:40 +0900
comments: true
tags:
  - backbone
  - SPA
  - チュートリアル
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/backbone.jpg
---

先日めでたく 1.0.0 をリリースした Backbone.js ですが、よくも悪くも「どう作るか」について、作成者側の思いで自由にできるため、始めの取っ掛かりとして、どう作ればよいかと言うことで結構悩む方も多いかと思います。

そこで、同じように悩んでいる人になんらかのヒントを与えられればと思い、シングルページアプリケーションを題材にチュートリアルを作成して公開してみました。
また、私が Backbone.js でアプリケーションを作成する上で、特に View について注意するポイントを幾つか紹介します。

<!-- more -->

何かの参考になれば幸いです。

### このエントリでお伝えしたいこと。

1.  Backbone.js のチュートリアル作りました。
2.  Backbone.View を扱う際に注意するポイントについていくつか紹介します。

## チュートリアル

早速ですが、Backbone.js でシングルページアプリケーションを作成するチュートリアルの紹介です。

このチュートリアルでは、よくある Tweet 検索アプリケーションを作成しています。

[https://github.com/mitsuruog/SPA-with-Backbone](https://github.com/mitsuruog/SPA-with-Backbone)

次からは、View について注意するポイントを幾つか紹介します。

## 1. 異なる View 間の連携はイベントベースで行う

Backbone.js でアプリケーションを作成する場合、いつくか View を分ける場合が多いのですが、次のようにトップレベルの View にて、他の View のイベントをハンドリングして処理を振り分けるコントローラ的なロジックを実装している例を時々に見かけます。

アプリケーション自体が比較的大きくない場合は、この実装方法でも大丈夫だと思います。
しかし、規模が大きくなり関係する View が増えた場合、コントローラのロジックが肥大化して View のサイズが大きくなる要因となりますので、私はあまりおススメしません。

```js
initialize: function () {

  //他のViewのイベントをハンドリングしてレンダリングする
  this.someView.on('chage:some', this.render);

},

render: function(){

  //他のViewへレンダリング指示
  this.anotherView.render();

}
```

Backbone.js には`Backbone.Events`というカスタムイベントをバインドしたり、発火させたりできる強力な仕組みが備わっていますので、これを使いましょう。
実装する際は、`Backbone.Events`を`_.extend()`して使います。

```js
//Backbone.Eventsのクローン
_.extend(mediator, Backbone.Events);

//イベントの発火
mediator.trigger("change:some", param);

//イベントのハンドリング
mediator.on("change:some", this.behavior);
```

このように View 間の連携をイベントベースで行うことの忘れてはならないメリットは、View 間の不要な依存関係を排除することで、各 View にてイベントを起点にユニットテストを行うことが出来ることです。

## 2. レンダリングはデータの変更を先に行う

レンダリングに際しては、順序に一貫性を持って行います。

> ユーザの操作 →Collection や Model の変更 →View のレンダリング

チュートリアルの検索ボタンクリックから検索履歴表示部分を例としてお話すると、次のような流れになります。

1.  検索ボタンをクリックする。
2.  検索キーワードを Collection に追加（データの変更）
3.  検索履歴 View をレンダリング

```js
initialize: function () {

  //他のViewからのModel追加依頼
  mediator.on('add', this.addSome);

  //Collectionのaddイベントをハンドリングしてレンダリング処理を呼び出す
  this.listenTo(this.collections, 'add', this.render);

},

addSome: function (some) {
  //CollectionにModelを1件追加する
  //追加した場合、addイベントが発火する
},

render: function () {
  //レンダリング処理
},
```

このように、ユーザの操作からレンダリングする間にデータの変更を挟むことによって、やってしまいがちな、ユーザの操作とレンダリングが 1 つになった、テストしにくいスパゲッティ function の作成を抑止できます。

## 3. その他、細々したこと

その他、知っておいたほうがいいポイントを紹介します。

### 3-1. Collection や Model のイベント監視には.listenTo()を使う

View が管理する Collection や Model のイベントハンドリングには従来`.on()`を使用してきましたが、0.9.9 以降は`.listenTo()`を使います。

```js
//.on()を使ったバージョン
this.collections.on("reset", this.render);

//.listenTo()を使ったバージョン
this.listenTo(this.collections, "reset", this.render);
```

これは、`.on()`でバインドしたイベントが（Model などを）`.remove()`した際に、アンバインドされずメモリリークを起こしてしまうためです。

### 3-2. initialize で\_.bindAll(this)を使う

1.のようにイベントベースで実装を進めた場合、結構ストレスに感じるのが javascript 特有の`this`の問題です。View の`initialize()`で`_.bindAll(this)`することで、View の中の this がすべて View 自身を指し示すようになるので、実装が楽になります。

```js
initialize: function () {

  bindAll(this);

  //なにかの処理

},
```

## 最後に

私が考える Backbone.js でのアプリケーション方について一通り説明しました。

最近のフロント系勉強会の動向を見ていても、Backbone.js はかなり注目されているクライアント MVC フレームワークの 1 つだと感じています。
また、先日 Backbone.js の 1.0.0 リリースしたこともあり、これから 2 ～ 3 年でネットサービス系を中心に普及期に入ると思います。  
これから始める方にとって、このエントリの内容が有意義なものであることを願っています。

**（余談）**  
このチュートリアルは、SI の中規模の開発案件にて Backbone.js を採用しよう夢見ていた時期があり（諸事情にて断念・・・orz）、大勢のエンジニアで Backbone.js を使った場合、どのようにガイドを作成したら均一に作れるか思索したものの残骸です。
