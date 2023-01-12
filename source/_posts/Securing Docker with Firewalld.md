---
title: Securing Docker with Firewalld
sub_title: docker-firewalld
cover: https://uposs.justokay.cn/images/devops/docker.png
date: 2022-6-30 19:47:12
categories: Devops
tags: [docker, firewalld]
---

Docker firewall uses the underlying iptables, firewalld does not work by default.

If you want to use firewalld, you need to make the following adjustments.

### Rebuild `DOCKER-USER chain`

Even if `DOCKER-USER` already exists, you need to delete and rebuild

```bash
firewall-cmd --permanent --direct --remove-chain ipv4 filter DOCKER-USER
firewall-cmd --permanent --direct --remove-rules ipv4 filter DOCKER-USER
firewall-cmd --permanent --direct --add-chain ipv4 filter DOCKER-USER
```

### Add iptables rule

```bash
firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -i docker0 -j ACCEPT -m comment --comment "allows incoming from docker"

firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -i docker0 -o eth0 -j ACCEPT -m comment --comment "allows docker to eth0"

firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT -m comment --comment "allows docker containers to connect to the outside world"

firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -j RETURN -s 172.17.0.0/16 -m comment --comment "allow internal docker communication"
```

### 添加自定义的规则

```bash
# Allow the specified ip traffic to pass, replace 1.1.1.1 with the ip you need to pass
firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -s 1.1.1.1/32 -j ACCEPT

# Allow the specified ip to access the specified port
firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 0 -p tcp -m multiport --dports 80,443 -s 1.1.1.1/32 -j ACCEPT

# Reject other traffic
firewall-cmd --permanent --direct --add-rule ipv4 filter DOCKER-USER 10 -j REJECT --reject-with icmp-host-unreachable -m comment --comment "reject all other traffic"
```

{% note warning  %}

- `REJECT` rule should be executed at the end
- Do not write multiple IP addresses for the same rule
- If you restart firewalld while Docker is running, then firewalld will remove the DOCKER-USER

{% endnote %}

### Reload the configuration and verify

- Reload the configuration: `firewall-cmd --reload`
- Verify: `iptables -L` for DOCKER-USER, or `cat /etc/firewalld/direct.xml` for direct.
