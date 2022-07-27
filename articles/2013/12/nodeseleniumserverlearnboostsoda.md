---
layout: post
title: "NodeからSeleniumServerを動かすLearnBoost製クライアントがあるsoda"
date: 2013-12-19 23:44:00 +0900
comments: true
tags:
  - nodejs
  - Selenium
---

socket.io で有名な LearnBoost が公開している Node 製 SeleniumServer クライアントをさくっと紹介します。
だって、フロントエンドエンジニアは Javascript で Selenium 動かしたいんだもん。

この記事は[Selenium Advent Calendar 2013](http://www.adventar.org/calendars/128)の 19 日目の記事です。

前の記事は[[hinac0 さん]Selenium vs Mercury](http://0dan5.wordpress.com/2013/12/18/1-3/)

次の記事は[[らんさぶさん]Selenium Tips - つれづれなるままに。](http://dolias2010.hatenablog.com/entry/2013/12/20/012714)

<!-- more -->

1.  soda とは
2.  soda を使ってみる
3.  soda の注意点
4.  まとめ

## 1. soda とは

[soda](https://github.com/LearnBoost/soda)とは socket.io で有名な LearnBoost が公開している、Node 製 SeleniumServer クライアントです。
簡単に言うと、Selenium の実行コードを Javascript で書いて、Nodejs で実行するためのモジュールです。
公式では「**Selenium Node Adapter.**」と謳ってます。

# 2. soda を使ってみる。

（ちなみに、私の環境は Mac です。一応、会社の windows7 も動作してます。）

まず、SeleniumServer をインストールします。Mac の場合は brew で一発インストールです。
本当に brew 偉大。

```
brew install selenium-server-standalone
```

公式サイトからダウンロードしても、もちろん構いません。
[http://www.seleniumhq.org/download/](http://www.seleniumhq.org/download/)

brew でインストールすると起動用のコマンドが表示されまうので、一旦覚えておきます。
面倒なかたは ailas 張った方がいいでしょう。

```
java -jar /usr/local/opt/selenium-server-standalone/selenium-server-standalone-2.37.0.jar -p 4444
```

soda を動かす際は、事前に SeleniumServer を起動させておきます。

まさか、Selenium やるのに Firefox インストールしていない方はいないと思いますが、インストールしていない方はインストールしましょう。(自分がそうでした w)

それでは、サンプルのプロジェクトを作成して soda を動かしてみます。

適当なフォルダに soda を npm からインストールします。

```
mkdir soda-sample
cd soda-sample
npm init
npm install --save soda
```

プロジェクト直下に「google.js」ファイルを作成して、次のようなテストコードを書きます。

```js
/**
 * Module dependencies.
 */

var soda = require("soda"),
  assert = require("assert");

var browser = soda.createClient({
  host: "localhost",
  port: 4444,
  url: "https://www.google.co.jp/",
  browser: "firefox",
});

browser.on("command", function (cmd, args) {
  console.log(" \x1b[33m%s\x1b[0m: %s", cmd, args.join(", "));
});

browser.chain
  .session()
  .open("/")
  .type("q", "Hello World")
  .click("btnK")
  .waitForTextPresent("Hello World")
  .getTitle(function (title) {
    assert.ok(
      ~title.indexOf("Hello World"),
      "Title did not include the query: " + title
    );
  })
  .end(function (err) {
    browser.testComplete(function () {
      console.log("done");
      if (err) throw err;
    });
  });
```

後は node コマンドから起動してみます。

```
node google.js
```

そうすると、横で Firefox が勝手に起動してテストしてくれます。
正常にテストが行われた場合、ターミナルにはこのように表示されます。

```sh
mitsuruog:soda-sample mitsuruog$ node google.js
getNewBrowserSession: *firefox, https://www.google.co.jp/
http.createClient is deprecated. Use `http.request` instead.
open: /
type: q, Hello World
click: btnK
waitForTextPresent: Hello World
getTitle:
testComplete:
done
```

## 3. soda の注意点

このように簡単に Node から Selenium を呼び出せる soda ですがいくつか注意点があります。

まず、「http.createClient is deprecated. Use `http.request` instead.」が象徴しているように、ここ１年くらいメンテナンスされていません。また、Chrome など他の WebDriver には対応してないようです。つまり「Firefox only」です。

## 4. まとめ

Node で Selenium を起動できる Driver モジュール soda いかがだったでしょうか。

機能限定ながらフロントエンジニアが Javascript でテストコードを書けて Node で実行できるというのは、ハマればメリットがあると思いました。

また、Node から Selenium を起動できるものは他にも[wd（https://github.com/admc/wd/）](https://github.com/admc/wd/)というものがあり、他の WebDriver をサポートしているなど、機能が豊富でなかなか強力です。

機会があれば、こちらも紹介したいですね。
