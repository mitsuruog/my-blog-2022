---
layout: post
title: "Angular2を最速でHerokuにDeployするMinimum Starter Kitを作成してみた"
date: 2016-02-21 23:43:00 +900
comments: true
tags:
  - angular2
  - heroku
  - vscode
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/angular2.png
---

Angular2 学習のため、大量に素振りする必要がでてきたので、素振り用の StarterKit を作成してみました。

これから学習する方は、公式の[5 Min Quickstart](https://angular.io/docs/ts/latest/quickstart.html)を最初にやる場合が多いと思うので、ベースは 5 Min Quickstart を利用しています。
その上で、気軽に Heroku へ Deploy して公開できるよう工夫しました。

[mitsuruog/angular2-minimum-starter: Minimum starter kit for angular2](https://github.com/mitsuruog/angular2-minimum-starter)

<!-- more -->

## 5 Min Quickstart から Heroku Delpoy への道

公式の[5 Min Quickstart](https://angular.io/docs/ts/latest/quickstart.html)は、学習するための環境としては十分なのですが、
Heroku へ Deploy するために少し工夫が必要でしたので手順を紹介します。

### Heroku 上での devDependencies のインストール

Heroku は Deploy する前、`package.json`に書かれている`dependencies`の内容をインストールしますが、通常は`devDependencies`をインストールしません。

そのため、Heroku 上の`NPM_CONFIG_PRODUCTION`設定を無効にする必要があります。

```
heroku config:set NPM_CONFIG_PRODUCTION=false
```

この設定は Heroku の GUI 上の Settings のタブからでも設定できます。

### Heroku 上での HTTP Server の導入

5 Min Quickstart には[johnpapa/lite-server](https://github.com/johnpapa/lite-server)という、
[Browsersync](https://www.browsersync.io/)をベースとした開発用の HTTP サーバーが含まれています。

しかし、lite-server 上で`Lightweight development only node server`と謳われているため、別途 HTTP サーバーを導入します。
今回は[indexzero/http-server](https://github.com/indexzero/http-server)を利用しました。

まず、`package.json`の`devDependencies`に追加します。

```
npm install http-server -D
```

次に、Heroku 上でアプリを開始する際に実行するコマンドを`package.json`に追加しておきます。

**package.json**

```diff
-    "start": "concurrent \"npm run tsc:w\" \"npm run lite\" "
+    "start": "concurrent \"npm run tsc:w\" \"npm run lite\" ",
+    "start-heroku": "concurrent \"npm run tsc\" \"npm run http-server\" "
```

最後に、Heroku がアプリを開始する際のコマンドを変更するため`Procfile`を作成し、先ほどのコマンドを設定します。  
(Node.js アプリの場合、Heroku はデフォルトで`npm run start`を実行するようになっています。)

**Procfile**

```
web: npm run start-heroku
```

こちらで、Angular2 のアプリを Heroku 上に Deploy できるはずです。

## まとめ

`gulp`や`grunt`などを利用するとローカルで build プロセスを実行することも可能ですが、素振り程度で依存するもどうかと思い簡単なものを作成してみました。

Angular2 学習のため、大量に素振りする必要がある人にはちょうどいいと思います。
