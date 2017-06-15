# Apache 環境構築

mod_clusterを使用するための、Apacheの環境構築方法を説明する。

## OS

* CentOS 7

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
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-ews-httpd-2.1.0-RHEL7-x86_64.zip
sudo unzip -q jboss-ews-httpd-2.1.0-RHEL7-x86_64.zip
sudo rm jboss-ews-httpd-2.1.0-RHEL7-x86_64.zip
```

unzipしたフォルダのパス（/opt/jboss-ews-2.1）を以降は、`JBOSS_EWS_HOME`と呼ぶ。

### apacheに必要なモジュールをインストール

`apr-util`, `mailcap` がインストールされていない場合は、インストールする。
```
sudo yum install apr-util
sudo yum install mailcap
```

### modulesの不明なsymbolick linkの削除

`JBOSS_EWS_HOME/httpd/modules` 内に不明なsymbolic linkがあった場合は、必要かどうかを判断し、必要ない場合は削除する。例えば、`mod_auth_kerb.so`は今回必要無いので、symbolic linkが不明な場合は削除する。

```
sudo unlink /opt/jboss-ews-2.1/httpd/modules/mod_auth_kerb.so
```

### conf.dの不明なsymbolick linkの削除
`JBOSS_EWS_HOME/httpd/conf.d` 内に不明なsymbolic linkがあった場合は、必要かどうかを判断し、必要ない場合は削除する。例えば、`auth_kerb.conf`は今回必要無いので、symbolic linkが不明な場合は削除する。

```
sudo unlink /opt/jboss-ews-2.1/httpd/conf.d/auth_kerb.conf
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
cd /opt
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-native-webserver-connectors-6.4.0-RHEL7-x86_64.zip
sudo unzip -q jboss-eap-native-webserver-connectors-6.4.0-RHEL7-x86_64.zip
sudo cp -pi jboss-eap-6.4/modules/system/layers/base/native/lib64/httpd/modules/* /opt/jboss-ews-2.1/httpd/modules/.
sudo rm -rf jboss-eap-6.4
sudo rm jboss-eap-native-webserver-connectors-6.4.0-RHEL7-x86_64.zip
```

### .postinstallの実行

postinstallを実行し、実行環境に合わせた設定ファイルに設定する。

```
cd /opt/jboss-ews-2.1/httpd
sudo ./.postinstall
```

### httpd.confの修正

#### httpd.confのバックアップを作成

初期状態に戻せるように、バックアップを作成しておく。

```
sudo cp /opt/jboss-ews-2.1/httpd/conf/httpd.conf /opt/jboss-ews-2.1/httpd/conf/httpd.conf.bk
```

#### Apacheのバージョン情報の非表示

Apacheのバージョン情報をレスポンスで返さないようにする。
httpd.confの以下の二点を変更すること。

```
ServerTokens OS
↓変更後
ServerTokens Prod
```

```
ServerSignature On
↓変更後
ServerSignature Off
```

#### Apacheのテストページを非表示にする

`/opt/jboss-ews-2.1/httpd/conf.d/welcome.conf`の中身をすべてコメントアウトする。

#### Apacheのディレクトリを非表示にする

ディレクトリ一覧が出ないようにします。
http.confを以下のように変更すること。

```
Options Indexes FollowSymLinks
↓変更後
Options -Indexes FollowSymLinks
```

#### 追加したモジュールをロード

`/opt/jboss-ews-2.1/httpd/conf/httpd.conf`のLoadModules一覧に下記を追加。

* httpd.conf

```
LoadModule proxy_cluster_module /opt/jboss-ews-2.1/httpd/modules/mod_proxy_cluster.so
LoadModule slotmem_module /opt/jboss-ews-2.1/httpd/modules/mod_slotmem.so
LoadModule manager_module /opt/jboss-ews-2.1/httpd/modules/mod_manager.so
LoadModule advertise_module /opt/jboss-ews-2.1/httpd/modules/mod_advertise.so
```

##### `mod_proxy_balancer`がロードされている場合は、ロードしないようにコメントアウトをする。

* httpd.conf

```
##LoadModule proxy_balancer_module /opt/jboss-ews-2.1/httpd/modules/mod_proxy_balancer.so
```

### VirtualHostの設定

VirtualHostを設定し、アクセス制限、ManagerBalanceNameなどの設定をする。
`JBOSS_EWS_HOME/httpd/conf.d`の直下に、`virtualhost.conf`ファイルを作成し、下記を記載し保存する。

`ManagerBalancerName`の値は、EAPの設定をする際に使用。

#### ServerAdvertiseを使用しない場合

* virtualhost.conf

```
<VirtualHost *:80
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

#### ServerAdvertiseを使用し、マルチキャストする場合

`192.168.33.10`の値は各サーバー自身のIPを入れること。

* virtualhost.conf

```
Listen 192.168.33.10:6666
<VirtualHost 192.168.33.10:6666>
  ServerName 192.168.33.10
  <Directory />
   Order deny,allow
   Deny from all
   Allow from all
  </Directory>

  KeepAliveTimeout 60
  MaxKeepAliveRequests 0
  EnableMCPMReceive On

  ManagerBalancerName mycluster
  AdvertiseFrequency 5
  ServerAdvertise On
</VirtualHost>
```

また、mod_cluster が advertise パケットをマルチキャストアドレス 224.0.1.105 に対して送信するため、route コマンドでルーティングを定義。

`eth1`はifconfigで調べた各サーバーのdevを入力すること。

```
route add -host 224.0.1.105 dev eth1
```

これはサーバーを再起動すると消えてしまう一時的なもののため、永続する場合は静的ルーティングを行うこと。

### apache 実行ユーザー作成

apache実行ユーザーとグループを作成。

```
sudo getent group apache >/dev/null || sudo groupadd -g 48 -r apache
sudo getent passwd apache >/dev/null || sudo useradd -r -u 48 -g apache -s /sbin/nologin  -d /opt/jboss-ews-2.1/httpd/www -c "Apache" apache
```

### JBOSS_EWS_HOMEの権限変更

`JBOSS_EWS_HOME`配下をapacheユーザーが実行するように変更

```
sudo chown -R apache:apache /opt/jboss-ews-2.1
```

## Serviceに登録

Serviceに登録し、サーバー起動時にApacheが起動するようにする。

#### Service 作成

以下のように、serviceファイルを作成

```
sudo touch /etc/systemd/system/httpd.service
```

`httpd.service`に下記を記載し保存。

* httpd.service

```
[Unit]
Description=The Apache HTTP Server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
ExecStart=/opt/jboss-ews-2.1/httpd/sbin/apachectl start
ExecReload=/opt/jboss-ews-2.1/httpd/sbin/apachectl restart
ExecStop=/opt/jboss-ews-2.1/httpd/sbin/apachectl graceful-stop

# We want systemd to give httpd some time to finish gracefully, but still want
# it to kill httpd after TimeoutStopSec if something went wrong during the
# graceful stop. Normally, Systemd sends SIGTERM signal right after the
# ExecStop, which would kill httpd. We are sending useless SIGCONT here to give
# httpd time to finish.
KillSignal=SIGCONT
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

#### Service登録

下記を入力し、Serviceを登録しスタート。

```
sudo systemctl enable httpd
sudo systemctl start httpd
sudo systemctl status httpd
```
