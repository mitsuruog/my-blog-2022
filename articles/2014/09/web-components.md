---
layout: post
title: "Web Components ハンズオンをやってみた"
date: 2014-09-14 23:37:00 +0900
comments: true
tags:
  - HTML5
  - Web Components
  - ハンズオン
---

2014/09/09 に美人で有名なおだんみつさんのいる[21cafe](http://www.ni-ichicafe.com/)で「[エンタープライヤーのための Web Components ハンズオン](https://atnd.org/events/55761)」を開催しました。内容は「Web 名刺」を Web Components で作るというものです。

Web Components についての解説記事はそこそこ出てきましたが、ハンズオンだと国内初の試みかと思います。それなりに難しい技術に関するハンズオンでしたが、なかなか好評だったようですので少し振り返ってみます。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/wc_handson1.png)

## 目次

## Web Components とは

UI 部品がコンポーネント化して再利用しやすくすることが出来る技術です。詳細は Google のえーじさんが[なぜ Web Components はウェブ開発に革命を起こすのか](http://blog.agektmr.com/2014/05/web-components.html)で書いている記事が分かりやすいかと思います。とにかく将来の Web 開発に革命を起こすと言われる技術です。

## 苦労したポイント

2 時間のハンズオンコースですので、その限られた時間内で結果を出さなければなりません。
今回苦労したポイントは 2 つです。

1.  Web Components のメリットを感じつつ、作ってて面白く、参加者が本気になる題材はなにか。
2.  Web Components の複雑に絡み合った仕様を最短で理解してもらうためには、どうすればいいか。

「題材」については自分のカスタムタグが作れて気軽に配布できると嬉しい「Web 名刺」にしました。
最短で理解してもらうための構成とコンテンツ作りには難儀しましたが、Web Components のコンセプトについては「花の種」を例えて、コンテンツの方は、講師がいなくても出来るように[Github](https://github.com/html5bizj/x-business-card)上に作りました。
(Github のコンテンツについてはかなり試行錯誤して悩んだのは事実です。)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/wc_handson2.png)

> [エンタープライズな@mitsuruog さんならではの「Web Components は花の種で理解しよう」論いいねっ ∩( ・ω・)∩ ](https://twitter.com/21cafe_shibuya/status/509291557111885825)

参加者からは嬉しい反応もいただけたので、なかなかハンズオンとしては成功だったようです。主催としてはホッとしています。

こちらが当日の様子です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/wc_handson3.jpg)

> [ 昨日は WebComponents ハンズオンありがとうございました。信じがたいことにあの 2 時間だけでかなり自在に WebComponent が書けるようになりました。(^^;;;](https://twitter.com/shunjikonishi/status/509540957809692672)

> [Web Components すごい](https://twitter.com/ab_lave/status/509320071731109888)

発表資料はこちらです。

[エンタープライヤーのための Web Components ハンズオン](https://www.slideshare.net/mitsuruogawa33/webcompoents)

ハンズオンの内容についてはこちらにあります。

[html5bizj/x-business-card](https://github.com/html5bizj/x-business-card)

## 成功したポイント

成功したポイントはいくつかあるのですが、簡単に言うと[@kara_d さん](https://twitter.com/kara_d)のこの一言、「企画」なのかなと思います。

> [今日は html5 えんぷら部にて web components ハンズオンに参加〜 名刺を作るって企画いいなあ。](https://twitter.com/kara_d/status/509314331154980864)

「企画」が最も大事なのは事実なのですが、裏でハンズオンを成功させるための運営的な小細工をいろいろやっていたので、機会があったらノウハウまとめたいと思います。

## さいごに

今回、[エンタープライヤーのための Web Components ハンズオン](https://atnd.org/events/55761)を開催しました。2 時間で参加者が満足できるハンズオンができるか不安でしたが、なんとか成功させることができたようです。

お忙しい中、参加していただいた皆さんありがとうございました。チューターの[@albatrosary さん](https://twitter.com/albatrosary)、[@can_i_do_web](https://twitter.com/can_i_do_web)さんありがとう！あなた達のフォローがなかったら成功しなかったです。会場提供の[21cafe](http://www.ni-ichicafe.com/)さんもありがとうございました。

作成した Web 名刺

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/wc_handson4.jpg)

最後は参加者で記念撮影

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/wc_handson5.jpg)
