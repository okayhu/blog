---
title: Object Creation Process And Memory Layout In Java
sub_title: jvm-object-memory
cover: https://uposs.justokay.cn/images/jvm/jvm.png
date: 2022-07-04 15:34:20
categories: Java
tags: jvm
---

## Object creation process

![jvm-object-memory-01](https://uposs.justokay.cn/images/jvm/jvm-object-memory-01.png)

### Checking loading

First check that the parameters of this instruction locate a symbolic reference to a class in the constant pool (symbolic reference: a symbolic reference describes the referenced target by a set of symbols) and that the class has been loaded, parsed and initialized.

### Allocating memory

The virtual machine will allocate memory for the new object. The task of allocating space for an object is equivalent to partitioning a definite size chunk of memory from the Java heap.

Allocating memory is done in two ways.

- **Pointer collision**: If the memory in the Java heap is absolutely regular, with all used memory on one side and free memory on the other, with a pointer placed in the middle as an indicator of the division point. Then the allocated memory is simply moving that pointer towards the free space by a distance equal to the size of the object, and this allocation is called pointer collision.
- **Free List**: If the memory in the Java heap is not regular, and used memory and free memory are interleaved, then there is no way to simply perform pointer collisions, and the virtual machine must maintain a list of which memory blocks are available. When allocating a block from the list that is large enough to be divided among object instances, and updating the record on the list, this allocation is called a free list.

{% note info %}
The choice of allocation method is determined by whether the Java heap is tidy, which in turn is determined by whether the garbage collector used has compression and tidying. If you use a garbage collector with compressed collation like Serial or ParNew, the system uses pointer collision, which is simple and efficient. If you use a garbage collector like CMS without compressed collation, theoretically you can only use a more complex idle list.
{% endnote %}

The JVM also has to consider concurrency safety when allocating memory, and there are two solutions to this problem:

- `CAS`: The action of allocating memory space is handled synchronously, in fact the VM uses CAS with failure retries to ensure atomicity of update operations.
- `TLAB (Thread Local Allocation Buffer)`.
- Overview: The memory allocation action is divided into different spaces according to threads, i.e., each thread is pre-allocated a small piece of private memory in the Java heap, i.e., the Local Thread Allocation Buffer (TLAB).
  - Step: When the JVM initializes a thread, it also requests a piece of memory of a specified size for the current thread only, so that each thread has a separate Buffer, and if it needs to allocate memory, it will allocate it on its own Buffer. area when the Buffer is running low.
  - Parameters: `JVM options: -XX:+UseTLAB` Allows the use of thread local allocation blocks (TLAB) in the young generation space, enabled by default.

### Memory space initialization

Note that the virtual machine needs to initialize the allocated memory space to zero values (e.g., 0 for int, false for boolean, etc.) after the memory allocation is completed, not the constructor. This step ensures that the object's instance fields can be used directly in Java code without being assigned initial values, and that the program can access the zero values corresponding to the data types of these fields.

### Setup

Next, the virtual machine makes the necessary settings for the object, such as which class the object is an instance of, how to find the class metadata information (Java Classes are represented as class metadata inside the Java hotspot VM), the object's hash code, the object's GC generation age, and other information. This information is stored in the object header of the object.

### Object initialization

After all the above work is done, a new object has been created from the VM's point of view, but from the Java program's point of view, the object creation has just started and all the fields are still zero-valued. So, in general, the execution of the new instruction is followed by the initialization of the object according to the programmer's wishes (execution of the `init` method), so that a truly usable object is fully created.

## Object memory allocation strategy

Memory allocation for objects is usually done on the Java heap, but with the advent of virtual machine optimization techniques (`escaping analysis techniques`), in some scenarios it is also done on the stack. Objects are mainly allocated in the Eden area of the new generation, and if a local thread buffer is started, they will be allocated on TLAB according to thread priority. In a few cases, they are also allocated directly on the old generation.

In general the allocation rules are not 100% fixed, the details depend on which combination of garbage collectors and VM related parameters are involved, but the VM will follow the following general rules for memory allocation.

- **Objects are allocated in the Eden area first**, and if there is not enough space in the Eden area, the VM performs a Minor GC.
- **Large objects go directly to the old age (large objects are those that require a lot of contiguous memory space)**. This is done to avoid a large number of memory copies occurring between the Eden zone and the two Survivor zones (the new generation uses a replication algorithm to collect memory).
- **Long-term surviving objects go to the old generation**. The virtual machine defines an age counter for each object, if the object has survived 1 Minor GC, the object enters the Survivor zone and sets the object age to 1. The age of the object increases by 1 for each Minor GC it survives in the Survivor zone, and when it increases to a certain age (**the concurrent garbage collector defaults to 15, the CMS is 6**), it will be promoted to the old age. This can be adjusted with `-XX:MaxTenuringThreshold`.
- **Dynamically determine the age of an object**. In order to better adapt to the memory situation of different programs, the VM does not always require the age of an object to reach `MaxTenuringThreshold` before it can be promoted to an older age. If the sum of all objects of the same age in Survivor space is greater than half the size of Survivor space, objects with an age greater than or equal to that age can be directly aged, without waiting for the age required in `MaxTenuringThreshold`.
- **Space Allocation Guarantee**. Before each Minor GC, the VM checks if the maximum available contiguous space in the old age is greater than the total space of all objects in the new age. If this condition is not true, the VM will check if the `HandlePromotionFailure` setting allows the guarantee to fail. If `HandlePromotionFailure=true`, then it will continue to check if the maximum available contiguous space in the old age is greater than the average size of objects promoted to the old age over time, and if it is, then a Minor GC will be attempted, but this Minor GC is still risky; if it is less than or `HandlePromotionFailure=false`, then a Full GC is performed instead.

## Memory layout of objects

![jvm-object-memory-02](https://uposs.justokay.cn/images/jvm/jvm-object-memory-02.png)

In the HotSpot VM, the layout of objects stored in memory can be divided into 3 areas: Object Header, Instance Data, and Alignment Padding.

### Object Header

The object header is divided into two parts in the HotSpot virtual machine, one called the Mark Word and the other a type pointer. If the object is an array, there is a piece of data in the object header that is used to record the length of the array.

|  length  |        content         |                                    description                                     |
| :------: | :--------------------: | :--------------------------------------------------------------------------------: |
| 32/64bit |       Mark Word        | stores the hashcode, bias lock pattern, lock information and GC age of the object. |
| 32/64bit | Class Metadata Address |                     A pointer to the object's class metadata.                      |
| 32/64bit |      Array Length      |                The length of the array (not necessarily available)                 |

### Instance Data

Instance data is the actual valid information stored in the object, and is also the information about the properties of the object as defined in the program code.

### Alignment Padding

Padding is not necessarily present and has no special meaning; it acts as a placeholder. Since the HotSpot VM's automatic memory management system requires that the size of an object be an integer multiple of **8 bytes**, alignment padding is needed to fill in other parts of the object's data when they are not aligned.

## Object Access Location

Java programs need to access specific objects in the heap via references on the JVM stack. The way objects are accessed depends on the implementation of the JVM virtual machine. Currently the two dominant access methods are handles and direct pointers.

### Direct pointers

points to an object and represents the starting address of an object in memory. If direct pointer access is used, what is stored in the reference is directly the object address, and then the layout inside the Java heap object must take into account how to place information about accessing the type data.

![jvm-object-memory-03](https://uposs.justokay.cn/images/jvm/jvm-object-memory-03.png)

Advantages: fast, saves time overhead of one pointer location. Since object access is very frequent in Java, this type of overhead can add up to a significant implementation cost. this is the approach used in HotSpot.

### Handles

A handle can be understood as a pointer to a pointer that maintains a pointer to an object. The handle does not point directly to the object, but to the object's pointer (the handle does not change and points to a fixed memory address), which in turn points to the object's real memory address. If you use direct handle access, a chunk of memory is divided in the Java heap to serve as a pool of handles, and the reference stores the object's handle address, which contains information about the specific address of each of the object's instance data and object type data.

![jvm-object-memory-04](https://uposs.justokay.cn/images/jvm/jvm-object-memory-04.png)

Advantage: the reference stores a stable handle address, and when the object is moved (it is very common to move objects during garbage collection), only the instance data pointer in the handle is changed, and the reference itself does not need to be modified.
