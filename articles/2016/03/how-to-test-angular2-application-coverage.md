---
layout: post
title: "Angular2 Unit Testing - カバレッジ編"
date: 2016-03-10 23:35:00 +900
comments: true
tags:
  - angular
  - angular2
  - karma
  - jasmine
  - coverage
  - istanbul
  - unit test
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/angular2-testing-logo.png
---

Angular2 の実装の方法は記事をよく目にする機会が増えたので、テストについての自分が困らないように調べてみたシリーズ。

今回はカバレッジ編。

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

## カバレッジ編

> コード網羅率（コードもうらりつ、英: Code coverage ）コードカバレッジは、ソフトウェアテストで用いられる尺度の 1 つである。プログラムのソースコードがテストされた割合を意味する。
> [コード網羅率 - Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%B3%E3%83%BC%E3%83%89%E7%B6%B2%E7%BE%85%E7%8E%87)

カバレッジを取得することのメリットは、コードの危ない部分に対して効果的にテストができているか客観的に評価できることです。。
特に HTML 形式のレポートは、コードとテストを実行した部分を重ねて表示することができ、結果を視覚的に見やすくしてくれます。

最近の JavaScript のテストではカバレッジ取得のための環境が整ってきたこともあり、積極的に活用していくべきです。

## karma-coverage でカバレッジを測定する

Karma でカバレッジを取得するためには、プラグインの 1 つである[karma-coverage](https://github.com/karma-runner/karma-coverage)を利用します。
早速、リポジトリの`devDependency`に追加します。

```
npm install karma karma-coverage --save-dev
```

続いて`karma.conf.js`の設定を変更します。

**karma.conf.js**

```js
'use strict';
// Karma configuration

let baseLibs = [...];

module.exports = function (config) {
  config.set({

    // ...省略

    // (1)
    // (*.spec.js, *.mock.js)以外のJavaScriptファイルをカバレッジ測定の対象とします
    preprocessors: {
      "app/**/!(*spec|*mock).js": ['coverage']
    },

    // (2)
    // テスト完了時のreporterにカバレッジ用reporterを設定します
    reporters: ['mocha', 'coverage'],

    // (3)
    // カバレッジ用reporterの出力先, フォーマットを指定します
    // see https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md
    coverageReporter: {
      dir : 'report/coverage/',
      reporters: [{
        type: 'html'
      }]
    }

    // ...省略

  })
}
```

テストを実行すると`report/coverage`の直下に HTML 形式のカバレッジレポートが出力されます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/testing-angular2-coverage-1.png)

karma-coverage 内部では、JavaScript のカバレッジ測定ツールとして有名な[istanbul](https://github.com/gotwarlost/istanbul)を利用しています。
HTML レポートでは、ディレクトリやファイルごとにカバレッジを知ることができます。これを見ながらカバレッジの低い部分などに追加のテストを書いていきます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/testing-angular2-coverage-2.png)

コードとテスト実行した部分を重ねあわせて表示することで、テストが不足している部分を容易に発見できます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/testing-angular2-coverage-3.png)

ところがこのままでは、レポートのコードが ts ファイルをトランスパイルした JavaScript ファイルとなっているため、実際に作成した ts ファイル上のどの部分に該当するかが非常に分かりにくいです。

## remap-istanbul で ts ファイルとリンクさせる

先ほどのカバレッジレポートを改良してトランスパイル前の ts ファイルをリンクさせます。リンクさせるには[remap-istanbul](https://github.com/SitePen/remap-istanbul)を利用します。

remap-istanbul とは、ts ファイルをトランスパイルした際に生成される SouceMap(ここでは inline SouceMap)を元に、カバレッジレポートをオリジナルの ts ファイルにリンクさせるツールです。
早速、リポジトリの`devDependency`に追加します。

```
npm install karma remap-istanbul --save-dev
```

続いて`karma.conf.js`の設定を変更します。カバレッジレポートのフォーマットを`html`ではなく`json`に変更します。

**karma.conf.js**

```js
'use strict';
// Karma configuration

let baseLibs = [...];

module.exports = function (config) {
  config.set({

    // ...省略

    // (1)
    // (*.spec.js, *.mock.js)以外のJavaScriptファイルをカバレッジ測定の対象とします
    preprocessors: {
      "app/**/!(*spec|*mock).js": ['coverage']
    },

    // (2)
    // テスト完了時のreporterにカバレッジ用reporterを設定します
    reporters: ['mocha', 'coverage'],

    // (3)
    // カバレッジ用reporterの出力先, フォーマットを指定します
    // see https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md
    coverageReporter: {
      dir : 'report/coverage/',
      reporters: [{
        type: 'json',
        subdir : '.',
        file : 'coverage-final.json',
      }]
    }

    // ...省略

  })
}
```

テストを実行すると`report/coverage/coverage-final.json`に JSON 形式のカバレッジレポートが出力されます。
これを remap-istanbul で HTML 形式のレポートに仕立てて行きます。

```
node_modules/.bin/remap-istanbul -i report/coverage/coverage-final.json -o report/coverage/ -t html
```

コマンドを実行すると`report/coverage`の直下に HTML 形式のカバレッジレポートが出力されます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/testing-angular2-coverage-4.png)

今度は ts ファイルとカバレッジレポートがリンクするようになりました。
めでたし。めでたし。

## まとめ

カバレッジの取り方とレポートの表示についてでした。
HTML レポートの出力方法は他にもあると思いますので、いろいろ試してみるといいでしょう。
カバレッジレポートを取得することで、テストが十分でない箇所を明らかにすることができ、つまらないテストにゲーム的な要素が加わってテストを書くことが楽しくなります。

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。
(もちろんカバレッジも取得できます！！)

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)
