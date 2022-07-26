---
layout: post
title: "[SAPUI5/OpenUI5]カスタムUIコントロールを作成する方法(前編)"
date: 2014-09-28 23:01:00 +0900
comments: true
tags:
  - SAPUI5
  - OpenUI5
---

> How to create new own controls in OpenUI5(Part 1)

OpenUI5 は UI フレームワークという名前の通り、多くの優れた UI コントロールを持っていますが、場合によっては少しカスタムして使いたいという要望は時々あります。

さて、OpenUI5 にてカスタム UI コントロールを作成する方法は「新規で作成する」「既存の UI を拡張する」の 2 つありますが、少し長くなるので、2 部構成で説明していきます。
前編は新規で作成する方を説明します。

今回のデモはこちらで参照できます。

[http://mitsuruog.github.io/sapui5-showroom/#/controls](http://mitsuruog.github.io/sapui5-showroom/#/controls)

<!-- more -->

### 目次

1. 新しい UI コントロールの定義
2. UI コントロールメタデータの定義
3. レンダラの実装
4. 配布、利用
5. まとめ

6. Definition of UI controls
7. Definition ofUI controls metadate
8. Implementation of the renderer
9. How to use
10. Summary

こちらの公式ページの内容をもとに書いています。

[Developing UI5 Controls in JavaScript](https://openui5.hana.ondemand.com/#docs/guide/91f1703b6f4d1014b6dd926db0e91070.html)

## 1. 新しい UI コントロールの定義(Definition of UI controls)

新しい UI コントロールを作成するためには、まず`sap.ui.core.Control`を継承する必要があります。以下のコードは新規で`mitsuruog.SayHello`という名前の UI コントロールを定義しています。

```coffee
sap.ui.core.Control.extend "mitsuruog.SayHello",
  metadata: {}
  renderer: {}
```

## 2. UI コントロールメタデータの定義

新しく定義した UI コントロールが持つ特徴をメタデータ(定義情報)として定義していきます。定義できるメタデータの属性は`Properties`、`Events`、`Aggregations(Associations)`の 3 つです。順に説明していきます。

### Properties

Properties とは、その名の通り UI コントロールに外部からアクセスできるプロパティ定義です。例えば、`name`という Properties を定義した場合、UI コントロールを初期化(new)する際に、`name`プロパティにパラメータを渡すことができます。以下の属性を定義します。

- **type**: プロパティのデータタイプを指定します。これを指定する事で OpenUI5 が提供する validation が機能します。デフォルトは`string`です。
- **defaultValue**: デフォルトを指定します。何も指定しない場合は`undefined`です。
  Properties にはアクセスレベルが指定できるようです(未検証)。[Object Metadata and Implementation](https://openui5.hana.ondemand.com/docs/guide/91f29fea6f4d1014b6dd926db0e91070.html)

### Events

UI コントロールから発火するカスタムイベント名を定義します。

### Aggregations(Associations)

UI コントロールに外部からリストを渡したい場合に定義します。`sap.m.List`の`items`や`sap.m.Page`の`content`に相当します。以下の属性を定義します。

- **type**: Aggregations に設定するクラスを定義します。`sap.m.List`の`items`場合は`sap.m.ListItemBase`です。デフォルトは`sap.ui.core.control`です。
- **multiple**: `0..n`の場合は`true`、`0..1`の場合は`false`にします。何も設定しない場合の挙動が面倒なので、必ず設定しましょう。
- **singularName**: 単数の場合の名前を定義します。通常は複数系の`「s」`を取り除いた形を指定します。`items`の場合は`item`です。この辺り、正直 OpenUI5 に慣れてないとピンとこないと思いますので、詳細は割愛します。

実装例)

```coffee

sap.ui.core.Control.extend "mitsuruog.BlueContainer",

  metadata:
    properties:
      boxColor:
        type: "string"
        defaultValue: "#CBE6F3"
    events:
      hover: {}
    aggregations:
      items:
        type: "sap.ui.core.Control"
        multiple: true
        singularName: "item"

    renderer: {}

    onmouseover: (evt) ->
      @fireHover()
```

詳細は公式ベージを確認してください。

- メタデータについての詳細
  [Defining the Control Metadata](https://openui5.hana.ondemand.com/#docs/guide/7b52540d9d8c4e00b9723151622bbb64.html)
- メタデータを定義した場合、使用しない方がいいメソッド名についての注意事項など
  [Adding Method Implementations](https://openui5.hana.ondemand.com/#docs/guide/91f0a8dc6f4d1014b6dd926db0e91070.html)
- Properties の指定方法の詳細
  [Defining Control Properties](https://openui5.hana.ondemand.com/#docs/guide/ac56d92162ed47ff858fdf1ce26c18c4.html)

## 3. レンダラの実装

レンダラとは実際に UI コントロールの HTML を出力する部分です。HTML を書き出す際は、内部的に`sap.ui.core.RenderManager`の各メソッドを呼び出します。良く使いそうなものはこちらです。

- **write**: HTML を出力します
- **writeEscaped**: エスケープして HTML を出力します
- **writeControlData**: OpenUI5 上が内部で UI コントロールを管理するための ID を出力します。これが無い場合、内部のイベントがハンドルできません。結構重要です。
- **addStyle**, **writeStyles**: インラインスタイルを出力します
- **addClass**, **writeClasses**: CSS クラスを出力します
- **renderControl**: 与えられた UI コントロールのレンダラを実行します。Aggregations(Associations)あたりで使うようです。

実装例）

```coffee
sap.ui.core.Control.extend "mitsuruog.BlueContainer",

  metadata:
    # 省略

  renderer: (rm, control) ->

    rm.write "<div"
    rm.writeControlData control
    rm.addClass "blue"
    rm.writeClasses()
    rm.write ">"

    # Aggregations(Associations)のデータはこうやって受け取る
    items = control.getContent()

    for item in items
      rm.write "<div"
      rm.addStyle "display", "inline-block"
      rm.addStyle "border", "1px solid #{control.getBoxColor()}"
      rm.addStyle "margin", "7px"
      rm.addStyle "padding", "7px"
      rm.writeStyles()
      rm.write ">"

      rm.renderControl item
      rm.write "</div>"

    rm.write "</div>"
```

ある程度書き慣れてくると、レンダラについてはお決まりのパターンが見えてくるでしょう。また、似たような OpenUI5 のソースを読むのもいいと思います。
詳細は公式ページを参照してください。

[JsDoc Report - SAP UI development Toolkit for HTML5 - API Reference - sap.ui.core.RenderManager](https://openui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.RenderManager.html)

## 4. 配布、利用

配布方法は UI コントロールを 1 つの Javascript ファイルにまとめて`index.html`で読み込めばいいと思います。
OpenUI5 には`RequireJS`のようなモジュールシステムがあるので、以下のようにモジュール化して呼び出し先でロードします。

```coffee
#
# カスタムUIコントロール側
#
jQuery.sap.declare "com.mitsuruog.sapui5.showroom.controls.BlueContainer"

sap.ui.core.Control.extend "mitsuruog.BlueContainer",

  # 以下、省略


#
# 呼び出し側
#
jQuery.sap.require "com.mitsuruog.sapui5.showroom.controls.BlueContainer"

sap.ui.jsview "someView",

  createContent: (oController) ->

    # new でUIコントロールを初期化します。
    blueContainer = new mitsuruog.BlueContainer

    # 以下、省略

```

## 5. まとめ

今回は新しい UI コンポーネントを作成する方法について説明しました。
実装の細かい部分は Github 上のサンプルを参照してください。

- UI コンポーネント側
  - [https://github.com/mitsuruog/sapui5-showroom/tree/master/coffee/controls](https://github.com/mitsuruog/sapui5-showroom/tree/master/coffee/controls)
- UI コンポーネント利用側
  - [https://github.com/mitsuruog/sapui5-showroom/blob/master/coffee/view/Controls.view.coffee](https://github.com/mitsuruog/sapui5-showroom/blob/master/coffee/view/Controls.view.coffee)
  - [https://github.com/mitsuruog/sapui5-showroom/blob/master/coffee/view/Controls.controller.coffee](https://github.com/mitsuruog/sapui5-showroom/blob/master/coffee/view/Controls.controller.coffee)

私が普段利用している OpenUI5 のモバイル用ライブラリ(sap.m〜)では v1.22 の時点で 73 の UI コントロールを持っています。OpenUI5 自体の UI が優れているため、新規で UI コントロールを作成するケースはあまりないように思えます。  
また、レンダラを実装していると Java の taglib を思い出して、軽いめまいを覚えますね。(まぁそこは置いといて。)

経験的にも良くあるケースとしては、既存の UI を少しカスタムしたいケースだと思います。  
その辺りは[後編](/2014/10/sapui5openui5ui/)にて取り上げたいと思います。
