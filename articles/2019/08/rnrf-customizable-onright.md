---
layout: post
title: "react-native-router-fluxのonRightをカスタマイズする(part2)"
date: 2019-08-27 0:00:00 +900
comments: true
tags:
  - react-native
  - react-native-router-flux
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/rnrf-logo.png
---

[react-native-router-flux](https://github.com/aksonov/react-native-router-flux)の小ネタです。

前回の話はこちら。

- [react\-native\-router\-flux の onRight をカスタマイズする \| I am mitsuruog](https://blog.mitsuruog.info/2019/03/rnrf-customizable-onright)

前回はアプリの NavBar の右側にあるボタン(以下、RightButton)をクリックした時に、次の画面に props を渡したいようなユースケースを想定していましたが、今回は RightButton を props の条件で出し分けしたいと思います。

次のような手順で実現できそうです。

1. PageComponent 内部で RightButton を出す
2. RightButton をタップした時に、Component 内部のタップハンドラ(private function)を実行する
3. 外部からの props の値で RightButton を出し分けする

コードは全て TypeScript です。

## PageComponent 内部で RightButton を出す

RightButton の追加方法は**いくつかある**のですが、今回は PageComponent に static な`navigationOptions`プロパティを追加して、この中で RightButton 用の Component を定義します。

> この方法というものがいくつかあって、それぞれ期待する動きをしないので辛いです。

```ts
// ...
import { NavigationScreenProps } from "react-navigation";

class Page extends React.Component<State, Props> {
  static navigationOptions = ({ navigation }: NavigationScreenProps) => {
    return {
      // ここにRightButtonのComponentを渡す
      headerRight: <Button title="+1" />,
    };
  };

  render() {
    // ...
  }
}
```

`navigationOptions`で渡されている関数の`navigation`は`react-navigation`の`NavigationScreenProps`の型を使います。これは、`react-native-router-flux`が`react-navigation`をベースとして拡張しているためです。

## RightButton をタップした時に、Component 内部のハンドラを実行する

RightButton をタップした時に、Component 内部のハンドラを実行するには`Button`Component の`onPress`を使えば可能です。しかし、`static`プロパティ内部から PageComponent 内の private function を呼び出すにはひと工夫必要でした。

`static`プロパティ内部から PageComponent の function を実行するには、props の`navigation`を通じて function の参照を渡すことで可能となります。
`componentDidMount`の中で props の`navigation.setParam`を使うことで参照を渡すことができます。

```ts
// ...
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";

export interface Props {
  navigation: NavigationScreenProp<any, any>;
}

class Page extends React.Component<State, Props> {
  static navigationOptions = ({ navigation }: NavigationScreenProps) => {
    return {
      headerRight: <Button title="+1" />,
    };
  };

  componentDidMount() {
    // ここでハンドラの参照をセットする
    this.props.navigation.setParams({ onRight: this.onRight });
  }

  // ...
}
```

渡されたハンドラの参照を次のように`navigationOptions`で使うことができます。

```diff
// ...

class Page extends React.Component<State, Props> {
  static navigationOptions = ({ navigation }: NavigationScreenProps) => {
    return {
-      headerRight: <Button title="+1" />
+      headerRight: <Button title="+1" onPress={navigation.getParam('onRight')} />
    };
  }

// ...
```

これで RightButton をタップした時に`onRight`が呼び出されるようになります。

## 外部からの props の値で RightButton を出し分けする

外部からの props も上の方法と同様に`navigation.setParam`と`getParam`を使って実現します。

今回は props で`hasButton`が渡されるとします。`componentDidMount`の中で再び`navigation.setParam`を使います。

```diff
// ...

  componentDidMount() {
    // ここでハンドラの参照をセットする
    this.props.navigation.setParams({ onRight: this.onRight });
+   this.props.navigation.setParams({ hasButton: this.props.hasButton });
  }

// ...
```

この値を`navigationOptions`の中で使います。

```diff
// ...

class Page extends React.Component<State, Props> {
  static navigationOptions = ({ navigation }: NavigationScreenProps) => {
    return {
-     headerRight: <Button title="+1" onPress={navigation.getParam('onRight')} />
+     headerRight: navigation.getParam('hasButton') ?
+       <Button title="+1" onPress={navigation.getParam('onRight')} /> :
+       undefined
    };
  }

// ...
```

これで props 経由で RightButton を出し分けすることができるようになりました。

。。。大変。

以上
