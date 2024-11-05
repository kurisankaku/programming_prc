
1億レコード存在するテーブルのパフォーマンスを測定する。

# 調査概要

`テーブル定義`に記載しているテーブルを作成。
実運用に近い形でのランダムな値を挿入し、レコードを作成する。
テーブルに挿入するレコード数も実運用を想定してのレコード数となっている。

また、同意義のようなテーブルもいくつか見られると思うが、それらは実験のために用意している。

例えば、
push_open_recordsとpush_open_historiesは同一の内容を異なる形式で表現している。
push_open_recordsはcustomer_nameなどを直接挿入している。
push_open_historiesはcustomer_idで定義し、実際の値はcustomersで管理するようにしている。

この2つのテーブルの違いにより、intとvarcharによる速度の違い、データ量の違いなどを検証している。

# 調査環境
MacBook Pro (13-inch, 2020, Four Thunderbolt 3 ports)
プロセッサ 2.3GHz クアッドコア Intel Core i7
メモリ 16GB

Docker上で実行
mysql 8.0.32

DockerデスクトップでのResourcesの指定は、
CPUs: 4,
Memory: 2.00GB
Swap: 1GB

# DB内レコード状況
[DB使用量]
55,934 MB

[テーブル]
+--------------------------------+-----------+----------+-----------------------+--------+-----------+
| TABLE_NAME                     | DBエンジン | 行数      | 平均レコード長 | ALL_MB | DATA_MB | INDEX_MB |
+--------------------------------+-----------+----------+-----------------------+--------+-----------+
| push_open_records              | InnoDB    | 97699800 |          186 |  17369 |   17369 |        0 |
| push_open_histories            | InnoDB    | 98039287 |           80 |  12236 |    7554 |     4682 |
| push_notification_customers    | InnoDB    | 99666673 |           58 |  10795 |    5545 |     5250 |
| notification_accessible_users  | InnoDB    | 95670656 |           57 |  10754 |    5289 |     5465 |
| push_endpoints                 | InnoDB    |  9074913 |           77 |   2157 |     669 |     1488 |
| campaigns                      | InnoDB    |  9533870 |           56 |    511 |     511 |        0 |
| push_endpoint_values           | InnoDB    |  2807026 |           99 |    503 |     266 |      236 |
| customers                      | InnoDB    |  2945682 |           53 |    444 |     150 |      293 |
| notifications                  | InnoDB    |     7503 |         5529 |     40 |      39 |        0 |
| push_notification_uuids        | InnoDB    |    99844 |           78 |     26 |       7 |       19 |
| push_notification_ids          | InnoDB    |    99405 |          121 |     14 |      11 |        2 |
| notification_detail_links      | InnoDB    |     9295 |         1299 |     11 |      11 |        0 |
| push_notifications             | InnoDB    |     9486 |          941 |      8 |       8 |        0 |
| push_notification_jobs         | InnoDB    |    19642 |          401 |      7 |       7 |        0 |

[テーブルのレコード数]
select count(*) from テーブル名 を行った際の結果。
select count(id) from テーブル名 で行っても同様の結果であった。
1行に格納されているレコードの長さにより、実行速度に大きく差が出ている。

■ push_open_records
行数: 100,635,225 実行時間: 3分5秒

■ push_open_histories
行数: 100,070,128 実行時間: 1分12秒

■ push_notification_customers
行数: 100,000,000 実行時間: 1分6秒

■ notification_accessible_users
行数: 100,000,000 実行時間: 1分0秒

■ push_endpoints
行数: 10,000,000 実行時間: 7.36秒

■ campaigns
行数: 10,000,000 実行時間: 4.7秒

■ push_endpoint_values
行数: 3,000,001 実行時間: 3.39秒

■ customers
行数: 3,000,000 実行時間: 1.75秒

■ notifications
行数: 10,000 実行時間: 0.421秒

■ push_notification_ids
行数: 100,000 実行時間: 0.408秒

■ notification_detail_links
行数: 10,000 実行時間: 0.209秒

