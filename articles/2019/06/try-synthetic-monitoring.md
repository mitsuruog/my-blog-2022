---
layout: post
title: "Catchpointでこのブログのパフォーマンスを1週間Synthetic Monitoringしてみた"
date: 2019-06-29 0:00:00 +900
comments: true
tags:
  - web performance
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint-logo.png
---

先日、参加した[html5j パフォーマンス部 第五回勉強会 ― 改正民法債権法と非機能要求としての Web パフォーマンス](https://atnd.org/events/106358)の勉強会にて**「Synthetic Monitoring」**なる聞きなれない単語が出てきたので、学習のためこのブロクのパフォーマンスを 1 週間測定してみた話です。

勉強会の内容をみて「Synthetic Monitoring とは？」っと興味を持った方には、読むと雰囲気が伝わるのではと思います。

Synthetic Monitoring については、当日の竹洞さんの資料や動画を確認してください。

- (Slide) <https://www.slideshare.net/takehora/web-150634918>
- (Video) <https://www.youtube.com/watch?v=R44_wzrkVMw>

> 注意)
>
> - この記事の内容は、[Spelldata 代表取締役 竹洞さん](https://spelldata.co.jp/about/representative.html)に測定を協力していただき、いろいろ教授していただい内容を元にしています。しかし、私自身が曲解・誤解している部分もあると思いますので、内容は正確でない可能性があります。ご注意ください。
> - 個人ブログを 1 週間計測しただけのごく限られた条件下の話であるため、この記事の内容を Web パフォーマンス全般について語っているような形で解釈しないでください。また計測値についても鵜呑みにしないでください。ご自身の Web サイトの状態を正確に知るためには、実際に測定して専門家に分析を依頼してください。
> - ブログ書きながら画像のキャプチャを撮っているため、若干計測の時間がずれているものがあります。雰囲気を感じるには十分だと思いそのままにしています。

## 測定条件

測定した条件は次の通りです。

- 測定したページ: <https://blog.mitsuruog.info/2018/03/how-to-learn-css-1>
- 測定期間: 2019/6/21 ~ 2019/6/28
- 測定ネットワーク:
  - 4G
  - 4G エミュレート
  - Desktop
- 測定地点:
  - Tokyo: NTT
  - Tokyo: KDDI
  - OSAKA: NTT
- 測定間隔: 各測定地点 15 分間隔
- 測定方法: Catchpoint を使った Synthetic Monitoring

> 注意)
>
> - 3 タイプの測定ネットワークで測定を行なっていますが、Desktop 以外のネットワークでサイトが遅すぎて測定がタイムアウトしてしまっていたため、以降の測定値はすべて Desktop で測定した内容です。

## このブログの測定結果

### 直近 1 時間分布を見る

まずはじめに直近 1 時間のパフォーマンス推移の散布図を見てみます。メトリクスは次の 3 つです。

- Render Start (ms)
- Document Complete (ms)
- Speed Index

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint1-1.png)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint1-2.png)

- Render Start (ms): 700ms~2s くらい
- Document Complete (ms): 2s~3s くらい
- Speed Index: 1,000~2,000

### 直近 24 時間分布を見る

直近 1 時間では信頼性に欠けるので、範囲を 24 時間に広げます。

Render Start の中央値が 1,298ms で Document Complete の中央値が 2,786ms なので、
残念ですが遅いサイト確定です。

いくつか**外れ値**(赤丸で括った部分)の存在が確認できます。外れ値は後ほどの Waterfall を見てみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint1-3.png)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint1-4.png)

俯瞰して見ると、ブログの速度は次の関係が成立しそうです。

- (速い) OSAKA: NTT > Tokyo: NTT > Tokyo: KDDI (遅い)

## 単一測定点の Waterfall を見る

だいたいの傾向がわかったので、中央値あたりにある測定点の Waterfall を見てみます。

この測定点の測定データでは、Render Start が 1,800ms で Document Complete までが 3,100ms です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-1.png)

どのあたりにボトルネックがあるかというと、下の図から次のリクエストに問題がありそうです。()の中は用途です。

