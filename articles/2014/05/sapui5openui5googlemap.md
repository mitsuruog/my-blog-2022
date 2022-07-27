---
layout: post
title: "[SAPUI5/OpenUI5]GoogleMapと組み合わせる"
date: 2014-05-31 22:42:00 +0900
comments: true
tags:
  - GoogleMap
  - javascript
  - OpenUI5
  - SAPUI5
---

SAPUI5/OpenUI5 を使った場合、SAP のバックエンドのデータと、様々なオープンデータや Web サービスを組み合わせてクライアントマッシュアップさせたくなります。  
（今回は OpenUI5 を使いました。）

まず定番は GoogleMap でしょうか・・・  
普通に Page に Map を表示するサンプルは探せばあるのですが、ダイアログで Map を表示するサンプルが無かったので作ってみました。

<!-- more -->

サンプルはこちらです。

「Open Map」ボタンを押すと東京駅を中心としたマップが表示されます。

> サンプル jsbin で作成していたのですが、消えてしまいました。（残念）

## 目次

## 1.説明

基本的には、OpenUI5 の index.html に GoogleMap の API を利用するために Javascript を読み込むだけで準備は OK です。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="description" content="sap.m.DialogでGoogleMap" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="UTF-8" />

    <title>SAPUI5/OpenUI5 Google map Sample</title>

    <script
      id="sap-ui-bootstrap"
      src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
      data-sap-ui-libs="sap.m"
      data-sap-ui-theme="sap_bluecrystal"
    ></script>
    <script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
  </head>

  <body class="sapUiBody" id="content" />
</html>
```

次に、ダイアログを作成します。

```js
@dialog = new sap.m.Dialog
  title: "Google Map"
  content: [
    new sap.ui.core.HTML
      content: "<div id='mapConteiner'></div>"
  ]

  #ダイアログ閉じる処理
  beginButton: sap.m.Button
    text: "close"
    press: (evt)->
      evt.getSource().getParent().close()

  afterOpen: (evt)->
    #座標の作成
    latlng = new google.maps.LatLng 35.681382, 139.766084
    #マップの設定
    options =
      zoom: 15
      center: latlng
      mapTypeId: google.maps.MapTypeId.ROADMAP
    #MAP初期化
    map = new google.maps.Map document.getElementById("mapConteiner"), options

    #マーカーをマップにプロット
    marker = new google.maps.Marker
      position: latlng
      map: map

button = new sap.m.Button
  text: "Open Map"
  press: [(evt) ->
    @dialog.open()
   , @]

button.placeAt "content"
```

以下、ダイアログを作成する際に初期設定でなにを行っているかの説明です。

- content
  - GoogleMap を表示させるコンテナを作成します。ここでは`sap.ui.core.HTML`を使って直接`<div>`タグを出力しています。
- beginButton
  - 閉じるボタンの処理です。
- afterOpen
  - ダイアログが表示された後に Map を初期化して、座標をプロットしています。

Map 初期化のタイミングですが、Map コンテナの DOM が生成される前に初期化するとエラーになるので注意が必要です。
ちょっとしたら、Map コンテナの afterRendering イベントでも初期化できるかもしれません（未検証）。そっちの方が作りとしては奇麗な気がします。

## 2.最後に

今後、企業の社員にタブレットなどのモバイル端末を配布して、外での業務活動に活かすケースはますます増えると思います。  
GoogleMap との連携はよくありそうなシーンなのですが、他の Web サービスや既存の社内システムの情報などをマッシュアップすることで、変化の激しい時代に適応した、モバイルを有効活用したまったく新しい企業システムが誕生するのかと思うと、少しわくわくします。

以下、参考情報です。

### OpenUI5API

- [JsDoc Report - SAP UI development Toolkit for HTML5 - API Reference - sap.m.Dialog](https://sapui5.netweaver.ondemand.com/sdk/docs/api/symbols/sap.m.Dialog.htm)
- [JsDoc Report - SAP UI development Toolkit for HTML5 - API Reference - sap.ui.core.HTML](https://sapui5.hana.ondemand.com/sdk/docs/api/symbols/sap.ui.core.HTML.html)

### GoogleMap 関連

GoogleMap の使い方についてはこちらが丁寧です。  
（AjaxTower さん、毎度ありがとうございます！）

- [Google Maps 入門(Google Maps JavaScript API V3)](http://www.ajaxtower.jp/googlemaps/)

GoogleMap の API のスタートガイド（公式）

- [スタート ガイド - Google Maps JavaScript API v3 — Google Developers](https://developers.google.com/maps/documentation/javascript/tutorial?hl=ja)

### SAPUI5/OpenUI5 と GoogleMap のサンプル

- [【第 1 回】SAPUI5 と SAP NetWeaver Gateway によるマッシュアップ開発入門（序章） - SAP 技術ブログ | SAP ソリューションの REALTECH Japan（リアルテックジャパン）](http://solution.realtech.jp/blog/2013/10/sapui5sap-netweaver-gateway.html)
- [SAPUI5 Gateway and Google Maps | Experiences with SAP Gateway](http://mysapgw.wordpress.com/2012/05/19/sapui5-gateway-and-google-maps/)  
  （コードは中のリンク「google code」に入ってます。）
- [SAPUI5 with Google Maps | SCN](http://scn.sap.com/people/konstantin.anikeev/blog/2013/02/11/sapui5-with-google-maps)
