---
layout: post
title: "期限付きURLを発行してセキュアなS3のオブジェクトにアクセスしてみる"
date: 2015-06-03 00:14:49 +0900
comments: true
tags:
  - aws
  - s3
---

小ネタです。  
最近、真面目に aws を触っていて、今更ながら[Amazon Web Services クラウドデザインパターン 設計ガイド 改訂版](http://www.amazon.co.jp/gp/product/4822277372/ref=as_li_tf_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4822277372&linkCode=as2&tag=mitsuruog-22)を読み始めました。

本書を読んでみると、AWS について初めて知る機能も多く、本当に AWS を利用してシステム構築するためのバイブルのような本だなと感じました。  
(もっと早く読んでいれば・・・)

今回は、その中で S3 上のセキュアな環境下にある任意のオブジェクトに対して、「期限付き URL(pre-signed URL)」を発行してアクセスさせる方法を試してみました。

<!-- more -->

## やってみる

では、早速やってみます。  
私は noder なので、node.js 版の aws sdk を利用して行います。

まず、S3 上に「Bucket」を作成して、任意のファイルをアップロードしておきます。

S3 上にアップロードしたファイル(オブジェクト)には、
アクセスするための一意な URL が付与されていますが、今の状態では外部からアクセスできません。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/aws-s3-pre-signed-url_01.png)

確認してみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/aws-s3-pre-signed-url_02.png)

では、aws sdk を利用して「期限付き URL」を発行してみます。

```js
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

var params = {
  Bucket: "<Bucket名>",
  Key: "<アクセスするオブジェクト>",
  Expires: 60, //sec
};

s3.getSignedUrl("getObject", params, function (err, url) {
  console.log("The URL is", url);
});
```

これをコンソール上で実行すると期限付き URL が発行されます。  
デフォルトでは URL の有効期間が 15 分なので、`Expires`に有効期限(sec)を指定することもできます。

では、生成された期限付き URL でアクセスしてみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/aws-s3-pre-signed-url_03.png)

ファイルの中身についてアクセスできました。

## さいごに

S3 上に静的コンテンツを配置して、任意のユーザーに限定公開できるので、
ユーザーへ期限付き URL を配布してパスワードの再入力など、特定の業務フローに組み込むことで効果を発揮しそうだと思いました。

AWS について、もっと学習しないとなーと思います。

### 参考

- [[AWS]S3 の期限付き URL を生成する[node] ｜ Developers.IO](http://dev.classmethod.jp/cloud/aws/node-pre-signed-url/)
- [S3 の事前署名付き（期限付き）URL を生成する | cloudpack 技術情報サイト](http://blog.cloudpack.jp/2014/07/08/aws-s3-url-with-expiration-using-php-ruby/)
- [Uploading Objects Using Pre-Signed URLs - Amazon Simple Storage Service](http://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html)
