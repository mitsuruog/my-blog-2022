---
layout: post
title: "Webpackでビルドしたbundleファイルのサイズを減らす"
date: 2018-03-09 0:00:00 +900
comments: true
tags:
  - webpack
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/bandle-logo.png
---

最近、割と耳にするようになってきた、Webpack の bundle.js のサイズを減らす話。自分でもやってみたので、結果を紹介します。

> 本当はもう少し減らせるかもねー

## はじめに

現在の使っているライブラリはこんな感じです。

- React
- Redux + redux-observable

ちなみに 2 つのアプリケーションがあるので、bundle は 2 つに分けてます。

最初の状態はこちらです。サードパーティのライブラリ(node_modules)のサイズが大きいことがわかります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/bundle1.png)

```txt
File sizes after gzip:

629.89 KB build/static/js/organization.js
595.88 KB build/static/js/applicant.js
49.28 KB build/static/css/organization.css
49.26 KB build/static/css/applicant.css
```

大きいのは、まず`highlight.js`ですね。

```txt
// ()の中はGzipしたサイズ
--------------------------------
highlight.js  750KB(190KB)
C3.js         677KB(93KB)
rx.js         686KB(32KB)
joi-browser   382KB(40KB)
```

## highlight.js のサイズを減らす

やりかたは前に書いた自分の記事を参考に。。。

- [highlight\.js を小さくバンドルする方法 \| I am mitsuruog](https://blog.mitsuruog.info/2017/12/how-bundle-size-makes-smaller)

結果:

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/bundle2.png)

```txt
File sizes after gzip:

456.75 KB build/static/js/organization.js
422.79 KB build/static/js/applicant.js
49.7 KB build/static/css/organization.css
49.69 KB build/static/css/applicant.css
```

`highlight.js`は「**750KB(90KB) => 90KB(17KB)**」になりました。

## RxJS のサイズを減らす

やりかたはこれを参考にしました。

- [RxJS を小さくバンドルする方法。import 文の書き方で容量が変わる \- Qiita](https://qiita.com/clockmaker/items/5e2207b14dac97c4ede1)

結果:

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/bundle3.png)

```txt
File sizes after gzip:

430.94 KB build/static/js/organization.js
397.02 KB build/static/js/applicant.js
49.7 KB build/static/css/organization.css
49.69 KB build/static/css/applicant.css
```

`RxJS`は「**686KB(32KB) => 164KB(9KB)**」になりました。

## lodash のサイズを減らす

`C3.js`と`joi-browser`はパッとみた感じ減らすのちょっと難しそうだと感じたので、`lodash`のサイズを減らしてみることにしました。

通常の`lodash`は ES6 のモジュール形式ではないので、ES6 モジュール形式でビルドされている[lodash-es](https://www.npmjs.com/package/lodash-es)の方を使います。

これまで import していた箇所をこのように変えていきます。

```diff
- import { isEqual } from "lodash";
+ import isEqual from "lodash-es/isEqual";
```

結果:

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/bundle4.png)

```txt
File sizes after gzip:

414.23 KB build/static/js/organization.js
380.24 KB build/static/js/applicant.js
49.69 KB build/static/css/organization.css
49.68 KB build/static/css/applicant.css
```

`lodash`は「**526KB(24KB) => 87KB(5KB)**」になりました。

## まとめ

だいたい 3 割くらい減らすことができました。

```txt
File sizes after gzip:

build/static/js/organization.js
  629.89 KB => 414.23 KB (65.7%)
build/static/js/applicant.js
  595.88 KB => 397.02 KB (66.6%)
```

Webpack 便利なのでついライブラリ追加してしまいがちですが、バンドルサイズが大きくなってないか常に気をつけたいですね。
バンドルサイズの測定は**webpack-bundle-analyzer**を使って行いました。

- [webpack-contrib/webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
