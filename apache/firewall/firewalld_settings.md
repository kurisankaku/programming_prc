# firewalld設定

各サーバーのfirewalldの設定方法について記載。

## firewalldの有効化

firewalldが起動時に必ず動作するように有効化する。

```
sudo systemctl enable firewalld
```

firwalldの起動

```
sudo systemctl start firewalld
sudo systemctl status firewalld
```

## EAPサーバーの設定

`/etc/firewalld/zones/`直下に、`eap_public.xml`を作成する。
`#IP入力`には、EAPサーバーにアクセスするのを許可するIPアドレスを入力すること。（例えば、Apacheサーバー）

* eap_public.xml

```
<?xml version="1.0" encoding="utf-8"?>
<zone>
  <source address="#IP入力"/>
  <port protocol="tcp" port="7600"/>
  <port protocol="tcp" port="8009"/>
</zone>
```

`/etc/firewalld/zones/`直下に、`eap_private.xml`を作成する。
このzoneは、EAPサーバーのmanagementにアクセスでき、またsshで接続できるようにしている。

`#IP入力`には、`eap_public.xml`に定義したものとは別のIPを入力すること。

* eap_private.xml

```
<?xml version="1.0" encoding="utf-8"?>
<zone>
  <source address="#IP入力"/>
  <service name="ssh"/>
  <port protocol="tcp" port="7600"/>
  <port protocol="tcp" port="9990"/>
  <port protocol="tcp" port="8009"/>
</zone>
```

`/etc/firewalld/zones/public.xml`から`ssh`のzoneを削除。下記のようにする。

* public.xml

```
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="dhcpv6-client"/>
</zone>
```

下記を実行し、firewalldに反映する。

```
sudo firewall-cmd --reload
```

## Apacheサーバーの設定

`/etc/firewalld/zones/public.xml`に`http`と`https`を追加。下記のようにする。

* public.xml

```
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="dhcpv6-client"/>
  <service name="ssh"/>
  <service name="http"/>
  <service name="https"/>
</zone>
```

下記を実行し、firewalldに反映する。

```
sudo firewall-cmd --reload
```

## log収集サーバーの設定

`/etc/firewalld/zones/public.xml`にtd-agentに対応したportを追加。下記のようにする。

* public.xml

```
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="dhcpv6-client"/>
  <service name="ssh"/>
  <port protocol="tcp" port="24224"/>
  <port protocol="udp" port="24224"/>
</zone>
```

下記を実行し、firewalldに反映する。

```
sudo firewall-cmd --reload
```