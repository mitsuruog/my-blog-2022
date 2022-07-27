---
layout: post
title: "一度使ったらやめられないMEANスタック開発が捗るgenerator-angular-fullstackの便利機能の紹介"
date: 2014-12-09 21:20:00 +0900
comments: true
tags:
  - AngularJs
  - yeoman
  - nodejs
---

最近の AngularJS 開発では[DaftMonk/generator-angular-fullstack](https://github.com/DaftMonk/generator-angular-fullstack)をオレオレカスタムしたものを使っています。 fullstack だけあって使いこなすまで慣れがいると思いますので、私が普段使いしていていいなって思う機能を紹介します。  
AngularJS 開発の厳しい旅のお供にどうぞ。

この記事は[YEOMAN Advent Calendar 2014 - Adventar](http://www.adventar.org/calendars/356)9 日目の記事です。

- 8 日目[YEOMAN Advent Calendar 8 日目：generator-ember を紹介します - albatrosary's blog](http://albatrosary.hateblo.jp/entry/2014/12/08/120810)
- 10 日目[YEOMAN Advent Calendar 10 日目：generator-reveal を紹介します - albatrosary's blog](http://albatrosary.hateblo.jp/entry/2014/12/10/143324)

<!-- more -->

## 基本的な使い方

基本的な使い方はこちらを参照してください。そんなに難しくないはず。

[DaftMonk/generator-angular-fullstack | usage](https://github.com/DaftMonk/generator-angular-fullstack#usage)

注意点としては、アプリを generate する際に`mongodbあり`を選択した場合は、mongodb が起動していないと動作しないとこでしょうか・・・

> npm install する際に`grunt-contrib-imagemin`でエラーが発生する場合、もう一度 npm install するか、一度 uninstall して install するといいです。
>
> ```
> npm uninstall grunt-contrib-imagemin --save-dev
> npm install grunt-contrib-imagemin --save-dev
> ```

アプリケーションの雛形を作成したら、機能を追加する際にこちらのサブジェネレータを利用するとソースコードを自動生成してくれます。

[DaftMonk/generator-angular-fullstack | generators](https://github.com/DaftMonk/generator-angular-fullstack#generators)

では、ここから generator-angular-fullstack(以下、fullstack)の便利機能を少し紹介していきます。

## OAuth 認証テンプレート

fullstack には`google+`, `twitter`, `facebook`の OAuth テンプレートが付属しています。これに加えて`user/password`形式の Form も付属しているので、認証が必要なアプリケーションを作成する場合は、非常に助かると思います。  
OAuth のモジュールは[Passport](http://passportjs.org/)を利用しています。

利用方法は、`serve>config>local.env.sample.js`を同じフォルダにコピーして、`local.env.js`にリネームしてからファイルの中身に AppID などを設定すれば利用できます。

例) local.env.js

```
module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   'some-secret-key',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  TWITTER_ID:       'app-id',
  TWITTER_SECRET:   'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
```

注意点としては、local.env.js は`.gitignore`に指定されているので、各環境ごとに作成する必要があります。うっかり、作成忘れると認証エラーでハマります。  
それから、`DOMAIN`は OAuth の callbackURL として fullstack 側で利用しているので、これも環境ごとに正しく設定する必要があります。

## livereload & auto restart

今風の高速フロントエンド開発の象徴ともいうべき livereload と auto restart。当然 fullstack にも付属しています。

フロント側を変更した場合は、ブラウザがリロードされ、サーバー側を変更した場合は、Node が restart します。

## Node inspector

> まさか、まだ`console.log()`じゃないですよね！そんなあなたのために。

Node.js のデバックには[node-inspector/node-inspector](https://github.com/node-inspector/node-inspector)を使うのが一般的だと思うのですが、
しばらく触っていないと使い方をすぐ忘れてしまします。幸い fullstack ではサーバーをデバックモードで起動する Grunt タスクとして組み込まれているので忘れにくくなりました。

```
grunt serve:debug
```

コマンドを叩くと、Node inspector が立ち上がってくるのですが、`--debug-brk`指定されているので最初のステップのブレイクポイントで止まっています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2014/node-Inspector.png)

ブレイクポイントから処理を進めると通常通りサーバーが起動してくるので`http://localhsot:9000`にてアプリの動作を確認しながら、Node 側のデバックもできます。

## mongodb テストデータ自動投入

サーバー起動時に動作環境を選択できます。デフォルトは`Development`になっていると思いますので、起動時に mongodb のテストの洗い替えを行ってくれます。  
テストデータは`server>config>seed.js`に初期設定されていて、最初は`Thing`と`User`のデータがセットされているはずです。ここにテストデータを追加してください。

テストデータ投入の有無は各動作環境ごとの config にて選択できます。`server>config>environment`以下の各環境ごとの設定ファイルが置かれているので、`seedDB`フラグを切り替えてください。

例) development.js

```
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/someapp-dev'
  },
  seedDB: true
};

```

## index.html へ必要なフロント側リソースの自動挿入

> 404...はいはい、あれね。

AngularJS でアプリケーションを作成していると、非常にファイル数が大きくなる傾向にあると思います。ファイル追加のたびにわざわざ`index.html`に`<script>`タグなど追加していくのが、非常に億劫になりますね。

fullstack では[klei/grunt-injector](https://github.com/klei/grunt-injector)を利用することで、面倒な`index.html`へのリソース追加を強力にサポートしてくれます。  
`index.html`を確認すると見慣れない`<!-- bower:css -->`や`<!-- injector:js -->`のコメントがありますが、この部分に必要な`*.js`や`*.css`を挿入します。bower モジュールも対応しているのがいいですね。

## 本番ビルド

Grunt コマンドで一発本番ビルドできるのも嬉しいですね。

```
grunt build
```

ちなみに次のようなことをしてくれます。

- js, css の結合と minify とリビジョン番号振り
- html の minify
- image の minify
- AngularJS の minify 地雷除去
- AngularJS のテンプレート結合と minify と cache

1 からタスク作ると大変だと思います。

## その他カスタム

これら普通にあるものを利用してもかなり捗るのですが、自分なりにカスタムしている部分を紹介します。  
(これも好みの問題でしょうが・・・)

### サブジェネレータのテンプレート

generator-angular-fullstack が作成するコードのテンプレートを変更したいケースがある場合は、`.yo-rc.json`の中身を変更します。  
`generator-ng-component`の中に`~Templates`というプロパティがあるので、そこにサブジェネレータが参照するテンプレートがあるパスを設定します。

.yo-rc.json

```json
  "generator-ng-component": {

    // 省略

    "directiveSimpleTemplates": "/templates/directiveSimple",
    "directiveComplexTemplates": "/templates/directiveComplex",
    "filterTemplates": "",
    "serviceTemplates": "",
    "factoryTemplates": "",
    "controllerTemplates": "",
    "decoratorTemplates": "",
    "providerTemplates": "",
    "routeTemplates": ""
  }
```

### jsLint, csslint

generator-angular-fullstack では jsLint は付属していますが、csslint は付属していません。 jsLint もチェックタイミングについてもファイル変更時に頻繁にチェックするようにしています。

とくに、css はコンポーネントっぽいフォルダ構成になっているため、スタイルクラス名などにプリフィクスなどつけてサンドボックス化までしてくれるかと期待してましたが、そこまではやってくれませんでした。  
さらにおかしな CSS を書くと minify した時にスタイル崩れが発覚して厄介ですので、`cssLint`は必須ですね。

### socket.io

フロントとサーバー側で socket.io のコンポーネントが付属するのですが、私の作るアプリではいまいちユースケースが合わないので、作り変えてます。  
ツールに使われず、必要に応じてカスタムして使いこなす姿勢が大事だと思います。

## まとめ

私が普段使いしている[DaftMonk/generator-angular-fullstack](https://github.com/DaftMonk/generator-angular-fullstack)の便利機能について紹介しました。  
まだ他にも便利機能があると思いますので探してみてください。

本格的は AngularJS 開発を行う場合は、このような開発を下支えするツールが必須だと思います。手に馴染んでくると本当に手放せなくなります。

> 本来であれば、こんなにも難しくなってしまった Web 開発の現状を嘆くべきでしょうが・・・
