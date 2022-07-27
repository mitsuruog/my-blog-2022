---
layout: post
title: "react-nativeでNative moduleを呼び出す(Swift編)"
date: 2019-02-05 0:00:00 +900
comments: true
tags:
  - react-native
  - swift
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/swift-react-native-logo.png
---

react-native で Swift の Native module を呼び出す方法です。基本的には下の Blog のやり方を真似ています。

- [Swift in React Native \- The Ultimate Guide Part 1: Modules](https://teabreak.e-spres-oh.com/swift-in-react-native-the-ultimate-guide-part-1-modules-9bb8d054db03)

紹介する内容は次の通りです。

- 簡単な Counter を Native Module で実装した
- Native Module の呼び出し
- Native Module から Constants を受け取る
- Native Module からの Callback を扱う
- Native Module からの Promise を扱う
- Native Module からの Event を扱う

対象のバージョンは次の通りです。

- react-native: 0.57.8
- Swift: 4.2.1
- Xcode: 10.1

プロジェクト全体のコードは GitHub で見ることができます。

- <https://github.com/mitsuruog/react-native-call-native-module-sample>

ちなみに Swift と Objecvive-C は初めて書きました。

## Native Module の呼び出し

まず、`Counter.swift`という Swift のクラスを作成します。
この時に Objective-C Bridging Header の設定をするか確認されるので、「Create Bridging Header」を選択して Bride Header ファイルを作成します。

このようなダイアログが表示されるはずです。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/swift-react-native1.png)

> Bride Header ファイルは、一度設定されると Xcode のプロジェクトファイルで管理されているため、手動でファイル名などを変更することは避けましょう。

Bride Header ファイルに react-native のモジュールをインポートしておきます。

```c
// Bridging-Header.h

#import "React/RCTBridgeModule.h"
```

続いて、Swift クラスに Counter クラスを定義します。

```swift
// Counter.swift

import Foundation

@objc(Counter)
class Counter: NSObject {
}
```

次に Objective-C のファイルを作成して、Native Module を JavaScript 側に公開するためのマクロを登録します。

`RCT_EXTERN_MODULE`の最初の引数が JavaScript 側に公開される名前で、第 2 引数が Native Module の Super Class を渡します。

```
// Counter.m

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(Counter, NSObject)
@end
```

react-native 側では`NativeModules`の中に、先ほど定義したモジュール名で Native Module が渡されてくるので、これを利用します。

```js
// App.js
import { NativeModules } from "react-native";

const { Counter } = NativeModules;

// 何かの処理
// Counter.doSomething();
```

これで Native Module を react-native 側で利用する準備が整いました。

## Native Module から Constants を受け取る

Native Module 側から counter の初期値を返します。

`Counter.swift`に`constantsToExport`メソッドを追加します。react-native 側に渡したいものを dictionary の中に設定していきます。

続いて`requiresMainQueueSetup`メソッドも追加します。これはこのクラスの初期化をメインスレッドかバックグラウンドスレッドのどちらで行うかを指定するためのものです。
 何も指定しない場合、次のような警告が表示されます。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2019/swift-react-native2.png)

```java
// Counter.swift

  ...

  @objc
  override func constantsToExport() -> [AnyHashable : Any]! {
    return ["initialCount": 0]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    // true  - メインスレッドで初期化される
    // false - メバックグラウンドスレッドで初期化される
    return true
  }
}
```

react-native 側では、`initialCount`は次のように利用することができます。

```js
// App.js
console.log(Counter.initialCount); // => 0
```

## Native Module からの Callback を扱う

現在の count を返す`getCount`メソッドを実装します。

Callback は`RCTResponseSenderBlock`クラスで定義されているので、これを引数で受け取って Callback を実行します。

```swift
// Counter.swift

@objc(Counter)
class Counter: RCTEventEmitter {

  private var count = 0

  ...

  @objc
  func getCount(_ callback: RCTResponseSenderBlock) {
    callback([count])
  }
}
```

続いて`Counter.m`にメソッドを追加します。

