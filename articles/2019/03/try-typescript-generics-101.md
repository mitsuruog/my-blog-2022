---
layout: post
title: "TypeScriptでジェネリクス(Generics)を理解するための簡単なチュートリアル"
date: 2019-03-12 0:00:00 +900
comments: true
tags:
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/typescript-generics-logo.jpg
---

TypeScript を使っていると頻繁に見かけるジェネリクス(以下、Generics)。
別の言語などで同様の概念を経験したことがある人であれば理解するのに苦労しないと思うのですが、最初はやはり難しい概念だと思います。

先日同僚に Generics を使ったユーティリティの作成をおねがいしたのですが、これが良い Generics のユースケースだと思ったので、チュートリアルっぽくしてみました。

## お題

次のように配列に対して値をマージするユーティリティ関数(`merge`)を作成してください。

```ts
merge(array, newValue);
```

渡される`array`には次のような構造の`User`と`Company`の 2 つのクラスがあり、それぞれ`id`プロパティを持っています。

```ts
class User {
  id: number;
  firstName: string;
}

class Company {
  id: number;
  name: string;
}
```

id が一致するものがあれば置き換え、なければ追加してください。

## ひとまず User クラスの merge 関数を作る

いきなり Generics を使うのはハードルが高いので、ひとまず User クラス用の merge 関数を作成しましょう。

User の配列と User の値を受け取って、両者をマージして新しい User の配列を返せばいいので、ひとまず User クラス用の merge 関数の interface を考えると、次のようになります。

```ts
function merge(array: User[], newValue: User): User[] {
  // ここに中身を書く
}
```

実装の方法はいくつかありますが、ここではシンプルに`findIndex`で最初に一致したもののみ値を置き換えるようにします。

```ts
function merge(array: User[], newValue: User): User[] {
  const index = array.findIndex((item) => item.id === newValue.id);
  if (index === -1) {
    return [...array, newValue];
  } else {
    return [...array.slice(0, index), newValue, ...array.slice(index + 1)];
  }
}
```

`merge`関数は次のように正しく動作します。

```ts
const array = [
  { id: 1, firstName: "Taro" },
  { id: 2, firstName: "Hanako" },
];

// => [{ id: 1, firstName: 'Mitsuru'}, { id: 2, firstName: 'Hanako' }]
console.log(merge(array, { id: 1, firstName: "Mitsuru" }));

// => [{ id: 1, firstName: 'Taro'}, { id: 2, firstName: 'Hanako' }, { id: 3, firstName: 'Ayumu' }]
console.log(merge(array, { id: 3, firstName: "Ayumu" }));
```

上の`merge`関数を`Company`クラスでも使えるようにするためにはどうすればいいでしょうか？
複製して関数の型定義を`Company[]`にしますか？もし扱う予定の型クラスが 100 あった場合どうしましょう。。。

ここで登場するのが**Generics**です。

## merge 関数で Generics を使う

Generics とは**型を抽象化したもの**です。
今回の例では`User`と`Company`とそれと他の何かのクラスも含めたものです。名前は`T`クラスとしましょう。

> 慣例で`T`を使うことが多い気がします。

早速、上の関数の interface を Generics に置き換えてみましょう。

```ts
function merge<T>(array: T[], newValue: T): T[] {
  // merge処理の中身
}
```

これで merge 関数は「**なにかのクラス(`T`)**の配列と**なにかのクラス(`T`)**の値を受け取って、両者をマージして新しい**なにかのクラス(`T`)**の配列を返す」関数になりました。

しかし、このままでは TypeScript のコンパイラがエラーになるはずです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/typescript-generics1.png)

「Property 'id' does not exist on type 'T'.」

当然ですね。merge 関数の中では渡されるクラスに`id`があることを前提にしていますが、`T`には`id`がありません。

「`T`には`id`がある」という制約を入れる必要があります。

## Generics に制約を入れる

「`T`には`id`がある」という制約を入れるためには、まず「`id`がある」という型を定義する必要があります。

```ts
{
  id: number;
}
```

これを`T`の制約とするには`extends`を使って、次のように「`T`は`{ id: number}`を継承している」という関係を作ります。

```ts
T extends { id: number }
```

TypeScript は「**Structural typing(構造型型付け)**」と呼ばれる、構造が同じであれば同じ型とみなす方式を取っているので、このような柔軟な型宣言が可能です。

では、最終形のコードがこちらです。

```ts
function merge<T extends { id: number }>(array: T[], newValue: T): T[] {
  const index = array.findIndex((item) => item.id === newValue.id);
  if (index === -1) {
    return [...array, newValue];
  } else {
    return [...array.slice(0, index), newValue, ...array.slice(index + 1)];
  }
}
```

使い方は次のようになります。

```ts
const userArray = [
  { id: 1, firstName: "Taro" },
  { id: 2, firstName: "Hanako" },
];

// => [{ id: 1, firstName: 'Mitsuru'}, { id: 2, firstName: 'Hanako' }]
console.log(merge(array, { id: 1, firstName: "Mitsuru" }));

// => [{ id: 1, firstName: 'Taro'}, { id: 2, firstName: 'Hanako' }, { id: 3, firstName: 'Ayumu' }]
console.log(merge(array, { id: 3, firstName: "Ayumu" }));

const companyArray = [
  { id: 1, name: "TOYOTA" },
  { id: 2, name: "SONY" },
];

// => [{ id: 1, name: 'NISSAN' }, { id: 2, name: 'SONY' }]
console.log(merge(companyArray, { id: 1, name: "NISSAN" }));

// => [{ id: 1, name: 'TOYOTA' }, { id: 2, name: 'SONY' }, { id: 3, name: 'NTT' }]
console.log(merge(companyArray, { id: 3, name: "NTT" }));
```

最近の TypeScript は型推論が優れているので通常は`merge`関数に型情報を渡す必要はありませんが、型推論ができずコンパイルエラーが出るような場合は次のように型情報を渡してください。

```ts
merge<User>(userArray, { id: 1, firstName: "Mitsuru" });
```

## まとめ

簡単なジェネリクス(Generics)を理解するためのチュートリアルでした。いかがだったでしょうか？
これから理解する人にはこれくらいの内容がちょうどいいと思います。

Generics についてはもっと踏み込むと面白いですし、ライブラリの型定義ではよく見かけるので、知っておいて損はないはずです。
