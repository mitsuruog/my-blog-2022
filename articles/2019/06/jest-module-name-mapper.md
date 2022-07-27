---
layout: post
title: "Jestでaliasを使ったモジュール参照を扱う"
date: 2019-06-07 0:00:00 +900
comments: true
tags:
  - jest
  - unit test
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/jest-alias-logo.png
---

JavaScript のテストフレームワーク[Jest](https://jestjs.io/en/)の小ネタです。

最近 react や react-native のプロジェクトでモジュールの参照に alias を使うことが多いのですが、Jest でこれを扱う方法について紹介です。

## alias を使ったモジュール参照

alias を使ったモジュール参照とは、プロジェクト内の特定のディレクトに別名(alias)をつけることで、`import`文の記述を簡単にすることです。

例えば、次のような相対パスでモジュールを import している箇所に alias を使ってみましょう。

```ts
// greet.ts は src/shared/services にあるとする
import { greet } from "../../../greet.ts";
```

alias を使う場合は、まず`src/shared`に`Shared`という alias をつけます。そうすると次のように相対パスを除いて書くことができます。

```ts
// Shared は src/shared を参照している
import { greet } from "Shared/services/greet.ts";
```

alias を使うメリットとしては、`import`文の記述を簡略化することもあるますが、相対パスを使った場合よりリファクタなどの変更に強いことが挙げられます。

## moduleNameMapper を使って alias を扱う

Jest で alias を扱うためには`moduleNameMapper`を使って alias と実際のパスをマッピングします。

- <https://jestjs.io/docs/en/configuration#modulenamemapper-object-string-string>

上の例の場合は次のようになります。

```js
module.exports = {
  moduleNameMapper: {
    "^Shared(.*)$": "<rootDir>/src/shared/$1",
  },
};
```

これで Jest でも、alias を使ったモジュール参照があるプロジェクトをテストすることができました。
