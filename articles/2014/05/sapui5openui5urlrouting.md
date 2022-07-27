---
layout: post
title: "[SAPUI5/OpenUI5]URLでのルーティングの基本"
date: 2014-05-25 02:16:00 +0900
comments: true
tags:
  - javascript
  - OpenUI5
  - SAPUI5
---

Backbone.js や AngularJS に代表される JavascriptMV＊系で構築された SPA（Single page application）は、Struts などで構築された従来の Web アプリケーションと異なり、1 つの HTML5 の中に複数画面（View）を持ち、画面遷移時に Javascript にて View を切り替えるため、通常はブラウザのリフレッシュを伴いません。

その際に問題となるのが、画面遷移時にリフレッシュを伴わないため、URL が変らないことです。

URL が変わらないということは、すべての画面の URL が同じになるということで、ブックマークから特定の画面を開くことができなくなります。

そこで SPA では通常、URL の後ろに「ハッシュ」と呼ばれる開く対象となる URL を付け加え、Javascript にてハッシュと一致する View を表示するようにコントロールする「router」「routing」と呼ばれる手法を行うことが一般的です。

今回は、SAPUI5/OpenUI5 での routing の基本的なことについて紹介します。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/a1510_000018.jpg)

## 目次

## 1.ルーティングテーブルの定義とルーターの初期化

ルーティングするためには、URL の「ハッシュ」とそれと対応して表示する View を定義する必要があります。ここでは便宜上「ルーティングテーブル」と言います。

まず、「Conpoment.js」内の「metadata」にルーティングテーブルを定義します。

```
#! Component.js

sap.ui.core.UIComponent.extend "com.mitsuruog.sapui5.Component",

  metadata:
    routing:
      config:
        viewType: "JS"
        viewPath: "view"
        targetControl: "navConteiner"
        targetAggregation: "pages"
        clearTarget: false
      routes: [{
        pattern: ""
        name: "First"
        view: "First"
        targetAggregation: "pages"
      }, {
        pattern: "second"
        name: "Second"
        view: "Second"
        targetAggregation: "pages"
      },

      # ...省略

```

ちなみに「config」はすべての routing 共通の設定で、「routes」内には、それぞれのハッシュと対応する View 定義、カスタムする振る舞いなどが定義出来ます。

細かい設定等はこちらです。簡単に紹介します。

