---
layout: post
title: "React + Redux + redux-observable + TypeScriptの実践的サンプル"
date: 2018-03-13 0:00:00 +900
comments: true
tags:
  - react
  - redux
  - redux-observable
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-observable-logo.png
---

新規プロダクトで「React + Redux + redux-observable + TypeScript」を使ってみました。
割と良く仕上がったので、全体アーキテクトを単純にしたサンプルを作ってまとめてみました。同じような構成を考えている人は参考にしてみてください。

対象者は、React と TypeScript(もしくは Flux)経験者です。初歩的な部分は割と割愛して説明しています。

> 続きがあるので、読み終わったらこちらも見てみてください。2019 年 1 月段階の最新です。
>
> - [typesafe\-actions を使って型安心な Redux Store を実装する \| I am mitsuruog](https://blog.mitsuruog.info/2018/12/typesafe-redux-store)

## デモ

作ったものはこちらの Github でみれます。

- [mitsuruog/react\-redux\-observable\-typescript\-sample: A sample application for React \+ redux\-observable \+ TypeScript](https://github.com/mitsuruog/react-redux-observable-typescript-sample)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-observable01.png)

GoogleMap と[OpenWeatherMap](https://openweathermap.org/)の API を連動させて、マップをクリックした地点の天気を表示する単純なサンプルです。

## はじめに

まずこの構成で始めようと思った方は、最初にこれに目を通すべきです。

- [piotrwitek/react\-redux\-typescript\-guide: A comprehensive guide to static typing in "React & Redux" apps using TypeScript](https://github.com/piotrwitek/react-redux-typescript-guide)

最初はよくわからないと思います。ある程度理解すると内容がわかってくると思うので、常にそばにおいて参照してください。

ちなみに「**Redux**」とは**Flux の良くある実装パターンに名前をつけたもの**です。
Flux を経験した身として、Redux の主な特徴は次の 2 点だと感じました。

- 中央管理的な State 管理(Store)
- Store 前にある Reducer(減速機)

> **Reducer(減速機)**とは、Store の手前にあるレイアーで、Store の値を直接変更する役割をしています。
> Action から Action を呼び出して、(加速しながら？)何周かぐるぐる回ることもあるので、(安全のため？)減速機を通してから Store を変更するためこのような名前になったのではと想像しています。

Flux の説明としては下の図が有名ですね。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2018/redux-observable02.png)

> <https://github.com/facebook/flux/tree/master/examples/flux-concepts> より

通常は登場人物は以上なのですが、今回は Redux で副作用を処理部分に edux-observable を使っているため、もう一人「**Epic**」が登場します。

それでは順にキーポイントとなる部分を紹介していきます。

## Action と Constants

まず Action を作ります。
Action はこれから Store を変更するための起点となる部分です。基本的には`type`となんらかのデータ構造(今回は`params`と`payload`)をとります。

```typescript
// actions/index.ts
export interface Action {
  type: string;
  payload?: {};
  params?: {};
}
```

type は他の Reducer や Epic でも使うので、定数化して`Constants`の中に定義しておきます。

```typescript
// constants/index.ts
export const WEATHER_GET = "@@weather/GET";
...
```

基本的には`@@XXX/SET`を Reducer 用、それ以外(例えば`@@XXX/GET`)を Epic で使うようにしています。(そこまで厳密じゃないです。)

Action 名は重複すると見つけにくい不具合の原因になるため、[typesafe-actions](https://github.com/piotrwitek/typesafe-actions)を使って定義していきます。

```typescript
export const weatherGetAction = createAction(WEATHER_GET, (params = {}) => ({
  type: WEATHER_GET,
  params,
}));
```

## Reducer

次に Reducer を作ります。
Reducer は直前の State と Action で渡されたものを引数に、新しい State を返す役割をしています。

```txt
(previousState: State, action: Action) => newState: State
```

まず、State と初期 State を定義します。

```typescript
// reducers/WeatherReducer.ts
export interface WeatherState {
  loading: boolean;
  weather?: Weather;
}

const initialState = {
  loading: false,
};
```

次に Reducer を定義していきます。

```typescript
export const weatherReducer = (
  state: WeatherState = initialState,
  action: Action
): WeatherState => {
  switch (action.type) {
    case WEATHER_SET:
      return Object.assign({}, state, { weather: new Weather(action.payload) });

    default:
      return state;
  }
};
```

Reducer の定義の部分で初期 State(`initialState`)を設定しているのが見てわかると思います。

また、Object.assign は`Object.assign(state, newState)`としないでください。こうすると元の State を上書きしてしまうので、Redux が State の変更を検知できません。

ここで正しく State が変更されて初めて、Redux はその変更を検知して React などに対して再描画の指示を出すことができます。

## Epic

次に Epic を作ります。
Epic は redux-observable のコアコンセプトの 1 つで、**Action から呼び出されて、Action を返します。**
そのため Epic の作成は「**任意**」です。Action から何か別の Action(例、API アクセス、並列処理など)を呼び出す必要がある場合のみ利用します。

```txt
(action$: Observable<Action>, store: Store) => Observable<Action>
```

もっとも簡単な Epic 例は、Action を受け取って、別の Action を返すものです。

```typescript
const deadSimpleEpic: Epic<Action, RootState> = (action$, state) =>
  action$
    .ofType(LOVELY_TYPE)
    .map((action: Action) => nextAction(action.payload));
```

次に API アクセスする例です。

> 実際のプロダクトでは、`Rx.Observable.ajax`を使ってみたのですが、個人的に好みではなかったので`fetch`を使った例にしています。

`fetch`は Promise を返すので、これを Observable に変換する共通クラスを作成しています。

```typescript
// shared/services/Api.ts
const getWeather = (lat: number, lng: number) => {
  const request = fetch(`some_lovely_URL_will_be_here!!`).then((response) =>
    response.json()
  );
  return Observable.from(request);
};
```

これを Epic の`mergeMap`で受け取って、別の Action に繋ぎます。`weatherSetAction`は Store を更新する Action です。

```typescript
// epics/WeatherEpic.ts
const weatherGetEpic: Epic<Action, RootState> = (action$, state) =>
  action$
    .ofType(WEATHER_GET)
    .mergeMap((action: WeatherAction) =>
      getWeather(action.params.lat, action.params.lng).map((payload) =>
        weatherSetAction(payload)
      )
    );
```

最終的には、複数の Epic をまとめて 1 つにします。

```typescript
// epics/index.ts
const epics = combineEpics(...weatherEpic);
```

redux-observable の Epic を使った場合にはじめに混乱するポイントとしては、**Action から Reducer に直接繋がるケースは少なく、別の Action を経由してから Reducer に繋がる点**です。

```txt
// Epicを使わない場合
Action => Reducer => Store => Re-render

// Epicを使った場合
Action(@@XXX/GET) => API call => Action(@@XXX/SET) => Reducer => Store => Re-render
```

## Connect

次に、Connect を作ります。
Connect は React と Flux の実装パターン(たぶん、コンテナパターン)の一種で、[react-redux](https://github.com/reactjs/react-redux)が採用しているものです。

React コンポーネントを「**Connect**」というコンテナでラップして、Redux の Store との橋渡しをします。
実際には次の 2 つの橋渡しです。

- Store からコンポーネント(慣例で`mapStateToProps`とする)
- コンポーネントから Store(慣例で`mapDispatchToProps`とする)

まず、この Connect コンポーネントが外側に見せる Props(`OwnProps`)を定義して、Store との橋渡し部分を定義します。

```typescript
// components/Weather.connect.tsx
interface OwnProps {}

const mapStateToProps = (state: RootState) => ({
  weather: state.weather.weather,
});

const mapDispatchToProps = (dispatch: Function, props: OwnProps) => ({
  // 今回は実際にないけど、あったらこんな感じで書く
  someEventHander: (payload: {}) => dispatch(someLovelyAction(payload)),
});
```

connect のインターフェースは一見難しいのですが、Higher order component(HOC)だと思うとわかりやすいかと思います。
まず、Store との橋渡しの定義を設定した HOC を作成してから、オリジナルのコンポーネントを渡して、Connect でラップされたコンポーネントを取り出します。

```txt
connect(mapStateToProps, mapDispatchToProps)(OriginalComponent) => ConnectComponent
```

これで、**外側から見ると`OwnProps`のコンポーネントで、中はしっかり Redux の Store を繋がっているコンポーネント**の出来上がりです。

```typescript
// components/Weather.connect.tsx
export default connect<{}, {}, WeatherProps>(
  mapStateToProps,
  mapDispatchToProps
)(Weather) as React.ComponentClass<OwnProps>;
```

## Store

最後は Store の設定です。Store をアプリケーションで有効にして、Connect が正しく機能するようにしましょう。

上で作成した Connect を有効にするためには、これらの外側を`Provider`というコンポーネントで囲う必要があります。
Store の作成は通常の Redux と同様に`createStore`を使って行います。

```typescript
const store = createStore(reducers, preloadedState, enhancer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

以上で紹介終わり。

## まとめ

ちょっと詳細割愛してしまった部分もありますが、細かな部分は実際の[Github リポジトリ](https://github.com/mitsuruog/react-redux-observable-typescript-sample)を見てもらえれば雰囲気わかるかと思います。

正直「Redux + redux-observable」は学習コスト高めです。使う人を選びます。
自分は習得できたし、他の人に教えることもできると思うので次のプロダクトでも機会があれば使うと思います。しかし、他の人にはあまり気持ちよく勧められない部分もあるのも事実です。とはいえ、やりごたえはあると思うので、興味がある方はトライしてみては如何でしょうか。

その他、個人的に目を通しておいた方がいいと思うもの。

- [Redux ユーザーが最もハマる state の不正変更とその検出方法 \| I am mitsuruog](https://blog.mitsuruog.info/2018/02/why-is-immutability-required-by-redux)
- [Immutable Update Patterns \- Redux](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns)
- [Ecosystem \- Redux](https://redux.js.org/introduction/ecosystem)
