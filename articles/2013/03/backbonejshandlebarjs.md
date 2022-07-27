---
layout: post
title: "Backbone.jsとHandlebars.jsを組み合わせる"
date: 2013-03-04 00:21:00 +0900
comments: true
tags:
  - backbone
  - handlebars.js
  - grunt
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/handlebar.png
---

Backbone.js でアプリケーションを作る場合、ついつい手軽さを求めて[Underscore.js の template()](http://underscorejs.org/#template)を使うことが多いのですが、少し凝った造りのページを作る場合、より専門的なテンプレートエンジンを使いたくなります。

そこで今回は、最近マイブームの[Handlebars.js](http://handlebarsjs.com/)を Backbone と組み合わせて使ってみました。

<!-- more -->

### このエントリでお伝えしたいこと。

1.  Backbone.js with Handlebars.js!!
2.  ここでもやっぱり Grunt 最高

## Handlebars.js とは

詳細は Google 先生の方が詳しいです（ごめんなさい）。  
数あるクライアントサイドのテンプレートエンジンの 1 つです。個人的にはプリコンパイルすることでパフォーマンス的に優位なところを注目しています。

[[jsperf]Precompiled Templates](http://jsperf.com/precompiled-hogan-handlebars-ejs)

最近話題の twitter の[Horgan.js](http://twitter.github.com/hogan.js/)ともいい感じに渡り合ってます。

> とは言っても、プリコンパイル前は激遅なんですが。。。

## アプリケーション構成

まず、アプリケーションの構成は次のようなものだと仮定して話を進めます。

```
app
 ├ Gruntfile.js
 ├ hbs
 │ └ partial.hbs //テンプレート
 └ js
   ├ views
   │ └ partial.js //テンプレートをレンダリングするView
   ├ collections
   ├ models
   ├ template.js //テンプレートがプリコンパイルされたJS
   ├ namespace.js
   └ app.js
```

namespace.js

```js
var MyApp = {
  Views: {},
  Collections: {},
  Models: {},
  Templates: {},
};
```

## なにはともあれ最初は Grunt!!

まず、なにか新しいことを始めるためには準備と計画が大事です。  
特に Handlebars.js の場合は、プリコンパイルしない事には使い物にならないので、ビルドプロセスが必須です。
ということで Grunt のタスクを使います。

[grunt-contrib-handlebars](https://github.com/gruntjs/grunt-contrib-handlebars)

Gruntfile.js は次のように書きます。

```js
module.exports = function (grunt) {
  grunt.initConfig({
    //some...

    handlebars: {
      compile: {
        options: {
          namespace: "MyApp.Templates",
          processName: function (filepath) {
            // input -> app/hbs/partial.hbs
            var pieces = filepath.split("/");
            return pieces[pieces.length - 1].replace(/.hbs$/, ""); //output -> partial
          },
        },
        files: {
          "app/js/template.js": "app/hbs/*.hbs",
        },
      },
    },
  });

  // Load the plugin.

  //some tasks...

  grunt.loadNpmTasks("grunt-contrib-handlebars");

  // Default task(s).
  grunt.registerTask("default", ["handlebars"]);
};
```

普段 Grunt 使っている人だったら、さっと見ただけで分かると思うので、compile オプションの大事な所だけ補足します。

#### namespace

プリコンパイルされたテンプレート関数が割り当てられます。デフォルトだと`JST`となるので必要な場合、設定してください。

#### processName

processName とは、（上の）namespase オブジェクトに格納された、プリコンパイル済みテンプレート関数を取り出すためのキーです。デフォルトではファイルパスが設定されるようになっており、次のように取り出すようになっています。`var tmpl = MyApp.Templates["app/hbs/partial.hbs"];`  
個人的には`var tmpl = MyApp.Templates.partial;`と backbone 側から利用したいので、override しています。

これで Grunt の watch タスクと組み合わせることで、hbs ファイルに変更があった際に template.js として自動でプリコンパルされます。Grunt ってほんと便利！

## Backbone と使う

さて本題です。
今回は、Backbone でありがちな、render()で Collection の中身を出力する場合を例に説明します。

まずは、Handlebars.js のテンプレート部分

```
{{#each models}}
<ul>
  <li class="id">{{this.id}}</li>
  <li class="name">({{this.name}})</li>
</ul>
{{/each}}
```

Backbone の View からは次のように呼び出します。

```js
MyApp.Views.partial = Backbone.View.extend({

  //partial.hbsで定義したテンプレート
  tmpl: MyApp.Templates.partial,

  //some...

  render: function() {

    this.$el.html(
      this.tmpl({
        models: this.collection.toJSON()
      })
    );

  },

  //some...
```

Handlebars.js のテンプレート関数にデータを渡す際に、1 回オブジェクトにラップして名前を付ける手間がありますが、これで`BackboneでHandlebars.js`を使うことができました。
Handlebars.js には他にも色々な Expressions があるのですが、同じ原理で大丈夫なはずです。
