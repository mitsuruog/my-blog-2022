---
layout: post
title: "Robloxで簡単なコイン拾いゲームを作る"
date: 2019-05-04 0:00:00 +900
comments: true
tags:
  - roblox
  - ロブロックス
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money-logo.png
---

今日はコインを拾うだけの簡単なゲームを作ってみましょう。

「**Debris(デブリ)**」というビルトインサービスを使って、ゲームフィールド上のランダムな場所にコインを発生させます。
Debris サービスは Roblox の中でも非常に有用なもので、これを使うことでゲームの中でアイテムやモンスターなどを自由に発生させることができます。

- [Roblox Developers: Debris](https://developer.roblox.com/api-reference/class/Debris)

完成形のプロジェクトはこちらです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money0.png)

## LeaderBorad を作成する

まず、今プレイヤーが持っているコインの総量を表示するための LeaderBoard を作成します。作り方はこちらを参照してください。

- [Roblox のリーダーボードを作成する | I am mitsuruog](https://blog.mitsuruog.info/2019/04/roblox-setup-leaderboard)

Script の名前は`LeaderBoardScript`として、ServiceScriptService の中に入れておきます。LeaderBoard に表示する名前は`Money`としておきましょう。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money1.png)

## コインを作る

コインを作りましょう。Part の名前は`Money`とします。形は Cylinder か Ball を使えばいいと思います。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money3.gif)

一度、Workspace 上でコインの Part を完成させてから、ServiceStorage に移動します。
ServiceStorage とは、Roblox のオブジェクトの格納庫のようなものです。注意点としては Server 以外からはアクセスできません。

## コインをゲームフィールド上に発生させる

では、コインをゲームフィールド上に発生させましょう。ServiceScriptService の中に`MoneyDropperScript`を作成します。

最初にコインの Part と`Debris`サービスを呼び出して使えるようにしておきます。

```lua
local money = game:GetService("ServerStorage").Money
local Debris = game:GetService("Debris")
```

続いて`while`ループの中でコインを複製してランダムな位置に配置させます。

```lua
...

while(1) do
  wait()
  -- コインを1つ複製する
  local clonedMoney = money:clone()

  -- マップの中の縦横-500〜500の中のランダムな位置に発生するようにする
  local positionX = math.random(-500, 500)
  local positionZ = math.random(-500, 500)
  -- 注意）y軸を100としているのは空から落ちてくるようにするため
  clonedMoney.Position = Vector3.new(positionX, 100, positionZ)
  clonedMoney.Parent = workspace

  -- Debrisサービスに追加することでマップ上に姿を表す
  Debris:AddItem(clonedMoney, 20)
end
```

`Debris:AddItem`の第 1 引数にはマップ上に出現させるオブジェクトを、第 2 引数にはオブジェクトの生存期間を設定します。上の例では**コインは 20 秒後に自動的に消えます。**

テスト実行するとコインが空から降ってくるようになりました。Debris サービス、超便利です。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money4.gif)

## コインに触れたらお金が増えるようにする

最後にコインに触れたらプレイヤーのお金が増えるようにしましょう。
コインの Part(`Money`)の中に Script を作成します。名前は`MoneyScript`にしておきます。

基本的には、コインに何か触れたら実行されるイベントハンドラを作成し、触れたものがプレイヤー(`Humanoid`)だったら処理を続行させます。

```lua
local money = script.Parent

local function onTouched(part)
  local humanoid = part.Parent:FindFirstChild("Humanoid")
  if humanoid then
    -- ここに処理を書く
  end
end

money.Touched:Connect(onTouched)
```

では、コインに触れたプレイヤーのお金を増やして、回収されたコインを消滅させます。
お金は LeaderBoard の`Money`に格納されるので、LeaderBoard の値を更新する必要があります。

```lua
...

local function onTouched(part)
  local humanoid = part.Parent:FindFirstChild("Humanoid")
  if humanoid then
    -- プレイヤー名を取得する
    local playerName = part.Parent.Name
    local player = game.Players:FindFirstChild(playerName)

    -- LeaderBoardの値を更新する
    player.leaderstats["Money"].Value = player.leaderstats["Money"].Value + 5

    -- コインを消滅させる
    money:Destroy()
  end
end

...
```

テスト実行すると、コインに触れるとお金が増えていきます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/roblox-money5.gif)

## まとめ

簡単な Roblox ゲームの作り方でした。

面白いゲームを作るには、さらに何か面白い仕掛けが必要ですが、基本的な作り方は今日紹介した通りです。例えば、コインの中にプレミアムコインや爆弾を混ぜたりしたり、集めたお金でアイテムを購入できるようにすることで、もう少しゲームっぽくなると思います。
