---
layout: post
title: "[SAPUI5/OpenUI5]ODataとOpenUI5でWebシステムを作るチュートリアルをつくりました"
date: 2014-07-26 22:28:29 +0900
comments: true
tags:
  - Northwind
  - OData
  - ODataService
  - OpenUI5
  - SAPUI5
---

国内での OpenUI5 の注目度の低さに涙が出そうです。でも頑張ります。  
今回は「OpenUI5 と OData を使ってどのように Web システムを作成するか」というチュートリアルを作って見ました。

内容はこちらです。  
[http://mitsuruog.github.io/Openui5-with-OdataService/](http://mitsuruog.github.io/Openui5-with-OdataService/)

Gtihub：  
[https://github.com/mitsuruog/Openui5-with-OdataService](https://github.com/mitsuruog/Openui5-with-OdataService)  
良かったら Github で Star 付けたり、SNS でシェアしてくださいね。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/openui5odata1.png)

> (2014/11/13 追記)  
> このネタで[HTML5Experts.jp](http://html5experts.jp)に寄稿しました。こちらの方が分かりやすく書いてあると思います。  
> [実例から考える、HTML5 時代のエンタープライズ・アーキテクチャ | HTML5Experts.jp](http://html5experts.jp/mitsuruog/9518/) > ![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/exjp_odata.png)

## 目次

## 1. OData とは？

OData とは、  
「Web システムにおける、フロントエンドとバックエンドとの面倒な Ajax 問い合わせの手続きを標準化したプロトコル」

皆さん、Web システムを構築する際に WebAPI に渡すパラメータを独自設計していると思いますが、パラメータを含めたバックエンドへのデータアクセスの手順を標準化しているものです。

Web 版、ODBC と例えるとイメージしやすいと思います。

## 2. なぜ OData と OpenUI5 なのか？

なぜ、OData と OpenUI5 なのかという背景についてです。

OpenUI5 は SAPUI5 という SAP 社が作成した HTML5 ベースの UI フレームワークです。  
OpenUI5 はオープンソースですが、SAPUI5 は「SAP Netweaver Gateway（以下、Gateway）」の UI アドオンとして配布されています。元々、Gateway は ERP に代表される SAP Suite と呼ばれるバックエンドの SAP 製品群と接続し、WebAPI のインターフェースを簡単に作成するための製品（ミドルウェア）です。

SAP 自体が OData の業界標準化に向けて力を入れていることもあり、Gateway は元々 OData サポートしてました、SAPUI5 は Gateway 上で動作する前提で作られている関係で
OData を標準でサポートしています。  
このような経緯もあり、SAPUI5 の流れを組む OpenUI5 は OData と非常に親和性が高いのです。

## 3. 注目度が低い OData

ところで OData 知ってましたか？

私は OpenUI5 を触るまで OData の存在を全く知りませんでした。検索しても WCF など.Net 系の情報が少しヒットするくらいで、フロントエンドを絡めた日本語の情報はほとんどヒットしません。

OData の仕様は一見非常に難解です。OData の仕様に則ったデータアクセスの URL を見てみましょう。

こちらは「CompanyName」を「Alfr」で前方一致検索するためのクエリです。

```
http://services.odata.org/Northwind/Northwind.svc/Customers?$filter=startswith(CompanyName, ‘Alfr’) eq true
```

こんなものもあります。

```
http://services.odata.org/OData/OData.svc/Categories?$select=Name,Products&$expand=Products
```

`$select`とか`$expand`とは一体どんな意味があるのでしょうか。。。（詳しくはチュートリアルの中で触れています。）

OData はデータアクセスの方法を標準化することにより、様々なデータアクセスの要求に対して柔軟に対応できます。

昨今のアジャイル的な開発スタイルが増える中で、バックンドへのデータアクセス要求の変更が与える影響が URL パラメータで吸収できるポテンシャルがあることは、非常に興味深い仕様です。

しかし、この OData 独特のクエリをフロント側で生成することが非常に骨が折れるため、あまり普及しなかったように思います。

## 4. OData ＋ OpenUI5 の可能性

そこで現れたのが OpenUI5 という UI フレームワークです。

ここで言う UI フレームワークとは UI コンポーネントも持つもので、WebAPI から取得したデータを元に自動で UI を構築し、UI 側の操作をダイレクト URL へ変換してバックエンドに連携できる機能を持っています。（以下、双方向データバインディング）

OData が持つデータアクセス方法の標準化と UI フレームワークの双方向データバインディングが組合わせることで、フロント部分の多くがフレームワークで隠蔽できます。

従来のオープンソースを組み合わせた場合と比べ、データアクセスに関わる非常にセンシティブで難易度が高い部分実装がかなり省け、大規模なシステム開発においても比較的管理しやすく、安全に開発ができる可能性があり、非常に惹かれるものがあります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/openui5odata2.png)

## 5. まとめ

OData と OpenUI5 について少し関心を持っていただけたでしょうか？

昨今は、AngularJS が最も注目される Javascript フレームワークです。私も非常に大好きです。

しかし、企業向け Web システムとして見た場合、様々なオープンソースを組み合わせて構築するより、様々な機能を統合した「エンタープライズ UI フレームワーク」の方が、向いているのではないかと思っています。

そう考えると、フロントエンド開発の一般的な事例と我々エンタープライズでは少し評価の観点が違いますね。

非常に興味深いです。
