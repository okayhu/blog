---
title: 绑定 Spring MVC 命令对象时如何自定义参数名
sub_title: spring-mvc-binding-object
index_img: https://uposs.justokay.cn/images/spring/spring-mvc.png
date: 2022-12-30 18:56:05
categories: spring
tags: [spring, springmvc]
---

## 来源

Spring 提供 `@RequestParam` 来绑定 Query 参数，并且能绑定不同名称的参数。

```java
@GetMapping("/page")
pulic Page page(@RequestParam("current_page") Integer pageNum,
                @RequestParam("page_size") Integer pageSize) {
    ...
}
```

然而当用对象来接收 Query 参数时，该如何绑定不同名称的参数呢？

这是用来绑定的分页查询对象：

```java
public class PageQuery {
    private Integer pageNum;
    private Integer pageSize;
}
```

对应的 Spring MVC 方法

```java
@GetMapping("/page")
pulic Page page(PageQuery pageQuery) {
    ...
}
```

它适用于`http://example.com/page?pageNum=1&pageSize=10`，却不适用于以下网址：

`http://example.com/page?current_page=1&page_size=10`

## 解决

为了解决上面这个问题，我们需要扩展 `HandlerMethodArgumentResolver`，并将其添加到 Spring MVC 的 ArgumentResolvers

### 自定义 DataBinder

```java
public class RequestParamNameDataBinder extends ServletRequestDataBinder {

    private final Map<String, String> requestParamNameMapping;

    public RequestParamNameDataBinder(Object target, String objectName,
                                      Map<String, String> requestParamNameMapping) {
        super(target, objectName);
        this.requestParamNameMapping = requestParamNameMapping;
    }

    @Override
    protected void addBindValues(@NotNull MutablePropertyValues mpvs,
                                 @NotNull ServletRequest request) {
        requestParamNameMapping.forEach((from, to) -> {
            if (mpvs.contains(from)) {
                PropertyValue propertyValue = mpvs.getPropertyValue(from);
                mpvs.add(to, propertyValue == null ? null : propertyValue.getValue());
            }
        });
    }
}
```

### 自定义参数处理器

```java
public class RequestParamNameMethodProcessor extends ServletModelAttributeMethodProcessor
    implements InitializingBean {

    // Rename cache
    private final Map<Class<?>, Map<String, String>> targetClassRequestParamNameMapping =
        new ConcurrentHashMap<>();

    private WebBindingInitializer webBindingInitializer;

    @Autowired(required = false)
    public void setAdapter(RequestMappingHandlerAdapter adapter) {
        this.webBindingInitializer = adapter.getWebBindingInitializer();
    }

    public RequestParamNameMethodProcessor(boolean annotationNotRequired) {
        super(annotationNotRequired);
    }

    @Override
    protected void bindRequestParameters(@NotNull WebDataBinder binder,
                                         @NotNull NativeWebRequest nativeWebRequest) {
        super.bindRequestParameters(binder, nativeWebRequest);

        Object target = binder.getTarget();
        Class<?> targetClass = Objects.requireNonNull(target).getClass();
        if (!targetClassRequestParamNameMapping.containsKey(targetClass)) {
            targetClassRequestParamNameMapping.put(targetClass, analyzeClass(targetClass));
        }
        RequestParamNameDataBinder paramNameDataBinder = new RequestParamNameDataBinder(target,
            binder.getObjectName(), targetClassRequestParamNameMapping.get(targetClass));
        webBindingInitializer.initBinder(paramNameDataBinder);

        paramNameDataBinder.bind(
            Objects.requireNonNull(nativeWebRequest.getNativeRequest(ServletRequest.class)));
    }

    private Map<String, String> analyzeClass(Class<?> targetClass) {
        Map<String, String> renameMap = new HashMap<>(8);
        for (Field field : targetClass.getDeclaredFields()) {
            RequestParamName requestParamName = field.getAnnotation(RequestParamName.class);
            if (requestParamName != null && StringUtils.isNotBlank(requestParamName.value())) {
                renameMap.put(requestParamName.value(), field.getName());
            }
        }
        if (targetClass.getSuperclass() != Object.class) {
            renameMap.putAll(analyzeClass(targetClass.getSuperclass()));
        }
        return renameMap;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(webBindingInitializer, "webBindingInitializer must not be null!");
    }
}
```

### 对应的注解

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequestParamName {

    /**
     * 绑定的请求参数名称
     */
    String value();
}
```

### 配置 Spring MVC 的 ArgumentResolver

```java
@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    @Bean
    public RequestParamNameMethodProcessor requestParamNameMethodProcessor() {
        return new RequestParamNameMethodProcessor(true);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(requestParamNameMethodProcessor());
    }
}
```

### 用法

```java
public class PageQuery {
    
    @RequestParamName("current_page")
    private Integer pageNum;
    
    @RequestParamName("page_size")
    private Integer pageSize;
}
```