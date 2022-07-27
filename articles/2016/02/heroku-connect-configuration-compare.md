---
layout: post
title: "HerokuConnect Configurationファイルの差分を出すモジュールを書いた"
date: 2016-02-09 01:00:00 +900
comments: true
tags:
  - heroku
  - heroku connect
  - nodejs
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/heroku-connect.png
---

前回、[Heroku Connect の Configuration ファイルが辛いので美しくするモジュールを書いた](http://blog.mitsuruog.info/2016/02/heroku-connect-configuration-comb.html)の続きっぽいもの。

通常のシステム開発では、開発、ステージング、本番など複数環境を利用することが多いので、複数環境間で Configuration ファイルの差分を出すモジュールを書いてみました。

<!-- more -->

## モチベーション

ここでの Configuration とは、Salesforce 上のオブジェクトと Heroku の postgres 上のカラムを紐付けている Mapping 定義のことです。

Mapping 定義から項目の Mapping が消えると、その項目が Heroku 上の postgres から消えます。
つまり、リリースなどで Mapping 定義がリグレッションすると、今まで動作していたアプリケーションが動かなくなります。

リリース時に Mapping 定義が正しくリリースされていることを証明するためには、Mapping 定義を Configuration ファイルに定義して各環境に import し、適用結果の差分を比べることが最も良い方法だと考えました。

> 適用 => 抽出 => 比較

そこで前回、作成した Configuration ファイルを整形するモジュールを利用して、Configuration ファイルの差分を抽出するモジュールを書きました。

[mitsuruog/heroku-connect-configuration-compare: Fetch two Heroku Connect Configuration and Compare together](https://github.com/mitsuruog/heroku-connect-configuration-compare)

## 使い方

使い方は簡単です。
npm モジュールをインストールして、比較したい Heroku アプリ名を指定してください。

```
npm install --global heroku-connect-configuration-compare
heroku-connect-configuration-compare one-heroku-appname other-heroku-appname
```

差分が Diff として参照できます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/heroku-connect-diff.png)

> 注）[ Heroku Toolbelt](https://toolbelt.heroku.com/)と[heroku-connect-plugin](https://github.com/heroku/heroku-connect-plugin)がインストールしていることが前提です。

## TODO

現在、次の改善点があります。モチベーションが続いたら改善したいです。

- 比較する対象に git remote の alias 名を利用する
- 比較除外プロパティの追加
  - applied_at, exported_at あたりは比較不要かと

## 最後に

HerokuConnect の利用者が増えると、もっと開発や運用する上での課題が明らかになりそうですね。
こんなのまだ、氷山の一角だと思います。
