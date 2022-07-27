---
layout: post
title: "[SAPUI5/OpenUI5]カスタムUIコントロールを作成する方法(後編)"
date: 2014-10-04 23:56:00 +0900
comments: true
tags:
  - SAPUI5
  - OpenUI5
---

> How to create new own controls in OpenUI5(Part 2)

[前回](/2014/09/sapui5openui5ui)に引き続き、OpenUI5 にてカスタム UI コントロールを作成する方法の後編です。今回のパートは「既存の UI を拡張する」方法についてです。

今回のデモはこちらで参照できます。
[http://mitsuruog.github.io/sapui5-showroom/#/controls](http://mitsuruog.github.io/sapui5-showroom/#/controls)

<!-- more -->

こちらの公式ページの内容をもとに書いています。
[Developing UI5 Controls in JavaScript](https://openui5.hana.ondemand.com/#docs/guide/91f1703b6f4d1014b6dd926db0e91070.html)

### 目次

## 1. 既存 UI コントロールの継承

既存の UI コントロールを継承した新しい UI コントロールを作成していきます。基本的には extend することで継承が可能です。
下の例は、sap.m.Input を継承して「mitsuruog.NoisyInput」という UI コントロールを作成しています。

```
jQuery.sap.declare "com.mitsuruog.sapui5.showroom.controls.NoisyInput"

sap.m.Input.extend "mitsuruog.NoisyInput",
  metadata: {}
  renderer: {}
```

## 2. 新規機能の追加

継承した UI コントロールに対する新機能の追加は、新しい UI コントロールの追加と変わりません。
こちらは先ほどの mitsuruog.NoisyInput 新しい機能を追加する例です。

NoisyInput は、focusin した際に UI コントロールを左右にアニメーションする新しい Input コントロールです。外部から`beQuiet=true`を受け取ることで静かになります。

```
sap.m.Input.extend "mitsuruog.NoisyInput",

  metadata:
    properties:
      beQuiet:
        type: "boolean"
        defaultValue: false

  onfocusin: (evt) ->
    unless @getBeQuiet() then @addStyleClass "shake"

  onfocusout: (evt) ->
    unless @getBeQuiet() then @removeStyleClass "shake"
```

既存 UI コントロールの既存機能(イベントハンドラなどの関数)を上書きする場合は、同名の function を宣言した上で継承元の prototype 関数を呼び出します。

```
sap.m.Input.extend "mitsuruog.NoisyInput",

  metadata:{}
  # 省略...

  init: ->
    sap.m.Input.prototype.init.apply @, arguments

  onBeforeRendering: ->
    sap.m.Input.prototype.onBeforeRendering @, arguments
```

上の例は既存の init と onBeforeRendering に対して機能を追加する例です。この例では実際に機能を追加していませんが、雰囲気は掴めると思います。

## 3. レンダラの変更

新しい UI コントロールの新しい UI を作成します。基本的には renderer を定義して、中で既存 UI コントロールの renderer を呼び出しすれば良いです。

```
sap.m.Input.extend "mitsuruog.NoisyInput",

  metadata:{}
  # 省略...

  renderer: (rm, control) ->
    rm.write "<div class='mitsuruogNoisyInput'>"
    sap.m.InputRenderer.render.apply @, [rm, control]
    rm.write "</div>"
```

ただし、実態は既存 UI コントロールの renderer がどのように実装されているかに依存している場合が多く、確実に実装するためには OpenUI5 側のソースを一度確認したほうがいいです。
OpenUI5 のコンロールの場合は、コントロールクラスの近くに「`〜Renderer-dbg.js`」があるのでこれを見ます。(-dbg)が付いているものが minify されていないものです。

例）
Input.js -> InputRenderer-dbg.js
Label.js -> LabelRenderer-dbg.js

既存の renderer を確認すると、外部から renderer のライフサイクルに対してフックするための I/F を備えているもの(sap.m.Input など)があります。
その場合は新しい UI コントロールの renderer 内から I/F 名を指定して機能を追加していきます。

次の例では、既存の addInnerStyles が実行される前に、Input コントロールの外見を変更する指定をしています。

> (inner や outer があるのは、OpenUI5 の UI コントロールは外側を div コンテナで囲う場合が多いからです。外側のコンテナを outer、内側の UI コントロールを inner と表現しています。)

```
sap.m.Input.extend "mitsuruog.NoisyInput",

  metadata:{}
  # 省略...

  renderer:
    addInnerStyles: (rm, control) ->
      rm.addStyle "background-color", "#23AC0E"
      rm.addStyle "border-radius", "7px"
```

ただし、既存の renderer を変更することは良くありません。既存の renderer の前後に機能を追加するか、フック用の I/F を利用するようにしてください。
既存の renderer を変更する必要な場合は、継承せず新規で UI コントロールを作成した方がいいと思います。

## 4. 配布、利用

配布方法は、新規 UI コントロールを作成する場合と変わりありません。

継承元のクラスがロードされていないケースを想定し、予防的に`jQuery.sap.require`にてクラスをロードする記述を書いておいた方がいいと思います。

## 5. まとめ

2 回に分けて OpenUI5 にて新しい UI コントロールを作成する方法を紹介しました。
OpenUI5 はフレームワーク側の仕組みが複雑であるために、正しい方法を理解せず、カスタムしようとすると必ず手痛い失敗をします。(経験談)

OpenUI5 多くの優れた UI コントロールを持っているため、本来であれば無理にカスタムせず、OpenUI5 のコンポーネントの機能の範囲内で UI を構築していく方がベストですが、カスタムの方法も知っておくと、一気に利用の幅が広がると思います。
