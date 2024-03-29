---
layout: post
title: "react-nativeで環境ごとに定数を切り替える(react-native-config)"
date: 2019-03-01 0:00:00 +900
comments: true
tags:
  - react-native
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-config-logo.png
---

まぁ、よくある development/statging/production の定数切り替えです。

いくつかライブラリを選定したのですが、最終的に[react-native-config](https://github.com/luggit/react-native-config)を使うことにしました。理由は NativeModule を使っていて、双方で定数を共有したいからです。

NativeModule を使っていなければ[react-native-dotenv](https://github.com/zetachang/react-native-dotenv)でも大丈夫だと思います。

導入にあたり Native 側にも設定が必要だったので、設定するにあたりある程度の困難はあると思っていたのですが、結構大変だったのでその辺りを中心に紹介します。

## 基本的な導入方法

公式ドキュメントにもあるとおり、`npm install`して`react-native link`をすると導入自体は終わります。

```sh
npm install --save react-native-config
react-native link react-native-config
```

設定ファイルの記述方法や基本的な環境の切り替えからなどは、[dotenv](https://github.com/motdotla/dotenv)と同じなので、使ったことがある人はそれほど苦労しないはず。

次のような`.env`ファイルを準備します。

```txt
API_URL=https://myapi.com
GOOGLE_MAPS_API_KEY=abcdefgh
```

react-native 側では次のように取得します。

```js
import Config from "react-native-config";

Config.API_URL; // 'https://myapi.com'
Config.GOOGLE_MAPS_API_KEY; // 'abcdefgh'
```

Native 側については設定がもう少し必要ですが、公式ドキュメントの内容にしたがってやってみるといいと思います。
で、ここまでが良く見かける記述。Google で検索すると良く出てくるのでサラッと流します。

NativeModule を使っている場合は、さらにここからドキュメントにない設定が必要です。ここからが本番です。

## トラブルシュート

自分が遭遇したトラブルについて残しておきます。

### Android 側で BuildConfig が見つからない

Android 側で定数を受け取るサンプルで良くあるのが、`MainApplication.java`などの**アプリの PackageName と同じパッケージ**だけでやっている場合。
これだと NativeModule を使っているケースでトラブルになります。

PackageName が`jp.sample.mitsuruog`だったとして、NativeModule を`jp.sample.mitsuruog.custom.hoge`など異なるパッケージに置いたとします。

```java
package jp.sample.mitsuruog.custom.hoge;

  ...

  public HttpURLConnection getApiClient() {
    URL url = new URL(BuildConfig.API_URL); // error: cannot find symbol
  }
```

`BuildConfig`は PackageName と同じパッケージに生成されるので、package をインポートする必要があります。

```diff
package jp.sample.mitsuruog.custom.hoge;

+ import jp.sample.mitsuruog.BuildConfig;

  ...

  public HttpURLConnection getApiClient() {
    URL url = new URL(BuildConfig.API_URL); // 'https://myapi.com'
  }
```

- [React Native Android Build Error MainActivity.java:29: error: cannot find symbol](https://stackoverflow.com/a/35912176/1855830)

### swift で使うための設定

swift で使いたいですが。。。残念ながら、公式やほどんどのサンプルが Objective-c で実装されているものです。

swift で使うためには、まず Bridge ファイルに react-native-config の Header を登録します。

```diff
// Bridging-Header.h
#import "React/RCTBridgeModule.h"
+ #import "ReactNativeConfig/ReactNativeConfig.h"
```

swift では次のように使います。

```swift
import ReactNativeConfig

...

あとで足すからちょっと待って
```

### xcode でビルドでエラー

xcode 上でのエラーが消えたので、実機で試そうかと思ってビルドしたらエラー。`ReactNativeConfig`が見つからない。

...え？

原因は`react-native link`がなんらかの理由で**正しく react-native-config を設定できていない**ためでした。

まず、xcode のプロジェクトビューの`Libraries`グループの中に`ReactNativeConfig.xcodeproj`があることを確認します。もしなければ、次の手順にしたがって手動でリンクを直してください。

- [Linking Libraries · React Native](https://facebook.github.io/react-native/docs/linking-libraries-ios.html)

プロジェクトの「Build Settings > Header Search Paths」には`$(SRCROOT)/../node_modules/react-native-config/ios`を追加します。

{% img https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-config1.png 550 %}

- ['GeneratedDotEnv.m' file not found](https://github.com/luggit/react-native-config/issues/187#issuecomment-368769123)
- ['ReactNativeConfig\.h' file not found](https://github.com/luggit/react-native-config/issues/81)

## まとめ

日本語や英語の react-native-config についての記事は、どれもここまで踏み込んだ内容ではなかったので、導入は少し面倒でした。
導入した結果、複数の環境で定数を分けることができたので結果には満足しています。

が。。。

react-native の外部ライブラリの設定周り、こんなに不安定でいいのか！？

> このブログは iOS 側で複数の環境を構築する手順が載っていてわかりやすいです。
>
> - [Managing Configuration in React Native – Differential – Medium](https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b)
