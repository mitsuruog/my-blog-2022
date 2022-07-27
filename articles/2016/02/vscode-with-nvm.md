---
layout: post
title: "vscodeとnvmを一緒に使う小ネタ"
date: 2016-02-07 23:59:59 +900
comments: true
tags:
  - vscode
  - nvm
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/vscode-with-nvm.png
---

# vscode と nvm を一緒に使う小ネタ

ローカルの node 環境を[nvm](https://github.com/creationix/nvm)で作ってて、typescript を npm 経由でインストールした時に少しハマったので自分用メモ

<!-- more -->

## トラブル

vscode の`task.json`に定義した`tsc`コマンドで`.ts`ファイルをコンパイルしようと思ったらエラーが発生。ぐぬぬ。。。

```
Failed to launch external program tsc HelloWorld.ts.
spawn tsc ENOENTspawn tsc ENOENT
```

## 結論

ターミナルから vscode を起動する必要があります。起動時に、nvm の設定を外部から指定すると動作します。

```
nvm use 5; code .
```

~~vscode をターミナルから動かせるようにしておくことが前提条件です。
設定はこちらを参考にしてください。~~

[Setting up Visual Studio Code](https://code.visualstudio.com/Docs/editor/setup)

~~自分の場合は zsh を使っているので、`.zshrc`に追加しました。~~  
(2016-03-10 追記) vscode のバージョンアップにより path の設定は不要になったようです。

```
function code () { VSCODE_CWD="$PWD" open -n -b "com.microsoft.VSCode" --args $*; }
```

参考：
[VS Code with NVM · Issue #1895 · Microsoft/vscode](https://github.com/Microsoft/vscode/issues/1895)
