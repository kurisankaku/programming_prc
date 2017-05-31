# Apache, EAP6.4構築

mod_clusterを使用し、ApacheとEAP6.4を用いたHAの構築方法を説明する。

## OS

Apache、EAP6.4ともにOSは、`CentOS 7`の最新のものとする。

## Apacheの設定

### Apache バージョン

EAP6.4のサポートしているhttpdのバージョンは、下記のリンクの通り。
* [What version of mod_cluster is supported in JBoss EAP](https://access.redhat.com/solutions/60624)

本環境では、EWS2.1のhttpd Server を使用し設定する。

### unzipコマンドインストール

unzipを使用できない場合は、unzipをインストールする。

```
sudo yum install unzip
```

### jboss-ews-2.1のダウンロード

/optに移動、jboss-ews-2.1をダウンロードし、unzipする。

```
cd /opt
sudo wget [jboss-ews-2.1のダウンロードパス]
sudo unzip -q [jboss-ews-2.1のzipパス]
sudo rm [jboss-ews-2.1のzipパス]
```

unzipしたフォルダのパス（例えば /opt/jboss-ews-2.1）を以降は、`JBOSS_EWS_HOME`と呼ぶ。

### apacheに必要なモジュールをインストール

`apr-util`, `mailcap` がインストールされていない場合は、インストールする。
```
sudo yum install apr-util
sudo yum install mailcap
```

### modulesの不明なsymbolick linkの削除

`JBOSS_EWS_HOME/httpd/modules` 内に不明なsymbolic linkがあった場合は、必要かどうかを判断し、必要ない場合は削除する。例えば、`auth_kerb.so`は今回必要無いので、symbolic linkが不明な場合は削除する。

```
sudo unlink JBOSS_EWS_HOME/httpd/modules/auth_kerb.so
```

### connectorのモジュールを追加

jboss-eap-6.4用のconnectorをダウンロードし、modulesに配置する。
配置するモジュールは以下。
* mod_proxy_cluster.so
* mod_jk.so
* mod_advertise.so
* mod_slotmem.so
* mod_manager.so

以下のようにダウンロードし、modulesにコピーする。
```
cd /tmp
sudo wget [jboss-eap-6.4用のconnectorダウンロードパス]
sudo unzip -q [jboss-eap-6.4用のconnectorのzipパス]
sudo cp -pi [connectorのmodulesまでのパス]/* JBOSS_EWS_HOME/httpd/modules/.
sudo rm [connectorのフォルダ]
sudo rm [jboss-eap-6.4用のconnectorのzipパス]
```
### .postinstallの実行

postinstallを実行し、実行環境に合わせた設定ファイルに設定する。

```
sudo JBOSS_EWS_HOME/httpd/.postinstall
```

### httpd.confの修正

#### httpd.confのバックアップを作成

初期状態に戻せるように、バックアップを作成しておく。

```
cp JBOSS_EWS_HOME/httpd/conf/httpd.conf JBOSS_EWS_HOME/httpd/conf/httpd.conf.bk
```

#### 追加したモジュールをロードするように、`httpd.conf`のLoadModules一覧に下記を追加。

`JBOSS_EWS_HOME`は各環境に合わせて修正すること。

* httpd.conf
```
LoadModule proxy_cluster_module /opt/jboss-ews-2.1/httpd/modules/mod_proxy_cluster.so
LoadModule slotmem_module /opt/jboss-ews-2.1/httpd/modules/mod_slotmem.so
LoadModule manager_module /opt/jboss-ews-2.1/httpd/modules/mod_manager.so
LoadModule advertise_module /opt/jboss-ews-2.1/httpd/modules/mod_advertise.so
```

#### `mod_proxy_balancer`がロードされている場合は、ロードしないようにコメントアウトをする。

下記は例。

* httpd.conf
```
##LoadModule proxy_balancer_module /opt/jboss-ews-2.1/httpd/modules/mod_proxy_balancer.so
```

#### ServerName

ServerNameを各環境に合わせて修正。下記は例。

* httpd.conf
```
ServerName 192.168.33.10:80
```

### VirtualHostの設定

VirtualHostを設定し、アクセス制限、ManagerBalanceNameなどの設定をする。
`JBOSS_EWS_HOME/conf.d`の直下に、`virtualhost.conf`ファイルを作成し、下記を記載し保存する。

`ManagerBalancerName`の値は、EAPの設定をする際に使用。

* virtualhost.conf
```
<VirtualHost *:80>  
    <Location />
        Order deny,allow
        Allow from all
    </Location>
	  
	KeepAliveTimeout 60
	MaxKeepAliveRequests 0
	EnableMCPMReceive
	  
	ManagerBalancerName mycluster
	ServerAdvertise Off  
</VirtualHost>
```