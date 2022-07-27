---
layout: post
title: "Fiddler2でリバースプロキシしてNorthWindのOdataサービスをテストで使う"
date: 2014-04-02 00:47:00 +0900
comments: true
tags:
  - Fiddler2
  - OpenUI5
  - ReverseProxy
  - SAPUI5
---

様々な Web サービスをフロント側で組み合わせて 1 つのアプリケーションを作成することを「クライアントマッシュアップ」と言います。クライアントマッシュアップを行う上で避けて通れないのが、様々なドメインのリソースをフロント側で利用する場合の同一生成元ポリシー違反です。

同一生成元ポリシー違反の回避方法は色々あるのですが、今回は Fiddler2 を用いたリバースプロキシで回避する方法を紹介します。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/fiddler2.png)

1.  背景
2.  grunt-connect-proxy を使う
3.  Fiddler2 のリバースプロキシ機能を使う

## 1.背景

最近、SAPUI5 という SAP 製の UI フレームワークをよく使っています。バックエンドは SAP Netweaver Gateway が提供する ODataService を使うのですが、SAP 環境が手元に無い場合は、OData の Mock サーバの様なもので代替えする必要があります。ところが、無料で使える OData の Mock サーバって意外と無いんですよね。

という訳で、行き着いたのが NorthWind の無料 ODataService でした。

[http://services.odata.org/Northwind/Northwind.svc/](http://services.odata.org/Northwind/Northwind.svc/)

正攻法で攻めると localhost で実行している Web アプリケーションに対して、services.odata.org のドメインから取得したデータをマッシュアップするので、立派な同一生成元ポリシー違反が成立します。

そこで今回はリバースプロキシサーバーを立てて、サーバーで受け取ったリクエストの中で、特定の URL の一部（例えば「`http://localhost/Northwind`」の「`/Northwind/`」）にマッチしたリクエストを、NorthWind の OdataService に代わりに要求します。そして結果をフロント側に返します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/reverse.png)

異なるドメインへのリクエストを裏でプロキシサーバーが代替わりしてくれるため、フロント側から見ると、サーバーは localhost しか見えないようになり、同一生成元ポリシー違反にならないのです。

## 2.grunt-connect-proxy を使う

まず最初に試したことは、使い慣れた Grunt タスクを使うことでした。幸い、「grunt-contrib-connect」の兄弟分で「grunt-connect-proxy」というリバースプロキシが使えそうでしたので、試してみました。

- [gruntjs/grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect)
- [drewzboto/grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy)

ところが、何度も試行錯誤したのですがうまく行きません。調べて見るとこんな Issue が w。（まじ、windows で動かないってなんなのー！orz）

[Can't get proxy working with a basic test odata service: ECONNREFUSED · Issue #46 · drewzboto/grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy/issues/46)

という訳で違う方法を試すことにしました。

## 3.Fiddler2 のリバースプロキシ機能を使う

Windows には Windows の作法がある！早速、Microsoft 謹製のデバック用プロキシツール「Fiddler」を使う事にしました。
Fiddler2 でのリバースプロキシ作成方法の公式ドキュメントはこちらです。

[Use Fiddler as a Reverse Proxy](http://docs.telerik.com/fiddler/configure-fiddler/tasks/usefiddlerasreverseproxy)

レジストリを変更する方法と、直接ルールを変更する方法の 2 種類あるのですが、今回は URL に対する細かい指定を行いたいので、直接ルールを書き換える方法にしました。

Fiddler のメニューから「Rules > Customize Rules.」を選択すると、ルールを定義している設定ファイルが開くので、OnBeforeRequest の部分を書き換えます。書き換えると Fiddler にて自動的に新しいルールを読み込んでくれます。

ルール定義は次のように書きます。

```js
static function OnBeforeRequest(oSession: Session) {

  // ...

  //services.odata.orgへのリバースプロキシ設定
  //
  //localhostdで/Northwind/というコンテキストがある場合に
  //services.odata.org:80ドメインへリクエストを投げます。
  if (oSession.HostnameIs("localhost") && oSession.uriContains("/Northwind/")) {
    oSession.host = "services.odata.org:80";
  }

  // ...

}
```

これで、Web アプリケーションから「`http://localhost/Northwind/Northwind.svc/Categories`」にリクエストを投げた場合、プロキシサーバにて「`http://services.odata.org/Northwind/Northwind.svc/Categories`」のリソースを取得してくれます。

こちらの記事も参考になりました。

[Using Fiddler as a Reverse Proxy - Stack Overflow](http://stackoverflow.com/questions/9831044/using-fiddler-as-a-reverse-proxy)

ルールファイルの細かな設定方法はこちら。（ちょっと読みにくいです。）

[Fiddler Web Debugger - Script Samples](http://fiddlerbook.com/Fiddler/dev/ScriptSamples.asp)

リバースプロキシって素敵。

## 補足

ちなみに、SAPUI5 の eclipse プラグインには「SimpleProxyServlet」と呼ばれるリバースプロキシが内包されているので、Fiddler2 にてわざわざリバースプロキシを作成する必要はありません。これについても機会があれば紹介します。
