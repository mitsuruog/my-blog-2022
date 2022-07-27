---
layout: post
title: "Reactのuncontrolled input warningで困った時に確認するべきたった1つのこと"
date: 2017-09-11 0:00:00 +900
comments: true
tags:
  - react
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/react-uncontrolled-input.png
---

たまに見る`uncontrolled input`関連の警告についての小ネタです。
知っていると原因がすぐわかるのですが、知らないと結構デバックに時間が掛かる面倒な警告です。

<!-- more -->

まず、React の Form 関連コンポーネントの考え方には`controlled`と`uncontrolled`の 2 つがあります。

簡単に両者の違いを説明すると、値が React の state で管理されているかどうかです。

`controlled`の方は、値が React の state で管理されていて、`setState`しないと変更できません。
それに対して`uncontrolled`は、値が React の state で管理されていないので、従来の方法で値を変更できるのですが、lifecycle イベントなどの React の様々な恩恵を受けにくくなります。

## で、本題ですが。

React でフォームがある画面を開発していると、ちょくちょくお目に掛かるのが次の警告です。
特にフォーム部品を`controlled`にしているにも関わらず、**何か**のタイミングでこの警告が発生するケースがあります。

```
Warning: App is changing a controlled input of type checkbox to be uncontrolled.
Input elements should not switch from controlled to uncontrolled (or vice versa).
Decide between using a controlled or uncontrolled input element for the lifetime of the component.
More info: https://fb.me/react-controlled-components
```

内容としては、フォーム部品の状態が**何か**の原因で`controlled`から`uncontrolled`になったことを警告している内容です。

しかし、この「**何か**」が結構わからなかったりします。

## どこをチェックすればいいのか？

これは React のフォームコンポーネントに割り当てられている State の値が、`null`か`undefined`になってしまうタイミングがあるためです。

フォームコンポーネントは State の値が`null`か`undefined`になった場合、uncontrolled になります。

この警告が発生する状況は大きく 2 つです。
もしこの警告が出た場合は、これらをチェックしてみるのが解決の近道です。

### State の初期値

まず 1 つ目はフォーム部品の State の初期値に`null`か`undefined`が設定されてる場合です。

```
this.state = {
  value: undefined
};
```

もちろんプロパティ自体が宣言されていない場合も同様に`undefined`となるので注意が必要です。

```
// this.state.valueはundefined
this.state = {};
```

### setState

もう 1 つは`setState`で値が`null`か`undefined`になるケースです。

```
this.setState({
  value: undefined
});
```

オブジェクトをそのまま設定する場合など、うっかりして起きやすいと思います。

## まとめ

React のフォームコンポーネントは、割り当てられている State の値が`null`か`undefined`になると、`uncontrolled`になってしまうので注意するべしという話でした。

- react: ^@15.0.0
- サンプル: <https://codepen.io/mitsuruog/pen/VMZLVj>
