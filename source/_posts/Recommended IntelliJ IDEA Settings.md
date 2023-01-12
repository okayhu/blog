---
title: Recommended IntelliJ IDEA Settings
sub_title: idea-settings
cover: https://uposs.justokay.cn/images/idea/idea.png
date: 2022-12-17 20:25:15
categories: IntelliJ IDEA
tags: idea
---

These are my must-have settings tweaks for IntelliJ IDEA, mixed with some useful tips. However, I recommend that you go through all the preferences in the Settings Dialog yourself. You will become more familiar with IntelliJ IDEA.

<!-- more -->

{% note info  %}
IntelliJ IDEA version: 2022.3
{% endnote %}

### Cancel update check

Settings ⇒ Appearance & Behavior ⇒ System Settings ⇒ Updates

Uncheck `Check IDE update for:`.

### Do not open projects automatically at startup

Settings ⇒ Appearance & Behavior ⇒ System Settings

Uncheck the `Reopen projects on startup` in Project.

### Proxy settings

Settings ⇒ Appearance & Behavior ⇒ System Settings ⇒ Http Proxy

![idea-http-proxy](https://uposs.justokay.cn/images/idea/idea-http-proxy.png)

### Tab multi-row display

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

Uncheck `Show tabs in one row`.

### Increase tab display

Tabs display up to 10 by default.

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

Modify the `Tab limit` in the Closing Policy.

### Modify tab's closing policy

By default, closing the Tab will open the Tab on the left, which can optionally be changed to open the most recent Tab.

Settings ⇒ Editor ⇒ General ⇒ Editor Tabs

Check `Most recently opened tab` of `When the current tab is closed，activate:` in Closing Policy.

### Code hints are not case-sensitive

Settings ⇒ Editor ⇒ General ⇒ Code Completion

Check `Match case`。

### Set the file newline character to LF

Settings ⇒ Editor ⇒ Code style

Set `Line separator` in General to `Unix and macOS (\n)`.

### Set the file encoding format to UTF-8

Settings ⇒ Editor ⇒ File Encodings

![idea-file-encodings](https://uposs.justokay.cn/images/idea/idea-file-encodings.png)

### Automatic package guide optimization

Settings ⇒ Editor ⇒ General ⇒ Auto Import

Check `Add unambigouts imports on the fly` in Java. When editing code, if there is only one importable declaration with a matching name, the import is automatically added.
Check `Optimize import on the fly` in Java. Removes unused imports and reorders them according to the code style settings.

### Adding split lines between methods

Settings ⇒ Editor ⇒ General ⇒ Appearance

Check `Show method separators`。

### Optimised code comment indentation

By default, all comments that use the `ctrl +/` shortcut start at the beginning of the line, without indentation.

#### Java

Settings ⇒ Editor ⇒ Code Style ⇒ Java ⇒ Code Generation

Uncheck `Line Comment at first column`. Line comments start at first column
Check `Add a space at line comment start`. Add a space at line comment start
Uncheck `Block comment at first column`. Quick comment starts at first line

![idea-codestyle-java-comment](https://uposs.justokay.cn/images/idea/idea-codestyle-java-comment.png)

#### XML

Settings ⇒ Editor ⇒ Code Style ⇒ XML ⇒ Code Generation

Uncheck `Line Comment at first column`. line comment starts from first line
Uncheck `Block comment at first column`. fast comment starts from first line

![idea-codestyle-xml-comment](https://uposs.justokay.cn/images/idea/idea-codestyle-xml-comment.png)
