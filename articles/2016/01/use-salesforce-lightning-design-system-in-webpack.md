---
layout: post
title: "webpackでSalesforce Lightning Design Systemを使う"
date: 2016-01-03 00:00:21 +0900
comments: true
tags:
  - webpack
  - Salesforce Lightning Design System
  - Salesforce
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/webpack-slds.png
---

一手間必要だったのでメモ。  
長いので Salesforce Lightning Design System(以下、SLDS)とします。

<!-- more -->

## 元ネタ

こちらの内容とほぼ一緒です。

Webpack config example · Issue #127 · salesforce-ux/design-system  
https://github.com/salesforce-ux/design-system/issues/127

## 手順

webpack をあまり触り慣れてない人向けのメモ。

### SLDS を npm install する

```
npm install --save @salesforce-ux/design-system
```

### index.scss の追加

SLDS は sass で作られているので、`index.scss`で SLDS の本体を`@import`するようにします。  
これを webpack で処理して、`style.css`として出力していきます。

```scss
@import "~@salesforce-ux/design-system/scss/index.scss";
```

### webpack.config.js の設定

webpack で css を扱うためにいくつか loader が必要です。まだの場合はインストールしておいてください。

```sh
# 各種ローダー
npm install --save-dev file-loader style-loader css-loader sass-loader
# 途中sassをコンパイルするために
npm install --save-dev node-sass
# webpackで処理したcssをファイル出力するために
npm install --save-dev extract-text-webpack-plugin
```

`webpack.config.js`にて`scss`を処理するようにします。

```js
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: "./entry.js",
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          "style-loader",
          "css-loader!sass-loader"
        ),
      },
    ],
  },
  plugins: [new ExtractTextPlugin("style.css")],
};
```

これで、SLDS が`style.css`に含まれるようになります。

### アプリケーションへの組み込み

アプリケーションへの組み込みは webpack のエントリポイント(この例だと`entry.js`)で、`index.scss`を呼び出すと OK です。

```js
// entry.js
require("./index.scss");
console.log("Hello Salesforce Lightning Design System!!");
```

最後に`index.html`で webpack で出力された`style.css`を利用すれば OK。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <script src="./bundle.js"></script>
  </body>
</html>
```

### font ファイルのロード(追記:2015/01/03)

上の方法では SLDS の font が正しくロードできず、font ファイルのリクエストがすべて 404 エラーになっていました。

まず、`webpack.config.js`の`module.loaders`に file-loader を追加して、font ファイルをコピーするようにします。

```js
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: "./entry.js",
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          "style-loader",
          "css-loader!sass-loader"
        ),
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: "file-loader?&name=/assets/fonts/[name].[ext]",
      },
    ],
  },
  plugins: [new ExtractTextPlugin("style.css")],
};
```

これで、`/assets/font`以下に font ファイルがコピーされるようになりましたが、  
SLDS 内部の font 指定が絶対パス指定されているため、このままでは font が webpack で処理されません。

`index.scss`にて SLDS 内部の Sass 変数を書き換えて、webpack で処理できるようにします。

```scss
// SLDS内部で使われているfontのpath設定
$static-font-path: "~@salesforce-ux/design-system/assets/fonts/webfonts";

@import "~@salesforce-ux/design-system/scss/index.scss";
```

font の絶対パスの件は本家に似たような Issue がありますので、Sass 変数の置き換え作法は、今後のためにも知っておいた方がよろしいかと思います。

Compiling index-ltng.scss results in CSS that does not load salesforce fonts · Issue #71 · salesforce-ux/design-system https://github.com/salesforce-ux/design-system/issues/71

これで font も読み込むことができました。  
めでたし、めでたし。

## まとめ

あくまで最小構成です。  
React.js を触っていると webpack を使うことが多いのですが、ちょっとしたサンプルであれば`bower`か`CDN`の方が楽ですね。
