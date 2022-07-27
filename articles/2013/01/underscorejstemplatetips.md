---
layout: post
title: "Underscore.jsのtemplateについてのTips"
date: 2013-01-03 23:37:00 +0900
comments: true
tags:
  - underscore
---

enja-oss にて Underscore.js の Utility を翻訳した際に、template 関数について少し深く知ることができましたので、フィードバックさせていただきます。
また、和訳で表現しきれない部分について少し補足します。
私が翻訳した文書が、エンジニアの皆さんの役に立ちますように・・・（-人-）

<!-- more -->

### このエントリでお伝えしたいこと。

1.  template 関数の基本的な使い方について。
2.  source プロパティとプリコンパイルされたテンプレートについて。
3.  variable を設定することによる、レンダリングの高速化について。（少し微妙）

翻訳した文書はこちらです。

[https://github.com/enja-oss/Underscore/blob/master/docs/Utility.md](https://github.com/enja-oss/Underscore/blob/master/docs/Utility.md)

## まず、template 基本的な使い方

書こうと思ったのですが、[@ahomu](https://twitter.com/ahomu)さんがいい感じまとめていましたので、こちらを参照してください。

（version1.3.3 での内容ですが、翻訳時の 1.4.3 でも変わっていないと思います。）

[Underscore.js の template 触ったメモ](http://havelog.ayumusato.com/develop/javascript/e490-underscore_js_template.html)

## source プロパティについて

まず、template 関数には、次の 2 通りの使い方があります。

1.  呼び出し時に即時レンダリングする。
2.  テンプレートをプリコンパイルしてレンダリング用関数と一緒に（変数などとして）キャッシュ。

この話の前提は「2.」の使い方の場合で、「プリコンパイルされたテンプレートは source プロパティに格納されているのでデバック等で使ってください。」といった内容の話です。
では早速、次のような最も単純なテンプレートをプリコンパイルして source プロパティの中身をのぞいてみましょう。
（注）source プロパティの出力内容は見やすいよう、改行インデントしています。

```js
// 最も基本的なTemplate
//<script type="text/template" id="tmpl-item">
//  <li><%= title %></li>
//</script>

// プリコンパイル後のsourceプロパティ
//_.template( $('#tmpl-item').html() ).source;

function(obj){
  var __t,
    __p='',
    __j=Array.prototype.join,
    print=function(){
      __p+=__j.call(arguments,'');
    };

  with(obj||{}){
    __p+='\n    <li>'+
    ( (__t=( title ))==null ? '' : __t )+
    '</li>\n';
  }
  return __p;
}
```

プリコンパイルされたテンプレートを確認することが出来ました。
「with(obj||{}){～」以下が、プリコンパイルされた内容です。
（with 微妙・・・って思った方は特に最後方を重点的に読んでください。）

次に、`<%-%>`を使って HTML エスケープした場合は次のようになります。

```js
// escapeしているTemplate
//<script type="text/template" id="tmpl-item">
//  <li><%- title %></li>
//</script>

// プリコンパイル後のsourceプロパティ
//_.template( $('#tmpl-item').html() ).source;

function(obj){

  //内容同じなので割愛

  with(obj||{}){
    __p+='\n    <li>'+
    ( (__t=( title ))==null ? '' : _.escape(__t) )+
    '</li>\n';
  }
  return __p;
}
```

HTML エスケープは内部で Underscore の escape()が使用されていることが分かりましたね。
最後は、テンプレートの中の`<%%>`で、ループ文を使った場合は次のようになります。

```js
// Template内でLoopを行う場合
//<script type="text/template" id="tmpl-items">
//  <% _.each(obj, function(item){  %>
//    <li><%= item.title %></li>
//  <% }); %>
//</script>

// プリコンパイル後のsourceプロパティ
//_.template( $('#tmpl-items').html() ).source;

function(obj){

  //内容同じなので割愛

  with(obj||{}){
    __p+='\n    ';
      _.each(obj, function(item){
        __p+='\n        <li>'+
        ( (__t=( item.title ))==null ? '' : __t )+
        '</li>\n    ';
      });
    __p+='\n';
  }
  return __p;
}
```

ちなみに、プリコンパイルされた後のレンダリング用関数「function(obj){～」の obj ですが、レンダリングする際に渡した JSON データがそのまま渡されてきます。

source プロパティによってテンプレートのデバックが劇的にやりやすくなるかというと、そういう話ではないのですが、どのようにプリコンパイルされたが確認できることによって、原因の切り分けがしやすくなると思います。

## variable とレンダリングの高速化

これについては原文に書いてあったのでそう訳してますが、いろいろ調べていると本当に大幅に高速化するか疑問に感じてきました。

サイ本（5 版）を読むと with 文は低速なので使用しない方が良いと書かれていましたので、そのように思っていた時期もあったのですが、次のエントリ（2008 年でちょっと古いですが・・・）を読んでみると、現在はあまりパフォーマンス的なネックな存在しないような印象を受けています。

[[404 Blog Not Found]javascript - with(second.thought) // with 再考](http://blog.livedoor.jp/dankogai/archives/51066288.html)

とは言っても、with 文を使用した場合、グローバルスコープの変数が誤って参照され、見つけにくいバグが入り込む可能性があると感じています（上の「変数かプロパティが曖昧ではないか!」の部分です。）。
ですので、個人的には template はデフォルトで with 句を使用してしまうので、それを避けるために variable を設定するといった方が納得できました。

最初の最も単純なテンプレートに variable を指定した場合は次のようにプリコンパイルされます。
（テンプレートの変数名とか少し変えてます。）

```js
// 最も基本的なTemplate
//<script type="text/template" id="tmpl-item">
//  <li><%= data.title %></li>
//</script>

// プリコンパイル後のsourceプロパティ
//_.template($('#tmpl-item').html(), undefined, {variable: 'data'}).source;

function(data){
  var __t,
    __p='',
    __j=Array.prototype.join,
    print=function(){
      __p+=__j.call(arguments,'');
    };

  __p+='\n    <li>'+
  ( (__t=( data.title ))==null ? '' : __t )+
  '</li>\n';

  return __p;
}
```

変数の参照が obj から data になって with 文が使用されなくなったと思います。
ちなみに、共通的に設定したい場合、次のようにも書けますので適宜使い分けてください。

```js
_.templateSettings.variable = "data";
```

variable についてはこちらも参考にさせていただきました。

[Using Underscore.js Templates To Render HTML Partials](http://www.bennadel.com/blog/2411-Using-Underscore-js-Templates-To-Render-HTML-Partials.htm)

with 文の挙動を確認したコードはこちらです。（興味があったら参考にしてください。）

```js
/**
 * 参照型でwith文を使用したスコープチェーンの確認
 */
obj.hoge = 'obj.hoge';
console.log('global[obj.hoge]->' + obj.hoge);

with(obj){
    console.log('with[obj.hoge]->' + hoge);

    //これはobj.fugaではなくグローバルfugaを参照...か
    console.log('with[obj.fuga]->' + fuga);

    //参照元プロパティの内容を変更
    delete obj.hoge;
    //ななななんと！スコープチェーンを遡ってhogeを参照してしまう...orz
    console.log('with[obj.hoge]->' + hoge);
}
//ここではundefined
console.log('global[obj.hoge]->' + obj.hoge);
```

このようにテンプレートがどのようにプリコンパイルされるか知っておくと、テンプレートに関連するデバック時間が短縮できると思います。困ったら思い出してください。
