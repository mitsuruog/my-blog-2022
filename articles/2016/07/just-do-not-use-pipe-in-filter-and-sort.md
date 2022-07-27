---
layout: post
title: "Angular2のPipeを使う上で開発者が知るべきたった1つのこと"
date: 2016-07-19 23:58:00 +900
comments: true
tags:
  - angular2
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/No_more.png
---

先日、学生向けに Todo ワークショップを開催した時の話です。
Angular1 のように`ngFor`と Pipe を組み合わせて、リストのソート機能をつくろうとしたところ、初め上手く動かせませんでした。
StackOverFlow で解決策を見つけてなんとか動かすことはできたのですが、腑に落ちず後日改めて調べたところ、Pipe を使う上で知っておくべき事を知らなかったことに気づきました。

今回は Pipe を使う上で、これだけは最低限知っておくべき内容について紹介します。

<!-- more -->

## tl;dr

- 開発者が知るべきたった 1 つのことは、**「Angular2 の Pipe には`pure`と`impure`の 2 種類がある」**ということ。
- `pure`Pipe が想定通りのタイミングで動作しない時は、`impure`を使ってみるのも手。
- ただし、Pipe でフィルタやソートを行うことはパフォーマンス上の懸念があるので、Component にて行うことを推奨します。

英語が読める人は本家のドキュメントを読んでください。

- [Angular | Pipes - ts](https://angular.io/docs/ts/latest/guide/pipes.html)

## `pure`と`impure`の違い

まず、Pipe には`pure`と`impure`の 2 つあるのですが、デフォルトは`pure`です。2 つの違いについて一言で表すとそれは**「Pipe が評価されるタイミング(反応する change detection)」**の違いです。下にその違いについて示します。

- pure
  - プリミティブ型(String, Number, Boolean, Symbol)の値が変わった時
  - オブジェクト型(Date, Array, Function, Object)の参照が変わった時
- impure
  - 常に評価

ここで大事なのは`pure`では、オブジェクトや配列内部の変更は無視してしまうということです。(このことを本家では`pure change`と表現しています。)
これは常に Deep check をすることを避け、パフォーマンスを向上させるために必要なことですが、うっかりこの事を知らないと Pipe が想定通りの動きをしない事態が容易に起こりえます。

## `impure`Pipe の作り方

`impure`Pipe を作るためには、`@Pipe`宣言の部分でプロパティに`pure: false`を指定することでできます。

```ts
@Pipe({
  name: 'impurePipe',
  pure: false
})
export class MyImpurePipe {}
```

非常に簡単なのですが、このとき「`pure`って何？」となるわけです。

### まとめ

では`impure`Pipe をガンガン使っていいのでしょうか？

本家のドキュメントに次の一文がありました。

> No FilterPipe or OrderByPipe

Pipe でフィルタやソートは行わないでくれと行っています。本家ではこれらの機能を Component 側に移動することを推奨しています。
理由の 1 つとしてフィルタやソートを Pipe で行うために、必ず処理対象のオブジェクトの参照が必要となり、非常にコストが高い処理となり易いことが挙げられます。

Angular1 の時代から`ng-repeat`と Filter を組み合わせてた場合、うっかり `n×n`の計算量となってしまい、パフォーマンス上の問題を出すことが多々ありました。
Angular2 でも同様に、`ngFor`と`impure`Pipe をうっかり組み合わせることは避けた方がいいと言えます。

## おまけ

- Todo のワークショップ資料
  - [mitsuruog/angular2-todo-tutorial: TodoApp for Anguar2](https://github.com/mitsuruog/angular2-todo-tutorial)
- (とりあえず)参考にした StackOverFlow の記事
  - [angular2 - How to apply filters to \*ngFor - Stack Overflow](http://stackoverflow.com/questions/34164413/how-to-apply-filters-to-ngfor)
  - NgFor doesn't update data with Pipe in Angular2 - Stack Overflow http://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
