---
title: Memory Structure In Java
sub_title: jvm-memory-structure
index_img: https://uposs.justokay.cn/images/jvm/jvm.png
date: 2022-06-22 21:47:45
categories: Java
tags: jvm
---

## Overview

Java Virtual Machine (JVM) is an abstract computer, based on a stack architecture, with its own instruction set and memory management. It loads class files, parses, interprets and executes bytecode. The basic structure is as follows.

![](https://uposs.justokay.cn/images/jvm/jvm-memory-structure-01.png)

Java virtual machine divides the memory it manages into regions during the execution of a Java program. As shown in the figure.

![](https://uposs.justokay.cn/images/jvm/jvm-memory-structure-02.png)

The JVM memory structure is divided into three main blocks: heap, stack, and method areas. The heap is the largest area in the JVM and consists of the young and old generations, **which in turn are divided into two parts, the Eden and Survivor areas, which in turn are divided into the From and To areas**, and by default the young generations are allocated in a ratio of **8:1:1**.

A diagram shows how the memory size of each region can be controlled by the following parameters.

![](https://uposs.justokay.cn/images/jvm/jvm-memory-structure-03.png)

- `Xms`: sets the minimum space size of the heap.
- `Xmx`: sets the maximum space size of the heap.
- `XX:NewSize`: set the minimum space size of the new generation.
- `XX:MaxNewSize`: set the maximum space size of the new generation.
- `XX:PermSize`: set the minimum space size of the permanent generation.
- `XX:MaxPermSize`: set the maximum space size of the permanent generation.
- `Xss`: set the stack size of each thread.

{% note info %}
There is no parameter to set the old age directly, but you can set both heap space size and new generation space size to control it indirectly. (old generation space size = heap space size - young generation space size)
{% endnote %}

## Heap

For most applications, the Heap is the largest piece of memory managed by the Java Virtual Machine. The heap is an area of memory that is shared by all threads and is created at virtual machine startup. The sole purpose of this memory area is to hold object instances, and almost all object instances are allocated memory here.

The heap is the main area managed by GC. If we look at it from the memory recovery point of view, since GC basically uses a generational collection algorithm, the heap can also be subdivided into: new generations and old generations. When let subdivided further, there are also the Eden area, From Survivor area, and To Survivor area.

According to the Java Virtual Machine specification, the heap can be in a physically discontinuous memory space, as long as it is logically contiguous, just like our disk space. When implemented, it can either be implemented as fixed size or scalable, although the current mainstream VMs are implemented as scalable (controlled by `-Xmx` and `-Xms`).

An OutOfMemoryError exception is thrown if there is no memory left in the heap for instance allocation and the heap can no longer be extended.

## Method Area

Method area, like the heap, is an area of memory shared by all threads. It is used to store data such as class information, constants, static variables, and code compiled by the immediate compiler that has been loaded by the virtual machine.

For developers used to developing and deploying programs on the HotSpot virtual machine, many would like to refer to the method area as the Permanent Generation, but essentially the two are not equivalent. It is simply because the HotSpot VM design team chose to extend GC generation collection to the method zone, or use the Permanent Generation to implement the method zone.

The Java Virtual Machine specification is very restrictive on this region, and in addition to not requiring contiguous memory like the heap and having the option to be fixed-sized or scalable, it also has the option to not implement garbage collection. The goal of memory reclamation in this area is mainly for constant pool reclamation and offloading of types. In general, it is difficult to achieve satisfactory results in this area, especially for offloading of types, which is quite demanding, but reclamation of this part of the area is really necessary.

{% note info %}
Garbage collection is relatively rare in this region, but it is not as permanent as the name of the permanent generation once the data enters the method region.
{% endnote %}

According to the Java Virtual Machine specification, an OutOfMemoryError exception is thrown when the method area cannot meet the memory allocation requirements.

## The pc Register

The pc Register is thread private and can be seen as a line number indicator for the bytecode executed by the current thread.

When the bytecode interpreter is working, it picks and records the next bytecode instruction to be executed by changing the value of the program counter. It is an indicator of the program control flow and is relied upon for branching, looping, skipping, exception handling, thread recovery, etc.

- If a thread is executing a Java method, the program counter records the address of the VM bytecode instruction being executed.
- If a Native method is being executed, the counter value is `Undefined`.

{% note info %}
The pc Register is the only area of the Java Virtual Machine specification that does not specify any OutOfMemoryError cases.
{% endnote %}

## Java Virtual Machine Stacks

Each thread has a private java virtual machine stacks
that is created and destroyed at the same time as the thread. It holds local variables and partial results, and acts on method calls and returns.
The memory of java virtual machine stacks need not be contiguous.

java virtual machine stacks
describes the threaded memory model for Java method execution: each method creates a stack frame (`Frames`) while executing, which stores information such as local variable tables, operand stacks, dynamic links, method exports, etc. The process of each method from invocation to execution completion corresponds to the process of entering and leaving a stack frame on the Java virtual machine stack.

- Each method corresponds to one stack frame
- The data structure of the stack is `FILO`

```java
public static void main(String[] args) {
    Work work = new Work();
    work.a();
}

public void a() {
    b();
}

public void b() {
    // do something
}
```

Next, let's analyze the structure of the virtual machine stack frame in detail

### Local Variables Table

As the name implies, the local variables table is used to store method parameters and local variables defined within the method. **There are 8 basic data types, the reference type (which is not the same as the object itself, but may be a reference pointer to the object's start address, a handle to the object or some other location related to the object) and the returnAddress type (which points to the address of a bytecode instruction)**.

The capacity of the local variables table is the smallest unit of the `Variable Slot`, with a 32 bit value occupying one Solt and a 64 bit value occupying two consecutive Solts.

When a method is called, the java virtual machine uses the local variables table to complete the transfer of parameter values to the list of parameter variables, i.e., from real to formal parameters. If an instance method (non-static) is executed, then the variable slot indexed at position 0 in the local variables table is used by default to pass a reference to the instance of the object to which the method belongs (this)

The maximum capacity (number of Slots) of the local variables table to be allocated for the method is determined in the `max_locals` data item in the Code property of the method when the Java program is compiled into a Class file.

### Operand Stacks

The operand stack is a `LIFO`. When a method first starts execution, its operand stack is empty. As the method executes and bytecode instructions are executed, constants or variables are copied from the local variable table or fields of the object instance and written to the operand stack, and then the elements of the stack are stacked out to the local variable table or returned to the method caller as the computation proceeds, i.e., the stack-out/stack-in operation. A complete method execution often contains multiple such stack-out/stack-in processes.

Each operand stack has an explicit stack depth for storing values, a 32 bit value can be stored in one unit of stack depth, while a 64 bit value requires 2 units of stack depth.

The maximum depth of the operand stack is written to the `max_stacks` data item of the method's Code property at compile time.

### Dynamic Linking

Each stack frame contains a reference to the method in the runtime constants pool to which the stack frame belongs. This reference is held to support inter-method invocations.

### Method Invocation Completion

When a method begins execution, there are only two ways to exit the method.

- When the execution engine encounters a bytecode instruction returned by any of the methods, it exits the method, which is called: `Normal Method Invocation Completion`.
- If an exception occurs during the execution of a method and is not handled in the method body, it causes the method to exit. This type of exit is called: `Abrupt Method Invocation Completion`.
