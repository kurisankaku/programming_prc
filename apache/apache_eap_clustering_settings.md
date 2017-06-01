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

`JBOSS_EWS_HOME/httpd/modules` 内に不明なsymbolic linkがあった場合は、必要かどうかを判断し、必要ない場合は削除する。例えば、`mod_auth_kerb.so`は今回必要無いので、symbolic linkが不明な場合は削除する。

```
sudo unlink JBOSS_EWS_HOME/httpd/modules/mod_auth_kerb.so
```

### conf.dの不明なsymbolick linkの削除
`JBOSS_EWS_HOME/httpd/conf.d` 内に不明なsymbolic linkがあった場合は、必要かどうかを判断し、必要ない場合は削除する。例えば、`auth_kerb.conf`は今回必要無いので、symbolic linkが不明な場合は削除する。

```
sudo unlink JBOSS_EWS_HOME/httpd/conf.d/auth_kerb.conf
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
sudo rm -rf [connectorのフォルダ]
sudo rm [jboss-eap-6.4用のconnectorのzipパス]
```
### .postinstallの実行

postinstallを実行し、実行環境に合わせた設定ファイルに設定する。

```
cd JBOSS_EWS_HOME/httpd
sudo ./.postinstall
```

### httpd.confの修正

#### httpd.confのバックアップを作成

初期状態に戻せるように、バックアップを作成しておく。

```
sudo cp JBOSS_EWS_HOME/httpd/conf/httpd.conf JBOSS_EWS_HOME/httpd/conf/httpd.conf.bk
```

#### 追加したモジュールをロード

`JBOSS_EWS_HOME/httpd/conf/httpd.conf`のLoadModules一覧に下記を追加。

`JBOSS_EWS_HOME`は各環境に合わせて修正すること。

* httpd.conf
```
LoadModule proxy_cluster_module JBOSS_EWS_HOME/httpd/modules/mod_proxy_cluster.so
LoadModule slotmem_module JBOSS_EWS_HOME/httpd/modules/mod_slotmem.so
LoadModule manager_module JBOSS_EWS_HOME/httpd/modules/mod_manager.so
LoadModule advertise_module JBOSS_EWS_HOME/httpd/modules/mod_advertise.so
```

##### `mod_proxy_balancer`がロードされている場合は、ロードしないようにコメントアウトをする。

下記は例。

* httpd.conf
```
##LoadModule proxy_balancer_module /opt/jboss-ews-2.1/httpd/modules/mod_proxy_balancer.so
```

### VirtualHostの設定

VirtualHostを設定し、アクセス制限、ManagerBalanceNameなどの設定をする。
`JBOSS_EWS_HOME/httpd/conf.d`の直下に、`virtualhost.conf`ファイルを作成し、下記を記載し保存する。

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

### apache 実行ユーザー作成

apache実行ユーザーとグループを作成。
`JBOSS_EWS_HOME`は各環境に合わせて修正すること。

```
sudo getent group apache >/dev/null || sudo groupadd -g 48 -r apache
sudo getent passwd apache >/dev/null || sudo useradd -r -u 48 -g apache -s /sbin/nologin  -d JBOSS_EWS_HOME/httpd/www -c "Apache" apache
```

### JBOSS_EWS_HOMEの権限変更

`JBOSS_EWS_HOME`配下をapacheユーザーが実行するように変更
`JBOSS_EWS_HOME`は各環境に合わせて修正すること。

```
sudo chown -R apache:apache JBOSS_EWS_HOME
```

### Serviceに登録

Serviceに登録し、サーバー起動時にApacheが起動するようにする。

#### Service 作成

以下のように、serviceファイルを作成
```
sudo touch /etc/systemd/system/httpd.service
```

`httpd.service`に下記を記載し保存。
`JBOSS_EWS_HOME`は各環境に合わせて修正すること。

