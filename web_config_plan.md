# やること

## UIデザイン
* ワイヤーフレーム
	* ペーパー
* デザイン
	* Sketch

## フロントエンド
* ビルドシステム
  * webpack
    * uglify
    * minify
    * sass compile
    * es6 compile
    * assets finger print
    * inject file
      * railsでの読み込みの場合は、やらなくてもいいかも。
      * 本当にフロントを分けるならやったほうが良い。
    * browsersync
* JavaScript
	* ECMA Script2016
  * eslint の設定。airbnbを使う
* JavaScriptフレームワーク
	* React に決定。Reduxで作成。
  * Riot
  * Aurelia
* Html テンプレートエンジン
	* jsx Reactにするので、これで。
  * ejs
  * slim
* Cssのメタ言語
	* Sass
  * cssのフレームワークを選定。bootstrap以外の軽量かつboxのやつを選ぶ。
    * pure 暫定で決定。
    * uikit
* UIライブラリ
  * モーダル
  * トースト
  * Date Picker

## バックエンド
* Webアプリケーションフレームワーク
	* Rails API
* サーバー構成ツール
	* ansible
* サーバー構築
	* プロキシサーバー Nginx
	* Rack Webサーバー Unicorn
	* Database MySQL
	* KVS 揮発性データベース　Redis
* ログについて
  * 各ログの管理 logrotate
  * ログの収集、転送 fluentd
  * ログの保存 S3
  * ログの解析 Elasticsearch, Kibana
    * すべてのログの保存をS3に行い、Elasticsearchには保存できる容量のログを保存し解析する。
* サーバー監視構築
	* 死活監視
	* プロセス監視
	* リソース監視
* docker
  * コンテナ管理で行うならこれだけど、複雑なものを扱う場合はVMだけ立ち上げてAnsibleで構築なのかな。。

今のところNewRelicだけで済ませてみる。
* CI構築
	* Circle CI
* Slack構築
	* Gitのフック
	* Circle CIのフック

## デプロイ環境
* OS
  * CentOS 7系
* クラウド
  * AWS
