---
layout: post
title: "Angular2でSharedServiceを作りたい"
date: 2016-02-29 00:35:00 +900
comments: true
tags:
  - angular
  - angular2
  - typescript
thumbnail: https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/angular2.png
---

SPA を構築する場合、Component をまたがったデータの共有をどのように実現するかが重要になってきます。  
Angular1 の場合は、SharedService を利用するケースが多かったです。  
そこで Angular2 でも試してみようとしたところ、少し勝手が違ったので自分用メモを残しておきます。

<!-- more -->

## 結論

- Angular2 では基本的に`@Injectable()`の DI は新規のインスタンスを生成します。
- Singleton で扱いたい場合は、`bootstrap(.., [ServiceA,ServiceB])`で DI すること。

## サンプル

Angular2 の公式ページでよく利用される HeroList を例に説明します。

- 画面の component は一覧(HeroListComponent)と詳細(HeroDetailComponent)の 2 つ。
- Hero 一覧データは HeroService に格納され、各 component は HeroService を参照する。

簡単な図に示すとこのような構造をしていると仮定します。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/IMG_20160229_001319.png)

## 失敗パターン

すべてのサンプルはこちら  
[plnkr](http://plnkr.co/edit/R1q9vzDa1gHXHBUClu1s?p=preview)

失敗パターンでは、HeroDetailComponent にて Hero を削除しても消えません。  
これは HeroDetailComponent の`providers`で HeroService を DI した場合、新規でインスタンスを生成してしまうためです。
結果、HeroListComponent と HeroDetailComponent では、別の HeroService のインスタンスを参照していることになっています。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2016/IMG_20160229_001409.png)

HeroDetailComponent で`@Component`を DI している箇所を抜粋します。

**hero-detail.component.ts**

```ts
import {Component,  Input}  from 'angular2/core';
import {Hero, HeroService}   from './hero.service';

@Component({
  selector: 'hero-detail',
  template: `
  <span class="badge">{{hero.id}}</span> {{hero.name}}
  <button (click)="remove()">remove</button>
  `,
  providers:  [HeroService]  // <- ここ
})
export class HeroDetailComponent implements OnInit  {
  @Input() hero: Hero;
  constructor(private service:HeroService){ }
  remove() {
    this.service.remove(this.hero);
  }
}
```

## 成功パターン

すべてのサンプルはこちら  
[plnkr](http://plnkr.co/edit/iYFMhuldCBqay72eWjay?p=preview)

こちらは SharedService として動作しているパターンです。`bootstrap(.., [ServiceA,ServiceB])`で HeroService を指定することで Singleton として扱うことができます。  
HeroDetailComponent で Hero を削除した場合、HeroListComponent の一覧も消えます。

**main.ts**

```ts
import { bootstrap } from "angular2/platform/browser";

import { AppComponent } from "./app.component";
import { Hero, HeroService } from "./heroes/hero.service";

bootstrap(AppComponent, [HeroService]);
```

## まとめ

Angular1 っぽい SharedService の作り方でした。  
正直、Two-way-binding と SharedService を利用した、手続き型っぽいやり方が Angular2 で最良の方法がどうかはわかりません。  
Angular2 でのベストプラクティスについてはまだ手探りな感じがします。

とはいえ、Angular1 を慣れている方であれば、Angular2 でも Component 間のデータ共有は SharedService でできることが分かりました。

refs [Angular2 "Services" how to @inject one service into another (singletons) - Stack Overflow](http://stackoverflow.com/questions/33575456/angular2-services-how-to-inject-one-service-into-another-singletons)
