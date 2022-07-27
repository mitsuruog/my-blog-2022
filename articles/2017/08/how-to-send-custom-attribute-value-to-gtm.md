---
layout: post
title: "リンククリック時にカスタムデータをGoogle tag managerに送信する"
date: 2017-08-01 0:00:00 +900
comments: true
tags:
  - その他
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/tagmanager_email.png
---

Google tag manager を使った小ネタの紹介です。

<!-- more -->

## 想定ユースケース

特定のリンクをクリックした時に Google tag manager に  何か特別な値も一緒に送りたい。

Google tag manager のクリックイベントハンドラでは、ページの URL・遷移先 URL・リンクのラベルなどの基本的な情報は取れます。
しかし、それだけでは分析する上で十分ではない場合が多く、もう少し送信できるデータの種類を増やしたいと思うことは多いのではないでしょうか。

そんな時に利用できるのが、今回紹介する小ネタです。

## 手順

### リンクに Custom Attribute を設定する

対象のリンクに次のように Custom Attribute(今回は`data-ga-custom-value`)を設定します。Attribute 名は任意ですが、次のステップでも同じ値を利用する必要があります。

```
<a href="/jump/to/cool/web-site"
   data-ga-custom-value="何かのキャンペーンコードとか">Click</a>
```

### Google tag manager 上でユーザー定義変数を定義する

次に、Google tag manager 上でユーザー定義変数を定義するのですが、少しテクニックが必要です。

#### 変数のタイプは「カスタム JavaScript」とする

まず、変数のタイプは「カスタム JavaScript」とします。
これを設定することで、Google tag manager 何かのイベントを検知したタイミングで任意の JavaScript を実行して、その結果をユーザー定義変数に格納します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gtm_1.png)

#### Custom Attribute を取得するコードを設定する

続いて、Custom Attribute を取得するために次のコードを入力します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gtm_2.png)

実際のコードはこちらです。

```
function() {
  var el = {{Click Element}}
  var data = el.getAttribute("data-ga-custom-value");
  return data;
}
```

`{% raw %}{{Click Element}}{% endraw %}`は、Google tag manager 上のビルトイン関数で、クリックした Element の Object を返します。

そのあとは、通常の JavaScript の世界なので`getAttribute()`を使って Custom Attribute の値を取得すれば OK です。

### Google tag manager のタグにカスタム変数を設定する

最後に、Google tag manager のタグの設定の際に、ユーザー定義変数を利用すれば OK です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gtm_3.png)

変数のリストの中に含まれています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/gtm_4.png)

## まとめ

自由にデータが送信できようになるので、やって見ると結構感動的でした。

「こんなことできたらいいなー。」と思っていたのですが、なかなか日本語の情報が見つからなかったのでまとめてみました。

- [Google Tag Manager event tracking using data attribute elements](https://www.thyngster.com/google-tag-manager-event-tracking-using-data-attribute-elements/)
