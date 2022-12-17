---
title: IDEA 必备设置
permalink: idea-settings/
date: 2022-12-17 20:25:15
categories: IDEA
tags: idea
index_img: /images/idea/idea.png
---

> IDEA 2022.3

### 取消更新检查

Settings ⇒ Appearance & Behavior ⇒ System Settings ⇒ Updates

取消选中 `Check IDE update for:`。

### 启动时不自动打开项目

Settings ⇒ Appearance & Behavior ⇒ System Settings

取消选中 Project 下的 `Reopen projects on startup`。

### Tab 多行展示

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

取消选中 `Show tabs in one row`。

### 增大 Tab 展示数量

默认情况， Tab 最多展示 10 个

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

修改 Closing Policy 下的 `Tab limit`

### 关闭当前 Tab 打开最近的 Tab

默认情况，关闭当期 Tab 后会打开左侧的 Tab。可以选择将其更改为打开最近的 Tab。

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

选中 Closing Policy 下 When the current tab is closed，activate: 的 `Most recently opened tab` 选项。

### 代码提示不区分大小写

Settings ⇒ Editor ⇒ General ⇒ Code Completion

选中 `Match case`。

## 设置文件换行符为 LF

Settings ⇒ Editor ⇒ Code style

设置 General 下的 Line separator 为 `Unix and macOS (\n)`。

### 设置文件编码格式为 UTF -8

Settings ⇒ Editor ⇒ File Encodings

![idea-file-encodings.png](/images/idea/idea-file-encodings.png)

### 自动导包优化

Settings ⇒ Editor ⇒ General ⇒ Auto Import

选中 Java 下的 `Add unambigouts imports on the fly`，在编辑代码时，如果只有一个具有匹配名称的可导入声明，则自动添加导入。
选中 Java 下的 `Optimize import on the fly`，删除未使用的导入并根据代码样式设置重新排序导入。

### 展示方法间的分割线

Settings ⇒ Editor ⇒ General ⇒ Appearance

选中 `Show method separators`。

### 注释缩进

默认情况，所有使用 `ctrl +/` 快捷键的注释都是从行首开始的，没有缩进。

**Java**

Settings ⇒ Editor ⇒ Code Style ⇒ Java ⇒ Code Generation

取消选中 `Line Comment at first column`，行注释从首行开始
选中 `Add a space at line comment start`，在注释前加一个空格
取消选中 `Block comment at first column`，快注释从首行开始

![idea-codestyle-java-comment.png](/images/idea/idea-codestyle-java-comment.png)

**XML**

Settings ⇒ Editor ⇒ Code Style ⇒ XML ⇒ Code Generation

取消选中 `Line Comment at first column`，行注释从首行开始
取消选中 `Block comment at first column`，快注释从首行开始

![idea-codestyle-xml-comment.png](/images/idea/idea-codestyle-xml-comment.png)
