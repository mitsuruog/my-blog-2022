---
layout: post
title: "Angular2 Unit Testing - 準備編"
date: 2016-03-08 00:35:00 +900
comments: true
tags:
  - angular
  - angular2
  - karma
  - jasmine
  - unit test
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/angular2-testing-logo.png
---

Angular2 の実装の方法は記事をよく目にする機会が増えたので、テストについての自分が困らないように調べてみたシリーズ。

今回は準備編。

<!-- more -->

> （注意）Angular 2.0.0-beta.9 をベースに話しています。
> E2E テストは protractor がそのまま利用できると思うので、ここでのテストはユニットテストの話です。

## Angular2 Unit Testing

1. [準備](/2016/03/how-to-test-angular2-application-1.html)
1. [基本](/2016/03/how-to-test-angular2-application-basic.html)
1. Mock, Spy の基本(TBD)
1. [DOM のテスト](/2016/03/how-to-test-angular2-application-dom.html)
1. [XHR のテスト](/2016/03/how-to-test-angular2-application-xhr.html)
1. Component のテスト(TBD)
1. Service のテスト(TBD)
1. [Pipe のテスト](/2016/03/how-to-test-angular2-application-pipe.html)
1. Directive のテスト(TBD)
1. [カバレッジ](/2016/03/how-to-test-angular2-application-coverage.html)

## 準備編

Angular1 の場合と同様に、Angular2 でもユニットテストを実行する前に少し下準備が必要です。
今回は、Angular1 経験者向けに変更点などを紹介します。

サンプルはこちらを参考にしてください。
[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)

## Karma ＋ Jasmine の構成はそのまま利用できる

ユニットテストの構成は Angular1 と同じ構成です。

- テストランナー
  - [Karma](https://karma-runner.github.io/0.13/index.html)
- テスティングフレームワーク
  - [Jasmine](http://jasmine.github.io/2.4/introduction.html)

Karma の設定は次のような形です。

**karma.conf.js**

```js
"use strict";
// Karma configuration

let baseLibs = [
  "node_modules/systemjs/dist/system-polyfills.js",
  "node_modules/systemjs/dist/system.js",
  "node_modules/es6-shim/es6-shim.js",
  "node_modules/rxjs/bundles/Rx.js",
  "node_modules/angular2/bundles/angular2-polyfills.js",
  "node_modules/angular2/bundles/angular2.dev.js",
  "node_modules/angular2/bundles/router.dev.js",
  "node_modules/angular2/bundles/http.dev.js",
];

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine"],

    // list of files / patterns to load in the browser
    files: [
      ...baseLibs,
      "node_modules/angular2/bundles/testing.dev.js",
      "karma.shim.js",
      { pattern: "app/**/*.js", included: false },
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["mocha"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
```

~~Karma の設定ファイルの`frameworks`にてテスティングフレームワークを変更できるので、mocha など他のものを利用することもできると思います。~~  
(2016-03-10 追記) Angular2 内部で Jasmine の DefinitelyTyped を参照しているため、Jasmine を使った方が幸せになれる気がします。

`karma.shim.js`という見慣れないファイルについては後で説明します。

## モジュールロードシステムが独自から systemjs に変更となった

Angular2 で大きく変わった点の一つは、モジュールロードシステムが[systemjs](https://github.com/systemjs/systemjs)に変更された点です。

Angular1 はモジュール名の名前解決による独自のモジュールロードシステムを持っていました。
基本的には`<script>`タグでロードした外部スクリプトを、Angular 上でモジュールとして再ロードすることで利用していました。

Angular2 では systemjs の設定ファイルにて利用する外部スクリプトを定義して、systemjs を介してモジュールをロードするようになります。
これまではテストランナーでテスト用のファイル一式をロードすれば十分でしたが、間に systemjs が 1 枚存在する形になります。

そこで、`karma.shim.js`の登場です。

## karma.shim.js とは

`karma.shim.js`とは、テストを行う前に systemjs にてモジュールがロードされていることを保証するために、Karma と systemjs の初期化のタイミングを制御する役割をするものです。

`karma.shim.js`の処理を大きく分けると次の 3 ステップでテストを実行しています。

1. systemjs 内にアプリケーションの静的リソースをロード
1. テスト用のブラウザと接続
1. Spec をロード&テスト実行

[refs](https://github.com/mitsuruog/angular2-minimum-starter/blob/master/karma.shim.js)

## サンプル Spec を作成して実行してみる

最後に簡単な Spec を実装してみます。シンプルな`AppComponent`です。

**app.component.ts**

```ts
import {Component, OnInit} from 'angular2/core';

@Component({
  selector: 'my-app',
  template: `
    <h1>Angular2 Minimum Starter Kit</h1>
  `
})

export class AppComponent {}
```

Spec を書いてみます。

**app.component.spec.ts**

```ts
import { Component, provide } from "angular2/core";
import {
  it,
  inject,
  injectAsync,
  beforeEachProviders,
  TestComponentBuilder,
} from "angular2/testing";

import { AppComponent } from "./app.component";

describe("Test: AppComponent", () => {
  beforeEachProviders(() => [AppComponent]);

  it("AppComponentが存在すること", inject(
    [AppComponent],
    (testee: AppComponent) => {
      expect(testee).toBeDefined();
    }
  ));
});
```

テストを実行してみます。

```
karma start karma.conf.js
```

テストを実行すると結果が表示されます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/testing-angular2-1-run.png)

## まとめ

モジュールロードシステムが SystemJS に変更されたことで、少し面倒になりましたがこれで Angular1 と同様にユニットテストを行う準備ができるはず！！

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。
(もちろんすぐテストできます！！)

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)

### 参考

- [juliemr/ng2-test-seed: Work in Progress - Example, cloneable setup for an Angular2 application with tests.](https://github.com/juliemr/ng2-test-seed)
- [ghpabs/angular2-seed-project: Angular 2 Seed Project – Gulp, TypeScript, Typings, Karma, Protractor, Sass and more.](https://github.com/ghpabs/angular2-seed-project)