■ push_notification_uuids
行数: 100,000 実行時間: 0.17秒

■ push_notifications
行数: 10,000 実行時間: 0.138秒

■ push_notification_jobs
行数: 10,000 実行時間: 0.110秒

# 調査結果概要
1億レコードテーブルに対してSelect, Insert, Update, Deleteの処理時間の調査結果概要を下記に示す。

[Select]
* Where句でIndexを指定する場合、処理時間は0.1秒以下と十分に速度が出ていた。
* Indexを指定せず、limitも指定しない場合、240秒かかり実運用に耐えられないことがわかった。
* Indexを指定しないが、limitを指定した場合取得レコードが件数に達するかどうかで速度が変わることがわかった。早めにlimitに達したのであれば、7秒で返却されるなどがあった。
* 複数テーブルJoinした場合であってもIndexに対するSelectであれば、処理時間0.1秒以下と十分に速度が出ていた。

[Insert]
* Indexの有無、ユニーク、外部キー、1レコードデータ量の全てが影響することがわかった。
* Indexに関して
  * Intに対してのIndexは速度が出る。Stringに対してのIndexは速度がIntの4倍以上遅くなることがある。
  * Indexにユニーク値を付けると速度が4倍以上遅くなることがある。
* 外部キーがある場合、無い場合に比べて実行速度が遅くなる。
* 1レコードのデータ量が異なるテーブルでは、同じレコード数でもデータ量が多いほうが数倍実行速度が遅くなる。
* 1レコードInsert, 10000万レコードInsertで処理時間が全く変わるため、ユースケースによってはIndexを気にせず貼ることもありだとわかった。
  * 負荷がそこまで高く無い場合、1レコードのInsertはIndexがStringに貼られていても0.04秒で終わるため実運用に影響は無いと思われる。
  * 負荷が高い場合（例えば100万行を5分以内で処理しなければならない場合など）はIndexを考慮しないと処理が終わらないため、Indexなどの設計に気をつける必要がある。

[Update]
* Where句でIndexを指定する場合は、処理時間0.1秒以下と十分に速度が出ていた。
* Where句でIndexを指定しない場合は、処理時間15分以上かかり実運用に耐えられないことがわかった。
  * Selectで同様のWhere句を指定した場合、3分程で完了していることからUpdateは処理時間がSelectよりかかっている事がわかる。
* Where句でJoin先のレコードを指定したとしても、Indexが適切に行われている場合は処理時間0.1秒以下と十分に速度が出ていた。

[Delete]
* Updateと同様の内容。Indexある無しで性能差が大きい。

# 1億レコードテーブルSelect
1億レコード保持するテーブルに対して、次の条件でSelectを行った場合の処理時間を計測。

## インデックスに対してのSelect

■ データが存在する場合
SELECT * FROM push_open_records where push_endpoint_name = '5a616816-18e7-4642-b113-d02c784e7f87';
取得秒数: 0.145sec
取得行数: 33行

■ データが存在しない場合
SELECT * FROM push_open_records where push_endpoint_name = '5a616816-18e7-4642-b113-d02c784e7f88';
取得秒数: 0.055sec
取得行数: 0行

## 非インデックスに対してのSelect

■ データが存在する場合
[limitで範囲指定する場合]
SELECT * FROM push_open_records where notification_id = 260 limit 100;
取得秒数: 7.968sec
取得行数: 100行

[limitで範囲指定しない場合]
SELECT * FROM push_open_records where notification_id = 260
取得秒数: 247.516sec
取得行数: 10800行

■ データが存在しない場合
SELECT * FROM push_open_records where notification_id = 15160 LIMIT 100;
取得秒数: 241.854sec
取得行数: 0行

## 2テーブルをJoinした場合のSelect

■ 主テーブルにはIndexが無い。従テーブルにはIndexがある場合。
select * from push_notification_customers as a
inner join notification_accessible_users as b on a.customer_name = b.customer_name
where a.customer_name = 'RFLo49VGlwMylxIJ';
取得秒数: 108.51sec
取得行数: 11817

