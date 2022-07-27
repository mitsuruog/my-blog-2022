---
layout: post
title: "ng-sake #1 でAngular2のテストについて話てきた"
date: 2016-03-31 22:29:00 +900
comments: true
tags:
  - angular
  - angular2
  - karma
  - jasmine
  - unit test
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/ng-sake.jpg
---

3/31 に酒を飲みながら Angular について話す素敵な催し[ng-sake](http://connpass.com/event/27707/)が開催されたので、Angular2 のユニットテストについて話て来ました。

<!-- more -->

当日のレポートは主催の[らこ](https://twitter.com/laco0416)さんが書いたものを参照ください。

- [ng-sake を開催しました | Angular2 Info](http://ng2-info.github.io/2016/03/31/ng-sake-1-report/)

## 当日の模様

Angular を使い込んでいる人が多かったので、濃い内容の話ばかりでした。

> [やばい、参加者がニッチすぎて面白い](https://twitter.com/mitsuruog/status/715153394558705664)

> [わいわい、がやがや。こういう形式もありだよね。angular に関わる人の熱意を感じる ](https://twitter.com/mitsuruog/status/715160894632828930)

> [ディレクトリ構成が盛り上がってて楽しいｗ](https://twitter.com/mitsuruog/status/715149679609192448)

## 発表内容

私の資料はこちらです。

[Angular 2 unit testing overview](https://www.slideshare.net/mitsuruogawa33/angular-2-unit-testing-overview)

Angular2 は別物になっているので、テスト周りの状況も心配していたのですが、結論としては Angular1 とあまり大差なかったです。

こちらに比較表作ってみました。

[Angular 1 to 2 Quick Reference In unit testing](https://gist.github.com/mitsuruog/9e3e5c2c5d17a15a4c2a)

当日紹介したテストのサンプルコードはこちらです。

<https://github.com/mitsuruog/_angular2-unit-test-sample>

[Angular2 Unit Testing - カバレッジ編 | I am mitsuruog](http://blog.mitsuruog.info/2016/03/how-to-test-angular2-application-coverage.html)で紹介したカバレッジが出る仕組みが入っています。
カバレッジフェチの方は動かして楽しめると思います。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/ng-sake-coverage.png)

## まとめ

Angular2 のテストについては公式のドキュメントが足りていない、かつアップデートが激しいです。
最新の情報をチェックしたい場合、生のコードを読みつつ、本家のリポジトリのテストコードを見るのが一番確実です。

最後に、主催の[らこ](https://twitter.com/laco0416)さん、[83](https://twitter.com/armorik83)さん、本当にありがとうございました。
今後も続くといいなー。
