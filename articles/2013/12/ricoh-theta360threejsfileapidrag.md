---
layout: post
title: "RICOH THETAで撮影した360°画像をthree.jsで全天球処理したついでにFileAPIのDrag&Drop対応してみた"
date: 2013-12-27 03:25:00 +0900
comments: true
tags:
  - HTML5
  - three.js
  - File API
  - RICOH THETA
---

職場の同僚が[RICOH THETA](https://theta360.com/ja/)なる 360° 写真が撮影できるカメラを買って、何やら面白そうなことをやりたがってたので、three.js を使って全天球処理するところを手伝いました。  
全天球処理はさほど難しくなかったのですが、欲を出して行った Drag&Drop 処理が結構ハマったので、その辺りを話ます。

下の DEMO サイトに THETA で撮影した画像を Drag&Drop すると、いい感じに全天球にしてくれます。ソースコードもすべて Github に公開してますので参考にしてください。

- DEMO：[http://mitsuruog.github.io/richo-theta-with-threejs](http://mitsuruog.github.io/richo-theta-with-threejs)
- リポジトリ：[https://github.com/mitsuruog/richo-theta-with-threejs](https://github.com/mitsuruog/richo-theta-with-threejs)

<!-- more -->

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2013/RICOH_THETA.png)

### 目次

1.  RECOH THETA とは
2.  three.js での全天球処理
3.  HTML5 File API による Drag&Drop 処理
4.  Cross Origin image load HACK
5.  まとめ

## 1. RECOH THETA とは

[RICOH THETA](https://theta360.com/ja/)とは RICOH 社が製造する 360° 写真が撮影できるカメラです。

外見がシャレてます。でも結構お高いです。（¥44,800 執筆時）

しかも、公式サイトもおしゃれで流行の縦スクロール型のレスポンシブデザインですが、中身は HTML5 ではなく XHTML でした。残念 w。

スクロールで動く部分は jQueryPlugins ではなく、手組っぽいです。

## 2. three.js での全天球処理

three.js での全天球処理はこちらの WebGL サンプルを参考にしました。  
（とは言ってもほとんどコピペですが・・・）

[http://threejs.org/examples/webgl_panorama_equirectangular.html](http://threejs.org/examples/webgl_panorama_equirectangular.html)

全天球処理がさくっと終わったので、欲を出して image ファイルを Drag&Drop して three.js のテクスチャを変えようとおもったのですが、これがハマりました。

## 3. HTML5 File API による Drag&Drop 処理

HTML5 には FIleAPI という、ブラウザからローカルファイルのやり取りができる標準 API があります。今回は FlieAPI を使って image ファイルの Drag&Drop 処理を実現していきます。

処理の大枠は次のようなコードになります。

```js
//イベント伝搬をキャンセル
function cancelEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

//ファイルがドロップされたら動くコード
function handllerDroppedFile(e) {
  //
  //ここにthree.jsのテクスチャを変えるコードを書きます。
  //

  //デフォルトのイベントキャンセルしないと
  //ブラウザでイメージが表示されてしまう
  cancelEvent(e);
}

//画面全体
var droppable = document.getElementById("container");
//イベントハンドラ
droppable.addEventListener("dradenter", cancelEvent);
droppable.addEventListener("dragover", cancelEvent);
droppable.addEventListener("drop", handllerDroppedFile);
```

実装時の注意点としては、ファイルドロップ時にイベントの伝搬をキャンセルしないと、ブラウザで image ファイルを開いてしまいます。

## 4. Cross Origin image load HACK

実際にドラックされた image ファイルは`dataURI形式`に変換して、three.js のテクスチャに設定すればうまく行くと思ったのですが、dataURI を読み込む際に同一生成元ポリシー（same origin policy）に抵触していまいエラーとなってしまいました。

dataURI は、通常の Web のリソース命名方式（http とか）ではなく、独自の命名方式（data）で命名されてしまうため、ドラッグした image ファイルを Javascript で再利用しようとすると必ず同一生成元ポリシー違反となってしまいます。  
（[RFC6454 — The Web Origin Concept の仕様書](http://tools.ietf.org/html/rfc6454#section-5)に書いてありました。）

そのため一度、ダミーの img タグに紐づけてから再利用するような HACK を行う必要があります。

```js
function handllerDroppedFile(e) {
  //単一ファイルの想定
  var file = e.dataTransfer.files[0];
  //dummy imgタグwww
  var img = document.createElement("img");
  var fileReader = new FileReader();
  fileReader.onload = function (e) {
    //一度、dummy imgのsrcにセットしてから
    //再利用します。
    //いきなりこうやるとsame origin error
    //material.map = new THREE.Texture(e.target.result);
    img.src = e.target.result;
    material.map = new THREE.Texture(img);
    material.map.needsUpdate = true;
  };
  //imageをdataURIで取得
  fileReader.readAsDataURL(file);
  //デフォルトのイベントキャンセルしないと
  //ブラウザでイメージが表示されてしまう
  cancelEvent(e);
}
```

これで、[RICOH THETA](https://theta360.com/ja/)で撮影した画像を Drag&Drop すると、three.js でいい感じに全球体処理してくれます。three.js すごい！

## 5. まとめ

three.js はやってて面白いですね。

HTML5 の fileAPI を使うことで、ブラウザ上でローカルファイルを扱うことが簡単になってきましたが、それを javascript で再利用する際は、いろいろ問題があることも分かりました。

いつになったら、Web はこういうハックとかバッドノウハウが無い世界になるのでしょうか・・・まだまだ苦難の時代は続きそうです。

### X. 参考資料

- Reading files in JavaScript using the File APIs
  [http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-dnd](http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-dnd)
- How to develop a HTML5 Image Uploader
  <span id="goog_1930387588"></span>[https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/](https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/)
- three.js change texture on material
  [http://stackoverflow.com/questions/13583103/three-js-change-texture-on-material](http://stackoverflow.com/questions/13583103/three-js-change-texture-on-material)
- Three.js Update Texture image
  [http://stackoverflow.com/questions/18436431/three-js-update-texture-image](http://stackoverflow.com/questions/18436431/three-js-update-texture-image)

**p.s**

同僚が[RICOH THETA](https://theta360.com/ja/)の競合製品を見つけて悶絶していました w
こちらはウェアラブルです。しかもサイトはしっかり HTML5 でした。もっと頑張れ RICOH

[http://bublcam.com/](http://bublcam.com/)