- ws-fe.assoc-amazon.com（Amazon アフィリエイト）
- blog.mitsuruog.info（HTML 配信）
- s3-ap-northeast-1.amazonaws.com（画像配信）
- i.creativecommons.org（画像配信）
- maxcdn.bootstrapcdn.com（FontAwesome CDN）
- rcm-fe.amazon-adsystem.com（Amazon アフィリエイト）
- Render Start から JavaScript の実行時間が 1,500ms くらいある

個別に見ていきます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-2.png)

まず HTML 配信から。

このサイトは[Netlify](https://www.netlify.com)(Free プラン)を使っているのですが、ここでの HTML 配信が遅延しているようです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-3.png)

> [Netlify Pricing](https://www.netlify.com/pricing/)を確認すると Free プランでも Netlify Edge features の Global CDN deployments が有効になっているので、単純にこの CDN が遅いだけかもしれません。
> （有料化したら別の高速化オプションがあるかもしれませんが。。。）

次に FontAwesome の CDN。遅いですね。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-4.png)

続いて画像配信。このサイトの画像は S3 から直接配信しています。

S3 の場合は、画像の最初の 1 バイト目が配信されるまでは速いのですが、ファイルサイズが大きくなると急激にデータの送り出しが遅くなるケースがあるようです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-5.png)

続いて、クリエイティブ・コモンズの画像。
（こんな小さな画像の配信でこんなに遅延するとは。。。）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-6.png)

そして、Amazon アフィリエイト。
（Redirect!? 一体こいつは何をしているんだ。。。）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-7.png)

最後に JavaScript の実行時間です。1,500ms くらいあります。

> この時間は Catchpoint では測定できないので、Developer tool のプロファイルで測定・分析する必要があります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint2-8.png)

今日は、パフォーマンス改善の話はしないので、ボトルネックの把握だけにします。
ここまでで判明した事実として、このブログは次のボトルネックがあるようです。

- HTML 配信が遅い
- S3 からの画像配信が遅い
- FontAwesome の CDN とクリエイティブコモンズの画像配信が遅い
- Amazon のアフィリエイトが遅い
- JavaScript の実行時間が遅い

続いて代表的な外れ値の Waterfall を確認してみます。

### 外れ値(S3 遅延のケース)

まず、Render Start が一番遅延している測定点の Waterfall を確認します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint3-1.png)

Render Start まで 10s 掛かっています。
ボトルネックを見ると、S3 が遅延していることがわかります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint3-2.png)

上のボトルネックでも判明している、S3 からの画像の送り出しの部分が非常に遅延していますね。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint3-3.png)

## 外れ値(JavaScript 実行による遅延のケース)

続いて、Document Complete が遅延している測定点を見てみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint4-1.png)

Render Start から Document Complete まで 5s 掛かっていることがわかります。

ボトルネックを見ると遅延していますが、上の Render Start の中央値 1,298ms と比べると Render Start の 1,397ms というのは、そこまで外れ値でななさそうです。
（つまり、通常通りの遅延であって、ここまで異常値になった原因ではない。）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint4-2.png)

異常箇所はどこにあるかというと、JavaScript の実行時間にありました。

ここの分析には Developer tool でプロファイルの測定をする必要がありますが、このタイミングを捉えるのは非常に根気がいる作業であることが容易に想像できます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint4-3.png)

## ボトルネック通信の品質の揺らぎを見る

続いて各ボトルネックの品質がどれくらい幅があるか見てみます。これは継続的にデータを収集する Synthetic Monitoring ならではの面白さだと感じます。

ちなみにパフォーマンスにおいて品質とは**「速さ」**です。

### ボトルネック通信をピックアップして分布を見る

まず、測定した通信の中で遅いものをピックアップします。
今回は次の 3 つをピックアップしました。

- `https://blog.mitsuruog.info/2018/03/how-to-learn-css-1`
  - S3 から配信している画像の中でも特別にサイズが大きいもの(サイズは 1M)
- `https://i.creativecommons.org/l/by-sa/4.0/88x31.png`
  - クリエイティブコモンズの画像
- `https://rcm-fe.amazon-adsystem.com/e/cm`
  - Amazon の AD システムの何か？

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint5−1.png)

