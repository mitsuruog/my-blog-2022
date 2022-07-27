---
layout: post
title: "Circle CI 2.0でフロントエンドをビルドする"
date: 2017-11-28 0:00:00 +900
comments: true
tags:
  - circleci
  - unit test
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/circleci2.0.png
---

[create-react-app](https://github.com/facebookincubator/create-react-app)で作っている React アプリを Circle CI 2.0 でビルドする手順について紹介します。

今回説明するのは、CircleCI 2.0 を使う上での大まかな流れについてです。

<!-- more -->

## 前提条件

フロントエンドのプロジェクトには`test`と`build`のタスクがあって、全て`npm run`で実行できるとします。
またデプロイについては、`build`タスクで 1 つのバンドルファイルを作成して S3 にデプロイします。

## 定義ファイルを作成する

まずは定義ファイルを作成する必要があります。設定ファイルは`.circleci`フォルダの中に`config.yml`を作成して定義していきます。

```
root
  .circleci
    config.yml
```

定義ファイルのシンタックスについては v1.0 と比べると結構変わっているので注意が必要です。
Slack の作業ログを見ると、Dashboard のどこかで定義ファイルが生成できたようですが、どこだか忘れてしまいました。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/circleci2.0-1.png)

定義ファイルを生成すると次のようなファイルが作成されます。

デフォルトでは CircleCI が準備した Docker image を使います。(`image: circleci/node:8.9`の部分)
node, npm, yarn は既に image に含まれているので、最小構成であればこれで大丈夫だと思います。

```
# Javascript Node CircleCI 2.0 configuration file
#
# Check https://circleci.com/docs/2.0/language-javascript/ for more details
#
version: 2
jobs:
  build:
    docker:
      # specify the version you desire here
      - image: circleci/node:8.9

      # Specify service dependencies here if necessary
      # CircleCI maintains a library of pre-built images
      # documented at https://circleci.com/docs/2.0/circleci-images/
      # - image: circleci/mongo:3.4.4

    working_directory: ~/workspace

    steps:
      - checkout

      # Download and cache dependencies
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}
          # fallback to using the latest cache if no exact match is found
          - v1-dependencies-

      - run: yarn install

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}

      # run tests!
      - run: yarn test
```

定義ファイルの書き方については公式サンプルプロジェクトを見てください。

- <https://github.com/CircleCI-Public/circleci-demo-javascript-express>

## Docker image を作成する

**（この工程は必要な場合のみです。）**

デフォルトでは CircleCI が準備した Docker image を使うのですが、これをさらにカスタムしてツールなどを導入したい場合は、新しく Docker image を準備する必要があります。

自分の場合、S3 にデプロイする場合は AWS-CLI ツールを利用するので、これをインストールした image を作成する必要がありました。
image を作成する際は、`circleci/node:8.9`を継承することができますので、ぜひそうしましょう。

```
FROM circleci/node:8.9

# ここから下にいろいろ定義する
...
```

実際に作成した image はこちらです。

- <https://hub.docker.com/r/mitsuruog/cool-build-frontend/>

docker image の作成方法についてはこちらを参照してください。

- [docker image を docker hub に公開する方法](https://blog.mitsuruog.info/2017/11/way-to-publish-docker-image)

## Job を定義する

次に Job を定義します。この後の手順としては、`Job`を定義してこれをワークフローの中で順番に呼び出していきます。

Job とは、CircleCI の中で再利用できると便利だなと思う一連のタスクをまとめたものです。例えば、`test` とか`test and build`などがそれにあたります。
とにかく次のワークフローの中ではこの**ジョブ名**を利用してフローを作成するので、このことを意識して定義するといいと思います。

基本的には`jobs:`の直下にタスク名(上の例では`build:`)を定義して、`steps:`の中にやりたいことを順番に書いていきます。
この辺りは 1.0 をやったことがある人であれば、想像できると思います。

```
version: 2
jobs:
  build:
    steps:
      - run step1
      - run step2
      - run step3
      ...
```

細かな設定は公式ドキュメントを参考にしてください。

- [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference/)

## ワークフローを定義する

最後に定義した Job をワークフローとして組み立てていきます。

基本的には`workflows:`の直下にワークフロー名を定義して、`jobs:`の中にやりたいことを順番に書いていきます。

```
workflows:
  version: 2
  test_build_and_deploy:
    jobs:
      - test
      - build
      - deploy
```

ちなみに`test`などの、次の Job に進む前に完了していなければならない Job がある場合、`requires`を使うことで表現することができます。

```
workflows:
  version: 2
  test_build_and_deploy:
    jobs:
      - test
      - build
          requires:
            - test
      - deploy
          requires:
            - build
```

この場合、`test` -> `build` -> `deploy`の順にワークフローが実行されます。
ワークフローを定義する場合、同じ階層にある Job は並列に実行されるため、`requires`でフローの制御は必須だと思います。

また、特定のブランチのみ実行させたい場合は、`filters`と`branches`を組み合わせることで表現可能です。

```
workflows:
  version: 2
  test_build_and_deploy:
    jobs:
      - test
      - build
          filters:
            branches:
              only:
                - develop
```

この場合は`develop`プランチの場合のみ build の Job が実行されるようになります。

定義したワークフローは CircleCI 上の「WORKFLOWS」にて確認することができます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/circleci2.0-2.png)

## おまけ

Circle CI のデフォルトのマシンリソースは`medium`(CPU 2.0 RAM 4GB)となっていて、最近のフロントエンドのテスト、デプロイにおいてはスペック不足感が否めません。

> CPU はコア数かな？

自分の場合は、テストで js-dom を使っているのですが、頻繁に次のようなエラーが発生していました。

```
ENOMEM: not enough memory, read
```

そんな時は、`resource_class`でマシンスペックをあげることができます。
しかし、今のところ Circle CI のカスタマーサポートに依頼する必要があります。詳しくはこちらを見てください。

- <https://circleci.com/docs/2.0/configuration-reference/#resource_class>

> 有効にしたい Organization 名と一緒に依頼すると割と早めに対応してくれました。Circle CI のカスタマーサポート素晴らしい！！

> ![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/circleci2.0-3.png)

> とはいえ、将来的には`resource_class`はプレミアム機能になるかもしれないです。要注意！

## まとめ

CircleCI 2.0 でフロントエンドをビルドするための大まかな手順でした。
本題とは全く関係ないのですが、Circle CI のカスタマーサポート迅速でよかったなー。

CircleCI 2.0 の公式ドキュメントについてはこちらを参照してください。

- <https://circleci.com/docs/2.0/>
