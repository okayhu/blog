---
title: Modify The Linux Server SSH Port
sub_title: linux-ssh-port-update
cover: https://uposs.justokay.cn/images/devops/linux.png
date: 2022-6-27 09:54:58
categories: Devops
tags: [linux, ssh]
---

{% note info %}
Environment: Centos 7
{% endnote %}

### Back up the ssh configuration file

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

### Modify the default port

```bash
vi etc/ssh/sshd_config
```

Change `#Port 22` to `Port 2233`, so that the ssh port is changed to 2233

### Restart sshd service

```bash
systemctl restart sshd
```

## Release the new port

```bash
firewall-cmd --premanent --add-port=2233/tcp
firewall-cmd --reload
```
