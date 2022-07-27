---
layout: post
title: "nodejitsuでカスタムドメインを使う方法"
date: 2012-10-31 22:16:00 +0900
comments: true
tags:
  - nodejitsu
  - nodejs
---

nodejitsu でホスティングした場合、ドメインは「_hoehoe_.jit.su」か「_hoehoe_.nodejitsu.com」（*hoehoe*は自分で決めれる。）となります。  
やっぱり自分で持ってるカスタムドメインで使いたいなと思ったので、やってみました。

<!-- more -->

とは言っても･･･
基本的に日本人で nodejitsu を使おうと思っているような人は、英語に抵抗がない部類の人だと思いますので、[ここのページ](http://dns.jit.su/)に書いている手順に沿ってサクッとやってしまうと思うのですが、nodejitsu の敷居を下げるために頑張ります。

## 1.nodejitsu.com の IP を調べる。

まず、nodejitsu.com の IP を調べます。私は windows ユーザーなので、黒い画面で ping コマンドを使います。

```
ping nodejitsu.com
```

おそらく、次の IP のうちのどれかが帰ってくると思いますので、メモしておきます。

```
165.225.129.253
165.225.130.235
165.225.130.237
165.225.130.238
165.225.130.239
165.225.130.240
165.225.130.241
165.225.131.4
165.225.131.5
```

## 2.ドメインを管理しているプロバイダの DNS を変更する。

私の場合は[GoDaddy](http://www.godaddy.com/)でドメイン持っているので、ここでの説明は GoDaddy をベースに行いますが他のプロバイダでも基本的にはやることは同じだと思います。

手順は GoDaddy の「DNS Manager」にて「A レコード」を変更します。

例えば、カスタムドメインが「mitsuruog.com」だったとして、

「mitsuruog.com」を nodejitsu のトップドメインとして使いたい場合は、次のような設定をします。

```
Host=@
Points to=1.で調べたIP（165.225.129.253とか）
```

カスタムドメインのサブドメイン（node.mitsuruog.com とか）を nodejitsu のトップドメインとして使いたい場合は、次のような設定をします。

```
Host=node
Points to=1.で調べたIP（165.225.129.253とか）
```

「TTL」は特に必要がなければそのままで、変更する必要はないと思います。

ちなみに、DNS を変更した場合、反映されるまで 48 時間くらい掛かります、気長に待ちましょう。
DNS が反映された場合、上のドメイン（`http://mitsuruog.com`とか）をブラウザで開くと、nodejitsu の 404 ページが表示されるようになりますので、目安にしてください。

## 3.package.json の変更

nodejitsu 側の設定はすべて package.json にて指定します。（さすが Paas！）

手順は package.json に上で指定したカスタムドメインを追加するだけです。

```
{
  "name": "mitsuruog",
  "subdomain": "mitsuruog",
  "domains": [
    "node.mitsuruog.com"
  ],
  "scripts": {
    "start": "./server.js"
  },


・・・（中略）・・・


  "engines": {
    "node": "v0.8.x"
  }
}
```

## 4.nodejitsu 上にデプロイ

最後は nodejitsu にデプロイして完了です。
黒い画面で操作してください。

```
jitsu login
jitsu deploy
```

以上の手順でカスタムドメインで運用できると思いますので、頑張ってみてください。
