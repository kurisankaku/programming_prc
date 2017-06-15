# fluentd 設定

## fluentd インストール

### rpm Repositoryからインストール

下記コマンドを実行

```
sudo curl -L https://toolbelt.treasuredata.com/sh/install-redhat-td-agent2.sh | sh
sudo /etc/init.d/td-agent start
sudo /sbin/chkconfig td-agent on 
```

サーバー起動時にtd-agentが動作するようにする

```
sudo systemctl enable td-agent
```

### 送信側fluentdのtd-agent.confの設定

#### apache

apache側のtd-agent.confの記述です。
hostのログ収集サーバーのIPアドレスを必ず入力してください。（`#IPアドレス入力`の部分）

* td-agent.conf

```
<source>
  @type tail
  path /opt/jboss-ews-2.1/httpd/logs/access_log
  pos_file /var/log/td-agent/apache_access.pos
  tag apache.access
  format apache2
</source>

<source>
  @type tail
  path /opt/jboss-ews-2.1/httpd/logs/error_log
  pos_file /var/log/td-agent/apache_error.pos
  tag apache.error
  format apache_error
</source>

<filter apache.*>
  @type record_transformer
  <record>
    HOST "#{Socket.gethostname}"
  </record>
</filter>

<match apache.*>
  @type forward
  send_timeout 60s
  recover_wait 10s
  heartbeat_interval 1s
  phi_threshold 16
  hard_timeout 60s

  <server>
    name logserver
    host #IPアドレス入力
    port 24224
    weight 60
  </server>

  <secondary>
    @type file
    path /var/log/td-agent/apache/forward-failed
  </secondary>
</match>

<match **>
  @type forward
  send_timeout 60s
  recover_wait 10s
  heartbeat_interval 1s
  phi_threshold 16
  hard_timeout 60s

  <server>
    name logserver
    host #IPアドレス入力
    port 24224
    weight 60
  </server>

  <secondary>
    @type file
    path /var/log/td-agent/fluent/forward-failed
  </secondary>
</match>
```

#### eap

eap側のtd-agent.confの記述です。
hostのログ収集サーバーのIPアドレスを必ず入力してください。（`#IPアドレス入力`の部分）

* td-agent.conf

```
<source>
  @type tail
  path /opt/jboss-eap-6.4/standalone/log/access/access.log
  pos_file /var/log/td-agent/eap_access.pos
  tag eap.access
  format ltsv
</source>

<source>
  @type tail
  path /opt/jboss-eap-6.4/standalone/log/application/application.log
  pos_file /var/log/td-agent/eap_application.pos
  tag eap.application
  format ltsv
</source>

<source>
  @type tail
  path /opt/jboss-eap-6.4/standalone/log/server/server.log
  pos_file /var/log/td-agent/eap_server.pos
  tag eap.server
  format ltsv
</source>

<filter eap.*>
  @type record_transformer
  <record>
    HOST "#{Socket.gethostname}"
  </record>
</filter>

<match eap.*>
  @type forward
  send_timeout 60s
  recover_wait 10s
  heartbeat_interval 1s
  phi_threshold 16
  hard_timeout 60s

  <server>
    name logserver
    host #IPアドレス入力
    port 24224
    weight 60
  </server>

  <secondary>
    @type file
    path /var/log/td-agent/eap/forward-failed
  </secondary>
</match>
<match **>
  @type forward
  send_timeout 60s
  recover_wait 10s
  heartbeat_interval 1s
  phi_threshold 16
  hard_timeout 60s

  <server>
    name logserver
    host #IPアドレス入力
    port 24224
    weight 60
  </server>

  <secondary>
    @type file
    path /var/log/td-agent/fluent/forward-failed
  </secondary>
</match>
```

### 受信側fluentdのtd-agent.confの設定

log収集サーバー側のtd-agent.confの記述です。

* td-agent.conf

```
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match apache.access>
  @type file
  path /var/log/td-agent/httpd/access
  time_slice_format %Y%m%d
  time_slice_wait 10m
  time_format %Y%m%dT%H%M%S%z
  compress gzip
  utc
</match>

<match apache.error>
  @type file
  path /var/log/td-agent/httpd/error
  time_slice_format %Y%m%d
  time_slice_wait 10m
  time_format %Y%m%dT%H%M%S%z
  compress gzip
  utc
</match>

<match eap.access>
  @type file
  path /var/log/td-agent/eap/access
  time_slice_format %Y%m%d
  time_slice_wait 10m
  time_format %Y%m%dT%H%M%S%z
  compress gzip
  utc
</match>

<match eap.application>
  @type file
  path /var/log/td-agent/eap/application
  time_slice_format %Y%m%d
  time_slice_wait 10m
  time_format %Y%m%dT%H%M%S%z
  compress gzip
  utc
</match>

<match eap.server>
  @type file
  path /var/log/td-agent/eap/server
  time_slice_format %Y%m%d
  time_slice_wait 10m
  time_format %Y%m%dT%H%M%S%z
  compress gzip
  utc
</match>

<match fluent.info>
  @type file
  append true
  path /var/log/td-agent/fluent/info
</match>

<match fluent.warn>
  @type file
  append true
  path /var/log/td-agent/fluent/warn
</match>
```