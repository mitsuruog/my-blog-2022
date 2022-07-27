---
layout: post
title: "docker imageをdocker hubに公開する方法"
date: 2017-11-10 0:00:00 +900
comments: true
tags:
  - docker
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2017/docker_hub.png
---

docker image を docker hub に公開する方法についての小ネタです。

<!-- more -->

お仕事で docker image を作成して公開必要があったのですが、やり方よく知らなかったので、同僚の docker 得意なエンジニアに教えてもらいました。

## docker image を作成する

まずは、docker image を作成します。

今回は CircleCI 2.0 で使うフロントエンドビルド用の image を作成するため、ベースの image に`circleci/node:8.9`を利用しました。

BuildDockerfile

```
FROM circleci/node:8.9

ENV PATH /home/circleci/.local/bin:${PATH}

# Install AWS CLI
RUN sudo apt-get install python-dev
RUN sudo curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py --user
RUN pip install awscli --upgrade --user
```

image ファイルができたら、docker image をビルドします。

```
$ docker build -f BuildDockerfile .
```

ビルドが終わったら image のリストを表示して、image id を覚えておきます。今回の場合は、一番上にある`<none>`が作成した image です。

```
$ docker images

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              680c58dbd0f9        29 seconds ago      986MB
circleci/node       8.9                 66a65e08d915        9 hours ago         894MB
codeprep/sqlite     latest              0c3ec62e9c37        7 days ago          13.6MB
...
```

> 直前に作った image であれば、一番上に表示されると思います。

## docker image をテストする

docker image をテストします。

テストの方法は「[docker image の中身をデバックする方法](https://blog.mitsuruog.info/2017/11/way-to-debug-docker-image)」にあるとおり image の中に入ってデバックします。

> image 名には、上で取得した image id を指定します。

## docker にログインする

ここからは、image を公開するための準備です。

[docker hub](https://hub.docker.com/)のアカウントで docker にログインしておきます。

```
$ export DOCKER_ID_USER="mitsuruog"
$ docker login
```

`DOCKER_ID_USER`には docker hub にユーザー名を設定しておきます。あとで使います。（なくても大丈夫ですが。。。）

## docker image にタグをつける

docker image にタグ（名前）を付けます。

```
$ docker tag [image name] $DOCKER_ID_USER/cool-build-frontend
```

`image name`には、上で取得した image id を指定し、`cool-build-frontend`に好きな名前を設定します。

タグつけが終わったら image のリストを表示して image にタグが付いていることを確認します。

```
$ docker images

REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
mitsuruog/cool-build-frontend   latest              680c58dbd0f9        2 minutes ago       986MB
circleci/node                   8.9                 66a65e08d915        9 hours ago         894MB
codeprep/sqlite                 latest              0c3ec62e9c37        7 days ago          13.6MB
```

## docker image を公開する

最後に image を docker hub に公開します。

```
$ docker push mitsuruog/cool-build-frontend
```

結果は、こんな感じです。

- <https://hub.docker.com/r/mitsuruog/cool-build-frontend/>

## まとめ

ほぼ、自分用のメモですね。

手順については他にも色々あると思うので、あくまでやり方の 1 つとして参考してください。
