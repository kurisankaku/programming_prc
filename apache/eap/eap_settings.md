# EAP 環境構築

mod_clusterを使用するための、EAPの環境構築方法を説明する。

### JDKのインストール

JDKをインストールする。バージョンは1.8以降を使用すること。
下記例のwgetのリンクが向こうになっている場合は、適宜修正し、それ以降のjdkのパスも修正すること。

```
wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.rpm
sudo rpm -e java-1.8.0-openjdk-headless-1.8.0.121-0.b13.el7_3.x86_64
sudo rpm -ivh jdk-8u131-linux-x64.rpm
rm jdk-8u131-linux-x64.rpm
```

bash_profileに下記追加
```
export JAVA_HOME=/usr/java/jdk1.8.0_131
```

### EAP6.4.0とパッチのダウンロード
下記をダウンロードする。

* [EAP 6.4.0](https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.0.zip)
* [EAP 6.4.9 Patch](https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.9-patch.zip)
* [EAP 6.4.10 Patch](https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.10-patch.zip)
* [EAP 6.4.11 Patch](https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.11-patch.zip)

```
cd /opt
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.0.zip
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.9-patch.zip
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.10-patch.zip
sudo wget https://mtimedsoldevsatmp.blob.core.windows.net/shared/jboss-eap-6.4.11-patch.zip
sudo unzip -q jboss-eap-6.4.0.zip
sudo rm jboss-eap-6.4.0.zip
```

以降、`/opt/jboss-eap-6.4`を`EAP_HOME`と呼びます。

### パッチの適用
* [参考ページ](https://access.redhat.com/documentation/ja-JP/JBoss_Enterprise_Application_Platform/6.2/html/Installation_Guide/Installing_Patches_in_Zip_Form_Using_the_patch_Command.html)

1. `/opt/jboss-eap-6.4/bin/standalone.sh -c standalone-ha.xml &` を実行し、サーバーを起動する
1. `sudo /opt/jboss-eap-6.4/bin/jboss-cli.sh`を実行し、「connect」を入力してサーバーと接続する。
1. `patch apply /opt/jboss-eap-6.4.9-patch.zip`と入力し、パッチを適用する。
1. 完了後、`shutdown --restart=true`と入力し、サーバーを再起動させる。
1. 6.4.10, 6.4.11も同様の手順でパッチを適用する。

### EAP 実行ユーザー作成

EAP実行ユーザーとグループを作成。

```
sudo getent group eap >/dev/null || sudo groupadd -r eap
sudo getent passwd eap >/dev/null || sudo useradd -r -g eap -s /sbin/nologin  -d /opt/jboss-eap-6.4 -c "EAP" eap
```

### EAP_HOMEの権限変更

`EAP_HOME`配下をapacheユーザーが実行するように変更

```
sudo chown -R eap:eap /opt/jboss-eap-6.4
```

### standalone-ha.xmlのバックアップ作成

初期状態に戻せるように、バックアップを作成しておく。

```
cp /opt/jboss-eap-6.4/standalone/configuration/standalone-ha.xml /opt/jboss-eap-6.4/standalone/configuration/standalone-ha.xml.bk
```

### ログ設定

`/opt/jboss-eap-6.4/standalone/configuration/standalone-ha.xml`内の `<subsystem xmlns="urn:jboss:domain:logging:1.5">~</subsystem>` を
`wch/server_config/eap/standalone-ha.xml`内の `<subsystem xmlns="urn:jboss:domain:logging:1.5">~</subsystem>` に置き換え。

### Serviceに登録

Serviceに登録し、サーバー起動時にApacheが起動するようにする。

#### jboss-as-standalone.shの変更

既存の`jboss-as-standalone.sh`を使用してしまうと、ログを２重に記録し続けてしまう。それを防ぐために、修正をする。

`/opt/jboss-eap-6.4/bin/init.d/jboss-as-standalone.sh` を `/wch/server_config/eap/init.d/jboss-as-standalone.sh`の内容にすべて置き換える。

#### Service 作成

以下のように、serviceファイルを作成
```
sudo touch /etc/systemd/system/jbosseap6.service
```

`jbosseap6.service`に下記を記載し保存。
`jdk.1.8.0_131`は環境に合わせて修正すること。

* jbosseap6.service

```
  [Unit]
  Description=JBoss EAP Systemctl script
  After=NetworkManager.service

  [Service]
  Type=forking
  ExecStart=/opt/jboss-eap-6.4/bin/init.d/jboss-as-standalone.sh start
  ExecStop=/opt/jboss-eap-6.4/bin/init.d/jboss-as-standalone.sh stop
  ExecReload=/opt/jboss-eap-6.4/bin/init.d/jboss-as-standalone.sh restart
  PIDFile=/var/run/jboss-as/jboss-as-standalone.pid
  # Environment
  Environment="JAVA_HOME=/usr/java/jdk1.8.0_131"
  Environment="JBOSS_HOME=/opt/jboss-eap-6.4"
  Environment="JBOSS_CONFIG=standalone-ha.xml -b 0.0.0.0"
  Environment="JBOSS_USER=eap"
  Environment="JBOSS_SERVER_LOG=/opt/jboss-eap-6.4/standalone/log/server/server.log"

  [Install]
  WantedBy=multi-user.target
```

#### Service登録

下記を入力し、Serviceを登録しスタート。

```
sudo systemctl enable jbosseap6
sudo systemctl start jbosseap6
sudo systemctl status jbosseap6
```

### standalone-ha.xmlの変更

ここからは、mod_clusterのAdvertiseを使用しない、静的なルーティングをする場合に設定する。
AWSなどのクラウド環境では、マルチキャストを行えないので、ここから下の設定は必須である。

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
cd EAP_HOME/bin
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
cd EAP_HOME/bin
sudo ./jboss-cli.sh -c --file=tcpping
sudo ./jboss-cli.sh -c command="shutdown --restart=true"
sudo rm tcpping
```
