---
layout: post
title: "[SAPUI5/OpenUI5]大きくなりがちなViewのコードをFragmentsでパーツ化して賢くViewを構築する"
date: 2014-05-06 23:52:39 +0900
comments: true
tags:
  - OpenUI5
  - SAPUI5
---

先日、SAPUI5 のバージョンが 1.20 になりました。

SAPUI5 にて UI 部品が多い View を構築する場合、すぐに 1000 行を超えるような巨大 Javascript ファイルになってしまうのですが、Fragments と呼ばれる UI をパーツ化して再利用するための機能があります。

今回は、この Fragments について実際の利用シーンをイメージしながら紹介します。

<!-- more -->

## 目次

## はじめに

最近、SAPUI5 を生の Javascript で書くと「}」とか「)}」とかしんどいので coffeeScript で書いて楽しています。また、すべてのソースコードをのせると非常に冗長なため、抜粋したソースコードを載せています。実際に動作するサンプルとソースコードは GIthub 上にありますので、そちらを参照してください。

サンプル
<http://mitsuruog.github.io/sapui5-showroom/#/fragment>

ソースコード

- CoffeeScript
  - [https://github.com/mitsuruog/sapui5-showroom/tree/master/coffee](https://github.com/mitsuruog/sapui5-showroom/tree/master/coffee)
- Javascript
  - [https://github.com/mitsuruog/sapui5-showroom/tree/master/app](https://github.com/mitsuruog/sapui5-showroom/tree/master/app/view)

## 1.Fragments とは

「Fragments」とは「断片、破片」という意味で、文字通り UI をパーツとして分割する機能です。公式ドキュメントはこちらです。

[https://sapui5.hana.ondemand.com/sdk/#docs/guide/36a5b130076e4b4aac2c27eebf324909.html](https://sapui5.hana.ondemand.com/sdk/#docs/guide/36a5b130076e4b4aac2c27eebf324909.html)

SAPUI5 での Fragments とは View と同じようなものですが、Controller を作成する必要がありません。従って、基本的に UI 部分をパーツ化して再利用するために利用するものです。ロジックまで再利用したい場合は、素直に View にしてしまった方がいいでしょう。

## 2.基本的な使い方

Fragments を使うためには、まず「sap.ui.jsfragment」を継承してオリジナルの Fragments を定義していき、Fragments を View（以下、ownerView）にて呼び出して初期化し、View のコンテンツとして追加します。

まず、Fragments を定義していきます。

Edit.fragments.coffee

```
sap.ui.jsfragment "util.Edit",

  createContent: (oController) ->

    # ここに普通のJSViewのcreateContentと同様にUIコントロールを追加して
    # 最後にreturnします。

```

次に、ownerView 側で Fragments を呼び出します。

Fragments1.view.coffee

```
sap.ui.jsview "view.Fragment",

  getControllerName: ->
    "view.Fragment"

  createContent: (oController) ->

    @page = new sap.m.Page
      title: "Fragment Sample"

    # Fragmentsを呼び出します
    fragment = sap.ui.jsfragment "util.Edit", oController
    @page.addContent fragment

    @page

```

Fragments を初期化する際の第 2 引数の oController は、Fragment にて参照する Controller を渡してください（詳細は後述）。参照が無い場合は、当然 null となります。（渡した方が後のこととか考えると無難です。）
また、この例の場合、SAPUI5 が呼び出す際のエイリアス名が「util.Edit」となるため、物理ファイル名と配置場所は「util/Edit.fragment.js」となります。〜fragments.js が接頭語だと思ってください。物理ファイルの配置場所とファイル名には特に注意が必要です。

基本的は使い方は以上です。

## 3.実際の利用シーン

では、実際のアプリケーションでの使いどころとしてはどのようなシーンがあるでしょうか。少し触って見た感じだと、以下の 2 つで使えそうです。

### 3.1 画面内での入力 UI と参照 UI の切り替え

このケースでは、1 画面で入力 UI と参照 UI の切り替え。用途としては、登録（変更）処理後に参照画面に切り替わるような、業務システムでよくあるシーンです。
SAPUI5 にてアプリケーションを構築した場合、MVC コンセプトに基づき View 部分と実際の表示データである Model は完全に分離され管理されています。
入力用と参照用の UI にて同じ Model を参照している場合、1 つの View 側で UI を切り替えた方がスマートだと最近考えています。

まず、参照用の Fragments を定義していきます。登録用の Fragments は先ほどの「Edit.fragments.coffee」を使います。

Detail.fragments.coffee

```
sap.ui.jsfragment "util.Detail",

  createContent: (oController) ->

    # ここに普通のJSViewのcreateContentと同様にUIコントロールを追加して
    # 最後にreturnします。

```

最後に、controller にて Fragments 呼び出し処理を行います。

Fragments2.controller.coffee

```
sap.ui.jsview "view.Fragment",

  getControllerName: ->
    "view.Fragment"

  createContent: (oController) ->

    @page = new sap.m.Page
      title: "Fragment Sample"

    # Fragmentsを呼び出します
    # -> controllerで呼び出すようにします
    #fragment = sap.ui.jsfragment "util.Edit", oController
    #@page.addContent fragment

    @page

```

次に、ownerView 側のボタンで UI の切り替えを行うため、ownerView で行っていた Fragments 呼び出し処理を、controller で行うようにします。

Fragments2.view.coffee

```
jQuery.sap.require "sap.m.MessageToast"

sap.ui.controller "view.Fragment",

  _fragments: {}
  _mode: "Detail"

  _getFragments: (name) ->
    #fragmentsを取得してキャッシュ
    unless @_fragments[name]
      @_fragments[name] = sap.ui.jsfragment "util.#{name}", @
    @_fragments[name]

  _toggleFragment: (name) ->
    fragment = @_getFragments name
    container = sap.ui.getCore().getElementById "fragContainer"
    #コンテナの0番目にfragmentsで取得したFormを追加します
    #[MEMO]ここではViewの中のContentはfragmentsのみの想定で書いています
    #[MEMO]Contentが複数ある場合は、removeContentとinsertContentのindexを変更してください
    container.removeContent 0
    container.insertContent fragment, 0
    @_mode = name

  onInit: ->
    @_toggleFragment "Detail"

  #入力用と参照用のFormを切り替る処理
  pressedToggle: (oEvt) ->
    if @_mode is "Detail"
      @_toggleFragment "Edit"
    else
      @_toggleFragment "Detail"
```

ここでの removeContent と insertContent は View の中で Content となる UI パーツが Fragments1 つのみの前提で書いています。
また、Fragments を切り替えるコンテナを作成して、固有の ID を振って Javascript 側からいつでもフックできるようにするといいでしょう。

### 3.2 ダイアログ UI の再利用

このケースでは、選択用などのダイアログ UI を再利用します。単純なものではなく少し UI パーツが多いダイアログを再利用するとさらに効果的です。
先ほどと同様にダイアログ用の Fragments を定義していきます。

Dialog.fragments.coffee

```
sap.ui.jsfragment "util.Dialog",

  createContent: (oController) ->

    dialog = new sap.m.Dialog
      title: "Dialog"
      content: [

        #入力用のFragmentsを再利用します

        sap.ui.jsfragment "util.Edit", oController
      ]
      beginButton: new sap.m.Button
        type: "Accept"
        text: "OK"
        press: [oController.pressedOk, oController]
      endButton: new sap.m.Button
        text: "NG"
        press: [oControl

```

ダイアログの中身のコンテンツは先ほど定義した Edit.fragments.js を再利用しています。こんなところでも Fragments いい仕事しています。

Fragments 側から Controller の function を呼び出していると思います。
これは、Fragments を初期化する際に Controller の参照を渡す事で、Fragments 側から OwnerView の Controller の function を呼び出すことが出来ます。

> この場合、OwnerView 側で Fragments が使う function を知っていて実装する必要があります。Java でいうインターフェースと同じような感覚なのですが、いかんせん動的型付け言語なのでチェックが緩いです。Controller に function が存在しない場合は当然、実行時に落ちます。
> 次に ownerView の controller にて Fragments を呼び出します。ownerView にてダイアログを開くボタンを押した際にダイアログを open します。

Fragments3.controller.coffee

```
jQuery.sap.require "sap.m.MessageToast"

sap.ui.controller "view.Fragment",

  _fragments: {}

  _getFragments: (name) ->
    #fragmentsを取得してキャッシュ
    unless @_fragments[name]
      @_fragments[name] = sap.ui.jsfragment "util.#{name}", @
    @_fragments[name]

  onInit: ->

  #ダイアログを表示します
  openDialog: (oEvt) ->
    dialog = @_getFragments "Dialog"
    dialog.open()

  #ダイアログでOKをPressした時の処理
  pressedOk: (oEvt) ->
    oEvt.getSource().getParent().close()
    sap.m.MessageToast.show "pressed OK"

  #ダイアログでNGをPressした時の処理
  pressedNg: (oEvt) ->
    oEvt.getSource().getParent().close()
    sap.m.MessageToast.show "pressed NG"
```

Fragments にて OK/NG ボタンを押した場合の処理は、Controller に記述して処理させています。

## 4.まとめ

Fragments とは以前から SAPUI5 にあった機能ですが、「Experimental（実験的）」な機能に分類されていました。1.20 からはめでたく Experimental でなくなったので、やっと実戦で投入できるようになりました。

SAPUI5 にて UI 部品が多い View を構築する場合、すぐに 1000 行を超えるような JS ファイルになってしまうのですが、このように Fragments を使うことで UI 部品をパーツで切り離して利用できるようになります。  
（行数が多いのは SAPUI5 に限ったことではありません、Javascript で View を作成する UI フレームワークはそうなりやすいです。）

また、UI を部品化することでアプリケーション内での再利用が進み、開発効率と品質面で一定のアドバンテージがあると思います。
巨大化しやすい View をいかにパーツ化して再利用しながらアプリケーションを構築していくのが、SAPUI5 に限らず UI フレームワークでアプリケーションを構築する際のポイントだと最近感じています。
