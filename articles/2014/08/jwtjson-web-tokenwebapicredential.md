---
layout: post
title: "JWT(Json Web Token)を利用したWebAPIでのCredentialの受け渡しについて"
date: 2014-08-25 02:45:00 +0900
comments: true
tags:
  - JSON Web Signature
  - Json Web token
  - JWS
  - JWT
  - WebAPI
---

AngularJS への改宗が完了した「mitsuruog」です。  
AngularJS に限らず Single page application(以下、SPA)を構築した場合、認証(Authenticate)とその後の WebAPI での証明情報(Credential)の受け渡し方法について最近悩んでいます。  
調べていたら Json Web Token(以下、JWT)を利用した方法が[Cookies vs Tokens. Getting auth right with Angular.JS](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/)で紹介されていて、試してみると結構使えそうでしたので紹介してみます。

<!-- more -->

## 目次

## 1.WebAPI での証明情報の受け渡しの重要性

Web アプリケーションのフロントエンドを SPA で構築した場合、バックエンドへのアクセスは通常 WebAPI 経由になります。JSP 時代のようなフロントとバックが密結合した状態ではなく、SPA での WebAPI は一般的に広く公開されているものです。  
URL を知っていれば誰でもアクセスできる性質を持っています。(企業システムは VPN という閉じた世界で利用されることが多いもの事実ですが)

バックエンドではユーザ認証を行い、その証明情報を元に、不正なアクセスを除外したり、正しいアクセスに対して機能に対する認可を行わなければなりません。そのため、SPA での証明情報の受け渡しは非常に重要です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/JWT2.png)

## 2.Token を利用した証明情報の受け渡し

まず、従来の Cookie を利用したやり方について簡単に説明します。ただし、「Token vs Cookie」のような関係ではなく、両者をうまく組み合わせた方がいいような気が今はしています。(ちょっと、まだ検証が足りてません)

Cookie を利用した証明情報とは「セッション ID」をイメージするいいと思います。この方法の特徴は、認証がバックエンドに依存していることです。つまり、バックエンド側では、認証された個人情報やロールをセッション ID に紐づけて保持する必要がありました。そのため、Web アプリケーションはセッションをどこで保持するかを意識した設計を行う必要がありました。

それに対し、Token を利用した方法では認証はバックンドに依存しません。ここでの「Token」とは「**電子署名**」の一種です。こちらが Token を利用した場合の証明情報の受け渡しフローです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/JWT3.png)

まず認証後に、暗号学的ハッシュ関数(SHA-256 など)を使って暗号化した Token を生成して渡します。このときにロールや個人情報を Token に含めることがポイントです。  
フロントエンドは WebAPI アクセスする際に HTTP ヘッダーに Token を設定します。WebAPI アクセスを受けたバックエンドは Token を秘密鍵を使って復号し、Token が改ざんされていないことを確認することで、正しいアクセスであることを確認します。

Token には個人情報やロールが含まれているため、バックエンドにて認証の状態を保持する必要がありません。**同じ秘密鍵・暗号学的ハッシュ関数があれば異なるバックエンドであっても Token を受け入れることが可能**です。

これは、バックエンドがクラウド・オートスケールアップしていくような流れの中で、従来ようなセッションを意識しない証明情報の受け渡し方法として注目しています。

## 3.実現するためのコア技術、JWT(Json Web Token)とは

JWT とは、Json 形式の claims(※)を暗号化して URL で安全に送れるようにしたものです。

> (※)claims(クレーム)：うーん、いまいちイメージが湧かない。たぶん、上の個人情報とかロールとかそんな印象だと思います。

JWT の構造は JSON Web Signature(JWS)と JSON Web Encryption(JWE)の 2 つ。
(ちなみに上の[Cookies vs Tokens. Getting auth right with Angular.JS](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/)は JWS です。)
JWS 構造の JWT を簡単に図解すると「ヘッダー」「クレームセット」「署名」の 3 部構成になっています。それぞれ Base64URL エンコードされており、署名はヘッダー・クレームセットから生成します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/JWT1.png)

