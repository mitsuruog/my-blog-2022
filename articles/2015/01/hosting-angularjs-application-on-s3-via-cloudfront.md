---
layout: post
title: "AngularJSで作ったSPAをAWS上の「S3＋CloudFront」でお手軽ホスティングして、クラウドサービスってやっぱ素晴らしいなと思った話"
date: 2015-01-15 21:47:55 +0900
comments: true
tags:
  - AngularJs
  - aws
  - s3
  - cloudfront
  - SPA
---

最近は、WebAPI や AWS のようなクラウドサービスが普及してきて、バックエンドのサーバーがなくても、Web サービスが公開できるようになってきました。

今回は AWS の**S3 にある Static Website Hosting 機能**を使って AngularJS で作成した SPA(Single page application)をホスティングさせてみました。

割と S3 でのサイト公開は簡単なので楽勝かと思いきや・・・  
いろいろまじめに考えると手こずるものですね。

<!-- more -->

## S3 での SPA 公開

S3 でのサイト公開は非常に簡単です。次の 3 ステップで即公開できます。  
(「S3 サイト公開」などで検索するといくつか記事がヒットすると思いますので参考にしてください。)

- S3 上に Bucket を作成する。
- AngularJS で作成した SPA をアップロードする。
- Bucket の Static Website Hosting を ON にする。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-1.png)

Static Website Hosting を ON にすることでアクセス可能な URL が取得できます。  
アクセスした際に「`AccessDenied`」エラーになる場合は、アップロードしたファイルの`Permissions`が**Everyone アクセス可能**になっていないことが多いです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-2.png)

しかし、この**Everyone アクセス可能**状態はあまりいい状態ではありませんので、CloudFront を利用します。  
(後で紹介しますが、S3 は CloudFront 経由のアクセスのみ有効にする設定を推奨します。)

> S3 の Everyone アクセス可能は Apache の設定漏れで、ファイル一覧が見えてしまっている感覚に似ていて落ち着きません w

他にも、S3 で公開した場合に問題になりそうな部分について紹介します。

## S3 での SPA 公開で問題になりそうなところ

S3 の Static Website Hosting 機能はお手軽で非常に魅力を感じるのですが、Web アプリケーションを想定した場合、次のような問題がありそうです。

- アクセスを`HTTPS`に限定できない。
- URL に「`/`」を指定した場合、S3 上のフォルダを参照してしまいエラーとなる。(結果「`/index.html`」まで含める形に・・・)
- 「`/`」以外の URL(「/hoge」とか)でアクセスした場合に`403(access denied)`エラー(2015/01/20 追記)
- 他にもあった気がするが、忘れた。

という訳で S3 のみのお手軽ホスティングは、コーポレートサイトのような静的コンテンツ向きな気がします。

## CloudFront の利用

そこで利用するのが CloudFront です。いろいろ探していたら、こちらの記事が参考になりました。ありがとうございます！

[[CloudFront + S3]特定バケットに特定ディストリビューションのみからアクセスできるよう設定する ｜ Developers.IO](http://dev.classmethod.jp/cloud/aws/cloudfront-s3-origin-access-identity/)

手順としては次のような形です。

- CloudFront 上に Distributions を作成
- Origin Domain Name に S3 の Bucket を指定
- Restrict Bucket Access で「Yes」を設定して S3 へのアクセスを制限

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-3.png)

これで CloudFront 経由で S3 へアクセスすることができますが、SPA をホスティングするに当たって追加で以下の設定をしました。

### General > Default Root Object

`Default Root Object`に「index.html」を設定します。これで「`/`」でアクセスした際に、エラーにならず「`index.html`」を呼び出すことができます。

しかも、デフォルトの(\*.cloudfront.net)ドメインであれば SSL 証明書までついてきます。  
まじで至れり尽くせりです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-5.png)

### Behaviors > Viewer Protocol Policy

新しい Behavior を作成して`Viewer Protocol Policy`にて`Redirect HTTP to HTTPS`を選択します。これで HTTP でアクセスされた場合に、HTTPS にリダイレクトすることが可能です。  
(あまりこだわりなければ`Path Pattern`は`Default (*)`1 つで事足りるはず。)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-4.png)

## CloudFront 利用上の注意点

CloudFront を利用すると幸せになれるのですが、1 点注意点があります。それは**キャッシュ**です。

CloudFront の本質は CDN なので、コンテンツをキャッシュします。しかもデフォルトでは**24h キャッシュを保持**するので、S3 上にアップロードしたファイルは最大 24h 変更されません。

### Invalidations を利用して Cache をクリア

CloudFront には Invalidations というキャッシュクリアをする仕組みがあるので、これを使って CloudFront に対してキャッシュのクリアを指示します。  
(ただ、5〜10 分くらいかかります。リアルタイムではないです。)

CloudFront で Distributions を選択すると「`Invalidations`」というタブがあるので、ここで「`Create Invalidation`」ボタンをクリックします。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/angular-s3-cloudfront-6.png)

クリアするファイルを指定する必要があるので、例えば「`/index.html`」とか入力します。  
私の場合、フロントのリソースは結合＆minify＆バージョニングして最適化してしまうので、普段は`index.html`だけで十分です。

あとはキャッシュがクリアされるまで気長に待ちましょう。

## まとめ

「S3 ＋ CloudFront」を使うことでお手軽に AngularJS で作成した Web アプリケーションをホスティングすることができました。しかも勝手にスケールするし、クラウドサービス偉大過ぎます。

### しかし、上には上がいる！

今回の「S3 ＋ CloudFront」はまだ**大関**構成なようですね。個人的には頑張ったと思うのですが。。。orz  
こちらの記事を読むと、この上の「S3 ＋ CloudFront ＋ Route53」**横綱**構成があるようです。

[AWS における静的コンテンツ配信パターンカタログ（アンチパターン含む） ｜ Developers.IO](http://dev.classmethod.jp/cloud/aws/static-contents-delivery-patterns/)

もっと稽古します。

> (2015/01/20 追記)  
> `/`以外の URL でアクセスした場合に`403(access denied)`エラーになるのですが、CloudFront Distributions の Error Pages 設定で、403 エラーの場合のエラーページを`/index.html`にすることで回避することができましたー。  
> うぇーーーーい！！って無理矢理感が半端ない w
