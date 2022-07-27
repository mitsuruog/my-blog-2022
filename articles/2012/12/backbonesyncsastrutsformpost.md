---
layout: post
title: "Backbone.SyncでSAStrutsにFormをPOSTする方法"
date: 2012-12-07 23:13:00 +0900
comments: true
tags:
  - backbone
  - SAStruts
  - Seaser2
---

[Backbone.js Advent Calendar 2012](http://www.adventar.org/calendars/15)と[青森アドベントカレンダー](http://aomori-web-advent-calendar-2012.blogspot.jp/2012/12/aomori-web-adevent-calendar-2012.html)17 日目の記事です。青森ネタは最後のほうに気持ち程度あります。
SAStruts+Seaser2 構成のバックエンドに対して、Backbone.Sync から Form を POST して ActionForm で受け取る方法です。  
（青森とは関係ありませんのであしからず。。。）

<!-- more -->

### このエントリでお伝えしたいこと。

1.  Backbone.Sync の POST は emulateJSON を知らないとちょっとハマる。
2.  SAStruts は JSP 切り離しても、Good なフレームワークだ。
3.  そろそろ SAStruts の中の人とお友達になりたい。
4.  青森はいいところだ。

## はじめに

きっかけは仕事で久しぶりに SAStruts を使うことになったことです。

現在、新しいプロジェクトのアプリケーションアーキテクトっぽいことをやっているます。  
それなりに画面数があり、タブが多く複雑な画面が結構あったので、JSP 使った場合の世紀末的な光景を思い浮かべ、思い切ってサーバ側のロジックを WebAPI 化して、Backbone と組み合わせてみようかと考えています。  
さらに、SAStruts の恩恵を最大限享受したいので、いろいろ試行錯誤しながら現在プロトタイプを作っています。

## SAStruts -> Backbone.Sync GET の場合

Backbone の Collection や Model にて fatch を呼び出すと、Backbone.Sync がサーバに対して GET で URL リソースを取得します。この部分は比較的簡単で、以下のように SAStruts の Action 側の実装を少し変えるのみで JSON でレスポンスを返すことができます。
（ちなみに、JSON のライブラリは[jsonic](http://jsonic.sourceforge.jp/)を使用しています。）

サーバ側(IndexAction.get.java)

```java
public class IndexAction {

  @Execute(validator = false)
  public String index() {

    List<Model> models = new LinkedList<Model>();
    models.add(new Model("aomori", "good place"));

    //JSONでレスポンスを返す
    ResponseUtil.write(JSON.encode(models), "application/json");
    return null;
  }
}
```

フロント側(Backbone.Sync.get.js)

```js
PROTO.Views.view = Backbone.View.extend({
  //中略

  read: function () {
    this.collection.fetch({
      success: this.render,
    });
  },

  //中略
});
```

## Backbone.Sync -> SAStruts POST の場合

今度は Backbone から Form の内容を POST でサーバ側へ送信する場合ですが、これは一筋縄ではいきませんでした。

結論から言うと、SAStruts 側で Backbone.Sync の Form 内容を POST で受け取るためには、Ajax リクエストをあたかも Form を Submit したリクエストかのように偽装する必要があります。

そう、**backbone.emulateJSON = true**の出番です。（本当に[このパート](https://github.com/enja-oss/Backbone/blob/master/docs/Sync.md)翻訳しといて良かったな w。）

これで Content-Type を「`application/x-www-form-urlencoded`」にすることは出来たのですが、リクエストパラメータは Ajax.options の data 属性で渡さないと受け取れません。結果、次のようなコードとなります。

フロント側(Backbone.Sync.post.js)

```js
PROTO.Views.view = Backbone.View.extend({
  //中略

  create: function () {
    var param = {};
    _.each($("form").serializeArray(), function (v) {
      param[v.name] = v.value;
    });

    //Content-Typeを偽装
    Backbone.emulateJSON = true;
    var model = new PROTO.Models.model(param);
    //リクエストパラメータはAjaxのdata属性で渡す
    this.collection.create(model, { data: param, success: this.render });
  },

  //中略
});
```

サーバ側(IndexAction.post.java)

```java
public class IndexAction {

  //TODO ActionForm
  //ActionFormでリクエストパラメータを受け渡し
  @Required
  public String name;
  @Required
  public String age;

  //TODO エラーの戻りをJSON化
  @Execute(validator = true, input="index.html")
  public String index() {

    List<Model> models = new LinkedList<Model>();
    models.add(new Model(name, age));

    ResponseUtil.write(JSON.encode(models), "application/json");
    return null;
  }
}
```

これで、サーバ側で Backbone.Sync の POST 値を受け取ることができました。

さらに、ActionForm も受け取れるだけではなく、アノテーションによる validation も効きます。ここでエラーが JSON で帰ってくると理想的なのですが、今日時点ではそこまで作れてません。
作っている最中のコードはこちらです。気力が続けば少しずつブラッシュしてくかも。

[https://github.com/mitsuruog/SAStruts-Backbone](https://github.com/mitsuruog/SAStruts-Backbone)

ちなみに本題とは別件なんですが、同じ仕事で Bootstrap のカスタムもやっていて、なかなか Less も面白いなと思っています。世の中には Bootstrap のテーマを公開している人も多いので、青森ゆかりのデザイナーさん、青森っぽいテーマ一緒に作ってみませんか？  
（と、無理やり青森アドベントカレンダーネタにしてみた w。）

**Backbone.js Advent Calendar 2012**

- ← 前日　[Node.js + WebSocket + Backbone.js のすすめ](http://takesy.cocolog-nifty.com/atico/2012/12/nodejs-websocke.html)[](http://www.blogger.com/)（@takeshy）
- → 後日　[おさわり。backbone の ajax 周りの処理とか。](http://1000ch.net/2012/12/18/AjaxOfBackbone/)（@1000ch）

**Aomori Advent Calendar 2012**

- ← 前日　[茄子的　今年一番ヒットしたツールは・・・](http://nasunoblog.blogspot.jp/2012/12/blog-post.html)（@nasunotw）
- → 後日　[なぜ Facebook は僕の中で今年一番ヒットしたのか？](http://aomori-web-advent-calendar-2012.blogspot.jp/2012/12/facebook.html)（@kzki）
