---
layout: post
title: "Robloxでテレポートするブロックを作る"
date: 2019-04-30 0:00:00 +900
comments: true
tags:
  - roblox
  - ロブロックス
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block-logo.png
---

Roblox でプレイヤーが触ると別の場所にテレポートするブロックを作ってみましょう。

## テレポートするブロックを作る

まず、Workspace の中に`Teleport`というフォルダを作成して、必要なもの一式を追加します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block4.png)

追加するものは次の通りです。

- `TeleportScript` - Lua スクリプト
- `Teleport1A` - テレポートブロック A(青色)
- `Teleport1B` - テレポートブロック B(ピンク色)

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block5.png)

## TeleportScript の骨子を作る

TeleportScript の大まかな処理を書きましょう。

基本的にはそれぞれのブロックの`Touched`にイベントハンドラを設定して、あとで中の処理を書いていきます。

```lua
local Teleport1A = script.Parent.Teleport1A
local Teleport1B = script.Parent.Teleport1B

-- A -> B へテレポート
local function TeleportA2B(part)
end

-- B -> A へテレポート
local function TeleportB2A(part)
end

Teleport1A.Touched:Connect(TeleportA2B)
Teleport1B.Touched:Connect(TeleportB2A)
```

## テレポート処理を書く

まず「A->B」のテレポート処理を書きます。

> 「B->A」は基本的に「A->B」と同じなので割愛します。

```lua
...

-- A -> B へテレポート
local function TeleportA2B(part)
  local humanoid = part.Parent:FindFirstChild("HumanoidRootPart")
  if humanoid then
    -- プレイヤーの位置をテレポートブロックBにする
    humanoid.CFrame = Teleport1B.CFrame
  end
end

...
```

まず、`Touch`したものがプレイヤー(Humanoid)かどうか判定します。プレイヤーの場合は、プレイヤーをテレポートブロック B にテレポートさせます。

プレイヤーを移動するには`CFrame`というものを使います。`CFrame`とは Roblox ゲーム上の 3D オブジェクトの中心の座標を表すものです。

CFrame については、まだよく理解できていないので詳しい説明はできませんが、基本的には(x, y, z)軸の数値を設定することで、指定した 3D オブジェクトの中心の位置を制御することができます。

では、早速テレポートブロック A に触れてみましょう。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block3.gif)

(え！？)

テレポートブロックに埋まってしまいました。全く動けません。

これは、テレポート先がテレポートブロック B の中心になってしまったためです。
ですので、テレポート先を少し上の方に調整する必要があります。

```lua
...

-- A -> B へテレポート
local function TeleportA2B(part)
  local humanoid = part.Parent:FindFirstChild("HumanoidRootPart")
  if humanoid then
    -- プレイヤーの位置をテレポートブロックBから高さ5上ににする
    humanoid.CFrame = Teleport1B.CFrame + Vector3.new(0, 5, 0)
  end
end

...
```

`Vector3`は(x, y, z)軸を設定するクラスです。
左から順に x 軸(横)、y 軸(高さ)、z 軸(奥行き)を設定します。今回の例だと`Vector3.new(0, 5, 0)`なので、高さだけ 5 に設定しています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block2.gif)

今度はうまくいきました。

> ちなみに、`Vector3.new(0, 50, 0)`に設定すると、テレポート先を上空に設定することができます。
>
> ![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-teleport-block1.gif)

## まとめ

Roblox でテレポートするブロックの作り方でした。

見慣れない`CFrame`というものが出てきました。大事な概念のようなのでマスターしておきたいです。
