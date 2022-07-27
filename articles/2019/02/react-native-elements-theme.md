---
layout: post
title: "react-native-elementsで動的にThemeを変更する"
date: 2019-02-14 0:00:00 +900
comments: true
tags:
  - react-native
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-elements-logo.png
---

react-native プロダクトでベースとなる UI コンポーネントライブラリを探していたら、ちょうどいいタイミングで
[react-native-elements](https://github.com/react-native-training/react-native-elements) が v1 になったので使ってみることにしました。

v1 の目玉機能の一つに Theme があります。
基本的な使い方は、自身でカスタム Theme を作成してから`ThemeProvider`にその Theme を渡すだけで動くのですが、一度設定した Theme をプログラムにて変更する場合に一癖あったので、その辺りを紹介します。

Theme についての公式のドキュメントはこちらです。

- [Customization · React Native Elements](https://react-native-training.github.io/react-native-elements/docs/customization.html)

## Theme の基本的な使い方

まずカスタム Theme を作成します。Theme のオブジェクトフォーマットについては[こちら](https://react-native-training.github.io/react-native-elements/docs/customization.html#the-theme-object)を参照してください。

```js
const theme = {
  colors: {
    primary: "green",
  },
};
```

これを App.js などの上位のコンポーネントに`ThemeProvider`を置いて Theme を設定して読み込ませれば大丈夫です。

```js
// App.js

  ...

  render() {
    return (
      <ThemeProvider theme={theme}>
        <AppRoute /> // react-native-router-fluxなどのRoute設定コンポーネント
      </ThemeProvider>
    );
  }

```

## Theme を動的に変更する

さて、Theme を動的に変更してみましょう。`ThemeProvider`は`theme`を props に持っているので、これを変更すれば Theme も変更できそうですが、実際には変更できません。

- [Question: Is it possible to toggle active Theme at runtime? · Issue \#1714 · react\-native\-training/react\-native\-elements](https://github.com/react-native-training/react-native-elements/issues/1714)

props での Theme の変更をゆるしてしまった場合、全てのコンポーネント  ツリーのコンポーネントが再描画されてしまうため、これを避けるために`withTheme` HOC(High Order Component)か`ThemeConsumer`を使って`updateTheme`を呼び出す必要があるようです。

今回は`withTheme`を使ってみました。

## withTheme を使った Theme の変更

まず Theme の変更をトリガーするコンポーネントを`withTheme`でラップします。ラップされたコンポーネントには props に`updatetheme`と`theme`が渡されてくるので、`updateTheme`に変更後の Theme を設定します。

```js
// Child.js
const Child = (props) => {
  return (
    <View>
      <Button
        title="Change theme"
        onPress={() => props.updateTheme({ colors: { primary: "blue" } })}
      />
    </View>
  );
};

export default withTheme(Child);
```

実際の画面はこんな感じで切り替わります。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/react-native-elements1.gif)