[Configuration Parameters for Navigation](https://sapui5.hana.ondemand.com/sdk/#docs/guide/902313063d6f45aeaa3388cc4c13c34e.html)

- pattern
  - パターンマッチするハッシュを文字列で指定します。ルーティングテーブルの中で最も大事な設定です
- name（必須）
  - ルーテリングテーブルの中で一意な名前を設定します
- view
  - pattern にマッチした場合に表示する View 名です
- viewType
  - View のタイプです。HTML、JS、JSON、XML があります
- viewPath
  - View のリソースがあるところまでのパスです。例えば、「view/someView」の場所に View が存在する場合は、「view」を指定します
- targetParent
  - 後述する targetControl の親要素を ID で指定します
- targetControl
  - view を表示するコンテナを ID で指定します
- targetAggregation
  - targetControl で指定したコンテナのどのプロパティに View を設定するか指定します。次のように指定することが多いです
- subroutes
  - ネストしたルーティングを実現する場合に routes と同じように設定します。（まだ詳しく検証してないです。
- clearTarget
  - View を追加する前に View をクリアする必要がある場合、true を設定します。
- callback
  - pattern にマッチした場合に実行される Callback を指定します。

どのルーティング定義にもマッチしないものに対して NotFound ページを表示する場合は、pattern に「`:all*:`」を設定してください。

ルーティングテーブルを定義した後に、同じ「Conpoment.js」にて router のライフサイクルを定義します。「init」で初期化して、「destory」時に破棄します。

この辺りのコードはお作法だと思ってコピペしましょう。

```
#! Component.js

  # ...省略

  init: ->
    jQuery.sap.require "sap.ui.core.routing.History"
    jQuery.sap.require "sap.m.routing.RouteMatchedHandler"

    sap.ui.core.UIComponent.prototype.init.apply @

    router = @getRouter()
    this.routerHandler = new sap.m.routing.RouteMatchedHandler router
    router.initialize()

  destory: ->
    if @routerHandler
      @routerHandler.destroy()
    sap.ui.core.UIComponent.prototype.destory.apply @

  # ...省略
```

## 2.ルーティング

それでは実際にルーティングしてみましょう。

サンプルの例では、次のように呼び出す URL にハッシュを追加することで、望みの画面を表示させることが可能です。

- [http://mitsuruog.github.io/sapui5-showroom/app/routing/#/second](http://mitsuruog.github.io/sapui5-showroom/app/routing/#/second)
- [http://mitsuruog.github.io/sapui5-showroom/app/routing/#/third/1/tab2](http://mitsuruog.github.io/sapui5-showroom/app/routing/#/third/1/tab2)

では、プログラムから View を切り替え時にハッシュも変更するためにはどうすればよいでしょうか？

プログラムから View を切り替え時にハッシュも変更するためには、先ほど定義した router を取得してハッシュを切り替える命令を出す必要があります。ハッシュパラメータを渡す場合は、第 2 引数に key-value 形式でハッシュパラメータのオブジェクトを渡します。

```
#! ButtonのPress処理などController.jsにて書いている想定。

nextPage: ->

  router = sap.ui.core.UIComponent.getRouterFor @

  #パラメータを伴わない場合
  router.navTo "Second"

  #パラメータを伴う場合
  router.navTo "Second",
    someParam: "hoge"
```

## 3.ルーティングマッチと View でのパラメータ取得

URL のハッシュ値を変えることで View を切り替えることができましたが、ハッシュに含まれるパラメータをそれぞれの View にて取得するためにはどうすれば良いでしょうか。

View にてハッシュに設定されたパラメータを取得するためには、ルーティングマッチした際に発火するイベントにフックする必要があります。

```js
#! routing先のController.jsにて書いている想定。

sap.ui.controller "view.Third",

  onInit: ->
    @router = sap.ui.core.UIComponent.getRouterFor @
    @router.attachRoutePatternMatched @_handleRouteMatched, @

  _handleRouteMatched: (oEvt) ->

    #viewNameが一致しないものはFilterする
    unless "Third" is oEvt.getParameter "name"
      return

    #Hashパラメータを取得
    #以下のようなURLを想定
    #/some/{id}
    #/some/:id:
    hashParams = oEvt.getParameter "arguments"
    id = hashParams.id

```

ルーティング時に渡したパラメータは getParameter にて取得します。すべてのパタメータをオブジェクトとして取得する場合は、getParameters を使います。

（getParameter の引数に arguments が使われている辺り、中の実装がどうなっているか予想できます w）

## 4.最後に

SAPUI5/OpenUI5 でのルーティングについて基本的なことを書きました。

ちなみに SAPUI5/OpenUI5 では、最近までは EventBus を使った Navigation を使うことが一般的でした。（たぶん、1.20 になってから変わったと思います。）

EventBus では、ブックマークからの特定画面を起動することが難しかったので、個人的には待ちに待った機能でした。

1.20 になってから他にも大きな変更点がある SAPUI5/OpenUI5 ですので、機会があればまた紹介していきます。

## X.デモやソースコードはこちらです。

### デモ

SAPUI5/OpenUI5 routing Sample

[http://mitsuruog.github.io/sapui5-showroom/app/routing/](http://mitsuruog.github.io/sapui5-showroom/app/routing/)

### ソースコード

sapui5-showroom/app/routing at master · mitsuruog/sapui5-showroom

[https://github.com/mitsuruog/sapui5-showroom/tree/master/app/routing](https://github.com/mitsuruog/sapui5-showroom/tree/master/app/routing)

### 参考リンク

- [(SAP/Open) UI5 with Routing Tutorial - YouTube](https://www.youtube.com/watch?v=YZqtx2KJ2To)
- [(SAP/Open) UI5 with dynamic Routing Tutorial - YouTube](https://www.youtube.com/watch?v=hMEkV1ECf2c)
- [Navigation](https://sapui5.hana.ondemand.com/sdk/#docs/guide/3d18f20bd2294228acb6910d8e8a5fb5.html)
- [Step 3: Navigation and Routing](https://sapui5.hana.ondemand.com/sdk/#docs/guide/688f36bd758e4ce2b4e682eef4dc794e.html)
