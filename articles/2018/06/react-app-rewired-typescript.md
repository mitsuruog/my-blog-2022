---
layout: post
title: "react-create-appで作成したTypeScriptのプロジェクトのwebpack.configを上書きする"
date: 2018-06-24 0:00:00 +900
comments: true
tags:
  - react
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/rewired.jpg
---

タイトル長くてすみません。

ひと昔前までは、[react-create-app](https://github.com/facebook/create-react-app)で作成したプロジェクトの webpack.config を上書きするには、`eject`するしか方法がなかったのですが、現在は [react-app-rewired](https://github.com/timarney/react-app-rewired)を使うことで上書きが可能です。

> この方法を使った場合、react-create-app が提供するツールの動作保証対象外となります。つまり、これ以降発生した問題は自己責任で解決しなければなりません。ご注意ください。

紹介する内容は、こちらの Github で見ることができます。

- <https://github.com/mitsuruog/create-react-app-typescript-rewired-styleguidist>

## react-app-rewired を導入する

基本的にはリポジトリにある README.md の通りに導入します。より具体的な例については後で少し紹介します。

### react-app-rewired をインストールする

まず npm モジュールをインストールします。

```sh
npm install react-app-rewired --save-dev
```

### プロジェクトのルートディレクトリに`config-overrides.js`を作成する

プロジェクトのルートディレクトリに`config-overrides.js`を作成します。とりあえず、ファイルの中身は公式ドキュメントのままにしておきますが、詳しくは後で紹介します。

```js
module.exports = function override(config, env) {
  //do stuff with the webpack config...
  return config;
};
```

### `package.json`の`sctipts`を変更する

`package.json`を変更します。

基本的には`react-scripts`の部分を`react-app-rewired`に変更すればいいのですが、TypeScript プロジェクトの場合は`--scripts-version`に起動スクリプトの名前が必要です。これは、react-app-rewired の内部で TypeScript 用の起動スクリプトにスイッチするために利用しています。

```diff
"scripts": {
-  "start": "react-scripts start",
+  "start": "react-app-rewired start --scripts-version react-scripts-ts",
-  "build": "react-scripts build",
+  "build": "react-app-rewired build --scripts-version react-scripts-ts",
-  "test": "react-scripts test --env=jsdom",
+  "test": "react-app-rewired test --env=jsdom --scripts-version react-scripts-ts",
},
```

### 動作確認する

最後にプロジェクトの開発用サーバーの起動とビルドの確認をします。

```sh
# 開発用サーバーの起動
npm start

# ビルド
npm build
```

正しく動いているようであれば、ひとまず導入は完了です。

## `config-overrides.js` をカスタマイズする

上の内容では元の Webconfig のままなのでカスタマイズする必要がありますが、その内容は**中〜上級者向け**です。カスタマイズのプロセスは次の通りです。

1. ここから[config-overrides.js のテンプレート](https://github.com/timarney/react-app-rewired#extended-configuration-options)を取得する
2. 設定変更用の関数(慣例で`rewire(再結線する)`と呼ぶことが多い)を作成する
3. rewire 関数を config-overrides.js に追加する

`config-overrides.js`のテンプレートは大まかに次のようなファイルになっています。
いくつかカスタマイズできるポイントがあるのですが、webpack.config のカスタマイズだけであれば、`webpack`の部分だけ注視していればいいと思います。

```js
module.exports = {
  // 開発サーバーのカスタマイズポイント
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      // デフォルト設定の開発サーバーを作成する
      const config = configFunction(proxy, allowedHost);

      // この辺でカスタマイズする

      return config;
    };
  },
  // `npm test`のカスタマイズポイント
  jest: function (config) {
    // この辺でカスタマイズする

    return config;
  },
  // webpack.configのカスタマイズポイント
  webpack: function (config, env) {
    // この辺でカスタマイズする

    return config;
  },
};
```

### (実践例)Sass 設定のカスタマイズ

では、既存の webpack.config の Sass 設定をカスタマイズして`sass-loader`を追加してみましょう。

> `react-create-app`の公式では別の方法が推奨されていますが、自分はこの昔ながらのやり方が好きなのです。

まず、Sass 設定を上書きする`rewireSass`関数を作成します。

```js
// config-overrides.js
const rewired = require("react-app-rewired");

function rewireSass(config) {
  const cssLoader = rewired.getLoader(
    config.module.rules,
    // ここでloaderをフィルタする
    (rule) => rule.test && String(rule.test) === String(/\.css$/)
  );

  // 新しいsass-loaderの設定
  const sassLoader = {
    test: /\.scss$/,
    use: [...(cssLoader.loader || cssLoader.use), "sass-loader"],
  };

  // sass-loaderを追加する
  const oneOf = config.module.rules.find((rule) => rule.oneOf).oneOf;
  oneOf.unshift(sassLoader);

  return config;
}
```

`react-app-rewired`のパッケージに`getLoader`という loader を pick up する関数があるので、これを使って既存の config から上書きするターゲットの loader だけを抽出します。

あとは、コードを見てもらうとわかると思うのですが、普通の JavaScript プログラミングです。
途中、`console.log`などを出しながら途中経過を見てカスタマイズしていきます。

> なので、将来 react-create-app 側の wepack.config が変わったり、Webpack 自体のバージョンが上がった場合は、容易に動作しなくなると思います。

この`rewireSass`関数を`config-overrides.js`に追加します。

```js
// config-overrides.js

function rewireSass(config) {
  ...
}

module.exports = {
  // 開発サーバーのカスタマイズポイント
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      // デフォルト設定の開発サーバーを作成する
      const config = configFunction(proxy, allowedHost);

      // この辺でカスタマイズする

      return config;
    }
  },
  // `npm test`のカスタマイズポイント
  jest: function (config) {

    // この辺でカスタマイズする

    return config;
  },
  // webpack.configのカスタマイズポイント
  webpack: function (config, env) {

    // この辺でカスタマイズする
    config = rewireSass(config, env); // <--------- ここに追加

    return config;
  },
};
```

Sass ファイルが Webpack で変換されていれば、無事 OK です。

## まとめ

react-create-app の Webpack.config をカスタマイズする方法でした。

react-create-app 便利なのですが、いままで作ったプロダクトではカスタマイズしなかったことなかったなぁ。。。
ちなみにカスタマイズは「**自己責任**」です。

カスタマイズする人は、「なぜ最近の Web フロントエンドはこんなに難しくなったのか。。。」と血の涙を流しながらやるといいでしょう。
