---
layout: post
title: "なぜAngularJSを薦めるのか ー 個人的な思い"
date: 2014-11-19 23:17:50 +0900
comments: true
tags:
  - AngularJs
  - その他
---

だいぶ前のことですが、9/22 に行われた[AngularJS リファレンス」出版記念会](http://html5experts.jp/albatrosary/10855/)にて SIer での AngularJS の取り組みについて話させていただきました。

先日、その資料を見て興味を持ってくれた他の SIer にて AngularJS について講演させていただく機会をいただいたこともあり、なぜ AngularJS をいいと感じているのかや、AngularJS に期待することなど、個人的な思いを書いてみたいと思います。(あくまで SIer 目線です。)

<!-- more -->

詳細は資料を参照してくださいね。

こちらが 9/22 の AngularJS リファレンス出版記念会の資料です。

[今後の Web 開発の未来を考えて angularJS にしました](https://www.slideshare.net/mitsuruogawa33/webangularjs)

他社にて 講演したときの資料です。

[今後の Web 開発の未来を考えて angular js にしました(拡大版)](https:////www.slideshare.net/mitsuruogawa33/webangular-js)

## マルチプラットフォームとしての HTML5

まず、AngularJS を選定する際に外せないのが、「HTML5」の存在です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/why_angular1.png)

ブラウザだけではなくモバイルアプリなど利用範囲が広いため、今後の Web アプリケーションのマルチプラットフォーム実行環境としては主役だなと思います。

## AngularJS の注目ポイント

AngularJS で注目しているポイントとしては次のような部分です。

1.  各モジュールのちょうど良いサイズ感
2.  生産性(4.の要件の範囲内であれば...)
3.  スキルチェンジ(JSP から AngularJS)
4.  Web 開発要件にマッチ

いくつか JS フレームワークを触っていきた経験的に、AngularJS の各モジュール分割(controller や filter など)の考え方は割と Better かなと思います。強いて言えば、規模が大きくなってくると細かな Service がたくさんできて DI が多くなるのが辛いといったとこでしょうか。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/why_angular2.png)

スキルチェンジに関しては、JSP と AngularJS はテンプレート部分にロジックを記述していくため、Javascript で全てテンプレートを生成するものより、理解しやすいと思います。また DI の概念や、各モジュールについての役割についても Java での Web 開発を例に説明できると思います。

## 開発支援ツールとしての Yeoman

私が Yeoman の存在を知ったのは 2013 年の 10 月くらいだったかと思います。

従来の Java での Web 開発と比較して、Yeoman が提供する Grunt タスク(特にフロント側リソースの本番ビルド)はかなりオーバースペックに見えたこともあり、ここ 1 年、少し慎重に評価していました。

AngularJS 開発にあたって Yeoman が必須な訳ではありませんので、Yeoman を使わずに自分の組織にあった Grunt タスクを 0 から作成して利用してもいいと思います。
(Yeoman は必須ではなくても、Grunt タスクは AngularJS 開発では必要だと思います。)

私の場合、当初は Yeoman を利用しない方向で考えていましたが、AngularJS を開発するにあたりいろいろとタスクを追加した結果、Yeoman でのタスクの劣化版を作っていることに気づきました。  
いまでは既存の Yeoman ジェネレーターを自組織に合うようにカスタムして利用しています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/why_angular3.png)

> 本来は、なぜフロント開発がこんなにも複雑になってしまったのかを嘆くべきなのでしょうが。。。

## まとめ

個人的な AngularJS についての思いを書いてみました。  
SIer の中にいると、最近の Web 開発手法の進化と現場での意識のギャップに戸惑うことが非常に多いです。

AngularJS もそろそろ実用レベルのものに達してきたと思いますので、このあたりで少し実戦で使っておかないと、10 年後には Web 開発がまともにできないような組織になるのではと危惧しています。

SIer じゃなければ React.js か vue.js を使いたいです w
