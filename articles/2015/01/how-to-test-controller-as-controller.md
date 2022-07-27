---
layout: post
title: "controllerAs仕様のcontrollerをユニットテストするための小ネタ"
date: 2015-01-13 23:33:37 +0900
comments: true
tags:
  - AngularJs
  - karma
  - unit test
---

小ネタです。  
いつも angular の controller を使うときは`ui-router`から`controllerAs`して使うことが多いですが、
controllerAs 仕様にした controller をユニットテストする際、少しハマったのでそのあたりを紹介します。

<!-- more -->

テストコードは angular 本家の[PhoneCat チュートリアル](https://docs.angularjs.org/tutorial)のものを利用します。

`controllerAs`仕様にカスタムした controller

contorller.js

```js
(function () {
  "use strict";

  angular.module("phonecatApp").controller("PhoneListCtrl", PhoneListCtrl);

  function PhoneListCtrl() {
    var vm = this;
    vm.phones = [
      {
        name: "Nexus S",
        snippet: "Fast just got faster with Nexus S.",
        age: 1,
      },
      {
        name: "Motorola XOOM™ with Wi-Fi",
        snippet: "The Next, Next Generation tablet.",
        age: 3,
      },
      {
        name: "MOTOROLA XOOM™",
        snippet: "The Next, Next Generation tablet.",
        age: 2,
      },
    ];
  }
})();
```

こちらがテストコード。

controllersSpec.js

```js
"use strict";

describe("Controller: PhoneListCtrl", function () {
  // load the controller's module
  beforeEach(module("phonecatApp"));

  var MainCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    MainCtrl = $controller("PhoneListCtrl as vm", {
      $scope: scope,
    });
  }));

  it("phoneモデルが3つ作成されていること", function () {
    expect(scope.vm.phones.length).toBe(3);
  });
});
```

[$controller](https://docs.angularjs.org/api/ng/service/$controller)で指定する controller の constructor 指定の部分に`as`構文が使えるんですね。知りませんでした。  
$controller でテストする controller を inject したら、scope に設定した model などは`as`で指定した alias(今回だと vm)から参照できるみたい。

ちなみに、constructor で`as`構文を使わないと`expect`するところで`undefined`になります。

```
TypeError: 'undefined' is not an object (evaluating 'scope.phones.length')
```
