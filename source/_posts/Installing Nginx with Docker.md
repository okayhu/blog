---
title: Installing Nginx with Docker
sub_title: nginx-docker-install
index_img: https://uposs.justokay.cn/images/devops/nginx_docker.png
date: 2022-06-21 21:28:22
categories: Devops
tags: [nginx, docker]
---

{% note success %}
Environment: Centos 7
{% endnote %}

### Download and start the image

```bash
docker run --name nginx -p 80:80 -d nginx:latest
```

### Open the port

If port 80 is not open, execute the following command

```bash
firewall-cmd --premanent --add-port=80/tcp

# You can also open it as a service
firewall-cmd --premanent --add-service-=http

# Reload the configuration
firewall-cmd --reload

# View all open ports
firewall-cmd --list-port

# View all open services
firewall-cmd --list-services

```

### Mount the configuration

Copy the nginx configuration file and the html file to the host

```bash
### Replace /usr/local/docker/nginx/ with the directory you want
mkdir -p /usr/local/docker/nginx/{conf,log,html}

docker cp nginx:/etc/nginx/nginx.conf /usr/local/docker/nginx/conf/nginx.conf

docker cp nginx:/etc/nginx/conf.d /usr/local/docker/nginx/conf/conf.d

docker cp nginx:/usr/share/nginx/html /usr/local/docker/nginx/html

```

### Additional commands

Stop and delete the nginx container

```bash
docker stop nginx

docker rm nginx

# You can delete containers that are still running
docker rm -f nginx
```

Restart the nginx container

```bash
docker run --name nginx -p 80:80 \\\
-v /usr/local/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf \\\
-v /usr/local/docker/nginx/conf/conf.d:/etc/nginx/conf.d \\\
-v /usr/local/docker/nginx/html:/usr/share/nginx/html \\\
-v /usr/local/docker/nginx/log:/var/log/nginx \\\
-d nginx:latest
```

If you want to modify the nginx configuration, you can directly modify the `usr/local/docker/nginx/conf/nginx.conf` file, and execute

```bash
docker restart nginx
```