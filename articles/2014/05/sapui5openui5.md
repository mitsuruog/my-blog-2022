---
layout: post
title: "[SAPUI5/OpenUI5]イベントハンドラにパラメータを渡す"
date: 2014-05-25 23:28:00 +0900
comments: true
tags:
  - javascript
  - OpenUI5
  - SAPUI5
---

小ネタです。

SAPUI5/OpenUI5 では UI コントロールのイベント（press、tap、select など）が発火した場合、Controller にあるイベントハンドラを実行するような処理をよく書きます。  
この時にイベントハンドラに、自分がセットしたパラメータを渡したいケースがたびたびあるのですが、やっと方法が分かったのでメモしておきます。

<!-- more -->

## 目次

## 1.イベントインターフェースについて

まず、SAPUI5 でのイベントインターフェースについて説明します。  
SAPUI5 では View の中にボタンなどの UI コントロールを配置していくのですが、この時に UI コントロールから発生するどのイベントを処理するか定義することが出来ます。

公式ドキュメントを参照すると、必ず次の 3 パターンの I/F があるはずです。

1.  fnListenerFunction
2.  [fnListenerFunction, oListenerObject]
3.  [oData, fnListenerFunction, oListenerObject]

1 のパターンは View などにてイベントとイベントハンドラを同時に書く方法です。2 はイベントハンドラを Controller へ移譲する場合、3 が今回やりたいイベントハンドラにパラメータを渡す方法です。「oData」となっている部分にパラメータオブジェクトを設定してください。

I/F のパラメータの詳細については次の通りです。

- fnListenerFunction
  - イベントハンドラで実行される function です。イベントによって若干差異があるかもしれませんが、イベントハンドラの I/F は次のようになっていることが多いです。
- oListenerObject
  - イベントハンドラ実行時のコンテキストを指定します。イベントハンドラ内の this が指し示すオブジェクトを指定します。
- oData
  - イベントハンドラに渡すパラメータです。オブジェクトを設定してください。

## 2.イベントハンドラにパラメータを渡す

では実際にサンプルを動かしてみます。  
「Action」ボタンを押した場合に表示されるメッセージダイアログに「Hello :)」というメッセージを渡すようにしています。

サンプルはこちらです。

> サンプル jsbin で作成していたのですが、消えてしまいました。（残念）

Button の press イベント発火時の第 1 引数にオブジェクトを渡しています。分かると簡単です。この例では press イベントの中にイベントハンドラを記述していますが、Controller に処理を委譲する場合は次のようにしてください。

```js
press: [ message: "Hello :)", oController.doPress, oController]
```

```
button = new sap.m.Button
  text: "Action!!"
  press: [message: "Hello :)", (evt, param) ->
    jQuery.sap.require "sap.m.MessageToast"
    sap.m.MessageToast.show param.message
  ]

button.placeAt "content"
```

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="description" content="[add your bin description]" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="UTF-8" />
    <title>SAPUI5/OpenUI5 Sample</title>
    <script
      id="sap-ui-bootstrap"
      src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
      data-sap-ui-libs="sap.m"
      data-sap-ui-theme="sap_bluecrystal"
    ></script>
  </head>
  <body class="sapUiBody" id="content" />
</html>
```

## 3.最後に

基本的なことなのですが、探すのにとても時間が掛かりました。公式ドキュメントの量が非常に多いので、欲しい情報を探すのに毎度苦労します。:(

ちなみに、この内容はこちらのやり取りを参考にしています。

[SAPUI5: How do I pass values to an eventhandler | SCN](https://archive.sap.com/discussions/thread/3442827)
