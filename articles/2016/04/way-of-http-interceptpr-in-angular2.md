---
layout: post
title: "Angular2でHTTP Interceptorを使いたい"
date: 2016-04-12 0:58:00 +900
comments: true
tags:
  - angular
  - angular2
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/HTTP_Intercept.png
---

Way of httpInterceptor in Angular 2

4/10 に開催された[Angular 2 ハンズオン](http://connpass.com/event/28985/)のチューターとして参加してきました。  
チューターしている合間に、Angular2 での HttpIntercepor のやり方を調べてたので、その辺りを紹介します。

<!-- more -->

ついでに LT してきました。LT の資料はこちらです。

Angular2 HttpInterceptor Needed  
<https://gist.github.com/mitsuruog/6f7f0ca3f546b245bccdd3ebc14375d8>

## HttpInterceptor とは

`HttpInterceptor`とは、XHR(つまり Ajax)に関連する横断的機能(cross-cutting feature)を分離するためのものです。

Controller などの後続処理から、XHR 通信時に発生する例外処理などを分離して`HttpInterceptor`で一括処理します。
Angular1 では、`HttpInterceptor`を使うことで綺麗に分離することができました。

refs: [AngularJS: API: $http](https://docs.angularjs.org/api/ng/service/$http)

## Angular2 では簡単にはできない

Angular2 でも簡単に実現できると考えていたのですが、思ったより面倒でした。
公式リポジトリの Issue にて実現方法について議論されていました。(めっちゃ長いです)

[RFC: Http interceptors and transformers · Issue #2684 · angular/angular](https://github.com/angular/angular/issues/2684)

## Angualr2 での HttpInterceptor の実現方法

以下の手順で実現できます。

1. `Http`を継承した`CustomHttp`を作成する。
1. `bootstrap`にて、既存の`Http`プロバイダを Ovarride する。

では順に見て行きましょう。

### `CustomHttp`を作成する

まず、`CustomHttp`を作成します。`Http`の API を 1 つ 1 つ Warp します。  
例外が発生した場合は、`catch`で捕捉して private 関数の`handleResponseError`で一括処理させるようにしています。

**custom-http.service.ts**

```ts
import {
  Http,
  ConnectionBackend,
  RequestOptions,
  Request,
  RequestOptionsArgs,
  Response,
} from "angular2/http";
import { Observable } from "rxjs/Observable";

export class CustomHttp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  request(
    url: string | Request,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return super
      .request(url, options)
      .catch((res: Response) => this.handleResponseError(res));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return super
      .get(url, options)
      .catch((res: Response) => this.handleResponseError(res));
  }

  // ...長いので省略

  //
  // Here's to handle error stuff
  //
  private handleResponseError(res: Response) {
    if (res.status === 401) {
      // do something
    } else if (res.status === 500) {
      // do something
    }
    return Observable.throw(res);
  }
}
```

### `Http`を上書きする。

つづいて、`bootstrap`時に`Http`を`CustomHttp`で上書きします。
次のコードは、`provide`を利用して、Angular2 が DI を処理する際にインスタンスを生成する方法を変更しています。

**main.ts**

```ts
import { provide } from "angular2/core";
// RxJS本体のObservableを利用するための設定
import { bootstrap } from "angular2/platform/browser";
import "rxjs/Rx";

import { AppComponent } from "./app.component";
import { CustomHttp } from "./common/services/custom-http.service";

bootstrap(AppComponent, [
  provide(Http, {
    useFactory: (backend: XHRBackend, defaultOptions: RequestOptions) => {
      return new CustomHttp(backend, defaultOptions);
    },
    deps: [XHRBackend, RequestOptions],
  }),
]);
```

## まとめ

Angular2 でも`HttpInterceptor`を実現できそうですが、少し面倒でした。

こちらに`custom-http.service.ts`のコード置いておきます。(しばらくはこのままで使えるはず。。。)

[custom-http.service.ts](https://gist.github.com/mitsuruog/6f7f0ca3f546b245bccdd3ebc14375d8#file-custom-http-service-ts)

> (追記)
> LT では`new Providor()`としていましたが、 [@laco0416](https://twitter.com/laco0416)さんから、
> `Providor`を Warp している`provide`を利用した方が破壊的変更が起きにくいとアドバイスいただき変更しました。ありがとうございます！！
