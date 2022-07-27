---
layout: post
title: "JSPでUnderscore.jsの.template()を使いながら、クライアントサイドテンプレートとJSPの融合について思いを馳せる"
date: 2013-04-26 23:07:00 +0900
comments: true
tags:
  - JSP
  - Underscore
---

最近、業務系の Web システムでも Ajax での非同期通信が当たり前となってきました。
その際に困るのが DOM をどう書き出すかと言ったところで、昔は javascript から直で DOM を書き出すことを平気でやっていたのですが、そんなことをするとメンテナンスしにくいコードが量産されていくわけで、そろそろクライアントサイドテンプレート導入について真剣に考えないとと思う今日この頃です。

<!-- more -->

### このエントリでお伝えしたいこと。

1.  JSP で underscore.js のテンプレートを使う方法
2.  JSP でクライアントサイドテンプレートを書き出すメリット

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/underscore.png)

まず、手軽にクライアントサイドテンプレートを導入するのであれば、[jQueryTmplate](https://github.com/jquery/jquery-tmpl)か[Underscore.js](http://underscorejs.org/)を使うのが良いと思います。
特に、Underscore.js は Java でいう apache commons のような、かゆいところに手が届く系の Utility 関数の詰め合わせなので、template 以外でも使いどころがありオススメです。

## JSP で underscore.js のテンプレートを使う際に少しハマッたこと

まず、JSP で underscore.js のテンプレートを使う際に少しハマッたので、その話をします。

underscore.js の template()のデリミタ（区切り文字）はデフォルトで`「<%」「%>」`となっています。
これは、JSP のスクリプトレットと同じなので、そのまま使った場合、JSP プリコンパイル時に落ちます。
（まぁ、当たり前と言えばそうです。）

幸い、underscore.js にはデリミタをカスタマイズできる I/F を持っているので、別のデリミタに置きかえましょう。
サンプルコードは次の通りです。

JSP 側のコード

```
<script type="text/template" id="tmpl_hoge">
<li>
  {{hoge}}
</li>
</script>
```

javascript 側のコード

```js
/**
 * _.templateSettingsにてテンプレートの区切り文字を変更してます。
 * デフォルトは<%%>なので、Mustache.jsのような{{}}に変えてます。
 */
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
};

var tmpl = _.template($("#tmpl_hoge").html());

$("ul.some").append(tmpl({ hoge: "Hello" }));
```

なにはともあれ、これで無事に JSP にて書き出したクライアントサイドのテンプレートを Underscore.js の.template()で使用することができました。

## JSP でテンプレートを出力することのメリットについての雑感

で、ここから本題です。
ちなみに最近の業務では、JSP でクライアントサイドのテンプレートの書き出しを行ってます。
実際に使ってみていろいろメリットがあると感じて、現状の Java の Web 開発における現実解だと思っています。
そのあたりのメリットについてつらつら書き出してみます。

### サーバ側の実装担当者との分業がしやすい

クライアントサイドテンプレートを JSP にするメリットは、なんといってもサーバ側実装者との分業促進です。
私の場合、テンプレートだけ外部 JSP にして、`<c:import>`でサーバ側でインクルードしています。
これでリポジトリにコミットする際の不要なコンクリフトが減りました。

### 管理がしやすい

JSP 一本なので･･･あちこちに点在するよりはいいです。

### 仕組みが簡単

サーバ側でインクルードするので、Java エンジニアにとって分かりやすいこと極まりない。

### 上を説得しやすい

「クライアントサイド～」とか言い出すと話がややこしくなるので、とにかく JSP というオブラートに包んでしまいましょう。

### サーバー側で動的にクライアントサイドのテンプレートを作成することが可能

はっきり言ってリーサルウエポンです。
Taglib とか EL 式とか自由に使えますので、JSP にカスタム Taglib を 1 つ書いて、後はすべて Java でテンプレートを構築するなんていう荒業も可能です。

私は、サーバ側で保持しているマスタ情報の書き出しなどに限定して使用してます。
良く使うのはコードマスタ系のプルダウン作成などです。

```
<%--
 Taglibも使うことで結構なんでもできるww
 でも、ロジックが分散するのでご利用は計画的に
--%>
<script type="text/template" id="tmpl_hoge">
{{hoge}}
<html:select property="hogeKbn"/>
  <html:options colection="hogeKbnList" property="kbn" labelProperty="kbnName" />
</html:select>
</script>
```

## まとめ

という訳でだらだら書いてしまいましたが、JSP とクライアントサイドテンプレートをうまく融合するために大事なことは 2 つです。

1.  テンプレート側のデリミタが、JSP のスクリプトレットや EL 式とバッティングしないようにすること。
2.  テンプレートを外部 JSP とし、サーバ側実装者との分業を促すこと。
