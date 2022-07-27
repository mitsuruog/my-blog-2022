---
layout: post
title: "RDB脳でもできた、mongooseを使ってmongodbでリレーションとjoinっぽいこと"
date: 2015-02-15 02:28:15 +0900
comments: true
tags:
  - mongodb
  - mongoose
---

ずっと RDB を使っていると、mongodb など NOSQL のスキーマ設計する際に正規化を意識してちょいちょい思考が固まるのですが、mongodb の O/R マッパーとして有名な[mongoose](https://github.com/learnboost/mongoose)を使う事で、複数の Collection 間のリレーションと join っぽいことをエミュレーションできるので紹介します。

<!-- more -->

まず最初に、mongodb で RDB のような第 3 正規化までやって、、、うんぬんみたいなことを本気でやりたかったら素直に RDB を使いましょう。  
今回はあくまで、mongodb のお作法に従いながら、たまに「リレーションっぽいことできればいいよねー」といった程度の Tips です。多用注意です。

今回の内容は、こちらの公式ドキュメントに基づくものです。

[Mongoose Query Population v3.8.23](http://mongoosejs.com/docs/populate.html)

## スキーマ定義

今回のスキーマは「社員(Employee)」と「部署(Unit)」として、以下のような構造をしているとします。

![](https://s3-ap-northeast-1.amazonaws.com/blog-mitsuruog/images/2015/mongoose-populate.jpg)

## ref を使ったリレーションの表現

mongoose の場合、Schema 定義の部分で`ref`を使うことでリレーションを表現することができます。  
mongodb は Collection に Document が作成された際に一意な`ObjectId`が生成されるため、これを外部キーのように利用してリレーションを表現します。

Schema 定義(model.js)

```js
var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// Employee
var employeeSchema = Schema({
  name: String,
  unit: { type: Schema.Types.ObjectId, ref: "Unit" },
});

// Unit
var unitSchema = Schema({
  name: String,
  employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
});

exports.Employee = mongoose.model("Employee", employeeSchema);
exports.Unit = mongoose.model("Unit", unitSchema);
```

これで、Employee と Unit の双方に ObjectId を通じた参照が定義されました。実際にはそれぞれの Document に参照先の ObjectId が設定されます。

## population で複数 document を join する

外部キー参照のようなものが定義できたので、実際に find したときに join してみましょう。社員の中の部署を join して取得しましょう。

```js
var Employee = require("./model").Employee;

Employee.find()
  .populate("unit")
  .exec(function (err, employees) {
    if (err) throw new Error(err);
    consolo.log(employees);
  });
```

```json
[
  {
    "_id": "54e06320a3ba074512dace94",
    "name": "田中",
    "unit": {
      "_id": "54e06366a3ba074512dace97",
      "name": "東京支所",
      "__v": 0,
      "employees": [
        "54e06320a3ba074512dace94",
        "54e06336a3ba074512dace95",
        "54e06340a3ba074512dace96"
      ]
    },
    "__v": 0
  }
]
```

このように部署まで取得することができました。

##ネストした population 表現

最後は、ネストした population の場合は次のようにします。社員の中の部署に所属する社員リストまで join して取得してみましょう。

```js
var Employee = require('./model').Employee,
  Unit = require('./model').Unit;

Employee.find()
  .populate('unit').
  .exec(function(err, employees) {
    if(err) throw new Error(err);

    // ここでUnitに対してpopulateを行う
    var options = {
      path: 'unit.employees',
      model: Employee
    };

    Unit.populate(employees, options, function(err, employees) {
      if(err) throw new Error(err);
      consolo.log(employees);
    });
  });
```

```json
[
  {
    "_id": "54e06320a3ba074512dace94",
    "name": "田中",
    "unit": {
      "_id": "54e06366a3ba074512dace97",
      "name": "東京支所",
      "employees": [
        {
          "_id": "54e06320a3ba074512dace94",
          "name": "田中",
          "unit": "54e06366a3ba074512dace97",
          "__v": 0
        },
        {
          "_id": "54e06336a3ba074512dace95",
          "name": "鈴木",
          "unit": "54e06366a3ba074512dace97",
          "__v": 0
        },
        {
          "_id": "54e06340a3ba074512dace96",
          "name": "木村",
          "unit": "54e06366a3ba074512dace97",
          "__v": 0
        }
      ],
      "__v": 0
    },
    "__v": 0
  }
]
```

社員リストの取得項目を限定したい場合は、`select`でプロパティを指定することができます。

```js
var options = {
  path: "unit.employees",
  select: "name", // -> nameだけ取得
  model: Employee,
};
```

これで部署に所属する社員リストまで join して取得することができましたが、結構面倒ですね。

## 最後に

`ref`と`populate`を使う事で、RDB のようなリレーションと join を行うことができました。  
しかし、実際には複数の Collection を fetch して ObjectId で紐付けるという泥臭い処理を mongoose が肩代りしてくれているだけです。

あまり RDB っぽくならないよう注意しながら利用するべきですが、mongoose を使って RDB ライクなことができるということを知ることで、mongodb に対する敷居がすこし下がるのではないかと思いました。

特にこのやり取りが読んでて興味深かったです。

[node.js - Mongoose populate vs object nesting - Stack Overflow](http://stackoverflow.com/questions/24096546/mongoose-populate-vs-object-nesting)

ちなみにネストした population を多用すると、海外の熱心な mongodb ファンから怒られるので注意です w

[node.js - Mongoose: How to populate 2 level deep population without populating fields of first level? in mongodb - Stack Overflow](http://stackoverflow.com/questions/27168022/mongoose-how-to-populate-2-level-deep-population-without-populating-fields-of-f)

## 参考文献

- [Node.js - Mongoose でネストした populate の書き方 - Qiita](http://qiita.com/Teloo/items/824447cfbb9b16dee215)
- [Can't make nested populate in new mongoose 3.6rc0 · Issue #1377 · LearnBoost/mongoose](https://github.com/LearnBoost/mongoose/issues/1377)
