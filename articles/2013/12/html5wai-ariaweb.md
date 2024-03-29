---
layout: post
title: "HTML5のセマンティックとWAI-ARIAでWebの未来がおもしろい件"
date: 2013-12-03 00:38:00 +0900
comments: true
tags:
  - HTML5
  - WAI-ARIA
---

このエントリは[HTML5 Advent Calendar 2013 ３日目](http://www.adventar.org/calendars/125)の記事です。

前後の記事はこちらです

← youhei.iwasaki8 [[iwahei の日記]geolocation api を使った位置情報取得](http://d.hatena.ne.jp/iwahei0813/20131202#1385943993)

→ あおいたん [[GCG 研究所]手元にあった HTML5 アプリを FxOS と Tizen で動かしてみるの巻](http://www.gcg.bz/labo_blog/?p=590)

「Internet of Things」と呼ばれる「モノがインターネットする」時代のコンテンツは、人が目にして理解できる程度では十分ではありません。すべてのモノが理解できるコンテンツ、その鍵は HTML5 が持つ「セマンティック」と「WAI-ARIA」での仕様の標準化だと思います。

<!-- more -->

### このエントリでお伝えしたいこと。

1.  たまに目にする「role=""」の意味を理解して欲しい。
2.  「aria-」で意味付けすることで、ちょっと得することがある。
3.  「セマンティック」は再利用してこそ意味がある。

エンタープライズにいるエンジニアとして、「なぜ HTML5 なのか？」「HTML5 になると何かいいのか？」という問いに対する答えを探し続けています。
まだ、答えは見つけられていませんが、ぼんやりと「セマンティック」の先にある何かではないかと感じています。今日は、そんな頭の中のもやもやを少し文書化してみました。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/ariaweb1.jpg)

## 私が思うセマンティックとは

今日まで数々の論者の方がセマンティックについて語って来ましたので、今更わたしのセマンティック論なんて聞きたくないと思いますが、あえて言わせていただきます。

**「HTML 文書に意味付けを行って、機械がその意味を理解して振る舞えるようにすること」**

セマンティックとは人が自己満足でやるものではなく、あくまで機械（デバイス）などで HTML 文書が再利用できて初めて価値があると思います。エンタープライスにて今後「HTML5」を導入する企業は多いと思いますが、一度この辺りを真剣に検討した方がいいと思います。

## アクセシビリティと WAI-ARIA

[WAI-ARIA(Accessible Rich Internet Applications)](http://www.w3.org/TR/wai-aria/)とは、
アクセシビリティ（どのような条件や環境下でも Web を利用できる）の問題を解決するために、W3C が仕様を策定しているもので、現在勧告候補となっています。

一般的にアクセシビリティとは、高齢者や障がい者向けへのブラウザ読み上げ機能を想像していただけると理解しやすいかと思います。

様々なデバイスが普及して Web に繋がるようになった今日、様々なデバイス（特にタッチスクリーン）・環境下（特に屋外）で Web を利用するケースが増えてきたこともあり、意外なシーンで Web のコンテンツを利用できないことを体験された方も多いかと思います。

そんな、通常の手段（人が目で見て手で操作する）で閲覧することができない場合、デバイス側への代替え手段の提示方法として、WAI-ARIA が存在しています。
これを人だけではなく、機械（デバイス）が利用してブラウジングできれば面白いですね。

また、WAI-ARIA が持つ一面として、[動的な振る舞いやコンテンツが持つ状態を仕様化](http://www.w3.org/TR/wai-aria/states_and_properties)があります。

HTML5 のセマンティックは文書の静的構造についての意味付けを行っており、現在の Web が持つ動的な振る舞いやコンテンツが持つ状態までは当然カバーしていません。

今後、本当の意味で「Internet of Things」になっていくためには、コンテンツが持つ振る舞いや状態まで標準化され、機械が理解できるようになる必要があると思うのは、当然な流れなのではないでしょうか。

## WAI-ARIA を使ってみる

では、WAI-ARIA を使ってみましょう。
試しに iOS の VoiceOver 機能を使って、Safari の画面を読み込ませてみました。

WAI-ARIA では、HTML のタグにカスタム属性「role」にて役割を、「aria-」にて振る舞いや状態を定義することができます。
（変なマークアップがあるかもしれませんが、雰囲気をつかめればいいのでご了承ください。）

なんからのポップアップのリンクがあったとします。
WAI-ARIA 対応されてないマークアップの場合は、VoiceOver はただのリンクと解釈しています。

```html
<a href="//www.google.com" target="_brank">google</a>
```

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/ariaweb2.png)

ところが、WAI-ARIA の「aria-haspopup」を使うことで、VoiceOver はポップアップリンクであることを認識しています。

```html
<a href="//www.google.com" target="_brank" aria-haspopup="true">google</a>
```

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/ariaweb3.png)

次は、状態の例です。

Ajax などによるコンテンツを動的に更新するケースは非常に多いと思います。
WAI-ARIA では次のように「aria-live」を使用することで、コンテンツの動的更新を通知することが可能です。

Javascript 側でタイマーを仕込んでコンテンツを動的更新させていきます。

```js
var p = document.getElementsByClassName('hoge')[0];
var count = 0;
setInterval(function(){
<span class="Apple-tab-span" style="white-space: pre;"> </span>p.innerText = count++;
}, 1000);
```

HTML のマークアップは次の通りです。

```
<p aria-live="polite" class="hoge"&gt;0&lt;/p&gt;
```

このようにすることで、VoiceOver はコンテンツが動的に変わった瞬間を検知して読み上げてくれます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/ariaweb4.png)

必須入力も「aria-required」で知らせてくれます。

```html
<input aria-required="true" />
```

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/ariaweb5.png)

ほかにも WAI-AREA で定義されている属性は非常に沢山ありますので、詳しくは仕様書を読んでください。

- [Accessible Rich Internet Applications (WAI-ARIA) 1.0](http://www.w3.org/TR/wai-aria/)
- [WAI-ARIA（日本語訳）：日立のユニバーサルデザイン](http://www.hitachi.co.jp/universaldesign/wai-aria/)

## まとめ

このように、WAI-ARIA を意識したマークアップを行うことで、デバイス側が振る舞いや状態を理解した上で、我々に機能を提供できる可能性があることを感じました。

少しでもアクセシビリティを考慮した Web が増えることで、デバイス側でそれを二次利用できるケースが増えると思います。
また、今後 WAI-ARIA を使った華やかな事例が出て、一気にデファクトスタンダードになるかもしれません。

まだ、デバイス側の挙動が統一されていないとか、そもそも実装されてないなど問題は多くありそうですが、HTML5 が持つ「セマンティック」と WAI-AREA の「アクセシビリティ」の組み合わせで、我々が普段目にする華やかな HTML5 とは少し違う、目に見えにくいけど、Web との関わり方そのものを変える（かもしれない）可能性を感じてもらえたらなと思いました。
