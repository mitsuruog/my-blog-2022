---
layout: post
title: "websocketを使う際の意外な落とし穴"
date: 2012-10-20 20:00:00 +0900
comments: true
tags:
  - nodejs
  - websocket
---

本ブログは[東京 Node 学園祭 2012 アドベントカレンダー](http://atnd.org/events/33022)の 6 日目の記事です。

今回は[nodejitsu](http://nodejitsu.com/)を使って sockect.io を使ったアプリをホスティングしたところ、websocket（以下、ws）まわりで思わぬハマりポイントがあったというお話しをします。  
（同じようなトラブルで悩む方に少しでもヒントをあげられたらと考えています。）

<!-- more -->

### このエントリでお伝えしたいこと。

1. ws 通信は 443 ポート（wss）で行った方が良い。
2. ws のみがブロックされた場合に socket.io が怪しい挙動をする…（Help me!）
3. nodejitsu なかなか好いよ。

## ws 通信は 443 ポート（wss）で行った方が良い。

既に周知の事実かもしれませんが、通常の HTTP（80 ポート）を使って ws 通信を行った場合、
サーバから送信された ws の通信データが、クライアントのブラウザに到達する前に（セキュリティソフト、firewall、proxy…などなど）ブロックされることがあります。  
（詳しく知りたい方は[こちらのエントリ](https://github.com/LearnBoost/socket.io/wiki/Socket.IO-and-firewall-software)を読んでみてください。）

サーバを正しく実装したにも関わらず ws が届かないようなときは、そもそもクライアントが ws 受信できる状態なのか、次の 2 つのサイトにて確認してみてください。

- [http://websocketstest.com/](http://websocketstest.com/)（ws と Comet の疎通確認ができるサイトです。）
- [http://wsping.jit.su/](http://wsping.jit.su/)（nodejitsu の websoketPing サイトです。）

例えばですが、80 ポートの ws がブロックされている場合は次のような結果となります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2012/comp.png)

で、厄介なのが、セキュリティソフトにてブロックされている場合で、
ws の疎通確認自体は OK なのですが、ws がなぜか届かない状態となってしまったので、原因を特定するのに少し時間がかかりました。

_（私の場合はウイルスバスタークラウド 2012 がブロックしていました。**こちらについては Trend Micro のサポートとやりとりしているので、**何か進展あっておもしろそうだったら書くかもしれません。）_

## ws のみがブロックされた場合に socket.io が怪しい挙動をする…

さて、nodejs で ws 使う際は socket.io を使うのがデファクトとなっているのは皆さんご存知だと思います。
socket.io ではクライアントが ws 使えない場合、通信手段を ws から XmlHttpRequest などに自動でダウングレードしてくれる便利機能があるのですが、今回のように ws のみがブロックされるような場合、そのダウングレード機能がうまく働きませんでした。

ws の正しい挙動としては、まず http でハンドシェイクを行い、ハンドシェイクができた後に ws にプロトコルを変更して通信する流れなのですが、どうやらハンドシェイクを確立した後に ws のみがブロックされている場合、socket.io にて通信手段の変更ができないようです。

（念のため、Chrome で取ったヘッダーとか載せときますね。）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2012/block.png)

```txt
Request URL:ws://wsping.jit.su/socket.io/1/websocket/dL7NXuBCnWhqnZMPAYkU
Request Method:GET
Status Code:101 Switching Protocols
Request Headersview source
Connection:Upgrade
Host:wsping.jit.su
Origin:http://wsping.jit.su
Sec-WebSocket-Extensions:x-webkit-deflate-frame
Sec-WebSocket-Key:4EjkGu1WajTwi0MOvQjOyw==
Sec-WebSocket-Version:13
Upgrade:websocket
(Key3):00:00:00:00:00:00:00:00
Response Headersview source
Connection:Upgrade
Sec-WebSocket-Accept:lbl4DxvLmfnTm2okzQxld/Yb/sE=
Upgrade:websocket
(Challenge Response):00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
```

正直、この挙動が仕様なのかバグなのか、それとも私の実装が悪いのか判断できず、一度詳しい方の見解を聞いてみたいです。（Help me!）

今回の件で、改めて新しいプロトコル導入期のライアント周辺環境（N/W とかセキュリティとか）の課題が大きいなと感じました。（SPDY もそうなんですが･･･）
現状、より多くのユーザの元に socket.io を使った通信を届けるためには、ws の通信を wss とするか、通信手段を XmlHttpRequest などにダウングレードするのが無難なのかもしれません。

（ちなみに先に紹介した nodejitsu の websocketPing サイトですが、ws が届いていない人も URL を https に変えてアクセスすると届いたりします。）
（ちなみに、私は windows ユーザなので、ならではの話題だったりして･･･）

## nodejitsu なかなか好いよ。

最後に 2 か月くらい[nodejitsu](http://nodejitsu.com/)使って遊んでますが。良かった点を書き連ねてみます。（CEO の[
Charlie Robbins 氏](https://twitter.com/indexzero)も来ることですし。）

- websocket が使える。
- 無料期間は 1 ヵ月。Micro プランで月$3。（円高最高！）
- jitsu を使ったクラウド上へのデプロイがシンプルで簡単（ただし、package.json にモジュールの依存関係を正しく書くこと）。
- サーバ側の実装を変えずに https 対応（ws も wss となる）できる。

実は nodejitsu、初めの頃は結構不安定（落ちてたり、デプロイできなかったり。。。）で「なんだかな～」と思った時期もあったのですが、9 月のアップデート以降は安定してます。

それから、まだ周辺ツール（ログの監視とか）がまだ充実してない印象があるので、これからの進化に期待といったとこでしょうか？
とにかく、これから nodejs 始める方は使ってみてはいかがでしょうか？

> **修正（2012/10/21)**  
> Jxck さんの指摘反映  
> websocket のセキュアなプロトコルは https ではなく wss。
