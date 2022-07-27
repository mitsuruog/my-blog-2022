---
layout: post
title: "react-intlを使ってReactアプリを国際化する"
date: 2016-10-19 23:58:00 +900
comments: true
tags:
  - react
  - react-intl
  - i18n
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/localization.png
---

[react-intl](https://github.com/yahoo/react-intl)を使って React アプリを国際化してみたところ、結構良かったので紹介します。

<!-- more -->

## tl;dr

- react-intl を使った React アプリの国際化方法
- react-intl を component だけではなく、utility function として使う方法

## react-intl とは

[react-intl](https://github.com/yahoo/react-intl)は、React アプリの国際化を支援するための Component と幾つかの API を提供する、Yahoo 製のライブラリです。
メッセージだけではなく数値(通貨も含む)、日付など幅広く対応しています。

今回は、メッセージの部分に特化して紹介します。

## 基本的な使いかた

基本的な使い方は、次の 3 ステップです。

- 国際化する context を設定する
- 言語設定ファイルを設定する(もし必要であれば)
- react-intl が提供する Component(`FormattedMessage`)を使ってメッセージを国際化する

### 国際化する context を設定する

まず、`IntlProvider`を使って国際化するための context を設定します。
react-intl は、この指定した context 配下で動作するため、アプリケーションのエントリーポイントに近い部分で行ったほうがいいです。
私の場合は、routing を設定する部分と一緒にしています。

```js
import React from "react";
import { IntlProvider } from "react-intl";
import AppRoute from "./AppRoute";

class App extends React.Component {

  constructor(prop) {
    super(prop);
    this.state = {
      locale: "ja",
      message: // 実際のメッセージファイル
    }
  }

  render() {
    return (
      <IntlProvider
        locale={this.state.locale}
        messages={this.state.messages}
      >
        <AppRoute />
      </IntlProvider>
    );
  }

}
```

メッセージファイルについては後で説明します。

### 言語設定ファイルを設定する

複数言語対応する場合は、追加で言語設定ファイルを設定する必要があります。

```js
import { IntlProvider, addLocaleData } from "react-intl";
import ja from "react-intl/locale-data/ja";

addLocaleData([...ja]);

// もっとたくさんの言語が必要な場合
addLocaleData([...ja, ...fr, ...es]);
```

### Component を使ってメッセージを国際化する

メッセージを国際化するためには、`FormattedMessage`を使います。

```js
import { FormattedMessage } from "react-intl";

const MyComponent = () => {
  return (
    <div>
      <FormattedMessage id="happy.birthday.to.you" />
      {/* en: Happy birthday to you */}
      {/* ja: お誕生日おめでとう */}
    </div>
  );
};
```

`FormattedMessage`の`id`はメッセージファイルのキーと一致している必要があります。
`id`は`.`で区切っていますが、これは JSON の object ではなく純粋な文字列キーです。
そのため、上の`id`を指定した場合、メッセージファイルは次のようにする必要があります。

```json
{
  "happy.birthday.to.you": "Happy birthday to you"
}
```

## utility function として使う

react-intl の Component を利用した国際化機能は非常に強力なのですが、国際化の機能自体を pure な function として使いたいケースは結構あると思います。
例えば、次のように Component の props と一緒に利用するケースなどです。

```js
import ChildComponent from "./ChildComponent";

const MyComponent = () => {
  return (
    <div>
      {/* titleを国際化したい!! */}
      <ChildComponent title="" />
    </div>
  );
};
```

そんな場合は、`IntlProvider`を直接使います。

```js
import { IntlProvider } from "react-intl";

import ChildComponent from "./ChildComponent";

const intlProvider = new IntlProvider({ locale, messages }, {});
const { intl } = intlProvider.getChildContext();

const MyComponent = () => {
  return (
    <div>
      {/* titleを国際化したい!! */}
      <ChildComponent
        title={intl.formatMessage({ id: "happy.birthday.to.you" })}
      />
      {/* en: Happy birthday to you */}
      {/* ja: お誕生日おめでとう */}
    </div>
  );
};
```

> `IntlProvider`の第 2 引数は context を渡すので、特に必要なければ`{}`でよろしいかと。

最終的にはいろいろな Component で利用したいので、Singleton な Class にしておくと、後で使い勝手がいいと思います。

## まとめ

[react-intl](https://github.com/yahoo/react-intl)を使うと国際化が非常に楽です。

一工夫することで、pure な utility function としても使うことができるので、非常に利用用途が広い優秀なライブラリだと思います。
