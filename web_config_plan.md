# やること

## UIデザイン
* ワイヤーフレーム
	* ペーパー
* デザイン
	* Sketch

## フロントエンド
* ビルドシステム
	* gulp
    * uglify
    * minify
    * es6 compile
    * sass compile
    * file rename revision
    * inject file
    * browsersync
    * react compile
* JavaScript
	* ECMA Script2016
  * eslint の設定。airbnbのを使うかも
* JavaScriptフレームワーク
	* React or Riot or Aurelia
* Html テンプレートエンジン
	* 悩み中。。。 ejsを使うかな。
* Cssのメタ言語
	* Sass
  * cssのフレームワークを選定。bootstrap以外の軽量かつboxのやつを選ぶ。

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
