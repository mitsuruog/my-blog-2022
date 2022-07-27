---
layout: post
title: "Angular1.X系をES6で書いてみたらちょっと残念だった話〜AngularJS ES6リファクタソンを終えて〜"
date: 2015-03-11 01:36:47 +0900
comments: true
tags:
  - AngularJs
  - es6
  - babel
  - jspm
---

2015/3/7 に[MSakamaki](https://github.com/MSakamaki)氏に声を掛けられれて一緒に AngularJS ES6 リファクタソンを開催しました。

内容は参加者が 2〜3 人のチームに分かれて ES5 で書かれた Angular1.3 ベースの Web アプリを、ES6 でリファクタするという企画です。
ES5 のコードの中にクソコードを仕込んでおいて、ついでにリファクタしてくれるかなーなんて思いながら主催側ですが、一緒にリファクタして結構楽しかったです。

Angular1.3 を ES6 でリファクタするポイントや、書き換えてみての所感とかまとめようと思います。  
(注 今回のコードは実験的な試みです。プロダクションコードに適用するかは自己責任でお願いします。)

[AngularJS ES6 リファクタソン - AngularJs Japan User Group | Doorkeeper](https://angularjs-jp.doorkeeper.jp/events/21008)

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-refactor.png)

## Angular1.X 系は ES6 と相性が悪い？？

始めにやってみた感じの所感を先に紹介すると、**ES6 の新機能は非常に魅力的だけど、Angular1.X 系の DI との組み合わせ(特に Modules)が、非常に相性が悪い** と思いました。
残念な部分も含めて ES6 へのリファクタのポイント紹介します。

## 環境周り

ES6 にはまだブラウザ上で動作しない仕様もあるため、Babel を使って ES6 で書いたコードを ES5 へコンパイルしました。また、最近 Babel とセットで使われることが多い jspm を利用ました。

- [Babel · The transpiler for writing next generation JavaScript](https://babeljs.io/)
- [jspm.io - Frictionless Browser Package Management](http://jspm.io/)

リファクタソンの課題はこちらです。

- [MSakamaki/AngularEs6Son](https://github.com/MSakamaki/AngularEs6Son)

こちらがリファクタ  ソンの内容を持ち帰って、私が書き直してみたコードです。今回紹介するコードはこちらのリポジトリにあります。全体を見たい場合はこちらを見てください。

- [mitsuruog/angular-es6](https://github.com/mitsuruog/angular-es6)

## controller

contorller は ES6 の class を使って置き換えます。

(client/app/list/list.controller.js)

```js
export default class ListController {
  constructor(BeanService, RegionsService) {
    this.beans = [];
    this.regions = [];
    this.beanService = BeanService;
    this.regionsService = RegionsService;
    // APIアクセス部分
    // Arrow Functionはthisを固定してくれるので、
    // promiseの中がthisと書けて非常に嬉しい
    this.beanService.query().$promise.then((data) => (this.beans = data));
    this.regionsService.query().$promise.then((data) => (this.regions = data));
  }
  // template側で利用する機能
  delete(id) {
    this.beanService
      .delete({
        id: id,
      })
      .$promise.then(() => {
        this.beanService.query().$promise.then((data) => (this.beans = data));
      });
  }
}
// Strict DI
ListController.$inject = ["BeanService", "RegionsService"];
```

class 内で再利用する Object は一旦`this`に格納します。
`this`の利用頻度が多いですが、普段`controllerAs`で contorller を利用している人にとっては、あまり違和感なのではないでしょうか。
module への登録は次のように行います。

(client/app/app.js)

```js
import ListController from "./list/list.controller";

export var app = angular.module("Es6App", ["ui.router"]);

// controllers
app.controller(ListController.name, ListController);
```

このあたりまでは ES6 の Arrow Functions・Classes・Modules などの新機能を使って Angular1.X 系でもいけるんじゃないかと思います。わたしにもそんなこと思っていた時期がありました。

ES6 の Class と Arrow Functions は本当にいいですね。

## factory

factory も contoller と同様に class を使って置き換えます。

(client/dataservices/beans/beans.service.js)

```js
export default class BeanService {
  constructor($resource) {
    return $resource(
      "http://localhost:8000/api/beans/:id",
      {
        id: "@id",
      },
      {
        update: {
          method: "PUT",
        },
      }
    );
  }
}
// Strict DI
BeanService.activate.$inject = ["$resource"];
```

module への登録は次のように行います。

(client/dataservices/index.js)

```js
import BeanService from "./beans/beans.service";

export var app = angular.module("Es6AppDataServices", ["ngResource"]);

app.factory("BeanService", ($resource) => new BeanService($resource));
```

module 登録の際に factory Class をインスタンス化する必要があります。さらに DI の注入がある場合は、依存関係のモジュールを渡さなければなりせん。
Angular1.X 系の DI の仕組みは、ES6 の Modules とは相性が悪いようです。そこで、Class のインスタンスを返す static な function を追加して次のように改善してみました。

(client/dataservices/beans/beans.service.js)

```js
export default class BeanService {

  constructor($resource) {
    ...
  }

  static activate($resource){
    BeanService.instance = new BeanService($resource);
    return BeanService.instance;
  }

}
// Strict DI
BeanService.activate.$inject = ['$resource'];
```

これで module への登録は少しスッキリします。

(client/dataservices/index.js)

```js
...

app.factory('BeanService', BeanService.activate);
```

## filter

filter も同様に class で置き換えます。

(client/filters/regionName/regionName.filter.js)

```js
export default class regionName {
  constructor() {
    return (input, regions) => {
      let regionName = "";
      angular.forEach(regions, function (region) {
        if (region.id === input) regionName = region.name;
      });
      return regionName;
    };
  }

  static activate() {
    regionName.instance = new regionName();
    return regionName.instance;
  }
}
```

module の登録は factory と一緒なので省略します。

## directive

directive も同じです。

(client/components/amountLabel/amountLabel.directive.js)

```js
export default class amountLabel {
  constructor() {
    // directiveの設定系
    this.templateUrl = "components/amountLabel/amountLabel.html";
    this.restrict = "EA";
    this.scope = {
      amount: "=",
    };
  }

  link(scope, element, attrs) {
    if (scope.amount > 1000) {
      scope.styleClass = "text-info";
    } else if (scope.amount <= 1000 && scope.amount > 500) {
      scope.styleClass = "text-success";
    } else if (scope.amount <= 500) {
      scope.styleClass = "text-danger";
    }
  }

  static activate() {
    amountLabel.instance = new amountLabel();
    return amountLabel.instance;
  }
}
```

module の登録は factory と一緒なので省略します。

## config

Config や router も ES6 の Class で置き換えてみます。

(client/app/app.config.js)

```js
export default class AppConfig {
  constructor($locationProvider) {
    // アプリ共通の設定系
    $locationProvider.html5Mode(true);
  }

  static activate($locationProvider) {
    AppConfig.instance = new AppConfig($locationProvider);
    return AppConfig.instance;
  }
}
// Strict DI
AppConfig.$inject = ["$locationProvider"];
```

(client/app/app.route.js)

```js
export default class AppRouter {

  constructor($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/list');
    $stateProvider.state('app', {
      abstract: true,
      url: '/#',
      template: `<div ui-view="header"></div>
        <div ui-view="contents" class="main"></div>
        <div ui-view="footer"></div>`
    })

	...

  }

  static activate($stateProvider, $urlRouterProvider) {
    AppRouter.instance = new AppRouter($stateProvider, $urlRouterProvider);
    return AppRouter.instance;
  }

}
// Strict DI
AppRouter.$inject = ['$stateProvider', '$urlRouterProvider'];
```

アプリのトップレベルの module への最終的な登録はつぎのとおりです。

(client/app/app.js)

```js
import angular from "angular";
import "angular-ui-router";

import "../components/index";
import "../dataservices/index";
import "../filters/index";
import AppConfig from "./app.config";
import AppRouter from "./app.route";
import ListController from "./list/list.controller";

export var app = angular.module("Es6App", [
  "ui.router",
  "Es6AppFilters",
  "Es6AppDataServices",
  "Es6AppComponents",
]);
// 設定系
app.config(AppConfig.activate);
app.config(AppRouter.activate);
// controllers
app.controller(ListController.name, ListController);
```

## 課題

とりあえず ES6 に置き換えることはできそうですが、テスト周りについての変更点については、まだ検証できてません。
個人的にはテストの spec が ES6 で書けるだけでも嬉しいです！！

- Angular1.X 系で良かった、テスタビリティがどれくらい犠牲にされているか。
  - ngMock
  - カバレッジ測定
  - E2E(protoractor)
- そもそもこの書き方でいいのか・・・

## さいごに

今や最も優れている(？)Angular1.X 系。
2 年後くらいに ES6 が主流になったとき、今の Backbone を見る時に感じるものと同じ感覚を覚えるのではないかと思いました。
また、来年には Angular2 が来ると言われているのですが、1.X 系とは全く別物なんですよねー(白目)。

にしても、いつになったらフロントエンド開発のデファクトが定まるのか、まだまだ JS フレームワークの長い旅は続きそうです。

### 参考

- [Using ES6 with Angular today](http://blog.thoughtram.io/angularjs/es6/2015/01/23/exploring-angular-1.3-using-es6.html)
- [Exploring ES6 Classes In AngularJS 1.x](http://www.michaelbromley.co.uk/blog/350/exploring-es6-classes-in-angularjs-1-x)
- [Writing AngularJS Apps Using ES6](http://www.sitepoint.com/writing-angularjs-apps-using-es6/)
- [Using ES6 Modules with AngularJS 1.3 — GoCardless Blog](https://gocardless.com/blog/es6-angular/)
- [gocardless/es6-angularjs](https://github.com/gocardless/es6-angularjs)
- [lukehoban/es6features](https://github.com/lukehoban/es6features)
- [yoheiMune/es6features(上の日本語  訳)](https://github.com/yoheiMune/es6features)
