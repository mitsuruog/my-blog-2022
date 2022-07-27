---
layout: post
title: "Gruntを使ってCoffeeScriptをいろいろコンパイルする"
date: 2014-03-07 01:29:00 +0900
comments: true
tags:
  - CoffeeScript
  - Grunt
---

最近、Javascript の実装なるべく楽したいので、CoffeeScript を書いています。
当然、ブラウザは CoffeeScript を解釈できないため、Javascript にコンパイルする必要があるのですが、やっぱここでも Grunt です。
Grunt での CoffeeScript のコンパイル方法について、個人的に調べたので少しまとめます。

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/coffee1.png)

1.  シンプル（1->1 または n->1）
2.  マルチ（n->n）
3.  マルチ（n->n）＋ちょっとカスタム
4.  まとめ

最初に、CoffeeScript をコンパイルする Grunt プラグインですが、こちらを使います。
[https://github.com/gruntjs/grunt-contrib-coffee](http://gruntjs/grunt-contrib-coffee)

node.js がインストールされている環境で、次のコマンドを実行してください。

```
npm install grunt-contrib-coffee --save-dev
```

インストールしたら、Gruntfile.js にてプラグインを有効化します。

```
grunt.loadNpmTasks('grunt-contrib-coffee');
```

## 1.シンプル（1->1 または n->1）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/coffee2.png)

まずは、最も単純なタスクです。1 つの「.coffee」ファイルを「.js」にコンパイルしたり、複数の「.coffee」を 1 つの「.js」にまとめます。コンパイルした Javascript は後続の Uglify タスクで minify したり難読化したりします。

良く使われるケースだと思います。Grunt タスクはこんな感じで書きます。

```js
coffee: {
  compile: {
    files: {
      // 1:1 コンパイル
      'path/to/result.js': 'path/to/source.coffee',
      // コンパイルして１つのファイルに結合
      'path/to/another.js': ['path/to/sources/*.coffee', 'path/to/more/*.coffee']
    }
  }
}
```

## 2.マルチ（n->n）

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/coffee3.png)

次は、コンパイル時に 1 つの Javascript とせず、フォルダ構成などを維持したまま CoffeeScript をコンパイルする方法です。JavascriptMV＊系フレームワークを使っていると割と遭遇するケースです。
Grunt タスクはこんな感じです。

```js
coffee: {
  compile: {
    // path/toにあるCoffeeScriptをpath/to/dest/にコンパイルします
    expand: true,
    flatten: false,
    cwd: 'path/to',
    src: ['*.coffee'],
    dest: 'path/to/dest/',
    ext: '.js'
  }
}
```

Grunt では、ファイルの指定を動的に行うための DynamicMapping という仕組みを持っていて、今回はこれを使ってます。詳しくは本家のページをどうぞ。

Configuring tasks - Grunt: The JavaScript Task Runner
[ http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically)

## 3.マルチ（n->n）＋ちょっとカスタム

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/coffee4.png)

最後は、ちょっと特殊（？）です。「.」が 2 つ以上あるファイルのコンパイルです。
上の方法で普通にコンパイルすると「hoge.view.coffee」が「hoge.js」になってしまいます。

これは Grunt では最初の「.」の所までがファイル名で、それ以降は拡張子と扱う仕様となっているからです。そこでコンパイル時の拡張子を判定する処理をカスタムすることにしました。Grunt タスクはこんな感じです。

```js
coffee: {
  compile: {
    // path/toにあるCoffeeScriptをpath/to/dest/にコンパイルします
    expand: true,
    flatten: false,
    cwd: 'path/to',
    src: ['*.coffee'],
    dest: 'path/to/dest/',
    // extには「view.coffee」が渡されてきます
    // returnで拡張子を返せばいいので、「view.js」を返してます
    ext: function(ext){
      return ext.replace(/coffee$/, 'js');
    }
  }
}
```

## 4.まとめ

CoffeeScript のコンパイル環境を 1 から作ってみたので、いろいろ試行錯誤した点をまとめてました。
ただ、最近は IDE の方で自動コンパイルするものが多いので、ちょこっと書く分には無理に Grunt 使う必要はないと思います。

結構、UI コンポーネントを持つ JavascriptMV\*系フレームワークだと、View 部分を Javascript でガリガリ書くことになるので、CoffeeScript が重宝しています。
まだまだ CoffeeScript 使いこなせてないのですが、しっかり味見してエンタープライズで使えるか評価していきたいですね。