push_notification_customersのcustomer_nameにはIndexがついているが、notification_accessible_usersのcustomer_nameにはIndexがついていない状態。この状態で下記を実行しても同様な時間がかかったことから、Joinによる影響ではなく、Indexによる影響と考えられる。

select * from notification_accessible_users where customer_name = 'RFLo49VGlwMylxIJ';
取得秒数: 107.27sec
取得行数: 117

■ 主テーブル、従テーブルにIndexがある場合。
select * from push_notification_customers as a 
inner join notification_accessible_users as b on a.customer_name = b.customer_name
where a.customer_name = 'gY8c6uBFMHr1XyjF';
取得秒数: 0.13sec
取得行数: 11817

## 4テーブルをJoinした場合のSelect

以下のレコード件数を保持するテーブルに対して検証を行う。
push_open_histories: 1億レコード
customers: 300万レコード
push_endpoints: 10万レコード
push_notification_uuid_masters: 1000万レコード

■ Where句から求められるIdに対して主テーブルでIndexを貼っている場合
主テーブルのpush_endpoint_id, 従テーブルのpush_endpointに対してIndexが貼られている。

select * from push_open_histories as a
inner join customers as b on a.customer_id = b.id
inner join push_endpoints as c on a.push_endpoint_id = c.id
inner join push_notification_uuid_masters as d on a.push_notification_uuid_master_id = d.id
where c.push_endpoint = 'e22d09c4-cab1-4fa5-8b02-b0282ff16ca5'
実行時間: 0.055秒
取得件数: 9行

■ Where句から求められるIdに対して主テーブルでIndexを貼っていない場合
主テーブルのpush_endpoint_idにはIndexが貼られていない。従テーブルのpush_endpointに対してIndexが貼られている。
select * from push_open_histories as a
inner join customers as b on a.customer_id = b.id
inner join push_endpoints as c on a.push_endpoint_id = c.id
inner join push_notification_uuid_masters as d on a.push_notification_uuid_master_id = d.id
where b.customerid = 'z2Sp76TZUyF5LLA3'
実行時間: 141.418秒
取得件数: 39行

indexが貼られていない主テーブルのIdに対してのSelect実行時間
select * from push_open_histories as a
inner join customers as b on a.customer_id = b.id
inner join push_endpoints as c on a.push_endpoint_id = c.id
inner join push_notification_uuid_masters as d on a.push_notification_uuid_master_id = d.id
where a.customer_id = '1234';
実行時間: 165.696秒
取得件数: 28行

# 1000万レコードテーブルSelect
Index無しのSelectを行った場合以下のようになった。

select * from campaigns where campaign_id = 13;
取得秒数: 5.96秒
取得行数: 333954レコード

select * from campaigns where customer_number = 'Jvtz85MyW0gLC';
取得秒数: 4.41秒
取得行数: 1レコード

# Insert
1億レコード存在するテーブルに対してBulk Insertした際の実行時間。

■ インデックスが無い

インデックスがない状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.014秒

・10行の場合
実行時間: 0.015秒

・100行の場合
実行時間: 0.023秒

・1000行の場合
実行時間: 0.091秒

・10000行の場合
実行時間: 0.427秒

■ インデックス（ユニークでない）が1つ

Indexが(customer_name)の状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.013秒

・10行の場合
実行時間: 0.040秒

・100行の場合
実行時間: 0.286秒

・1000行の場合
実行時間: 2.849秒

・10000行の場合
実行時間: 26.183秒

Indexが(push_notification_id)の状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.008秒

・10行の場合
実行時間: 0.016秒

・100行の場合
実行時間: 0.017秒

・1000行の場合
実行時間: 0.080秒

・10000行の場合
実行時間: 0.440秒

・10000行の場合かつpush_notification_idが全て新規の値の場合
実行時間: 0.462秒

■ インデックス(ユニークでない)が2つ

Indexが(push_notification_id)と(customer_name)の状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.009秒

