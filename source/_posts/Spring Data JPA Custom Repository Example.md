---
title: Spring Data JPA Custom Repository Example
sub_title: spring-jpa-custom-repository
index_img: https://uposs.justokay.cn/images/spring/spring-date-jpa.png
date: 2022-08-26 22:16:41
categories: Spring
tags: [spring, jpa]
---

Spring-Data-JPA provides many common Repository interfaces, such as CrudRepository, PagingAndSortingRepository, JpaRepository and so on. In practical development we often have some custom methods, so how should we extend the Repository interface?

## Base class

First define a BaseRepository that inherits from JpaRepository and write the methods we want to extend

```java
@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {

    List<T> findByIdIn(Iterable<ID> ids);

    void deleteByIdIn(Iterable<ID> ids);
}
```

The `@NoRepositoryBean` is used to inform the Spring container not to instantiate the BaseRepository, since the BaseRepository is used as an intermediate interface to derive the concrete Repository interface.

Next, create an implementation class of the BaseRepository that implements the extended methods

```java
public class BaseRepositoryImpl<T, ID> extends SimpleJpaRepository<T, ID> implements BaseRepository<T, ID> {

    private final EntityManager em;
    private final JpaEntityInformation<T, ?> entityInformation;

    public BaseRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.em = entityManager;
        this.entityInformation = entityInformation;
    }

    @Override
    public List<T> findByIdIn(Iterable<ID> ids) {
        return findAllById(ids);
    }

    @Override
    public void deleteById(ID id) {
        Assert.notNull(id, "Id must not be null!");

        CriteriaBuilder builder = em.getCriteriaBuilder();
        CriteriaDelete<T> delete = builder.createCriteriaDelete(getDomainClass());
        Root<T> root = delete.from(getDomainClass());
        delete.where(builder.equal(root.get(entityInformation.getIdAttribute()), id));
        em.createQuery(delete).executeUpdate();
    }

    @Transactional
    @Override
    public void deleteByIdIn(Iterable<ID> ids) {
        Assert.notNull(ids, "Ids must not be null!");

        if (ids.iterator().hasNext()) {
            CriteriaBuilder builder = em.getCriteriaBuilder();
            CriteriaDelete<T> delete = builder.createCriteriaDelete(getDomainClass());
            Root<T> root = delete.from(getDomainClass());
            delete.where(getIdsPredicate(builder, root, ids));
            em.createQuery(delete).executeUpdate();
        }
    }

    @SuppressWarnings("unchecked")
    protected Predicate getIdsPredicate(CriteriaBuilder builder, Root<T> root, Iterable<ID> ids) {
        Path<ID> path = (Path<ID>) root.get(entityInformation.getIdAttribute());
        CriteriaBuilder.In<ID> inPredicate = builder.in(path);
        ids.forEach(inPredicate::value);
        return inPredicate;
    }
}
```

## Configuration

Finally we can specify the new repositoryBaseClass on the main class with `@EnableJpaRepositories`

```java
@EnableJpaRepositories(repositoryBaseClass = BaseRepositoryImpl.class)
@SpringBootApplication
public class JpaExamplesApplication {

    public static void main(String[] args) {
        SpringApplication.run(JpaExamplesApplication.class, args);
    }
}
```

## Usage

Instead of inheriting from JpaRepository, our Repository interface inherits from BaseRepository

```java
public interface UserRepository<User, Long> extends BaseRepository<User, Long> {
}
```

Next, we test our custom method

```java
@SpringBootTest
class BaseRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void deleteByIdIn_test() {
		userRepository.deleteByIdIn(Arrays.asList(1L, 2L));
    }
}
```

Turn on SQL printing:

```properties
spring.jpa.show-sql=true
```

Console output successfully: `Hibernate: delete from user where id in (1 , 2)`
