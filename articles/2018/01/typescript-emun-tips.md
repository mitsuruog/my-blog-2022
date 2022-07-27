---
layout: post
title: "TypeScriptのEnumに関数を追加して値を返却する"
date: 2018-01-26 0:00:00 +900
comments: true
tags:
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/TypeScriptEnum.png
---

TypeScript の Enum を使った小ネタです。

TypeScript の Enum を使っていると、**Enum の値やメンバー名以外に、何かもう一つ値を追加したい**ことありませんか？
自分の場合は、多言語化しているアプリケーションなどで、Enum の値に対するテキストを表示する際に、Enum にメッセージキーを割り当てたいことがよくあります。

今回は、Enum に関数を追加してメッセージキーを返却できるようにする方法の紹介です。

## Enum の基本的な使い方

次のような Enum があったとします。

```ts
enum Type {
  Normal, // 0
  Special, // 1
}
```

基本的な Enum の使い方は、Enum のメンバーを指定して値を取得するか、Enum の値を指定してメンバー名を取得するかです。

```ts
// Enumのメンバーを指定して値を取得する
console.log(Type.Normal); // 0
console.log(Type.Special); // 1

console.log(Type["Normal"]); // 0
console.log(Type["Special"]); // 1

// Enumの値を指定してメンバー名を取得する
console.log(Type[0]); // Normal
console.log(Type[1]); // Special

console.log(Type[Type.Normal]); // Normal
console.log(Type[Type.Special]); // Special
```

## Enum に関数を追加する

Enum に関数を追加するには、Enum と同名の`namespace`定義して、その中に関数を定義します。

```ts
namespace Type {
  export function toMessageKey(type: Type) {
    switch (type) {
      case Type.Normal:
        return "message.normal";
      case Type.Special:
        return "message.special";
    }
  }
}
```

次のように呼び出すと、メッセージキーを取得することができます。

```ts
console.log(Type.toMessageKey(Type.Normal)); // message.Normal
console.log(Type.toMessageKey(Type.Special)); // message.special

console.log(Type.toMessageKey(0)); // message.Normal
console.log(Type.toMessageKey(1)); // message.special
```

JavaScript にコンパイルされると次のようなコードになっています。
中身をみた感じだと、Enum オブジェクトに関数を追加しているだけのようです。うん不思議。

```JavaScript
(function (Type) {
    function toMessageKey(type) {
        switch (type) {
            case Type.Foo:
                return "message.foo";
            case Type.Bar:
                return "message.bar";
        }
    }
    Type.toMessageKey = toMessageKey;
})(Type || (Type = {}));
```

### (2018/01/30) 追記

1 つのファイルに Enum を複数定義して個別で`export`している場合は、次のエラーが出るかもしれません。

```
Error:(81, 11) TS2395: Individual declarations in merged declaration 'Type' must be all exported or all local.
```

その場合は`export`を一箇所にまとめて行うようにしてください。

```ts
enum Type {
  ...
}

namespace Type {
  ...
}

export {
  Type,
}
```

## まとめ

TypeScript の Enum に関数を追加してメッセージキーを返す方法でした。

やり方は、この記事の「Enum with static functions」を参考にしています。

- [Enums · TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/docs/enums.html)
