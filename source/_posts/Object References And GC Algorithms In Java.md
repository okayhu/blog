---
title: Object References And GC Algorithms In Java
sub_title: jvm-object-gc
cover: https://uposs.justokay.cn/images/jvm/jvm.png
date: 2022-07-18 22:08:11
categories: Java
tags: jvm
---

## Object references

**Strong reference**: We usually new an object is a strong reference, for example `Object obj = new Object()`. The JVM would rather throw an OutOfMemory error than reclaim such an object, even in the case of insufficient memory.

**Soft reference**: If an object has only a soft reference, there is enough memory space and GC will not reclaim it, or if there is not enough memory, it will be reclaimed before a memory overflow occurs.

```java
SoftReference<String> softRef = new SoftReference<String>(str);
```

**Weak references**: Objects with weak references have a shorter life cycle. When GC performs garbage collection, once an object with only weak references is found, its memory will be reclaimed regardless of whether the current memory space is sufficient.

```java
WeakReference<String> weakRef = new WeakReference<String>(str);
```

**Phantom References**. If an object holds only a phantom reference, it can be reclaimed by GC at any time, just as if it did not have any reference.

Phantom references are mainly used to track the activity of objects that are GC'd. Phantom references must be used in conjunction with a reference queue (`ReferenceQueue`). When the GC is ready to reclaim an object, if it finds it to be a phantom reference, it will add the phantom reference to the reference queue associated with it before reclaiming the object's memory.

```java
ReferenceQueue queue = new ReferenceQueue();
PhantomReference phantomRef = new PhantomReference(str, queue);
```

## What is garbage

An object that doesn't have any references.

## Reference counter method

Create a reference counter for each object, +1 when there is a reference to the object, -1 when the reference is released, when the counter is 0 then it can be recycled.

{% note info %}
The reference counter does not solve the problem of circular applications.
{% endnote %}

### Reachability Analysis Algorithm

Starting from GC Roots and searching down the path called `Reference Chain`. When an object is not connected to any reference chain to GC Roots, it is proved that the object is recyclable.

The objects that are GC Roots include the following (emphasis on the first 4).

- **Objects referenced in the virtual machine stack (local variable table in the stack frame); parameters, local variables, temporary variables, etc. used in the method stack of each thread call.**
- **Objects referenced by static properties of classes in the method area, static variables of reference types of java classes**.
- **Objects referenced by constants in the method area. For example: references in the pool of string constants**.
- **Objects referenced by JNI (e.g. Native methods) in the local method stack**.
- Internal references of the JVM (class objects, exception objects NullPointException, OutofMemoryError, system class loader).
- All objects held by synchronized locks (synchronized keyword).
- JMXBean inside the JVM, callbacks registered in JVMTI, local code cache, etc.
- Temporary objects in JVM implementations, objects referenced across generations.

The above recycling are objects, the class (Class) recycling conditions are very demanding, must also meet the following conditions (just can, does not mean necessarily, because there are some parameters can be controlled)

- All instances of the class have been recycled, i.e. there are no instances of the class in the heap.
- The ClassLoader that loaded the class has been recycled.
- The java.lang.Class object corresponding to this class is not referenced anywhere, and the methods of this class cannot be accessed anywhere by reflection.

`-Xnoclassgc`: Disables garbage collection for the class.

The recycling of deprecated constants and static variables is actually similar to the conditions for Class recycling.

### Finalize

The finalize() method in the Object class is similar to the C++ destructor and is used to close external resources and so on. But try-finally and other methods can do better, and the method is expensive to run, uncertain, and does not guarantee the order of calls for each object, so it is better not to use finalize().

{% note info %}
Executing the finalize() method on an object when it is ready to be recycled only means that **it is possible** to save yourself by having the object referenced again in that method.
{% endnote %}

## Garbage collection algorithms

### Copying algorithm

It divides the available memory into two equal-sized chunks by capacity and uses only one of them at a time. When this block is used up, the remaining objects are copied to the other block, and the used memory space is cleaned up at once.

The copy recovery algorithm is suitable for new generations. Since most of the objects are born and die, fewer objects are copied over, so it is more efficient.

### Mark-Sweep algorithm

The algorithm is divided into two phases: mark and sweep. First scan out all the objects and mark the objects to be recycled, after the mark is completed, scan and recycle all the marked objects, so it needs to scan twice. When recycling, if there are more objects to be recycled, the more marking and clearing work needs to be done, which is less efficient than replication recycling, so the marking and clearing algorithm is suitable for old age.

Too much space fragmentation may lead to the inability to find enough contiguous memory when a larger object needs to be allocated later in the program runtime and another garbage collection action has to be triggered earlier.

### Mark-Compact algorithm

The algorithm is divided into two stages: first mark all the objects to be recycled, and after the mark is done, instead of cleaning up the recyclable objects directly, all the surviving objects are compressed into one end of memory so that they are compactly arranged together, and then the memory outside the end boundary is recycled.

The mark-cleaning algorithm has no memory fragmentation, but it is inefficient. We see that the main difference between the mark-cleaning algorithm and the mark-removal algorithm is object movement. Object movement not only burdens the system, but also requires the entire user thread to be suspended in order to do so, and all references to the object need to be updated (direct pointers need to be adjusted).