・10行の場合
実行時間: 0.047秒

・100行の場合
実行時間: 0.339秒

・1000行の場合
実行時間: 3.098秒

・10000行の場合
実行時間: 28.348秒

■ マルチカラムインデックス（ユニークではない）

Indexが(push_endpoint_name, push_notification_uuid)の状態のpush_open_recordsへのInsert

・1行の場合
INSERT INTO `push_open_records` (`notification_id`, `push_endpoint_name`, `customer_name`, `push_notification_uuid`, `os_type`, `opened_at`, `created_at`, `updated_at`) VALUES ('10001', 'e1dd2cda-a58f-43b1-9ac3-583e629892e5', 'fh5AjYOthpYfoB72', '1UGkXYdazSaAAjWvEEi4unBgZCmIEJH2RLP3Y5P1onetrSnq7uNi9aS4hCrgdFxF', '1', '2023-11-27 09:19:32', '2023-11-27 09:19:32', '2023-11-27 09:19:32');

実行時間: 0.04秒

・10行の場合
実行時間: 0.161秒

・100行の場合
実行時間: 1.243秒

・1000行の場合
実行時間: 5.402秒

・10000行の場合
実行時間: 61.820秒

■ マルチカラムインデックス(ユニーク)とインデックス（ユニークではない）

Indexが(push_notification_id, customer_name)ユニークと(customer_name)の状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.024秒

・10行の場合
実行時間: 0.094秒

・100行の場合
実行時間: 0.597秒

・1000行の場合
実行時間: 4.156秒

・10000行の場合
実行時間: 48.234秒

■ マルチカラムインデックス(ユニークではない)とインデックス（ユニークではない）

Indexが(push_notification_id, customer_name)ユニークではないと(customer_name)の状態のpush_notification_customersへのInsert

・1行の場合
実行時間: 0.028秒

・10行の場合
実行時間: 0.075秒

・100行の場合
実行時間: 0.490秒

・1000行の場合
実行時間: 3.950秒

・10000行の場合
実行時間: 28.150秒

■ 外部キーが複数存在し、Indexがある場合

外部キーがある状態でのpush_open_historiesへのInsert。1億レコードで計測しようとしたが処理時間がかかりすぎるため、500万レコード状態での計測。

