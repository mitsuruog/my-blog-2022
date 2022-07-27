---
layout: post
title: "GitHubでのうっかりPRマージ事故を防ぐChrome拡張機能を作ってみた"
date: 2017-12-28 0:00:00 +900
comments: true
tags:
  - github
  - browser extensions
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gatekeeper00.png
---

## はじめに

ん！？
この Pull Request。。。。

develop ブランチ向けだと思ったら、マージ先が master ブランチじゃないかーーーー！
うぉぉぉぉーーー！！！！
うっかりマージボタン押してしまったーーーーーーー！！

あぁぁぁーーーーーー！

（完）

そんな悲しい経験をした方は多いのではないでしょうか？

はい、私はあります。

同じ間違いは二度と起こさない。そんな自分のために Chrome 拡張機能を作ってみました。

## merge-gatekeeper-for-github とは

![](https://github.com/mitsuruog/merge-gatekeeper-for-github/raw/master/assets/images/1280-800.png)

- [merge gatekeeper for github \- Chrome ウェブストア](https://chrome.google.com/webstore/detail/merge-gatekeeper-for-gith/meogknoedhhdmkgcmmgdibeeinnhfnlg)

「merge-gatekeeper-for-github」は、GitHub の「Merge pull request」ボタンのすぐ近くに、この PR が「**どこから来てどこに行くのか**」かを表示するだけのシンプルな拡張機能です。

ちなみに、こちらが拡張機能がない場合です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gatekeeper01.png)

GitHub 上にも PR の行き先について表示はあるのですが、オリジナルのスタイルに溶け込みすぎて見落としてしまいます。
それに最近追加された review やマージのためのチェック機能のおかげで、さらにマージボタンから**遠くなってさらに見落とし易くなってしまいました。**

「merge-gatekeeper-for-github」は、マージボタンのすぐ下に、**オリジナルのスタイルを崩さず、かつ目立つ**形で必要な情報を表示します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gatekeeper02.png)

> 実際に作ったのは**8 ヶ月前**ですが、もうこれがないと恐ろしくてマージボタンが押せません。

## で、そもそも。。。

で、そもそも。。。
この件に関しては、GitHub の UI が**ミスを誘発する悪い UI**だと思います。

はい。以上。

8 ヶ月使い続けているのですが、もう手放せなくなってきました。よかったら使ってみてください。

ソースコード一式は GitHub においてあります。

- <https://github.com/mitsuruog/merge-gatekeeper-for-github>