* httpd.service
```
[Unit]
Description=The Apache HTTP Server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
ExecStart=JBOSS_EWS_HOME/httpd/sbin/apachectl start
ExecReload=JBOSS_EWS_HOME/httpd/sbin/apachectl restart
ExecStop=JBOSS_EWS_HOME/httpd/sbin/apachectl graceful-stop

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

## EAP6.4の設定

### EAP6.4のダウンロード

/optに移動、EAP6.4をダウンロードし、unzipする。

```
cd /opt
sudo wget [EAP6.4のダウンロードパス]
sudo unzip -q [EAP6.4のzipパス]
sudo rm [EAP6.4のzipパス]
```

unzipしたフォルダのパス（例えば /opt/EAP6.4）を以降は、`EAP_HOME`と呼ぶ。

### EAP 実行ユーザー作成

EAP実行ユーザーとグループを作成。
`EAP_HOME`は各環境に合わせて修正すること。

```
sudo getent group eap >/dev/null || groupadd -r eap
sudo getent passwd eap >/dev/null || useradd -r -g eap -s /sbin/nologin  -d EAP_HOME -c "EAP" eap
```

### EAP_HOMEの権限変更

`EAP_HOME`配下をapacheユーザーが実行するように変更
`EAP_HOME`は各環境に合わせて修正すること。

```
sudo chown -R eap:eap EAP_HOME
```

### standalone-ha.xmlのバックアップ作成

初期状態に戻せるように、バックアップを作成しておく。

```
cp EAP_HOME/standalone/configuration/standalone-ha.xml EAP_HOME/standalone/configuration/standalone-ha.xml.bk
```

### standalone-ha.xmlの変更

standalone-ha.xmlを使用し、EAPサーバーを起動。その後、jboss-cli.shを使用し、設定を反映していく。
`192.168.33.11`の部分に関しては、各環境のサーバーのIPを設定すること。

```
EAP_HOME/bin/standalone.sh -c standalone-ha.xml -b 192.168.33.11
```

#### modclusterの設定

下記内容のファイルを作成(ファイル名はなんでもよい)。
`value=mycluster` がapacheで設定した`ManagerBalancerName`の値と同じにする。
`value="192.168.33.10:80"`には、各環境のapacheのIPを記載。IPが複数ある際はカンマ区切りで記載する。

* mod-cluster-config
```
  /subsystem=modcluster/mod-cluster-config=configuration/:write-attribute(name=load-balancing-group,value=myGroup)
  /subsystem=modcluster/mod-cluster-config=configuration/:write-attribute(name=balancer,value=mycluster)
  /subsystem=modcluster/mod-cluster-config=configuration/:write-attribute(name=proxy-list,value="192.168.33.10:80")
```

jboss-cli.shでstandalone-ha.xmlに反映。
```
sudo ./jboss-cli.sh -c --file=mod-cluster-config
sudo ./jboss-cli.sh -c command="shutdown --restart=true"
sudo rm mod-cluster-config
```

下記内容のファイルを作成(ファイル名はなんでもよい)。
`value="192.168.33.11[7600],192.168.33.12[7600]"`には、各環境のeapサーバーのIPを記載。IPが複数ある際はカンマ区切りで記載する。

* tcpping
```
    batch
    /subsystem=jgroups/stack=tcp:remove
    /subsystem=jgroups/stack=tcp:add(transport={"type" =>"TCP", "socket-binding" => "jgroups-tcp"})
    /subsystem=jgroups/stack=tcp/:add-protocol(type=TCPPING)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=MERGE2)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=FD_SOCK,socket-binding=jgroups-tcp-fd)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=FD)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=VERIFY_SUSPECT)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=BARRIER)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=pbcast.NAKACK)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=UNICAST2)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=pbcast.STABLE)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=pbcast.GMS)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=UFC)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=MFC)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=FRAG2)
    /subsystem=jgroups/stack=tcp/:add-protocol(type=RSVP)
    /subsystem=jgroups:write-attribute(name=default-stack,value=tcp)
    run-batch
    /subsystem=jgroups/stack=tcp/protocol=TCPPING/property=initial_hosts/:add(value="192.168.33.11[7600],192.168.33.12[7600]")
    /subsystem=jgroups/stack=tcp/protocol=TCPPING/property=port_range/:add(value=0)
    /subsystem=jgroups/stack=tcp/protocol=TCPPING/property=timeout/:add(value=3000)
    /subsystem=jgroups/stack=tcp/protocol=TCPPING/property=num_initial_members/:add(value=3)
```

jboss-cli.shでstandalone-ha.xmlに反映。
```
sudo ./jboss-cli.sh -c --file=tcpping
sudo ./jboss-cli.sh -c command="shutdown --restart=true"
sudo rm tcpping
```

## Apache, EAP の起動

Apache, EAPを起動し、ApacheのIPで各EAPにリクエストが届くことを確認する。
EAPの起動時は、
```
EAP_HOME/bin/standalone.sh -c standalone-ha.xml -b 192.168.33.11
```
のように、`-b`オプションで自身のIPを指定することを忘れないこと。