---
layout: post
title: "親子でマイクラ ー HerokuにMincraftのプライベートサーバーを立てる"
date: 2018-06-05 0:00:00 +900
comments: true
tags:
  - heroku
  - minecraft
  - aws
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/minecraft01.png
---

「お父さんと 2 人だけで[マイクラ](https://minecraft.net/ja-jp/)やりたい！」

GW に娘がそんなこと言い出したので、お父さん、ちょっと頑張ってプライベートサーバーを立ててみたよ！

> 注意：
> この方法で立てたサーバーには、Minecraft pocket edition からはアクセスできません。Minecraft pocket edition で子供を一緒に遊びたい方は、こちらの記事を参考にしてください。
> [【親子でマイクラ PE】自宅 Wi\-Fi で同時プレイ！ 2 つの iPhone で同じ世界に入って遊ぶ方法 \| Minecraft（マインクラフト） \| できるネット](https://dekiru.net/article/15596/)

## 下調べ

少し調べていると、Mincraft は[サーバーがソフトウェアにて配布されていて](https://minecraft.net/en-us/download/server)これを実行するとプライベートサーバーになるようです。

これをダウンロードして、自分のローカル PC で動かすとプライベートサーバーが作れるのですが、仕事に行っている間も自宅の PC で Mincraft を動かしているのは抵抗があったので、クラウド上にホスティングすることにしました。

サーバー代あまりかけたくないし、常時動かす必要はないので、こういう場合は「[Heroku](https://jp.heroku.com/home)」一択ですね。

## 構築手順

基本的にはこの[heroku-buildpack-minecraft](https://github.com/jkutner/heroku-buildpack-minecraft)にある通りに設定すると大丈夫です。

### ngrok の token を取得する

[ngrok](https://ngrok.com/)という、ローカル PC にトンネルを作って Internet に接続できるようにするサービスがあるので、無料のアカウントを取得して token を取得します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/minecraft02.png)

### git プロジェクトを作成して eula.txt を作成する

新しく git プロジェクトを作成して、中に`eula.txt`をおきます。

```sh
echo 'eula=true' > eula.txt
git init
git add eula.txt
git commit -m "Add eula.txt"
```

`eula.txt`の中身は次のなっています。

```sh
eula=true
```

### Heroku アプリケーションを作成する

[Heroku toolbelt](https://toolbelt.heroku.com/)をインストールして Heroku アプリケーションを作成します。
途中で buildpack と環境変数(ngrok の token)の指定をします。

```sh
heroku create
heroku buildpacks:add heroku/jvm
heroku buildpacks:add https://github.com/jkutner/heroku-buildpack-minecraft
heroku config:set NGROK_API_TOKEN="xxxxx"
git push heroku master
```

> 環境変数の指定は GUI の設定ページからも行えます。

### 接続用アドレスを取得して Mincraft から接続する

Heroku のアプリケーションが正常に作成できた後に、実際に Heroku のプライベートサーバーにアクセスして接続用のアドレスを取得します。

```sh
heroku open
```

プライベートサーバーにアクセスすると、次のようなアドレスが画面上に表示されます。

`Server available at: 0.tcp.ngrok.io:XXXXX`

これを Mincraft で接続先のサーバーに指定すると、プライベートサーバーにアクセスできるようになります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/minecraft03.png)

## セーブデータを S3 に保存する

Mincraft のセーブデータは Heroku の中に保存されます。
しかし、Heroku のサーバーは 24 時間に 1 回再起動してしまうので、その度にセーブデータがなくなってしまいます。そこでセーブデータを S3 へ転送します。

AWS のコンソールで S3 バケットと IAM を作成して、アクセスキーとシークレットキーを取得します。
これを Heroku の環境変数に設定します。

```sh
heroku config:set AWS_BUCKET=your-bucket-name
heroku config:set AWS_ACCESS_KEY=xxx
heroku config:set AWS_SECRET_KEY=xxx
```

> AWS の IAM 設定はこのあたりの記事を参考にしてください。
> [特定の S3 バケットにだけアクセスできる IAM ユーザーを作る \| I am mitsuruog](https://blog.mitsuruog.info/2017/11/way-to-api-key-access-s3)

これで 60 秒に一回、セーブデータが転送されるようになりました。

## まとめ

Heroku でプライベートサーバーを立てる方法でした。Heroku と AWS を扱ったことがあるイケメンなら、そこまで難しくない手順だと思います。

> とはいえプライベートサーバーを立てたあとに、Minecraft に edition の違いがあることを知り、結局自分用の pocker edition を買って遊ぶことになったのですが。。。
> 娘がもう少し大きくなって PC 使えるようになったら、使いたいと思います w
