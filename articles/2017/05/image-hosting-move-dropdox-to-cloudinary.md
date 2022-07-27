---
layout: post
title: "Dropboxのpublicフォルダが使えなくなったので、画像をCloudinaryに移行してみた"
date: 2017-05-17 0:00:00 +900
comments: true
tags:
  - その他
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/dropbox2cloudinary.png
---

~~当ブログで使っている画像を Dropbox の public フォルダから、Cloudinary に移行した話です。
画像に限った話では、Dropbox の代替先として Cloudinary は結構いいんじゃないかと思います。~~

(うそです)

> 結局、Bandwidth が無料枠をオーバーしてしまったので、S3 にしました。(2017/06/15)

<!-- more -->

## はじめに

当ブログの画像は Dropbox の public フォルダを使っていたのですが、2017 年 3 月から有料化しないとそのままでは使えなくなってしまいました。
長らく代替先を検討していたのですが、この度 Cloudinary を使ってみることにしました。

Cloudinary とは、画像/動画専門のクラウドホスティングサービスで、画像をアップロードしてブログなどで使うために利用できます。

> ~~フリーでも 75,000 枚の画像や動画を保存できるので、まぁ普通に使っている内は大丈夫でしょう。。。~~

> （だめでした〜！！）Bandwidth が 5GB/月なんですが、結構アクセス多くってオーバーしてしまいました。結果、S3 に移行することにしました。(2017/06/15)

- [Cloudinary](http://cloudinary.com/)

## 移行方法

移行方法は至ってシンプルで、Dropbox の画像 URL を Cloudinary のものに置き換えて行きます。

```
// Dropbox
https://dl.dropboxusercontent.com/u/<YOUR_ID>

// Cloudinary
https://res.cloudinary.com/<YOUR_COULD_NAME>/image/upload/<YOUR_ID>
```

### 画像 URL の一括置換

手作業では面倒なので、次のスクリプトでフォルダの中のファイルを一括置換します。(あ、ちなみに Mac の場合です)

```
find . -name "*.ext" | xargs sed -i "" 's/置換前/置換後/g'
```

### 移行時の URL に関する注意点

URL に関しては、ファイル名に空白が含まれる場合は注意が必要です。Cloudinary 上にアップロードしたタイミングで空白が`_`に置き換わるようです。

```
// 元ファイル
Image 01.png

// Dropbox
Image%2001.png

// Cloudinary
Image_01.png

```

## まとめ

普通に画像読めているし、https も使えるので、Dropbox の代替先として Cloudinary は結構いいんじゃないかと思いました。

> Bandwidth が 5GB/月の中に収まるのであれば大丈夫だと思います。
