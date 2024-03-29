---
layout: post
title: "react-nativeでreact-styleguidistを使う"
date: 2019-02-12 0:00:00 +900
comments: true
tags:
  - react-native
  - styleguide
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-react-styleguidist-logo.png
---

react-native のプロジェクトで[react-styleguidist](https://github.com/styleguidist/react-styleguidist)を使う方法です。

コードのサンプルは本家の方に PR 送ったのでこちらの見てください。

- <https://github.com/styleguidist/react-styleguidist/tree/master/examples/react-native>

> 本家の方でコードが変わっている場合もあります。ご注意ください。

使っているライブラリなどのバージョンは次の通りです。

- expo: 32.0.0
- react-styleguidist: 8.0.6
- react: 16.5.0
- react-dom: 16.7.0
- react-native-web: 0.10.0
- @babel/core: 7.2.2

Expo を使ってますが、react-native のプロジェクトでも大まかな手順はほとんど同じだと思います。

## 動作の仕組み

react-styleguidist には react-native で動作させるための仕組みがないので、[react-native-web](https://github.com/necolas/react-native-web)を使って react-native の UI コンポーネントを Web で表示できるように変換して表示します。

簡単な図に表すと次のような仕組み  に  なっています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-react-styleguidist1.jpg)

通常は react-native は[Metro bundler](https://facebook.github.io/metro/)を通して実行可能な形式になりますが、react-native-web で動かす場合は、[Babel](https://babeljs.io/)を  使って  トランスパイルを行ってから、react-styleguidist で処理します。

## react-styleguidist の導入

### react-styleguidist とその  依存モジュールをインストール

react-styleguidist とその依存モジュールをインストールします。

```sh
npm install --save-dev @babel/core @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread @babel/polyfill @babel/preset-env babel-loader babel-plugin-react-native-web file-loader metro-react-native-babel-preset react-dom react-native-web react-styleguidist webpack
```

注意点としては、react-native v0.57 から[babel-preset-react-native](https://www.npmjs.com/package/babel-preset-react-native)は[metro-react-native-babel-preset](https://github.com/facebook/metro/tree/master/packages/metro-react-native-babel-preset)に置き換わっていて、Babel も 7 系を  使うようになっています。古いサンプルなどは依存関係のバージョンに注意してください。

> `react-art`が依存関係に見つからないというエラーが出る場合は、npm インストールしてください。

### styleguide.config.js を設定  する

styleguide.config.js を追加します。

```js
// styleguide.config.js
const webpack = require("webpack");

module.exports = {
  require: ["@babel/polyfill"],
  components: "src/**/[A-Z]*.js",
  webpackConfig: {
    resolve: {
      // auto resolves any react-native import as react-native-web
      alias: { "react-native": "react-native-web" },
      extensions: [".web.js", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: [/node_modules/],
          options: {
            plugins: [
              "@babel/proposal-class-properties",
              "@babel/proposal-object-rest-spread",
              "react-native-web",
            ],
            presets: [
              "@babel/preset-env",
              "module:metro-react-native-babel-preset",
            ],
            babelrc: false,
          },
        },
        {
          test: /\.(jpe?g|png|gif)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                hash: "sha512",
                digest: "hex",
                name: "[hash].[ext]",
              },
            },
          ],
        },
        {
          test: /\.ttf$/,
          loader: "file-loader",
        },
      ],
    },
    // Most react native projects will need some extra plugin configuration.
    plugins: [
      // Add __DEV__ flag to browser example.
      new webpack.DefinePlugin({
        __DEV__: process.env,
      }),
    ],
  },
};
```


注意点としては、webpack の`resolve.alias`オプションで、`react-native`の参照先を`react-native-web`に置き換えている部分です。これで内部で宣言されている react-native 部分を react-native-web に豪快に置き換えています。

 実際のファイルはこちらです。

- <https://github.com/mitsuruog/react-styleguidist/blob/master/examples/react-native/styleguide.config.js>

これで`npm run styleguide`をすると、次のような画面が表示されます。
![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-react-styleguidist2.png)

## まとめ

最近、react-native を仕事で使うことが多いので react-styleguidist が動かせるかどうか調べてみました。

`react-native`の参照先を`react-native-web`に置き換えているため、実際の再現度など細かな部分で差異がありそうです。

- [react\-native\-web: Compatibility with React Native](https://github.com/necolas/react-native-web#compatibility-with-react-native)

> 自分の場合は、採用を検討した結果、`react-native-web`部分に不安があるので見送りました。
