---
layout: post
title: "Angular2 Unit Testing - Pipeのテスト"
date: 2016-03-17 1:29:00 +900
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

今回は Pipe のテスト。

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

## Pipe のテスト

Pipe のテストについて紹介します。

Angular2 の Pipe は Angular1 の filter に相当するものです。
Linux コマンドの`|(パイプ)`と同義で、入力内容を Pipe 内で(transform, replace など)処理し、結果を出力する単純なものです。

## Pipe のテストは至ってシンプル

文の区切りの最初の文字を大文字にする Pipe をテストします。

```
例）
abc     => Abc
abc def => Abc Def
```

Pipe のコードはこちらです。

**init-caps.pipe.ts**

```ts
import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
  name: 'initCaps'
})
export class InitCapsPipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/(?:^|\s)[a-z]/g, (m) => m.toUpperCase());
  }
}
```

Pipe は単純な class であるため、テストクラス内でインスタンスを生成してテストします。
至ってシンプルです。

下の例では、`beforeEach`でテスト対象の Pipe を読み込んでテストしています。

**init-caps.pipe.spec.ts**

```ts
import {
  describe,
  it,
  expect,
  inject,
  injectAsync,
  beforeEach,
  beforeEachProviders,
  TestComponentBuilder,
} from "angular2/testing";

import { InitCapsPipe } from "./init-caps.pipe";

describe("Test: InitCapsPipe", () => {
  let testee;

  beforeEach(() => {
    testee = new InitCapsPipe();
  });

  it('"abc"が”Abc”に変換されること', () => {
    expect(testee.transform("abc")).toEqual("Abc");
  });

  it('"abc def"が”Abc Def”に変換されること', () => {
    expect(testee.transform("abc def")).toEqual("Abc Def");
  });

  it('"Abc Def"は変換されないこと', () => {
    expect(testee.transform("Abc Def")).toEqual("Abc Def");
  });
});
```

ただし、Pipe 内部で DI している provider がある場合は、`beforeEachProviders`で読み込んだ後に`inject`で DI する必要があるでしょう。

## まとめ

Pipe のテストは以上です。

Pipe は構造がシンプルなためテストも簡単です。テストの最初にトライするものとしては最適だと思います。
サンプルコードはこちらを参照してください。

[mitsuruog/\_angular2_pipe](https://github.com/mitsuruog/_angular2_pipe)

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。
(もちろんテストもできます！！)

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)
