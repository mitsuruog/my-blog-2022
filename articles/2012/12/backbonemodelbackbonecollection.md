---
layout: post
title: "Backbone.Modelから見るBackbone.Collectionとの関連性"
date: 2012-12-05 22:57:00 +0900
comments: true
tags:
  - backbone
  - localstorage
  - Jasmine
---

このエントリは[Backbone.js Advent Calendar 2012](http://www.adventar.org/calendars/15)の 5 日目の記事です。

[前回](2012/12/backbonelocalstoragejsbackbonesync)の Backbone.Sync と backbone.localstorage.js の話の続きで、Backbone.Model から見る Backbone.Collection との関連性についてお話します。

<!-- more -->

### このエントリでお伝えしたいこと。

1.  何をすると Backbone.Model と Backbone.Collection の結びつくか。

## はじめに

前回のテストコードですが、[Backbone.localstorage.js 本家](http://goo.gl/v1gFX)のテストコードを見たところ、どうやら Backbone.Collection の create()を使うのが正しい使い方ようなので、次のように書き直しました。  
（ちなみにユニットテストは[Jasmine](http://goo.gl/IUtf)を使ってます。）

```js
describe("test localstorage", function () {
  beforeEach(function () {
    this.collection = new collection();
  });

  it("test collection create", function () {
    this.collection.create({
      title: "hello",
    });

    var model = this.collection.at(0);
    expect(this.collection.localStorage.find(model)).not.toBe(null);
    expect(this.collection.localStorage.find(model).title).toBe("hello");
  });
});
```

なんだ Collection の create()を使えば良いのか。一件落着！  
と思いたいのですが。。。

確か、model.localStorage か model.collection.localStorage が存在しない場合、デフォルトの Ajax が動くのは前回確認済みです。上のテストコードのどこを見てもそのようなことはしていませんね。
なにやら黒魔術的な臭いがします。

## Backbone.Model と Collection の近しい関係

黒魔術的な臭いがする場合は、ソースコードを読むのが一番です。まず、Collection の`create()`を読みました。

```js
// Create a new instance of a model in this collection. Add the model to the
// collection immediately, unless `wait: true` is passed, in which case we
// wait for the server to agree.
create: function(model, options) {
  var coll = this;
  options = options ? _.clone(options) : {};
  model = this._prepareModel(model, options);
  if (!model) return false;
  if (!options.wait) coll.add(model, options);
  var success = options.success;
  options.success = function(nextModel, resp, xhr) {
    if (options.wait) coll.add(nextModel, options);
    if (success) {
      success(nextModel, resp);
    } else {
      nextModel.trigger('sync', model, resp, options);
    }
  };
  model.save(null, options);
  return model;
},
```

上は Backbone.js の 766 行目辺り。ざっと目を通してすぐ分かりました。

```js
model = this._prepareModel(model, options);
```

怪しすぎる ww。  
なので、`_prepareModel()`を読みました。

```js
// Prepare a model or hash of attributes to be added to this collection.
_prepareModel: function(model, options) {
  options || (options = {});
  if (!(model instanceof Model)) {
    var attrs = model;
    options.collection = this;
    model = new this.model(attrs, options);
    if (!model._validate(model.attributes, options)) model = false;
  } else if (!model.collection) {
    model.collection = this;
  }
  return model;
},
```

上は Backbone.js の 809 行目辺り。ありました。見たかったのはこれです。

```js
model.collection = this;
```

なるほど、こんなところで Model に Collection がセットされていましたね。
これで、上のテストコードがパスできる理由も分かりました。これですっきりです。

他にも Collection の中で`_prepareModel()`呼んでいる場所を調べたところ、`create()`も含めて 4 箇所ありました。

- [add](http://backbonejs.org/#Collection-add)
- [push](http://backbonejs.org/#Collection-push)
- [unshift](http://backbonejs.org/#Collection-unshift)
- [create](http://backbonejs.org/#Collection-create)

まだ Backbone の全体を見通せてないので、作ってて所々（？）となることがあります。ソースコード印刷して電車で読むことにしました。

**Backbone.js Advent Calendar 2012**

- ← 前日　[Backbone.js の MVC について](http://goo.gl/J28KM)（@tomof）
- → 後日　[Backbone.js 日本語リファレンス](http://ando19721226.github.com/Backbone/)[](http://www.blogger.com/blogger.g?blogID=5596737312884238083)（@ando）