キーは、
KEY `idx_push_open_histories_1` (`push_endpoint_id`,`push_notification_uuid_master_id`),
KEY `fk_push_open_histories_1` (`push_notification_id`),
KEY `fk_push_open_histories_3` (`push_notification_uuid_master_id`),
KEY `fk_push_open_histories_4` (`customer_id`),
CONSTRAINT `fk_push_open_histories_1` FOREIGN KEY (`push_notification_id`) REFERENCES `push_notifications` (`id`) ON DELETE CASCADE,
CONSTRAINT `fk_push_open_histories_2` FOREIGN KEY (`push_endpoint_id`) REFERENCES `push_endpoints` (`id`) ON DELETE CASCADE,
CONSTRAINT `fk_push_open_histories_3` FOREIGN KEY (`push_notification_uuid_master_id`) REFERENCES `push_notification_uuid_masters` (`id`) ON DELETE CASCADE,
CONSTRAINT `fk_push_open_histories_4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE

push_notifications: 10000件
push_endpoints: 10000000件
push_notification_uuid_masters: 100000件
customers: 3000000件

・10000行（500万件push_open_historiesに存在する場合）
実行時間: 5.636秒

■ 外部キーが存在せず、Indexがある場合

外部キーが無い状態でのpush_open_historiesへのInsert。500万レコード状態での計測。

キーは、
KEY `idx_push_open_histories_1` (`push_endpoint_id`,`push_notification_uuid_master_id`),
KEY `fk_push_open_histories_1` (`push_notification_id`),
KEY `fk_push_open_histories_3` (`push_notification_uuid_master_id`),
KEY `fk_push_open_histories_4` (`customer_id`)

push_notifications: 10000件
push_endpoints: 10000000件
push_notification_uuid_masters: 100000件
customers: 3000000件

・10000行（500万件push_open_historiesに存在する場合）
実行時間: 1.113秒


キーが、
KEY `idx_push_open_histories_1` (`push_endpoint_id`,`push_notification_uuid_master_id`)
のみの場合

・10000行（500万件push_open_historiesに存在する場合）
実行時間: 0.906秒

# Update
1億レコードテーブルへのUpdate

■ Indexが無いカラムをWhere句で指定する場合
UPDATE `push_open_records` SET `updated_at` = '2023-11-28 09:19:32' WHERE (`notification_id` = '10001');
実行時間: 15分32秒
行数: 1行

select文の場合下記のような時間となる。Updateの場合数段時間がかかっていることがわかる。
select * from `push_open_records`  WHERE (`notification_id` = '10001');
実行時間: 3分33秒
行数: 1行

■ IndexがあるカラムをWhere句で指定する場合
UPDATE `push_open_records` SET `updated_at` = '2023-11-28 09:19:32' WHERE (`push_endpoint_name` = 'bef7cf15-192e-4842-8c5f-17e96b3a7fb9');
実行時間: 0.16秒
行数: 35行

■ Indexが主テーブル、従テーブルともにありWhere句で従テーブルのカラムを指定する場合
push_open_histories: 1億レコード

indexは、(push_endpoint,push_notification_uuid_master_id)での作成。
customers: 300万レコード
push_endpoints: 10万レコード
push_notification_uuid_masters: 1000万レコード

update push_open_histories as a
inner join push_endpoints as c on a.push_endpoint_id = c.id
inner join push_notification_uuid_masters as d on a.push_notification_uuid_master_id = d.id
set a.opened_at = '2023-09-14 23:02:20'
where c.push_endpoint = '78eba952-95b2-4460-9fda-32cd06fa3cb8';

実行時間: 0.049秒
影響行数: 9行

# Delete
1億レコードテーブルへのDelete

■ IndexがあるカラムをWhere句で指定する場合
DELTE FROM `push_open_histories` WHERE (`push_endpoint_id` = '709853');
実行時間: 0.058秒
影響行数: 9行

Selectの場合
SELECT FROM `push_open_histories` WHERE (`push_endpoint_id` = '2699');
実行時間: 0.03秒
取得件数: 7行

■ IndexがないカラムをWhere句で指定する場合
DELTE FROM `push_open_histories` WHERE (`push_notification_id` = '2700');
実行時間: 12分35秒
影響行数: 10122行

Selectの場合
SELECT FROM `push_open_histories` WHERE (`push_notification_id` = '2699');
実行時間: 2分7秒
影響行数: 10138行

# Index追加
1億レコードのテーブルへのIndexを追加した際の処理時間。

CREATE INDEX `idx_push_open_records_1`  ON `push_open_records` (push_endpoint_name, push_notification_uuid);
実行時間: 1時間7分18秒

push_endpoint_nameの長さは36文字
push_notification_uuidの長さは64文字

CREATE INDEX `idx_notification_accessible_users_2`  ON `notification_accessible_users` (customer_name);
実行時間: 17分11秒

customer_nameカラムの長さは16文字
CREATE INDEX `idx_push_notification_customers_1`  ON `push_notification_customers` (push_notification_id,customer_name)
実行時間: 12分27秒

push_notification_idはInt, customer_nameのカラムの長さは16文字

# テーブル定義
`campaigns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `customer_number` varchar(32) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
)
`information_banners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `image_path` varchar(1024) NOT NULL,
  `action_type` int NOT NULL,
  `action_value` varchar(2048) NOT NULL,
  `action_option` json DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `position` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_information_banners_01` (`start_date`),
  KEY `idx_information_banners_02` (`end_date`)
)
`notification_accessible_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `notification_id` int unsigned NOT NULL,
  `customer_name` varchar(64) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_notification_accessible_users_1` (`notification_id`,`customer_name`),
  KEY `idx_notification_accessible_users_2` (`customer_name`),
  CONSTRAINT `fk_notification_accessible_users_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
)
`notification_detail_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `notification_id` int unsigned NOT NULL,
  `link_url` varchar(2048) NOT NULL,
  `click_count` bigint NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notification_detail_links_1` (`notification_id`),
  CONSTRAINT `fk_notification_detail_links_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
)
`notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `is_user_limit` tinyint(1) NOT NULL DEFAULT '0',
  `is_push_notification` tinyint(1) NOT NULL DEFAULT '0',
  `push_notification_date` datetime DEFAULT NULL,
  `push_notification_uuid` varchar(64) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `title` varchar(64) NOT NULL,
  `detail` mediumtext NOT NULL,
  `push_text` varchar(150) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_01` (`start_date`),
  KEY `idx_notifications_02` (`end_date`)
)
`push_endpoint_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_endpoint_name` varchar(128) NOT NULL,
  `customer_name` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_push_endpoint_values_1` (`push_endpoint_name`)
)
`push_notification_customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_notification_id` int unsigned NOT NULL,
  `customer_name` varchar(64) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_push_notification_customers_1` (`push_notification_id`,`customer_name`),
  KEY `idx_push_notification_customers2` (`customer_name`),
  CONSTRAINT `fk_push_notification_customers_1` FOREIGN KEY (`push_notification_id`) REFERENCES `push_notifications` (`id`) ON DELETE CASCADE
)
`push_notification_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_notification_id` int unsigned NOT NULL,
  `job_id` varchar(256) NOT NULL,
  `job_type` varchar(32) NOT NULL,
  `from_id` bigint unsigned NOT NULL,
  `to_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_push_notification_jobs_1` (`push_notification_id`),
  CONSTRAINT `fk_push_notification_jobs_1` FOREIGN KEY (`push_notification_id`) REFERENCES `push_notifications` (`id`) ON DELETE CASCADE
)
`push_notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `notification_id` int unsigned DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `push_text` varchar(150) NOT NULL,
  `send_at` datetime NOT NULL,
  `push_state` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_push_notifications_1` (`notification_id`),
  CONSTRAINT `fk_push_notifications_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
)
`push_notification_ids` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_notification_id` int unsigned NOT NULL,
  `push_notification_uuid` varchar(64) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_push_notification_ids_1` (`push_notification_id`),
  CONSTRAINT `fk_push_notification_ids_1` FOREIGN KEY (`push_notification_id`) REFERENCES `push_notifications` (`id`) ON DELETE CASCADE
)
`push_open_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `notification_id` int unsigned DEFAULT NULL,
  `push_endpoint_name` varchar(128) NOT NULL,
  `customer_name` varchar(64) DEFAULT NULL,
  `push_notification_uuid` varchar(64) NOT NULL,
  `os_type` int NOT NULL,
  `opened_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_push_open_records_1` (`push_endpoint_name`,`push_notification_uuid`)
)
customers {
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customerid` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
}
push_endpoints {
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_endpoint` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
}
push_notification_uuids {
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
}
`push_open_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_notification_id` int unsigned DEFAULT NULL,
  `push_endpoint_id` bigint unsigned NOT NULL,
  `push_notification_uuid_master_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `os_type` int NOT NULL,
  `opened_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_push_open_histories_1` (`push_endpoint_id`,`push_notification_uuid_master_id`),
  KEY `fk_push_open_histories_1` (`push_notification_id`),
  KEY `fk_push_open_histories_3` (`push_notification_uuid_master_id`),
  KEY `fk_push_open_histories_4` (`customer_id`),
  CONSTRAINT `fk_push_open_histories_1` FOREIGN KEY (`push_notification_id`) REFERENCES `push_notifications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_push_open_histories_2` FOREIGN KEY (`push_endpoint_id`) REFERENCES `push_endpoints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_push_open_histories_3` FOREIGN KEY (`push_notification_uuid_master_id`) REFERENCES `push_notification_uuid_masters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_push_open_histories_4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
)

