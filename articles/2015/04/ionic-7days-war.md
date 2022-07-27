---
layout: post
title: "Androidアプリ開発初心者がionicでアプリを作って公開するまでの7日間の道のり"
date: 2015-04-17 23:30:00 +0900
comments: true
tags:
  - cordova
  - ionic
  - Android
---

[Ionic](http://ionicframework.com/)で Android アプリを初めて作って公開してみました。

ionic で開発自体は AngularJS ベースということもあり、結構スムーズだったのですが、開発以外の部分で意外とハマったので、その辺り紹介しようと思います。

<!-- more -->

作ったアプリはこちらです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/hello-ionic-1-1.png)

~~ダウンロードはこちら(現在は配布しておりません)~~

はい、千葉のローカルバスのアプリです。

では、早速本題へ。

## ionic でアプリ scaffold の作成

まず、ionic の概要についてご存知ない方はこちらを参照してください。

[キミは ionic を知っているか？AngularJS+PhoneGap+美麗コンポーネント群！ | HTML5Experts.jp](https://html5experts.jp/canidoweb/7359/)

最初に ionic を使ってアプリ scaffold を作成します。こちらは公式サイトの手順通りに行えばいいと思います。

[Getting Started with Ionic - Ionic Framework](http://ionicframework.com/getting-started/)

```sh
$ npm install -g cordova ionic
$ ionic start <アプリ名> tabs
$ cd <アプリ名>
$ ionic platform add android
$ ionic serve
```

最後の`ionic serve`すると、アプリの webview 部分がブラウザ上で表示されますので、比較的単純なデバックはこちらで行いながら開発していきます。

### パッケージ名の変更

ionic コマンドでアプリ scaffold の作成した場合は、必ず`config.xml`の`<widget id="">`のパッケージ名を変更してください。  
デフォルトでは`com.ionicframework.<アプリ名+乱数>`のような形式になっています。
これは後でストア公開するときのアプリの公開 ID になります。ストア公開後は変更できませんので必ず変更するようにしてください。

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<widget id="com.mitsuruog.transitbus"
  version="0.0.1" xmlns="http://www.w3.org/ns/widgets"
  xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <name>アプリ名</name>

  ...(省略)

```

## ionic でのアプリ開発

ionic は AngularJS ベースですので、UI 部分の開発は比較的 AngularJS の知識が流用できます。  
今回は、Cordova で利用頻度の高い plugin を AngularJS のモジュールでラップして使いやすくした、`ngCordova`を利用しました。

[ngCordova - Simple extensions for common Cordova Plugins - by the Ionic Framework Team - by the Ionic Framework Team](http://ngcordova.com/)

導入は、ngCordova の bower モジュールをインストールして、トップレベルの AngularJS モジュールで宣言すると利用できます。

```sh
$ bower install ngCordova --save
```

**app.js**

```js
angular.module("yourApp", ["ionic", "ngCordova"]);
```

ngCordova のそれぞれの plugin を利用するためには、別途 Cordova コマンドにて plugin をインストールする必要があります。詳しくは公式サイトを参照してください。

[ngCordova - Document and Examples - by the Ionic Framework Team](http://ngcordova.com/docs/plugins/)

### 実機での実行、デバック(webview)

実機での実行とデバックは、USB ケーブルで Android 端末の実機と PC を接続してから下のコマンドを実行すると、実機上にアプリがビルドされて実行されます。

```sh
$ ionic run android
```

webview デバックについては、Chrome を立ち上げて`chrome://inspect`することで、実機上の WebView を直接インスペクトすることができます。

手前味噌ですが、以前こんな記事を書いてます。

[Android やってる人で ChromeDevtools の Remote Debugging と Screencasting 知らない人は使ってみた方がいいよ！ - I am mitsuruog](http://blog.mitsuruog.info/2013/12/androidchromedevtoolsremote.html)

### ionic テーマのカスタム

ionic のスタイルは`Sass`で出来ていて、テーマ部分は`_variables.scss`に入っています。上書き用の`.scss`を書いてコマンドを実行すると上書きすることができます。

[Writing a Sass Theme | Formulas | Learn Ionic](http://learn.ionicframework.com/formulas/working-with-sass/)

通常は、`./scss/ionic.app.scss`にカスタム用の scss ファイルがあるので、こちらにカスタムする内容を書いていきます。Sass の環境構築についてはこちらを参照してください。

[Ionic CLI - Using Sass | Ionic Framework](http://ionicframework.com/docs/cli/sass.html)

[Sass: Syntactically Awesome Style Sheets](http://sass-lang.com/assets/img/illustrations/glasses-2087d741.svg)

コマンドの例はこちらです。

```sh
$ sass --watch scss/ionic.app.scss:www/css/ionic.app.css
```

これをプロジェクトのトップレベルで実行すると、`scss/ionic.app.scss`を参照して、`www/css/ionic.app.css`に上書き用の CSS を生成してくれます。  
`index.html`で、この CSS を読み込むとテーマをカスタムすることができます。

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width"
    />
    <title></title>

    <link href="lib/ionic/css/ionic.css" rel="stylesheet" />
    <!-- IF using Sass (run gulp sass first), then uncomment below and remove the CSS includes above -->
    <link href="css/ionic.app.css" rel="stylesheet" />

    ...(省略)
  </head>
</html>
```

あとは、ガツガツ開発していきます。

PC のブラウザ上では正しく表示されているけど、実機だと表示できない・・・  
といった事がよくありますが、気にせず頑張ってください。

その辺りの微妙な不安感を楽しめるかどうかが、ionic と仲良くなるコツです。(うーん、アプリ開発全般で言えることか・・・)

ちなみに、プラットフォームで表示に差異が生じた場合は、CSS を上書きするようなパッチを当てます。  
ionic ではプラットフォームごとに、`platform-android`のような CSS クラスを付与しているので、以下のように追加で CSS を書きます。

```css
.platform-android .hoge {
  color: red;
}
```

### アイコン&スプラッシュイメージ

ionic には、プラットフォームでサイズがまちまちで作成が面倒なアイコンやスプラッシュイメージを、ベースのイメージから自動生成する仕組みが備わっています。

[Automating Icons and Splash Screens | The Official Ionic Blog](http://blog.ionic.io/automating-icons-and-splash-screens/)

`resources/android`フォルダの直下にアイコンであれば`icon.png`、スプラッシュイメージであれば`splash.png`を作成して置いてください。
(ios であれば`resources/ios`に置いてください)

以下のコマンドを実行すると、各プラットフォームごとに画像を生成してくれて、`config.xml`まで書き換えてくれます。超便利。

```sh
$ ionic resources
```

ちなみに、アイコンはこちらから探してきました。

[Clipart - High Quality, Easy to Use, Free Support](https://openclipart.org/)

### google analytics の導入

Web サイト同様にアプリでもユーザーの行動を分析したいので、google analytics を導入します。
ngCordova には GoogleAnalytics 用の plugin がありますが、今回は Android Native SDK v4 対応の別のものを使いました。

[cmackay/google-analytics-plugin](https://github.com/cmackay/google-analytics-plugin)

```sh
$ cordova plugin add com.cmackay.plugins.googleanalytics
```

初期化には少し注意する必要があるので、こちらを参照してください。(使ってるライブラリ微妙に違うけど、雰囲気わかってくれるはず。)

[Using Google Analytics With IonicFramework](https://blog.nraboy.com/2014/06/using-google-analytics-ionicframework/)

View の切り替え時などは、ionic の`ion-view `のライフサイクルイベントをハンドルしてトラッキングします。

**controller.js**

```js
$scope.$on("$ionicView.beforeEnter", function () {
  navigator.analytics.sendAppView("view名");
});
```

どのバス停が人気があるかとか、こっそりトラッキングしてニヤニヤしてます。  
ちゃんと真面目にエラーのスタックトレースも取得してます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/hello-ionic-2-2.png)

> モバイルアプリのトラッキングは Google Analytics 上のアナリティクス設定で新しいプロパティを作成する際に、トラッキングの対象を「モバイルアプリ」にしてください。(普段、Web ページのトラッキングをやっているので、最初うっかりハマってしまいました。)

## 公開準備

アプリの作成が完了しましたので、公開するための準備を行います。

### アプリのビルド

アプリが出来上がったので、リリース用にビルドします。手順は公式サイトを参照してください。

[Publishing your app - Ionic Framework](http://ionicframework.com/docs/guide/publishing.html)

まず、アプリをリリースビルドします。

```sh
$ cordova build --release android
```

これで、`platforms/android/ant-build/MainActivity-release-unsigned.apk`というファイルが生成されます。  
これは unsigned APK(署名なし APK)と呼ばれるもので、このままだと Play store に公開できません。

次に署名を作成します。`keytool`コマンドで private key を生成します。  
この手順は初回 1 回のみです。生成された private key はズッ友なので無くさないように。。。

```sh
$ keytool -genkey -v -keystore <あなたのKeyの名前>.keystore
  -alias <エイリアス名> -keyalg RSA -keysize 2048 -validity 10000

姓名は何ですか。
  [Unknown]:
組織単位名は何ですか。
  [Unknown]:
組織名は何ですか。
  [Unknown]:
都市名または地域名は何ですか。
  [Unknown]:
都道府県名または州名は何ですか。
  [Unknown]:
この単位に該当する2文字の国コードは何ですか。
  [Unknown]:
CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknownでよろしいですか。
  [いいえ]:  y
```

この例だと、10,000 日間有効な 2,048 ビットの RSA の鍵ペアと自己署名型証明書(SHA256withRSA)を生成するらしい。

次に、`jarsigner`コマンドを使って、APK を署名します。

```sh
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1
  -keystore <あなたのKeyの名前>.keystore platforms/android/ant-build/MainActivity-release-unsigned.apk <エイリアス名>

キーストアのパスワードを入力してください:
   追加中: META-INF/MANIFEST.MF
   追加中: META-INF/TRANSITB.SF
   追加中: META-INF/TRANSITB.RSA
  署名中: AndroidManifest.xml
  署名中: assets/_where-is-www.txt
  署名中: assets/www/app/animation.css
  署名中: assets/www/app/app.constant.js

...

  署名中: res/xml/config.xml
  署名中: resources.arsc
  署名中: classes.dex
jarは署名されました。

警告:
-tsaまたは-tsacertが指定されていないため、このjarにはタイムスタンプが付加されていません。タイムスタンプがないと、署名者証明書の有効期限(2042-09-01)後または将来の失効日後に、ユーザーはこのjarを検証できない可能性があります。
```

最後に`zipplugin`コマンドで APK を zip 化します。

```sh
$ zipalign -vf 4 platforms/android/ant-build/MainActivity-release-unsigned.apk <アプリ名>.apk

Verifying alignment of transitbus.apk (4)...
      50 META-INF/MANIFEST.MF (OK - compressed)
    7366 META-INF/TRANSITB.SF (OK - compressed)
   14812 META-INF/TRANSITB.RSA (OK - compressed)
   15959 AndroidManifest.xml (OK - compressed)
...

 2413084 resources.arsc (OK)
 2415741 classes.dex (OK - compressed)
Verification succesful
```

コマンドを実行した直下に apk ファイルができているので、これを play ストアにう p すればいい。

[Android においてなぜ zipalign をやる必要があるのか - Qiita](http://qiita.com/kazuqqfp/items/8eae69e309c6ed75d661)

### ストア公開用アイコン&宣伝画像

まず、ストア公開用アイコンと宣伝画像ですね。正直、デザインセンスや画像編集ツール慣れてない身としては、ここが一番コストがかかったとこです。

画像編集ツールはいろいろ試して悩んだ結果。。。

[Keynote](https://www.apple.com/jp/mac/keynote/)が最も使いやすかったので使っています w。
プレゼンテーション用のソフトなんですが、画像編集も便利
です。

アプリのデバイス枠はめ込み画像はこちらで作成できます。

[Device Art Generator | Android Developers](http://developer.android.com/distribute/tools/promote/device-art.html)

### ストア公開用スクリーンショット

続いてはスクリーンショットですが、個人だと手持ちの端末が 1 機種しかないので、タブレットとかの画像がエミュレータで実行したものを利用します。

エミュレータは Genymotion を使っています。

[Genymotion](https://www.genymotion.com/#!/)

導入はこちら。スクリーンショット撮るときに Android Studio の「Android Device Monitor」を使いますので、一緒にセットアップしておきます。

[Genymotion + Android Studio on Mac - Qiita](http://qiita.com/Sam/items/8d551f575b617fa0be7e)

Genymotion 上に作成した apk ファイルをどうインストールするか、少し悩んだのですが、起動した Genymotion のエミュレータに対して apk ファイルをドラッグするとインストールできます。

エミュレータでのスクリーンショットですが、Genymotion から取得する場合は有料プランの機能のようです。  
そこで、下の記事のように Android Device Monitor から実行中のエミュレータをアタッチすることで、スクリーンショットを取得することにしました。

[android emulator - Capture screenshot in GenyMotion - Stack Overflow](http://stackoverflow.com/questions/21771416/capture-screenshot-in-genymotion)

エミュレータが実行されている状態で Android Device Monitor を起動します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/hello-ionic-3-1.png)

実行中のデバイスが表示されるので、「Screen capture」ボタンをクリックします。キャプチャ用の別画面が立ち上がります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/hello-ionic-3-2.png)

> 他に良い方法あれば教えてください。。。

## 公開

で、いろいろ揃えてストア公開しよう！と思ったら。。。

[Google Play デベロッパー コンソール - 基本事項 - Google Play デベロッパー ヘルプ](https://support.google.com/googleplay/android-developer/answer/6112435?hl=ja)

1 回登録すれば OK です。$25 です。あ、はい。

というわけで無事公開できましたー。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/hello-ionic-3.jpg)

## 最後に

作るのに 4 日。そこから公開まで 3 日くらいかかりました。  
1 日フルで使えた日はないので、実質はもう少し少ないと思いますが、予想より公開準備の部分のコストが掛かったと思います。  
初期の学習コストだと思うので次回以降は半分くらいになると思いますが。。。

普段やっている Web と違って、アプリの世界は結構大変ですね。

いつもエンジニアとしてアプリの機能を開発していますが、このように 1 から自身の手でやってみると、世の中に出ている素晴らしいアプリを作成する裏側でどれくらいの労力が掛かっているか、実感できてよかったです。

特にデザイン周りでは苦労しましたし、デザインスキルを持っている人は本当に素晴らしい。貴重な才能だなと思います。  
また機会があったら作ってみたいと思います。

ではではー。
