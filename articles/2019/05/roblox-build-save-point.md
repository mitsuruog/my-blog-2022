---
layout: post
title: "Robloxでセーブポイントを作る"
date: 2019-05-10 0:00:00 +900
comments: true
tags:
  - roblox
  - ロブロックス
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point-logo.png
---

今日は Roblox でセーブポイントを作ってみます。

セーブポイントとは、プレイヤーが死んだ時に任意の場所から復活できるものです。Obby(Obstacle course)と呼ばれる障害物を超えてゴールを目指すタイプのゲームにてよく見かけます。

完成形のプロジェクト構造はこちらです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point1.png)

今回は Workspace に Part を 4 つと ServerScript が 1 つです。

## セーブポイントをマップに配置する

まず、Workspace にセーブポイントを配置します。
セーブポイントは「SpawnLocation」を使います。SpawnLocation は下ようなギアのマークが付いているブロックで、プレイヤーはこの場所からゲームに参加します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point2.png)

今回は 4 つ配置します。
わかりやすいように`Checkpoints`というフォルダに格納して、それぞれの`Name`を 1 から 4 までつけます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point3.png)

この画像では見えていないですが、すぐ横に触ると死ぬマグマ玉も置いています。

## スタート地点を設定する

プレイヤーがゲームに参加した時にどのセーブポイントから始まるかスタート地点を設定します。
今回は**①**の場所から始まるようにします。

ServerScriptService に`CheckpointScript`を作成します。

まず始めにセーブポイントのブロックを取得して、プレイヤーがゲームに参加した時に、セーブポイントの 1 つめをスタート地点に設定します。

`player.RespawnLocation`に SpawnLocation を設定すると、プレイヤーが死んだ時、設定された SpawnLocation から復活します。

```lua
local Players = game:GetService("Players")

-- セーブポイントのブロックを取得する
local checkPointFolder = game.Workspace.Checkpoints
local checkpoints = checkPointFolder:GetChildren()

local function onPlayerAdd(player)
  -- セーブポイントの1番目をスタート地点にする
  player.RespawnLocation = checkpoints[1]
end

-- プレイヤーが参加した時のハンドラ
Players.PlayerAdded:Connect(onPlayerAdd)
```

結果はどうでしょうか？

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point4.gif)

4 番目のセーブポイントがスタート地点になっています。
どうやら、セーブポイントを`Name`の昇順で並び替える必要があるようです。

```lua
local Players = game:GetService("Players")

-- セーブポイントのブロックを取得する
local checkPointFolder = game.Workspace.Checkpoints
local checkpoints = checkPointFolder:GetChildren()

-- `Name`の昇順でソートする
local function sortFunction(a, b)
  return tonumber(a.Name) < tonumber(b.Name)
end
table.sort(checkpoints, sortFunction)

...
```

## セーブポイントに触れた時にスタート地点を変更する

セーブポイントに触れた時にスタート地点を変更してみましょう。
スタート地点を変更は、今のセーブポイントよりも先に進んだ場合のみ行うようにします。

まず、セーブポイントに触れた時の処理を作成して、これを全てのセーブポイントにループ文で設定します。

```lua
...

-- セーブポイントの設定処理
local function setUpCheckpoint(checkpoint)
  -- セーブポイントに触れた時の処理
  checkpoint.Touched:Connect(function(part)
    -- ここに実際の処理を書く
  end)
end

-- 全てのセーブポイントに設定する
for index, checkpoint in pairs(checkpoints) do
  setUpCheckpoint(checkpoint)
end

...
```

続いて、スタート地点を変更してみましょう。

まず、触れたのがプレイヤーかどうか判定してから、現在の復活地点を取得します。
もし触れたセープポイントが現在の復活地点より先の場合、スタート地点を変更します。

スタート地点を変更した場合にログを出力するようにしておきます。

```lua
...

-- セーブポイントの設定処理
local function setUpCheckpoint(checkpoint)

  -- セーブポイントに触れた時の処理
  checkpoint.Touched:Connect(function(part)

    -- プレイヤーかどうかを判定し、プレイヤーオブジェクトの取得する
    local humanoid = part.Parent:FindFirstChild("Humanoid")
    local player = Players:FindFirstChild(part.Parent.Name)

    if humanoid and player then
      -- 現在の復活地点を取得する
      local currentCheckPoint = player.RespawnLocation.Name
      -- セーブポイントの比較する
      if tonumber(checkpoint.Name) > tonumber(currentCheckPoint) then
        -- スタート地点を変更して、ログを出力する
        player.RespawnLocation = checkpoint
        print("RespawnLocation has been changed to " .. checkpoint.Name)
      end
    end
  end)
end

...
```

実際にセーブポイントに触れてみると、スタート地点が更新されていることがログで確認できます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point5.gif)

実際に死んでみます。

セーブポイント 3 に触れた後で、マグマ玉に触れるとセーブポイント 3 から復活することができます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-save-point6.gif)

## まとめ

セーブポイントの作り方でした。
仕組みがわかると簡単ですね。

今日の内容だけでは、スタート地点がゲームの中に保存されていないため、プレイヤーが一度ゲームをやめるとスタート地点がリセットされてしまいます。
注意してください。