クレームセット部分には、個人情報やロールなどカスタム項目を設定します。これ以外に JWT の仕様で以下のような項目(クレーム名)が標準で定義されています。

- **iss:** Token 発行者
- **sub:** Token を利用するアプリケーション名など。(iss とセットで発行者側を識別するために使う)
- **aud:** この Token を利用することが想定される対象の識別子。例)このブログでの利用想定の場合は「blog.mitsuruog.info」のようになる(はず)
- **exp:** Token の有効期間
- **jti:** Token の一意性を保証するための ID を設定する

JWT についての詳細は下記のブログを参照してください。おそらく私よりかなり正確な理解をされていると思います。(JWT の日本語情報はかなり希少です)
特に hiyosi’s blog さんの記事は JWT の仕様と JWS 構造の JWT の作成・検証(ただし scala)まで含まれており、非常に有用です。

[JSON Web Token (JWT) - OAuth.jp](http://oauth.jp/blog/2012/10/26/json-web-token-jwt/)
[JWT について簡単にまとめてみた - hiyosi’s blog](http://hiyosi.tumblr.com/post/70073770678/jwt)

## 4.Token を利用した場合の課題など

Token を利用した場合の課題など、列挙しておきます。
私自身、どれだけ理解しているか不安ですので、ご意見いただけると嬉しいです。

### 秘密鍵の管理

JWT を利用した場合、その Token の正当性は暗号化する際の秘密鍵がすべてです。Token がフロントエンドで分散して保持されているため、なんからの方法で秘密鍵が外部に漏れてしまった場合の被害は甚大になると思われます。
スケールアウトしている場合など、秘密鍵の変更を素早く同期できる方法が必要です。

### リフレッシュトークン

おそらく、Token には何らかの有効期限を設けて運用すると思われます。Token の有効期限が切れた場合、Cookie を使っていた場合のセッションタイムアウトと同じ事態になりますので、OAuth2 のリフレッシュトークンのような仕組みが必要になると思います。
これは課題とではなく、やるべきことですね。できればその辺りまでライブラリでカバーして欲しいです。

### セキュリティ

Cookie の場合、CSRF、セッションハイジャックなどセキュリティ脆弱性がありました。Token を使った場合は、Cookie を利用していないため、Cookie の仕組みによる脆弱性はないと思われますが、他にどのような危険性があるかはまだ未知数です。(専門家の人助けてー)

特に、URL パラメータに Token 付与した場合とか、そもそも誤送信した時点でアウトなので、そもそもそのような利用シーンは想定しない方がいいか、などもう少し利用する上で検討しなければならない項目の見落としがありそうです。

## 5.まとめ

JWT を利用した証明情報の受け渡し方法いかがでしたでしょうか。
国内情報が少なくて、正直どこまで信頼できるか手探りの状態です。今後も引き続き WebAPI 周りの認証とか証明情報の受け渡しとか注視していきます。

最近、AngularJS で各ソーシャル対応の Token ベース認証ライブラリが出ましたので、こちらを使ってみるのもいいかと思います。
[sahat/satellizer](https://github.com/sahat/satellizer)

こちらが参考資料です。

- **Blog**
  - [Cookies vs Tokens. Getting auth right with Angular.JS](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/)
  - [JSON Web Token (JWT) - OAuth.jp](http://oauth.jp/blog/2012/10/26/json-web-token-jwt/)
  - [JWT について簡単にまとめてみた - hiyosi’s blog](http://hiyosi.tumblr.com/post/70073770678/jwt)
- **仕様**
  - [JSON Web Token (JWT) draft25](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)
  - [JSON Web Token (JWT) -日本語 draft11-](http://openid-foundation-japan.github.io/draft-ietf-oauth-json-web-token-11.ja.html)
- **ライブラリ**
  - [auth0/express-jwt(nodejs/express ミドルウェア)](https://github.com/auth0/express-jwt)
  - [auth0/node-jsonwebtoken(nodejs/JWS 形式の JWT 作成)](https://github.com/auth0/node-jsonwebtoken)
  - [sahat/satellizer(javascript/AngularJS 用の Token ベース認証ライブラリ)](https://github.com/sahat/satellizer)
