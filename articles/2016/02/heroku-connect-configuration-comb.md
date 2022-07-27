---
layout: post
title: "Heroku ConnectのConfigurationファイルが辛いので美しくするモジュールを書いた"
date: 2016-02-05 00:00:00 +900
comments: true
tags:
  - heroku
  - heroku connect
  - nodejs
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/heroku-connect.png
---

[Heroku Connect](https://www.heroku.com/connect)は、Salesforce と Heroku 上の postgres とを接続するアドオンです。

Heroku Connect を使うことで、ほぼリアルタイムに Salesforce と Heroku のデータを同期させることができます。
これにより、Heroku 上で Salesforce のデータを利用することができ、これまでの Salesforce の常識にとらわれない新しい Saleforce の使い方が可能になります。

Heroku Connect を実際に利用して、Configuration ファイル仕様が辛かったので、うまく付き合うための npm モジュールを作りました。

<!-- more -->

## モチベーション

ここでの Configuration とは、Salesforce 上のオブジェクトと Heroku の postgres 上のカラムを紐付けている Mapping 定義のことです。
Configuration は Heroku Connect のダッシュボードや[heroku コマンドのプラグイン](https://github.com/heroku/heroku-connect-plugin)をインストールすることで、JSON としてエクスポートすることができます。

こちらがエクスポートしたものです。

```json
{
  "mappings": [
    {
      "config": {
        "sf_max_daily_api_calls": 30000,
        "sf_notify_enabled": false,
        "fields": {
          "Email": {},
          "LastName": {},
          "Id": {},
          "IsDeleted": {},
          "Title": {},
          "Rating": {},
          "Status": {},
          "Name": {},
          "SystemModstamp": {},
          "IsConverted": {},
          "CreatedDate": {},
          "Company": {},
          "FirstName": {}
        },
        "access": "read_only",
        "sf_polling_seconds": 600
      },
      "object_name": "Lead"
    },
    {
      "config": {
        "sf_max_daily_api_calls": 30000,
        "sf_notify_enabled": false,
        "fields": {
          "Description": {},
          "ContactId": {},
          "CaseNumber": {},
          "Id": {},
          "Subject": {},
          "ClosedDate": {},
          "Status": {},
          "SystemModstamp": {},
          "Reason": {},
          "Type": {},
          "IsClosed": {},
          "CreatedDate": {},
          "IsDeleted": {},
          "IsEscalated": {},
          "Priority": {}
        },
        "access": "read_only",
        "sf_polling_seconds": 600
      },
      "object_name": "Case"
    }
  ],
  "version": 1,
  "connection": {
    "organization_id": "00DE0000000L6REMA",
    "app_name": "heroku-connect-mitsuruog-dev",
    "exported_at": "2016-02-04T08:25:16.681265+00:00"
  }
}
```

もう一度、エクスポートしてみますね。

```json
{
  "connection": {
    "organization_id": "00DE0000000L6REMA",
    "exported_at": "2016-02-04T08:26:20.736598+00:00",
    "app_name": "heroku-connect-mitsuruog-dev"
  },
  "version": 1,
  "mappings": [
    {
      "config": {
        "sf_polling_seconds": 600,
        "sf_max_daily_api_calls": 30000,
        "fields": {
          "Email": {},
          "SystemModstamp": {},
          "CreatedDate": {},
          "LastName": {},
          "Status": {},
          "Rating": {},
          "IsDeleted": {},
          "IsConverted": {},
          "Title": {},
          "Id": {},
          "Company": {},
          "Name": {},
          "FirstName": {}
        },
        "sf_notify_enabled": false,
        "access": "read_only"
      },
      "object_name": "Lead"
    },
    {
      "config": {
        "sf_polling_seconds": 600,
        "sf_max_daily_api_calls": 30000,
        "fields": {
          "Description": {},
          "SystemModstamp": {},
          "CreatedDate": {},
          "Subject": {},
          "Status": {},
          "Reason": {},
          "IsEscalated": {},
          "IsDeleted": {},
          "ClosedDate": {},
          "Type": {},
          "Priority": {},
          "CaseNumber": {},
          "IsClosed": {},
          "Id": {},
          "ContactId": {}
        },
        "sf_notify_enabled": false,
        "access": "read_only"
      },
      "object_name": "Case"
    }
  ]
}
```

....え！？

Mapping を変更していないにも関わらず、エクスポートするたびに(気まぐれで)順序がバラバラになります。

システム開発を行う過程で Mapping の変更はそれなりの頻度があり、Configuration ファイルにて変更点を管理したいのですが、これでは変更点がわかりません。
そこで、アルファベット順でソートする node モジュールを書きました。

[mitsuruog/heroku-connect-configuration-comb: Makes your Heroku Connect Configuration beautiful](https://github.com/mitsuruog/heroku-connect-configuration-comb)

## 使い方

使い方は簡単です。
`input.json`にエクスポートした Configuration ファイルを指定してください。

```
npm install --g heroku-connect-configuration-comb
heroku-connect-configuration-comb input.json output.json
```

これで Configuration ファイルが見れるものになりました。

## 最後に

そのうち本家で改善されるでしょう。。。
(中の人が気づいたら、リポジトリに star してくれたらいいな。)

Heroku Connect のコンセプトは非常にいいのですが、プロダクトの完成度としてやや利用者視点に欠けた部分が多い印象を持っています。
今後のアップデートに期待したいです。
