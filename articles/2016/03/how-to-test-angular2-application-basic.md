---
layout: post
title: "Angular2 Unit Testing - 基本編"
date: 2016-03-15 23:29:00 +900
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

今回は基本編。

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

## 基本編

Angular1 は他の JavaScript フレームワークと比較して、テスタビリティ(テストのしやすさを)重視したフレームワークでした。

Angular2 もテスタビリティを重視したフレームワークとなっており、本体の API の中に`angular2/testing`, `angular2/http/testing`, `angular2/router/testing`などテスト専用のものが組み込まれていることからも伺い知ることができます。

## テストフレームワークは Jasmine が基本

テストフレームワークは[Jasmine](http://jasmine.github.io/2.4/introduction.html)を利用します。
これは、`angular2/testing`の中で Jasmine の API を overwrap しているためです。
いまのところ、Angular2 のテストは Jasmine を利用したほうが幸せになれると思います。

## テストクラスの構成

簡単なテストクラス(.ts ファイル)の構成についてです。
ファイル名は慣例としてテスト対象のファイルに`.spec.ts`を付けることが多いです。

```
例）
hero.service.ts
-> hero.service.spec.ts
```

`angular2/testing`の中で Jasmine の API を overwrap しているため、基本的には Jasmine の書き方と同じです。  
テストクラスに含まれる要素は大きく 3 つです。

1. import
1. describe
1. it
1. expect

### テストで利用するモジュールを読み込む(import)

import 部分では、テストで利用するモジュールを読み込みます。  
最低限`angular2/testing`とテストするモジュールを読み込む必要があります。

```ts
import {
  describe,
  it,
  inject,
  injectAsync,
  expect,
  beforeEach,
  beforeEachProviders,
  TestComponentBuilder
} from 'angular2/testing';

import {HeroService} from './hero.service';

...つづく
```

### テストケースをグルーピングする(describe)

複数のテストケースをまとめてグルーピングします。
`describe`はネストできるため、複数のテストケースをグルーピングして見通しを良くすることができます。

```ts
describe("Test: なにかのServiceのテスト", () => {
  describe("Test: 正常系", () => {});

  describe("Test: 異常系", () => {});
});
```

### テストケースを記述する(it)

`it`には実際のテストケースを記述していきます。`it`の中にはテストを検証するためにいくつかの`expect`が含まれます。

```ts
describe("Test: 正常系", () => {
  it("ステータスコードが200であること", () => {});
});
```

### テストを検証する(expect)

`expect`はテストを検証する function です。`matchar`とも呼ばれます。

`expect`は用途に応じていくつか種類があり、`angular2/testing`の`expect`は Jasmine の matchar を overwrap しているため、Jasmine の API はそのまま利用できます。
他にも Angular2 独自で拡張している matchar(NgMatchers)もあります。詳細については割愛します。

[NgMatchers - ts](https://angular.io/docs/ts/latest/api/testing/NgMatchers-interface.html)

```ts
expect(testee).not.toBe(undefined);
```

全体像はこちらで雰囲気を掴んでください。

[app.component.spec.ts](https://github.com/mitsuruog/angular2-minimum-starter/blob/master/app%2Fapp.component.spec.ts)

つづいて Angular2 ならではの機能について紹介します。

## beforeEachProviders

`beforeEachProviders`はテストで利用するモジュールを override する仕組みです。
Angular1 の`$provide`を利用したモジュールの上書きや、[angular.mock.inject](https://docs.angularjs.org/api/ngMock/function/angular.mock.inject)(`_moduleName_`の気持ち悪いやつ)と同等です。

```js
// Angular1($window.locationを上書きする例)
beforeEach(function () {
  module(function ($provide) {
    $window = {
      location: { href: null },
    };
    $provide.value("$window", $window);
  });
});
```

```ts
// Angular2(MyServiceをMyServiceMockで上書きする例)
describe("", () => {
  beforeEachProviders(() => [
    provide(MyService, {
      useClass: MyServiceMock,
    }),
  ]);
});
```

beforeEachProviders では Provider と呼ばれる`Injector`インタフェース(`@Injectable`指定したもの)を持つものや、`@Component`を設定します。(要確認)

[beforeEachProviders - ts](https://angular.io/docs/ts/latest/api/testing/beforeEachProviders-function.html)

## inject, injectAsync

`inject`, `injectAsync`は beforeEachProviders で読み込んだ Provider を`it`や`describe`の中に DI します。
Angular1 での inject と同等のものです。

Angular2 でも`@Injectable`を利用した強力な DI 機能を持っており、異なる`it`のコンテキストの中で利用する Provider を柔軟に選択することができます。

```js
// Angular1
it("should provide a version", inject(function (mode, version) {
  expect(version).toEqual("v1.0.1");
  expect(mode).toEqual("app");
}));
```

```ts
// Angular2
it('should provide a version', inject([mode, version], (mode: string, version: string) => {
  expect(version).toEqual('v1.0.1');
  expect(mode).toEqual('app');
});
```

`injectAsync`は`it`や`describe`の中が非同期の結果を返す場合に利用します。

```ts
it('...', injectAsync([AClass], (object) => {
  return object.doSomething().then(() => {
    expect(...);
  });
})
```

## まとめ

基本編は以上です。

Angular1 と同じ系譜を辿っていることがわかると思いますが、モジュールの override の部分が少し洗練されてきたかなと感じます。

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。
(もちろんテストもできます！！)

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)
