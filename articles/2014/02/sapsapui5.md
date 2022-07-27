---
layout: post
title: "業務系アプリケーションに特化したSAP社製「SAPUI5」を触ってみた"
date: 2014-02-19 05:13:00 +0900
comments: true
tags:
  - SAPUI5
  - OpenUI5
---

SAP 社では 2013 年 12 月に[SAP Mobile Platform \- Wikipedia](https://en.wikipedia.org/wiki/SAP_Mobile_Platform)を公開しており、本格的に HTML5 に力を入れてきました。  
今回はその流れの中で、SAP のモバイル戦略を下支えする HTML5 ベースの UI フレームワーク「SAPUI5」を少し触ってみます。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/Shopping_Cart.png)

## SAPUI5 とは

SAPUI5 とは「SAP UI Development Toolkit for HTML5」の略称で、業務系アプリケーションに特化した機能豊富な UI コンポーネントを含んだ UI フレームワークです。  
2013 年 12 月に SAPUI5 をオープンソース化した[OpenUI5](https://openui5.org/)が発表されています。

特徴は、Publickey さんの方で語られていますので、こちらを参照してください。

[SAP、業務アプリ用の JavaScript 製 UI ライブラリ「OpenUI5」を公開。レスポンシブ対応でモバイルデバイスにも － Publickey](https://www.publickey1.jp/blog/13/sapjavascriptuiopenui5.html)

## SAPUI5 と OpenUI5 の違い

では、SAPUI5 と OpenUI5 の何が違うのかと言ったところですが、簡単に両者の違いを話ます。

SAPUI5 はもともと「SAP NetWeaver Gateway」の UI アドオンの 1 つとして提供されていました。基本的には「SAP NetWeaver Gateway」を購入したユーザーでないと使えませんでした。

「OpenUI5」は SAPUI5 をオープンソース化したもので、開発者からすると嬉しい限りですが、利用する際はいくつか注意点があります。（今のところ）

### 1. SAPUI5 とはリリースサイクルが異なる

> (2014/02/20 追記) 2014/02/20 に OpenUI5 も最新版の 1.18.8 にアップデートされました。とはいえ使う時はバージョンちょっと注意してくださいね。（ブログ見てくれたのかな w）

OpenUI5 の中身は基本的に SAPUI5 と同じものですが、SAPUI5 より若干古いバージョンが提供されているようです。それに伴っていくつかの UI コンポーネントが使えません。

2014/2/17 現在で以下のようになっています。

- OpenUI5
  - 1.16.7
- SAPUI5
  - 1.18.6

これに伴い、開発者用のドキュメントも分かれています。ご注意ください。

- SAPUI5 SDK - Demo Kit
  [https://sapui5.hana.ondemand.com/sdk/#content/Overview.html](https://sapui5.hana.ondemand.com/sdk/#content/Overview.html)
- OpenUI5 SDK - Demo Kit
  [https://openui5.hana.ondemand.com/#content/Overview.html](https://openui5.hana.ondemand.com/#content/Overview.html)

### 2. Theme Designer がない

それから SAPUI5 では「Theme Designer」という GUI でデザインを変更できるツールがあるのですが、OpenUI5 には（いまのところ）付属してないようです。

OpenUI5 のダウンロードしたファイルの中を見ると、less を書き換えるとテーマの変更ができると思いますが、かなり Hackey です。

### 3. Experimental features を実戦投入しない(2014/02/20 追記)

API の中には、`Experimental features`（実験的機能）が含まれています。予告なく変更・削除される恐れがありますので、実戦投入しないようにしてくださいね。

ドキュメントを見ると「`Experimental features`」って書いてあります。

## 実際に試してみる

実は、SAP にて SAPUI5 の CDN が提供されており、お試し程度であればこれで十分です。  
こちらの URL にていつでも最新バージョンのライブラリを利用することができます。

[https://sapui5.hana.ondemand.com/resources/sap-ui-core.js](https://sapui5.hana.ondemand.com/resources/sap-ui-core.js)

では、実際に SAPUI5 を試してみましょう。  
SAPUI5 ではデスクトップ用途の「`sap.ui.commons`」とモバイル用途の「`sap.m`」の 2 系統の UI コンポーネントが提供されています。今回はモバイル用の UI コンポーネントを使用します。

HTML ファイルを準備して以下のように記述してください。（ライブラリは 2014/2/17 現在の最新版 1.18.6 を使っています。）

コードはこちらです。

```js
//3.0.3以降
$myModal = $('#myModal').modal({}, {
  person: 'mitsuruog'
});

$myModal.on('show.bs.modal', function(e) {
  var name = e.relatedTarget.person;
}
```

実際に動くアプリケーションはこちらです。

[Hello SAPUI5](https://jsbin.com/gur)

## まとめ

SAP 社では 2013 年 12 月に[SAP Mobile Platform \- Wikipedia](https://en.wikipedia.org/wiki/SAP_Mobile_Platform)を公開しており、本格的に HTML5 に力を入れてきました。

Platform 3.0 では「Sybase Unwired Platform」をはじめ、「SAP NetWeaver Gateway」、GUI で画面開発ができる「App Builder」などいくつかのモバイル向けソリューションの統合が行われています。  
HTML5 ベースの UI フレームワーク「SAPUI5」は、そのような SAP のモバイル戦略を下支えするものです。

SAPUI5 を使うことで、他の Web サービスとのマッシュアップ開発など柔軟に行えるようになり、まったく新しい SAP ユーザ体験を提供できる可能性を秘めているのではないかと思います。
