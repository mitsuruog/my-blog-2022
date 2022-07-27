---
layout: post
title: "MQTTクライアントをブラウザ上で動かす"
date: 2015-02-05 23:41:35 +0900
comments: true
tags:
  - mqtt
  - mows
  - Iot
  - wot
---

最近 MQTT が気になっているので、実際にクライアントを作ってブラウザ上で動かしてみました。  
作ったデモは<http://mitsuruog.github.io/what-mqtt/>で動かすことが出来ます。  
内容薄い記事なので、デモだけも動かして MQTT の雰囲気感じてもらえればと思います。

> ブラウザ上で動作するか検証するのが目的だったのですが、いざ作ってみたら Web ページが思ったよりリッチになってしまいました。フロントエンド屋はそんなもんですよねー w

<!-- more -->

## MQTT とは

MQTT は PUB/SUB 型のプロトコルで、従来の HTTP より軽量・省電力であることから、センサーなどの機器で永続的に発生する小さいデータを送受信する用途に向いているとされています。もともとは IBM が仕様を作っていました。

もうすでに[時雨堂さん](https://shiguredo.jp/news/20141209/)で商用化されてますし、MQTT は仕様自体が小さいため、良質な日本語の記事が多い印象です。
次に紹介する記事を読むとなんとなく全容がわかるかと思います。

- [IoT に最適化された MQTT プロトコルとそれを実現する技術(PDF)](http://ngm2m.jp/m2m/files/symp2014_suzuki_pm.pdf)
- [MQTT についてのまとめ — そこはかとなく書くよん。](http://tdoc.info/blog/2014/01/27/mqtt.html)
- [Mosquitto(MQTT)を動かしてみた - 人と技術のマッシュアップ](http://tomowatanabe.hatenablog.com/entry/2014/04/21/095650)
- [初めての MQTT](https://gist.github.com/voluntas/89000a06a7b79f1230ab)
- [MQTT と JavaScript - @ledsun blog](http://ledsun.hatenablog.com/entry/2014/08/13/141908)

## Node で動かす

フロントエンドエンジニアが最も簡単に MQTT を動かすためには、Node.js 上で[mqttjs/MQTT.js](https://github.com/mqttjs/MQTT.js)を使うのが一番簡単だと思います。モジュールを`npm install`して、少しスクリプトを書くと動きます。

```
npm install mqtt --save
```

hello_mqtt.js

```js
var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

client.subscribe("presence");
client.publish("presence", "Hello mqtt");

client.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString());
});

client.end();
```

## MQTT on Websocket

Node.js 上では簡単に動作する MQTT ですが、ブラウザ上で動作するためには MQTT を Websocket で置き換えて動かすのが一般的のようです。

- [MQTT over WebSockets](http://test.mosquitto.org/ws.html)
- [MQTT over Websockets with HiveMQ](http://www.hivemq.com/mqtt-over-websockets-with-hivemq/)

軽量で双方向通信を得意としているということで、Websocket と機能的に被るところがあると思っていたのですが、`Websocket vs MQTT`の関係ではなく、ブラウザ上では仲良く共存させるようです。

> MQTT は TCP/IP 上で動作して HTTP と同列なので、よく考えれば当然だったのですが。。。

Websocket の上を MQTT が走ることですべてのブラウザが MQTT デバイスになることができます。そんな凄い未来なのかイマイチ想像できませんが・・・今回は[mcollina/mows](https://github.com/mcollina/mows)を使いました。

```js
var mows = require("mows");
var client = mows.createClient("ws://test.mosquitto.org:8080/mqtt");

client.subscribe("presence");
client.publish("presence", "Hello mqtt");

client.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString());
});

client.end();
```

Node.js で動かしたときとあまり大差ないですね。`mows`は内部的に`MQTT.js`の API をコールしています。

注意する点としては接続先のプロトコルが`mqtt://`から`ws://`に変わっているとこでしょうか。Broker によっては`mqtt://`と`ws://`での接続先ポートが異なる場合がありますので、ご注意ください。  
また、Broker が Websocket に対応している必要があります。

## まとめ

MQTT クライアントをブラウザ上で動かすには Websocket を使うという話でした。先日行われた[HTML5 Conference 2015](http://events.html5j.org/conference/2015/1/)でも IoT 系のセッションが多く、今年のトレンドは IoT 一色だなと感じています。

デモの Web ページでは mosquitto 社が提供するテスト用の Broker に接続しています。チャットアプリ程度ではまだ MQTT の本当の価値って気付きにくいですが、ノード側で配置さえるセンサー機器を想像すると、Topic の考え方ってマッチしているなと思う次第です。  
一番身近なところでは Facebook messenger でつかっているそうです。

こちらの記事も参考になりますよー。

- [IoT 時代を支えるプロトコル「MQTT」（前編）：CodeZine](http://codezine.jp/article/detail/8000)
- [IoT 時代を支えるプロトコル「MQTT」（中編）：CodeZine](http://codezine.jp/article/detail/8019)
- [IoT 時代を支えるプロトコル「MQTT」（後編）：CodeZine](http://codezine.jp/article/detail/8020)
- [MQTT(本家)](http://mqtt.org/)
