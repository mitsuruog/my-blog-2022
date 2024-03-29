---
layout: post
title: "Angular2 Unit Testing - XHRのテスト"
date: 2016-03-21 1:29:00 +900
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

今回は XHR が関連するテスト。

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

## XHR のテスト

XHR 通信が関連するテストについて紹介します。

Angular1 には XHR 通信を行う`$http`サービスがありました。
XHR 通信をテストする場合は、`$http`を Mock する[$httpBackend](https://docs.angularjs.org/api/ngMock/service/$httpBackend)を利用し、実際の XHR 通信を`$httpBackend`でダミーのレスポンスに置き換えてテストを行っていました。

Angular2 にも`MockBackend`という`$httpBackend`と同様の役割のものがありますので、利用方法について紹介します。

- [MockBackend - ts](https://angular.io/docs/ts/latest/api/http/testing/MockBackend-class.html)

## 標準 HTTP の Mock を準備する(beforeEachProviders)

`MockBackend`は`@Injectable`指定されているため、他の Provider と同様に`beforeEachProviders`で呼び出した後に、`inject`でテストコード中に DI して利用する必要があります。

**hero.service.spec.ts**

```ts
describe("HTTPのテスト", () => {
  beforeEachProviders(() => [
    BaseRequestOptions,
    MockBackend,
    provide(Http, {
      useFactory: function (backend, defaultOptions) {
        return new Http(backend, defaultOptions);
      },
      deps: [MockBackend, BaseRequestOptions],
    }),
    HeroService,
  ]);

  // ...省略
});
```

上のコードでは、`Provider`API を利用して、テスト専用の`HTTP`を生成しています。
`Provider`は、Angular2 の中で`@Injecter()`によって DI がされる際にインスタンスの生成方法を指定する API です。

- [Provider - ts](https://angular.io/docs/ts/latest/api/core/Provider-class.html)

ここでは、`dependencies`で`HTTP`が利用している Provider を DI し、`useFactory`内部で新しい`HTTP`インスタンスを作成しています。
インスタンスを作成する際の`backend`に、`dependencies`で指定した`MockBackend`が設定されます。

`dependencies`に設定している各 Provider は、後にダミーのレスポンスを返却する設定を DI するための楔(くさび)だと考えてください。

## ダミーのレスポンスを設定する(inject)

続いてダミーのレスポンスを設定します。

先に生成した`HTTP`がテスト対象の Service に DI されるタイミングで、`inject`を利用して`MockBackend`のレスポンスをダミーで書き換えます。

**hero.service.spec.ts**

```ts
describe("HTTPのテスト", () => {
  // ...省略

  beforeEach(inject([MockBackend], (backend: MockBackend) => {
    const response = new Response(
      new ResponseOptions({
        body: {
          data: [
            { id: "1", name: "mitsuru" },
            { id: "2", name: "ogawa" },
          ],
        },
      })
    );
    backend.connections.subscribe((conn: MockConnection) =>
      conn.mockRespond(response)
    );
  }));

  // ...省略
});
```

ダミーのレスポンスを返却する部分は少しややこしいですが、まずは形から入りましょう。

大事な部分は`ResponseOptions`にダミーのレスポンスを設定する部分です。
上の例では、body の`data`プロパティにダミーのオブジェクトを設定しています。他にも設定できるプロパティが存在するので、詳しくは API を参照してください。

- [ResponseOptions - ts](https://angular.io/docs/ts/latest/api/http/ResponseOptions-class.html)

実際のレスポンスは`MockConnection`を利用して行います。他にも`mockDownload`, `mockError`など使えそうな API があります。

- [MockConnection - ts](https://angular.io/docs/ts/latest/api/http/testing/MockConnection-class.html)

`ResponseOptions`の部分はダミーレスポンス専用のクラスにしておき、テストコードの先頭で import して利用するともっとスッキリすると思います。

## テストを検証する(it)

では XHR 通信が正しく Mock されているか検証します。

その前に、テスト対象の HeroService についてです。
HeroService は、`Hero`のリストを XHR 通信で取得した後に、Observable でラップして返却する(Angular2 的には)シンプルなデータアクセスクラスだとします。

**hero.service.ts**

```ts
@Injectable()
export class HeroService {
  getHeroes(): Observable<Hero[]> {
      return this.http.get(this.URL)
        .map(res => <Hero[]>res.json().data);
    }
}
```

先ほどの設定してダミーレスポンスを実際に検証してみます。

**hero.service.spec.ts**

```ts
describe("HTTPのテスト", () => {
  // ...省略

  it("2件取得できること", inject([HeroService], (testee: HeroService) => {
    testee.getHeroes().subscribe((res: Hero[]) => {
      expect(res.length).toEqual(2);
      expect(res[0].name).toEqual("mitsuru");
    });
  }));
});
```

無事、2 件取得できることが確認できました。
めでたし。めでたし。

## まとめ

HTTP のテストについてでした。

テストの全体像についてはこちらを参考にしてください。

<https://github.com/mitsuruog/_angular2_http>

Unit テスト全般に言えることですが、テストを行うための Mock などの下準備が非常に面倒くさいです。
下準備は定型文的なものが多いため、再利用できるようスニペットなどにしておくことが大事です。

今回は、Service クラスを題材にしたため、テストコードの中で HTTP を置き換えています。
Component など HTTP から遠いレイアーでは、今回のように HTTP を置き換えるのではなく、Service クラスごと Mock 化して`beforeEachProviders`で Service クラスを置き換え方がテストしやすいと思います。

### PR

こちらに初学者のための Minimum starter kit を作成しましたので、ぜひ利用してください。
(もちろんテストもできます！！)

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)
