---
layout: post
title: "ReactのHigher order component(HOC)をTypeScriptで作る"
date: 2018-02-21 0:00:00 +900
comments: true
tags:
  - react
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/hoc2.png
---

React の Higher order component(以下、HOC)を TypeScript で作る方法の紹介です。
作り方を探したところ、こちらの記事がほぼ完璧だと思ったので、本人に許可をもらってゆるく翻訳しながら紹介することにしました。

(完全な翻訳を目指しているわけではないので、細かいニュアンスまで気になる方は英語の記事を直接読んでください。あと少しコードは自分好みに変えてます。)

- React Higher-Order Components in TypeScript made simple
  <https://codeburst.io/react-higher-order-components-in-typescript-made-simple-6f9b55691af1>

> 本人によると、この記事は HOC の作り方について同僚とディスカッションした内容をまとめたものだそうです。同僚大事。

## HOC とは何か？

[公式ドキュメント](https://reactjs.org/docs/higher-order-components.html)によると、HOC とは

> a higher-order component is a function that takes a component and returns a new component
> (HOC とは、コンポーネントをもらって新しいコンポーネントを返す関数です。)

HOC は機能横断的な機能を抽出するために利用され、複数のコンポーネントを一箇所にまとめることで、コードの重複を減らすことができます。
ちなみに、もっとも有名な HOC は[react-redux](https://github.com/reactjs/react-redux)の`connect`だそうです。

## これから学ぶこと

この記事では、`clickCountHOC`という HOC を作成します。

`clickCountHOC`はクリック数を子コンポーネント(**wrapped コンポーネント**と呼ぶ)の props に渡します。さらにクリック数を表示して、`style` prop を使ってスタイリングすることが可能です。
そして最後に、クリックした時に`console.log`が出力できるよう、設定できるようにします。

これらの要素は、HOC の全ての側面を可能な限りシンプルに説明するために選ばれています。

## Props

まず、HOC を作成する際には**3 種類の Props**について考える必要があります。

- `OriginalProps`は、ラップされるコンポーネントが持つ**オリジナルの Props**です。HOC はこれらの内容をを全く知りません。
- `ExternalProps`は、HOC によって定義された Props です。これらはラップされるコンポーネントには渡されません。
- `InjectedProps`は、HOC が**ラップされるコンポーネントに追加する Props**です。これらは基本的に、HOC の State と`ExternalProps`を合成したものです。

これら 3 つの prop の関連は次のような図で表すことができます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/hoc1.png)

この図でわかるように、resulting component(HOC で新しく作られたコンポーネント)の Props は`OriginalProps & ExternalProps`(2 つを合成したもの)です。

今回の例の`clickCountHOC`Props はこのようになります。

```typescript
interface ExternalProps {
  style?: React.CSSProperties;
}

export interface InjectedProps {
  clickCount?: number;
}
```

`InjectedProps`は HOC を利用する際に使うため、export する必要があります(後述)。
そして State はシンプルで、ただクリックカウントがあるだけです。

```typescript
interface State {
  clickCount: number;
}
```

## Options

最初に言ったように、HOC とは、コンポーネントをもらって新しいコンポーネントを返す関数です。

(これを簡単に図示すると)

```typescript
(Component) => Component;
```

しかし、多くの HOC はオプションの設定をもらって HOC を返す、カリー化された HOC ファクトリーのような形式になっています。(`react-redux`もそう)

```typescript
(options) => (Component) => Component;
```

これらのオプションは HOC 自体を変更するために利用される静的な定義体です。
また、これらは State や Props に対するアクセスはできず、HOC ファクトリーが呼び出された時に**一度だけ評価される**ことに注意してください。

もし、この場所から Props や State を操作する必要がある場合、唯一の方法は、関数としてオプションを指定することです。引数として Props や State を受け取ることができます。

`clickCountHOC`のオプションはシンプルで、クリックした時にメッセージをコンソールに出力するかを指示するためのフラグです。

```typescript
interface Options {
  debug?: boolean;
}
```

## 全てを一箇所にまとめる

必要な全ての Props を定義し終えたら、HOC を書く事ができます。

```typescript
export const clickCountHOC =
  ({ debug = false }: Options = {}) =>
  <OriginalProps extends {}>(
    WrappedComponent: React.ComponentType<OriginalProps & InjectedProps>
  ) => {
    // body
  };
```

一目見ただけでは、少し複雑に見えるので、パーツごとに分解してみましょう。

```typescript
({ debug = false }: Options = {}) =>
```

最初の行は一つの引数をもらうラムダ関数で、ES6 の destructuring 構文を使って、デフォルト値を持つキーとして分解されています。(今回の場合、キーは`debug`)
これにより呼び出し元が、この関数を**引数なし**か**1 つの`Options`を引数**として呼び出せるようになります。そして一部のキーが渡されなかった場合、内部的にデフォルト値が利用されます。

```typescript
<OriginalProps extends {}>(
  WrappedComponent: React.ComponentType<OriginalProps & InjectedProps>
) => {
  // body
};
```

2 つめは、1 つの型引数`OriginalProps`を伴った generic ラムダ関数です。
`extends {}`は、HOC が JSX タグではなくラムダ関数であることを指し示すための、決まり文句のようなものです。

このラムダ関数は`WrappedComponent`というただ 1 つの引数をとり、2 つの型になる可能性があります。(大文字から始まることに注意してください。これは意図的で、後ろの方に理由が書いてあります。)

> (注意)原文では、`React.ComponentClass`と`React.StatelessComponent`の 2 つを使っていますが、コメントでよりシンプルなやり方として`React.ComponentType`が提示されていたので、これを使っています。

- `React.ComponentType` - `React.ComponentClass` と `React.StatelessComponent` を合成した型です。

この Props の型は上の図にある、2 つの型がラップされるコンポーネントに渡される場所に対応しています。
これで基本的な構文ができたので、あとは中身を作っていくだけです。

```typescript
export const clickCountHOC =
  ({ debug = false }: Options = {}) =>
  <OriginalProps extends {}>(
    WrappedComponent: React.ComponentType<OriginalProps & InjectedProps>
  ) => {
    type ResultProps = OriginalProps & ExternalProps;

    return class ClickCountHOC extends React.Component<ResultProps, State> {
      static displayName = `ClickCountHOC(${WrappedComponent.displayName})`;

      constructor(props: ResultProps) {
        super(props);

        this.state = {
          clickCount: 0,
        };

        this.onClick = this.onClick.bind(this);
      }

      public render(): JSX.Element {
        return (
          <div onClick={this.onClick} style={this.props.style}>
            <span>Clicked {this.state.clickCount} times</span>
            <WrappedComponent {...this.props} {...this.state} />
          </div>
        );
      }

      private onClick() {
        if (debug) {
          console.debug("clicked");
        }
        this.setState({ clickCount: this.state.clickCount + 1 });
      }
    };
  };
```

まず最初に、resulting component の props の型(上の例では`ResultProps`)を定義します。
単純に`OriginalProps & ExternalProps`とします。

次に、この Props 型を持つ resulting component のクラスを作成します。state にも適切なものを設定してください。

静的なプロパティ`displayName`を定義します。これは(ReactDev tool などで)デバックする際に、ラップされたコンポーネント名を知るために役立つものです。そして、state を初期化するシンプルなコンストラクタを定義します。

`handleClick`はクリックカウントを計算するための関数で、`debug`が有効な場合にメッセージをコンソールに出力します。

最後は、`render`関数です。`style`と Click ハンドラを持つ`div`タグです。div の中の`span`はクリックカウントを表示します。
これが`WrappedComponent`が大文字で始める理由です、そうでなければこのようにレンダリングできません。
`OriginalProps`にあったもの全てと HOC の State にある`clickCount`と一緒に渡されます。

## HOC を使う

HOC の使い方について紹介しましょう。まず`ClickArea`というコンポーネントを作成して、これを HCO でラップします。

```typescript
import { InjectedProps } from "./ClickCountHOC";

interface ClickAreaProps {}

const ClickArea = (props: ClickAreaProps & InjectedProps) => (
  <div>Click me!!</div>
);

export default ClickArea;
```

注意することは、この props の型は`ClickAreaProps`(すなわち`OriginalProps`)と`InjectedProps`の合成ということです。こうすることで、HOC とラップされたコンポーネントから props を使う事ができます。

最後にラップした 2 つのコンポーネントを作成します。(1 つはデバック機能付き)

```typescript
import ClickArea from "./ClickArea";
import { clickCountHOC } from "./ClickCountHOC";

export interface HelloProps {}

const Wrapped1 = clickCountHOC()(ClickArea);
const Wrapped2 = clickCountHOC({ debug: true })(ClickArea);

export class Hello extends React.Component<HelloProps, {}> {
  render() {
    return (
      <div>
        <h1>Here is a simple example with HOC</h1>
        <Wrapped1 style={{ padding: 10 }} />
        <Wrapped2 style={{ padding: 10, background: "gray" }} />
      </div>
    );
  }
}
```

このように好きなコンポーネントと一緒に使う事ができ、TypeScript の型チェックの恩恵も受けることができます。

以上

## まとめ

HOC を TypeScript で作る際の簡単なサンプルと説明でした。

英語の記事に方には、[HOC のテンプレート](https://gist.github.com/no23reason/3d1d34b712313260b68e58b6113246e9#file-hoc-template-ts)もあるので、ぜひチェックしてみてください。

記事の中のコードは全てこちらのリポジトリで見ることができます。

- <https://github.com/mitsuruog/react-typescript-hoc-sample>

HOC の作り方は最初難しいので、このような素晴らしい記事に出会えて本当によかったです。ありがとう！Dan

Making HOC with TypeScript is complex work at the first glance. but I am so happy to find such a great article!!
Thanks Dan. I love you!!
