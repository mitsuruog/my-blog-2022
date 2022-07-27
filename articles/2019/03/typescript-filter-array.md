---
layout: post
title: "TypeScriptのArray.filterで'Object is possibly undefined'を消したい"
date: 2019-03-26 0:00:00 +900
comments: true
tags:
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/typescript-array-filter-logo.png
---

TypeScript の小ネタです。

次のような基本的な Array の map 処理を考えてみましょう。
TypeScript のコンパイラオプションには`strictNullChecks`を入れています。

```ts
interface User {
  id: number;
  name?: string;
}

const users: User[] = [
  { id: 1, name: "aaa" },
  { id: 2 },
  { id: 3, name: "bbb" },
];

users
  .filter((user) => Boolean(user.name))
  // Object is possibly 'undefined'... why?
  .map((user) => console.log(user.name.length));
```

`User`クラスの name は Optional なので、一度`filter`関数を通過させて undefined のものを除外しています。
しかし、TypeScript のコンパイラはしつこく`Object is possibly 'undefined'`と言ってきます。

今回は、これをどうにかしたいです。

## User-Defined Type Guards を使う

このエラーを解消するためには[Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)を使って、コンパイラに型情報を追加で教える必要があります。

1 つめのやり方は、name が Optional ではない新しい Type を作る方法です。

```ts
...

// Userを継承した新しいTypeを作る
interface ConfirmedUser extends User {
  name: string;
}

users
  .filter((user: User): user is ConfirmedUser => Boolean(user.name))
  .map(user => console.log(user.name.length));
```

もう 1 つのやり方は、TypeScript にビルトインされている mapped-type の`Required<T>`を使います。

```ts
...

users
  .filter((user: User): user is Required<User> => Boolean(user.name))
  .map(user => console.log(user.name.length));
```

`Required<T>`を使う場合は全てのプロパティが required になるので、部分的に Optional が残る場合は、最初の`extends`で新しい Type を作るほうがいいと思います。

疑問に思ったので、ここで聞いてみた内容でした。

- [Why TypeScript compiler doesn't handle correctly nested object filtering? \- Stack Overflow](https://stackoverflow.com/questions/55337969/why-typescript-compiler-doesnt-handle-correctly-nested-object-filtering)
