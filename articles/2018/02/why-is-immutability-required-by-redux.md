---
layout: post
title: "Reduxユーザーが最もハマるstateの不正変更とその検出方法"
date: 2018-02-26 0:00:00 +900
comments: true
tags:
  - react
  - redux
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-logo.png
---

今日は Redux ユーザーが最もハマるポイントだと個人的に思っている、state の不正変更とその検出方法について紹介します。
ちなみに React での話ですが、他のフレームワークでも同じ事なんではと、勝手に想像しています。

## Redux の state 変更検知の仕組み

まず最初に Redux の state 変更検知の仕組みについておさらいします。概要だけ紹介するため、詳細は公式ドキュメントも合わせて参照してください。

- Immutable Data - Redux <https://redux.js.org/faq/immutable-data>

Redux の state の変更検知には「**shallow equality checking**」という仕組みを使っています。
shallow equality とは、あるネストしたオブジェクトがあった場合、**全ての値をチェックしているのではなく、このオブジェクトが格納されている参照(マシンメモリの番地)が正しいことをチェックする**ことです。そのため「reference equality」とも言われているようです。

Redux の state は内部的に state をいくつかの部分に分割した状態で保持していますが、1 つ 1 つは比較的大きい構造となる場合が想定されるため、このように参照のみをチェックすることでパフォーマンスを担保しています。

通常 Redux の state を変更する時は、state の変更を検知できるように変更することが望ましいのですが、残念ながら検知できない変更方法が存在します。
これを便宜上「**state の不正変更**」と呼ぶ事にします。

## state を不正変更できてしまうメカニズム

これは JavaScript の言語仕様に深く関係しています。

例えば`const`は再代入を許さない変数宣言ですが、再代入のチェックに**参照を利用している**ため、オブジェクト内部のプロパティは変更することが可能です。

```javascript
const state = { name: "foo" };

// これはエラーにならない
state.name = "bar"

// これは再代入に当たるためエラーになる
const state = { name: "foo" };
```

JavaScript の場合、オブジェクト内部の**プロパティを変更したとしても参照は同じものとなる**ため、参照を使ったチェックではオブジェクトの内部の変更を検知することはできません。

## Redux の state を不正変更するとどんな問題が起きるのか？

さて、state を不正変更するとどんな問題が起こるかというと、React 上で再描画(re-render)が発生しなくなります。

これは React が持つメカニズムのためで、Props の変更を検知して、これが利用されている React コンポーネントのツリーのみを効率良く再描画させるためです。
これが起こると state は変更されているが、**画面の表示内容がまったく変化しない**というかなり面倒な事が発生します。

よくある事例として、React の component 内にある`componentWillReceiveProps`が予期せず発火しなくなります。

```javascript
componentWillReceiveProps(nextProps) {
  if (nextProps !=== this.props) {
    // なにかの処理
  }
}
```

この状態を redux-dev-tool で見ると次のようになります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-01.png)

> state を変更しているはずだが、redux-dev-tool の diff には何も現れてこない。

これに起因する問題は見つけにくく、個人的には Redux ユーザーが Redux で最もハマりやすいポイントだと思います。

## state の不正変更に対する正しいアプローチ

公式に「Immutable Update Patterns」というドキュメントがあるので、これに習って state を変更します。(これくらい state の更新には細心の注意が必要です)

- Immutable Update Patterns · Redux <https://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html>

Immutable Update Patterns を見るとわかるのですが、かなり面倒です。
そのため通常は、なんからのユーティリティライブラリの力を借りている方も多いかと思います。

- kolodny/immutability-helper: mutate a copy of data without changing the original source
  <https://github.com/kolodny/immutability-helper>
- debitoor/dot-prop-immutable: Immutable version of dot-prop with some extensions
  <https://github.com/debitoor/dot-prop-immutable>

しかし、上で話した通り JavaScript の言語仕様もあり、うっかり事故が絶えません。
そのため個人的には、なんからの**検知の仕組みをプロジェクトに導入するのが上策**だと考えました。

## state の不正変更を検知する

Redux の middleware に state の不正変更を検知するものがあったので、これを使います。

- leoasis/redux-immutable-state-invariant: Redux middleware that detects mutations between and outside redux dispatches. For development use only.
  <https://github.com/leoasis/redux-immutable-state-invariant>

### redux-immutable-state-invariant を導入する

導入はドキュメントにある通り、redux を初期化している部分で middleware に設定します。
ドキュメントには`redux-thunk`を使った例しかないので、`redux-observable`を使ったものにしてみます。

```javascript
const { applyMiddleware, combineReducers, createStore } = require("redux");
const createEpicMiddleware = require("redux-observable");
const epics = require("./epics/index");
const reducers = require("./reducers/index");

// Be sure to ONLY add this middleware in development!
const middleware =
  process.env.NODE_ENV !== "production"
    ? [
        require("redux-immutable-state-invariant").default(),
        createEpicMiddleware(epics),
      ]
    : [createEpicMiddleware(epics)];

// Note passing middleware as the last argument to createStore requires redux@>=3.1.0
const store = createStore(reducers, applyMiddleware(...middleware));
```

middleware を導入した状態で、state を不正変更すると次のようなエラーが発生します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-02.png)

**警告ではなくエラー**なので注意が必要です。既に state を不正変更コードがある場合、最悪アプリケーションが動作しなくなります。

> これくらい清々しくクラッシュしてくれた方が、修正のモチベーションになっていいと思います。

これでうっかり state を不正変更した場合でも検知することができます。

## まとめ

今日は Redux ユーザーが最もハマるポイントだと個人的に思っている、state の不正変更とその検出方法について紹介でした。

人は間違い起こすものなので、このような検知の仕組みを導入すると安心ですね。