```objc
// Counter.m

@interface RCT_EXTERN_MODULE(Counter, NSObject)
  RCT_EXTERN_METHOD(getCount: (RCTResponseSenderBlock)callback)
@end
```

react-native 側では次のように利用します。

```js
// App.js
Counter.getCount((count) => console.log(count)); // => 0
```

## Native Module からの Promise を扱う

次は Promise を扱ってみます。

`decrement`メソッドを実装します。正しく減算できた場合は`resolve`を、count が 0 で減算しようとした場合に`reject`を返すようにします。

Promise は`resolve`の場合の`RCTPromiseResolveBlock`と`reject`の場合の`RCTPromiseRejectBlock`を利用します。

reject する場合は、第 3 引数に Error オブジェクトが必要なので、`NSError`でエラーを作成しておきます。

```swift
// Counter.swift

@objc(Counter)
class Counter: NSObject {

  ...

  @objc
  func decrement(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    if (count == 0) {
      let error = NSError(domain: "", code: 200, userInfo: nil)
      reject("E_COUNT", "count count cannot be negative.", error)
    } else {
      count -= 1
      resolve("count was decremented.")
    }
  }
}
```

続いて`Counter.m`にメソッドを追加します。

```diff
// Counter.m

@interface RCT_EXTERN_MODULE(Counter, NSObject)
  RCT_EXTERN_METHOD(getCount: (RCTResponseSenderBlock)callback)
+  RCT_EXTERN_METHOD(decrement: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)
@end
```

react-native 側では通常の Promise と同じように扱うことができます。

```js
// App.js
Counter.decrement()
  .then((count) => console.log(count))
  .catch((error) => console.error(error));
```

## Native Module から Event を受け取る

最後に decrement した時に、`onDecrement`イベントが発火するようにして、これを react-native 側で利用できるようにします。

Event を react-native 側に送るには`RCTEventEmitter`が必要なので、`Counter.m`を変更してインポートしておきます。

```diff
// Counter.m
#import "React/RCTBridgeModule.h"
+ #import "React/RCTEventEmitter.h"

- @interface RCT_EXTERN_MODULE(Counter, NSObject)
+ @interface RCT_EXTERN_MODULE(Counter, RCTEventEmitter)
  ...
@end
```

続いて`Counter.swift`を変更します。

まずクラスを`RCTEventEmitter`のサブクラスにします。次に`supportedEvents`を実装して、Native Module から発火されるイベント名を返すようにします。
最後に`requiresMainQueueSetup`を override に変更します。

```diff
// Counter.swift

@objc(Counter)
- class Counter: NSObject {
+ class Counter: RCTEventEmitter {

  ...

+  @objc
+  override func supportedEvents() -> [String]! {
+    return ["onDecrement"]
+  }

  @objc
-  static func requiresMainQueueSetup() -> Bool {
+  override static func requiresMainQueueSetup() -> Bool {
    ...
  }

  ...

}
```

react-native 側にイベントを送るには`sendEvent`を使います。送るペイロードは`Map`を使って準備します。

```diff
// Counter.swift

  ...

  @objc
  func decrement(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    if (count == 0) {
      let error = NSError(domain: "", code: 200, userInfo: nil)
      reject("E_COUNT", "count count cannot be negative.", error)
    } else {
      count -= 1
+      sendEvent(withName: "onDecrement", body: ["count": count])
      resolve("count was decremented.")
    }
  }
}
```

react-native 側では`NativeEventEmitter`の中に Native Module のインスタンスを設定して EventEmitter を取得します。
あとは、EventEmitter に EventListener を設定すれば OK です。

```js
// App.js
import { NativeModules, NativeEventEmitter } from "react-native";

const counterEventEmitter = new NativeEventEmitter(Counter);

counterEventEmitter.addListener("onDecrement", ({ count }) => {
  console.log(count); // => 1
});
```

## まとめ

react-native で Swift の Native module を呼び出す方法についてでした。

Objective-C を書いていたら、遠い昔に触って挫折した苦い記憶が蘇ってきました。

JavaScript 側は Android と同じ形で処理できるので、マルチプラットフォームの Native Module を扱う場合は、両者を等しく扱えるような I/F 設計が重要な気がします。
