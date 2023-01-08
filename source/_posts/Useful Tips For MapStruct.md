---
title: Useful Tips For MapStruct
sub_title: mapstrcut-style
index_img: https://uposs.justokay.cn/images/tool/mapstruct.png
date: 2022-07-14 22:03:31
categories: Tool
tags: [tool, mapstruct]
---

MapStruct is a powerful and convenient pojo conversion tool in our project development process.
Although MapStruct is good, there are some problems about its use.

### Do not change to the source object

e.g. Convert `UserDTO` to `UserVO`

```java
public class UserDTO {

    private Long id;
    private String username;
    private Integer age;
}

public class UserVO {

    private Long id;
    private String username;
    private Integer age;
    private List<RoleVO> roles;
    private List<GroupVO> groups;
    private List<String> authorityCodes;
}

@Mapper
public interface UserMapper {

    UserVO dtoToVo(UserDTO userDto);

    @BeforeMapping
    default void afterDtoToVo(UserDTO userDto) {
        if ("Administrator".equals(userDto.getUsername())) {
            userDto.setId(0L);
            userDto.setAge(null);
        }
    }
}
```

Problem: Creates an unintended exception for the caller of the method.

### Do not include a lot of business code

```java
@Mapper
public interface UserMapper {

    UserVO dtoToVo(UserDTO userDto);

    @AfterMapping
    default void afterDtoToVo(@MappingTarget UserVO userVo) {
        UserService userService = SpringContextUtil.getBean(UserService.class);
        userVo.setAuthorityCodes(userService.getAllAuthorityCodes(userVo.getId()));
    }
}
```

Problem:

- Methods in Mapper, to a large extent, will be called multiple times and applied in different domains, so the writer needs to make sure that the expectations of the methods are generic and trusted. In the above example, the converted `UserVO` does not contain `roles`、 `groups`、`authorityCodes`, but this is not necessarily what is expected for the method caller.
- Once the business logic in the Mapper is modified, it may have a bad impact on multiple locations.
