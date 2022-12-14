---
title: 更换 Linux 服务器 ssh 默认端口
permalink: linux-ssh-port-update/
date: 2022-6-27 09:54:58
categories: Devops
tags: [linux, ssh]
index_img: /images/devops/linux.png
---

> 环境 centos 7

### 备份 ssh 配置文件

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

### 修改默认端口

```bash
vi etc/ssh/sshd_config
```

修改 `#Port 22` 为 `Port 2233`，则 ssh 端口分改为 2233

### 重启 sshd 服务

```bash
systemctl restart sshd
```

## 放行新的端口

```bash
firewall-cmd --premanent --add-port=2233/tcp
firewall-cmd --reload
```
