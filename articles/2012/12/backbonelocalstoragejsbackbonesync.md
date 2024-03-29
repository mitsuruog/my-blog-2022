---
layout: post
title: "backbone.localstorage.jsとBackbone.Syncのお話"
date: 2012-12-02 21:44:00 +0900
comments: true
tags:
  - backbone
  - localstorage
  - Jasmine
---

このエントリは[Backbone.js Advent Calendar 2012](http://www.adventar.org/calendars/15)の 2 日目の記事です。

Backbone.js には[Backbone.Sync](http://goo.gl/xIbI9)という Model とサーバ側のリソースを常に同期させる仕組みがあり、これを Override することで同期させる仕組みを自体を柔軟に変えることができます。  
今回は[backbone.localstorage.js](http://goo.gl/qBk6P)のユニットテストを通じて、Backbone.Sync を Override する仕組みについて少しお話したいと思います。

<!-- more -->

### このエントリでお伝えしたいこと。

1.  backbone.localstorage.js はどのように Backbone.Sync と Override しているか。
2.  backbone.localstorage.js は Backbone.Sync を Override するコードの良いお手本だと思う。。

## はじめに

まず、きっかけですが、backbone.localstorage.js を使って localstorage に Backbone.Model を保存する簡単なサンプルを作ってユニットテストしたところ、思わぬところで fail してしまったことです。  
Backbone.js 側のコードとユニットテストのコードは次のとおりです。
（ちなみにユニットテストは[Jasmine](http://goo.gl/IUtf)を使ってます。）

app.js

```js
var model = Backbone.Model.extend({
  title: "",
});

var collection = Backbone.Collection.extend({
  model: model,
  localStorage: new Backbone.LocalStorage("backbone-blog-post"),
});
```

test.model.before.js

```js
describe("test localstorage", function () {
  beforeEach(function () {
    this.model = new model();
  });

  it("test model save()", function () {
    //Error: A "url" property or function must be specified
    this.model.save({
      title: "hello",
    });
    expect(this.model.collection.localStorage.find(this.model)).not.toBe(null);
    expect(this.model.collection.localStorage.find(this.model).title).toBe(
      "hello"
    );
  });
});
```

ユニットテストを実行した結果は、次のようなエラーが発生しました。

> Error: A "Url" property or function must be specified

初めは localstorage に保存しているのに、なぜ URL が必要なのかわかりませんでした。

## localstorage に保存するはずなのになぜ URL が必要??

その前に、Backbone.Model の`save()`と`Backbone.Sync`の関係、`Backbone.Sync`のデフォルトの挙動について抑えておく必要があります。

まず、Backbone.Model の`save()`と Backbone.Sync の関係についてですが、Backbone.Model の`save()`を呼び出した際に、内部で`sync`イベントが発生して、Backbone.Sync に定義されている function が実行されるようになっています。  
その際に、Backbone.Sync はデフォルトでサーバサイド側の REST API
(GET/PUT/POST/DELETE)と Ajax（jQuery か Zepto 依存）で通信をするようになっています。

これらの事により、先のエラーは Ajax 通信をしているため発生していることが容易に予想できるのですが、そもそも backbone.localstorage.js は Backbone.Sync を Override しているので、なぜ Ajax のコードが生きているのか分かりませんでした。

## なぜ Ajax が動いているのか?

この問題を理解するために backbone.localstorage.js のソースを読みました。  
（以下、核心部分だけ抜粋します。）

```js
// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function (method, model, options, error) {
  return Backbone.getSyncMethod(model).apply(this, [
    method,
    model,
    options,
    error,
  ]);
};
```

上は backbone.localstorage.js の`134行目`辺り。
Backbone.Sync を Override しているところです。中で`Backbone.getSyncMethod()`を return しています。
自分でカスタムする場合は、ここに直接 Override するコードを書いても良さそうです。

```js
Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function (model) {
  if (
    model.localStorage ||
    (model.collection && model.collection.localStorage)
  ) {
    return Backbone.LocalStorage.sync;
  }

  return Backbone.ajaxSync;
};
```

上は backbone.localstorage.js の`123行目`辺り。本問題の核心部分です。  
読めば一目瞭然なのですが、デフォルトの Backbone.Sync を`Backbone.ajaxSync`という別名で保存してました。

しかも、`Backbone.getSyncMethod`では

- model.localStorage
- model.collection.localStorage

いずれかのプロパティが存在しない場合、Backbone.ajaxSync が return されます。

これですべての謎が解けました。

## 最初のテストコードはどうあるべきだったのか?

先に結論ですが、次のコードでテストが通りました。

```js
describe("test localstorage", function () {
  beforeEach(function () {
    this.model = new model();
    //collectionをmodelにセットする
    this.collection = new collection();
    this.model.collection = this.collection;
  });

  it("test model save()", function () {
    this.model.save({
      title: "hello",
    });
    expect(this.model.collection.localStorage.find(this.model)).not.toBe(null);
    expect(this.model.collection.localStorage.find(this.model).title).toBe(
      "hello"
    );
  });
});
```

ただ、なんとなく違和感が残ります。

Model だけをテストする目的であればこれも有りだと思いますが、テストを通すためにコードを足したようでなんとなく気持ち悪いですし、何か使い方が間違っている気がします。  
（[次回](/2012/12/backbonemodelbackbonecollection/)はこの違和感を取り除いて行く過程を書きます。）

ちなみに、backbone.localstorage.js はコードが 140 行足らずなので読むのは非常に楽でした。
実際に Backbone.Sync を Override するコードを書く場合は、ぜひ参考にしたいと考えています。

**Backbone.js Advent Calendar 2012**

- ← 前日　[Backbone.js で今つくっている構成について](http://goo.gl/s9JLG)
- → 後日　[Backbone.js が自動でやってくれるところについて](http://goo.gl/WxdVo)
