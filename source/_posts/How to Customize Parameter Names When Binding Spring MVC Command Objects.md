---
title: How to Customize Parameter Names When Binding Spring MVC Command Objects
sub_title: spring-mvc-binding-object
cover: https://uposs.justokay.cn/images/spring/spring-mvc.png
date: 2022-12-30 18:56:05
categories: spring
tags: [spring, springmvc]
---

## Question

Spring provides `@RequestParam` to bind Query parameters, and can bind parameters with different names.

```java
@GetMapping("/page")
pulic Page page(@RequestParam("current_page") Integer pageNum,
                @RequestParam("page_size") Integer pageSize) {
    ...
}
```

However, when using objects to receive Query parameters, how do you bind parameters with different names?

This is the paging query object used to bind:

```java
public class PageQuery {
    private Integer pageNum;
    private Integer pageSize;
}
```

Corresponding Spring MVC methods:

```java
@GetMapping("/page")
pulic Page page(PageQuery pageQuery) {
    ...
}
```

It applies to `http://example.com/page?pageNum=1&pageSize=10`, but not to the following URLs:

`http://example.com/page?current_page=1&page_size=10`

## Solution

To solve this problem above, we need to customize `HandlerMethodArgumentResolver` and add it to Spring MVC ArgumentResolvers

### Customized DataBinder

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

### Customized parameter processor

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

### Corresponding annotation

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

### Configuring the Spring MVC ArgumentResolver

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

### Usage

```java
public class PageQuery {

    @RequestParamName("current_page")
    private Integer pageNum;

    @RequestParamName("page_size")
    private Integer pageSize;
}
```
