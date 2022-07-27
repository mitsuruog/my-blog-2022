---
layout: post
title: "Angular2 Unit Testing - DOMのテスト"
date: 2016-03-17 1:59:00 +900
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

今回は DOM が関連するテスト。

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

## DOM のテスト

DOM のテストについて紹介します。

DOM のような状態が不安定なものをテストする場合、テスト対象の状態を一定に固定するため、`fixture`と呼ばれる土台(仮の DOM)を利用してきました。
Angular2 の DOM のテストでも、これまでと同様に fixture を利用します。

## fixture を準備する(TestComponentBuilder)

まず、テストで利用する fixture を準備します。

Angular2 にはテスト用 fixture を作成するための API`TestComponentBuilder`が準備されています。
`TestComponentBuilder`は、fixture 用の Component を作成して外側から操作・検証する API を提供します。

DOM のテストのおおまかな流れは次のような形です。

```ts
import {
  it,
  describe,
  expect,
  inject,
  injectAsync,
  beforeEach,
  beforeEachProviders,
  TestComponentBuilder
} from 'angular2/testing';
import {Component} from 'angular2/core';

describe('DOMのテスト', () => {

  beforeEachProviders(() => [
    TestComponentBuilder
  ]);

  it('なにかのテスト', injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    // ここに実際のテストコードを書く
  }));

});

// fixture用Component
@Component({ selector: 'container' })
class TestComponent { }
```

`TestComponentBuilder`は`@Injectable`指定されているため、他の Provider と同様に`beforeEachProviders`で呼び出した後に、`injectAsync`でテストコード中に DI して利用する必要があります。

続いて、テストで利用する使い捨て Component を作成します。これをテスト用 fixture として利用します。

- [TestComponentBuilder - js](https://angular.io/docs/js/latest/api/testing/TestComponentBuilder-class.html)

## fixture を作成する(overrideTemplate, createAsync)

続いて実際に fixture を作成します。

テスト用 fixture が準備できたので、この Component をテンプレートを上書きして DOM を作成します。

```ts
// itの部分だけ抜粋
it(
  "なにかのテスト",
  injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    let template = "<div>Hello Angular2 :)</div>";
    return tcb
      .overrideTemplate(TestComponent, template)
      .createAsync(TestComponent)
      .then((fixture) => {
        // ここに検証コードを書く
      });
  })
);
```

`overrideTemplate`に Component と上書きするテンプレートを渡して、`createAsync`を呼び出すと、実際にテストする fixture が作成されます。

実際には、テンプレートに Component や Directive を含めることが多いかと思います。
Angular1 での`$compile(template)($rootScope)`とほぼ同じものだと考えて大丈夫です。

`TestComponentBuilder`で作成された fixture は`ComponentFixture`クラスなり、次のようなテストで利用する API が準備されています。

- debugElement
  - テスト用の Helper クラス
- componentInstance
  - TestComponent のインスタンス
- nativeElement
  - テスト用 fixture の HTMLElement を表す
- detectChanges()
  - テスト中に Component を変更するために、Component の変更検知サイクルを発火します。

よく利用するものについて紹介します。

- [ComponentFixture - js](https://angular.io/docs/js/latest/api/testing/ComponentFixture-class.html)

## fixture を検証する API(nativeElement)

`nativeElement`はテスト用 fixture の`HTMLElement`を返す API です。
`HTMLElement`は HTML 標準の API であるため、これを利用してテスト用 fixture を検証・操作します。

[HTMLElement - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```ts
// itの部分だけ抜粋
it(
  "なにかのテスト",
  injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    let template = "<div>Hello Angular2 :)</div>";
    return tcb
      .overrideTemplate(TestComponent, template)
      .createAsync(TestComponent)
      .then((fixture) => {
        let div = fixture.nativeElement.querySelector("div");
        // HTMLElementを検証する
        expect(div).toHaveText("Hello Angular2 :)");
      });
  })
);
```

## fixture を変更する(detectChanges)

`detectChanges()`は、Angular1 の`scope.$digest()`に似ており、強制的に Angular へ変更を検知させる仕組みです。

Angular2 内部では Angular1 の`dirty checking`に代わる独自の変更検知サイクルを持っています。
テストで Click イベントなどの非同期を利用する場合、この変更検知サイクルを発火して Angular2 に変更を検知させる必要があります。

Angular2 の変更検知サイクルについてはこの記事が詳しいです。

- [Change Detection in Angular 2 | Victor Savkin](http://victorsavkin.com/post/110170125256/change-detection-in-angular-2)

次のテストコードは、マウスが当たると文字色が red に変わる Component のテストだと仮定します。

```ts
// ... describeの部分だけ抜粋
describe("DOMのテスト", () => {
  let mouseenter;

  beforeEachProviders(() => [TestComponentBuilder]);

  beforeEach(() => {
    // mouseenterイベントを定義します
    mouseenter = new MouseEvent("mouseenter", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
  });

  it(
    "mouseenterするとredに変わること",
    injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      let template = "<div>Hello Angular2 :)</div>";
      return tcb
        .overrideTemplate(TestComponent, template)
        .createAsync(TestComponent)
        .then((fixture) => {
          let div = fixture.nativeElement.querySelector("div");

          // mouseenterイベントを強制的に起こします
          div.dispatchEvent(mouseenter);

          // detectChangesしないと変更が検知されない
          expect(div.style.backgroundColor).toEqual("red"); // => NG
          fixture.detectChanges();
          expect(div.style.backgroundColor).toEqual("red"); // => OK
        });
    })
  );
});
```

## まとめ

DOM についてのテストは以上です。

DOM が関連するテストはやはり面倒ですね。メンバーの習熟度や学習コストを鑑みて、自動テストをしないという選択肢もありだと思います。
テストコードの全体像は、こちらで雰囲気をつかめると思います。

[\_angular2-attribute-directive/highlight.directive.spec.ts at master · mitsuruog/\_angular2-attribute-directive](https://github.com/mitsuruog/_angular2-attribute-directive/blob/master/app%2Fcomponents%2Fhighlight.directive.spec.ts)

今回の例では、検証に fixture の`nativeElement`を利用していましたが、`debugElement`についてはまだ利用用途があまりはっきりとわかっていません。
機会があれば、もう少し掘り下げようかと思います。

- [DebugElement - js](https://angular.io/docs/js/latest/api/core/DebugElement-class.html)

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)