まず分布をみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint5−2.png)

このままでは何もわからないので、累積分布関数(Cumulative Distribution Function)をかけます。

累積分布を見ると**どれくらいの確率でどれくらいの速度が出ているか**がわかります。
下のグラフを眺めていると、途中までは速度が速く一定ですが、急に遅くなるポイントがあります。これを**「変曲点」**と呼び、品質を見る上で重要なポイントです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint5−3.png)

個別にみてみます。

### S3 画像配信の品質

まず分布をみます。
中央値は 238ms ですが、分布を見ると速いケースと遅いケースに二極化しているようです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint6−1.png)

次に累積分布をみます。変曲点は 60 パーセンタイルと 99 パーセンタイルの 2 つでした。
つまり「60%の確率で速く、残りの 39%の確率は非常に遅く、1%の確率で信じられないくらい遅い」ということです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint6−2.png)

このグラフのように速度のばらつきも大きいため、大きいサイズの画像を S3 から配信した場合は**品質が悪い**と言えます。

### クリエイティブコモンズと Amazon の AD システムの品質

2 つまとめて分布を見てみます。
分布を見るとクリエイティブコモンズの方が、Amazon の AD システムよりも高速なことが多いことがわかります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint7−1.png)

次に累積分布をみます。変曲点は共に 99 パーセンタイルでした。
つまり「99%の確率で遅く、1%の確率で信じられないくらい遅い」ということです。

このような累積分布を示す場合は、(遅いけど)**品質が良い**と言えます。
下のグラフを見ると、クリエイティブコモンズは品質が一定ですが、Amazon の AD システムは少し変動の幅があるため、クリエイティブコモンズの方が品質が良いと言えます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint7−2.png)

### Netlify からの HTML 配信の品質

Netlify からの HTML 配信の分布をみてみます。

> 記事を書いている間にとんでもない外れ値が出ていました。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint8−1.png)

次に累積分布をみます。
品質は安定していますが、1 つだけ異常な測定値がありました。これは一体なんなのでしょうか。。。？

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint8−2.png)

異常点の Waterfall を見てみます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint8−3.png)

なんと DNS failure。サイトに到達できてない。

今回の計測では、これの原因の推測まではできません。
しかし、1 ヶ月や 1 年などの長い周期で測定していた場合、何かの傾向(定期的なシステムメンテナンスなど)が読み解けるかもしれませんね。

### S3 から小さな画像を配信してみたらどうか？

S3 から大きい画像を配信した場合は遅延することがわかったのですが、小さな画像の場合はどうでしょうか？
小さな画像の通信をいくつかピックアップして分布を見てみます。

中央値は 25ms なので割と高速ですが、分布にばらつきがみられ品質はあまり良さそうではないです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint9-1.png)

累積分布を見てみます。
品質が一定ではない(気がする)。
CloudFront などの CDN から配信した場合を直接測定したことがないので、正直なんとも言えませんね。CDN を測定してみると違いがわかると思います。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/catchpoint9-2.png)

ちょっと疲れてきたので、このあたりにします。

## まとめ

自分のブログのパフォーマンスを Synthetic Monitoring で 1 週間測定してみて、通信上のボトルネックについてどれくらいの品質なのか分析してみました。

わかったこととしては、このブログは遅いが、HTML 配信や画像配信、JavaScript 実行のプロファイル分析をすることで高速化する可能性があるということです。
また、品質管理の観点では、品質は平均ではなく分散であり、累積分布をみることでどれくらい安定しているか判断できるようになることがわかりました。

継続的に同じ条件で測定を行うことで、別の視点からの比較・分析がやりやすいことがわかりました。

とはいえ、Catchpoint は個人で使うには高すぎるので、別の代替えサービスを探して測定を続けたいと思います。

### 謝辞

個人で Synthetic Monitoring を試してみようと思ったところ、どのサービスも個人で利用するためには敷居が高すぎて頓挫しているところを、「1 週間なら試しに測定してもいいよ」と言ってくれただけでなく、後日、丁寧な解説用の動画を作成してくれた竹洞さんに最大の感謝を送ります。
