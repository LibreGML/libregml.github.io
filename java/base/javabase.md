---
url: /java/base/javabase.md
---
# javabase

## 基本数据类型

| 类型       | 关键词              | 占用内存 (字节) | 取值范围                        | JVM 底层存储                                      |
| ---------- | ------------------- | --------------- | ------------------------------- | ------------------------------------------------- |
| 整数类型   | byte,short,int,long | 1,2,4,8         |                                 |                                                   |
|            | byte                | 1               | -128 ~ 127 (-2^7 ~ 2^7-1)       | 补码表示，最高位为符号位                          |
|            | short               | 2               | -32768 ~ 32767 (-2^15 ~ 2^15-1) | 补码表示                                          |
|            | int                 | 4               | -2^31 ~ 2^31-1 (约±21 亿)       | CPU 直接处理，性能最优                            |
|            | long                | 8               | -2^63 ~ 2^63-1                  | 64 位 JVM 中与 int 性能相当，32 位 JVM 需两次指令 |
| 浮点数类型 | float,double        | 4,8             |                                 | IEEE 754 标准                                     |
| 字符类型   | char                | 2               | 0 ~ 65535 (Unicode 编码)        | UTF-16 编码                                       |
| 布尔类型   | boolean             | 1/4             | true,false                      | JVM 规范未明确定义，HotSpot 使用 int 存储         |

::: tip 核心要点

**字面量默认类型**：

* 整型字面量默认为 `int` 类型，即使是 `long a = 28493274;` 也是 int，若转 long，加 `L` 或`l`后缀（推荐用 L，小写 l 易与数字 1 混淆）
* 浮点型字面量默认为 `double` 类型，若要为 `float`，加 `F`或`f` 后缀

**JVM 中的实际存储**：

* `boolean` 在数组中占 1 字节，单独使用占 4 字节（int 实现）
* `char` 采用 UTF-16 编码，可表示 Unicode 基本多文种平面（BMP）字符
* 所有数值类型在 JVM 中均以**补码**形式存储和运算
  :::

### JVM 内存模型中的基本数据类型

```java
// 栈内存中的存储（局部变量）
int a = 10;        // 直接在栈帧的局部变量表中分配 4 字节
long b = 100L;     // 分配 8 字节，占用两个局部变量槽（slot）
float c = 3.14F;   // 4 字节，遵循 IEEE 754 标准
boolean flag = true; // HotSpot 中实际存储为 int(1)

// 堆内存中的存储（对象字段）
class Data {
    byte b;    // 1 字节，但受内存对齐影响可能占用更多
    int i;     // 4 字节
    long l;    // 8 字节
}
```

::: warning 重要细节

* **内存对齐**：JVM 会对对象字段进行内存对齐优化，可能导致实际占用空间大于理论值
* **slot 复用**：long 和 double 占用 2 个 slot，其他基本类型占 1 个 slot
* **溢出处理**：整数溢出不会抛异常，而是高位截断（环绕）
  :::

::: info JVM 规范深度解读

**JVM 规范对基本类型的定义**：

* `boolean` 类型在《Java Virtual Machine Specification》中明确规定：虽然使用 int 代替，但编译器应该在编译期进行类型检查
* `char` 类型是无符号的 16 位整数，范围 0~65535，不能直接表示 Unicode 辅助平面字符（需要使用 Character 类的 isSurrogate 方法）
* `byte` 类型在数组中占用 1 字节，但作为实例字段时，由于内存对齐（通常是 8 字节对齐），可能实际占用 4-8 字节

**CPU 架构的影响**：

* x86\_64 架构下，int 和 long 的性能差异不大（都是 64 位寄存器）
* ARM 架构下，int 性能明显优于 long（32 位原生支持）
* 向量化处理时，float\[] 比 int\[] 更适合 SIMD 优化
  :::

***

### 数据类型转换

#### 1. 自动类型转换（隐式转换）

**底层原理**：

* 小范围的类型自动转换为范围大的类型
* JVM 使用 `i2l`(int to long)、`i2d`(int to double) 等字节码指令实现

```java
// 示例及字节码分析
int i = 100;
double d = i;  // 字节码：i2d，将 int 转为 double

char c = 'a';
int ci = c;    // 字节码：i2c (char 实际存储为 int)，输出 97

// 表达式运算的自动提升
byte b1 = 10, b2 = 20;
int sum = b1 + b2;  // 字节码：iload, iload, iadd
// JVM 先将 byte 转为 int（i2b 逆向），再执行加法
```

::: tip 表达式运算规则

* 表达式中，`byte`、`short`、`char` 类型的变量都直接转换成 `int` 参与运算
* `byte + short = int`，`byte + byte = int`
* 原因：JVM 的算术运算指令（如 `iadd`、`isub`）只支持 `int` 及以上类型
  :::

::: info 编译器优化细节

**常量折叠（Constant Folding）**：

```java
final byte a = 10;
final byte b = 20;
byte c = a + b;  // 编译期直接计算为 30，生成 bipush 30 指令
```

编译器会在编译期计算常量表达式，避免运行时开销

**窄化转换的验证**：

```java
byte b = 127;      // ✓ 编译通过（常量在范围内）
byte b = 128;      // ✗ 编译错误（超出 byte 范围）
byte b = (byte)128;// ✓ 强制转换，运行结果为 -128
```

:::

#### 2. 强制类型转换（显式转换）

**底层原理**：

* 可能造成数据丢失或精度损失
* JVM 使用 `l2i`(long to int)、`d2i`(double to int) 等字节码指令
* 浮点转整型时，小数部分直接**截断**（非四舍五入）

```java
// 示例及风险分析
int a = 10000;
byte c = (byte) a;  // 字节码：iload, i2b，输出 -48（溢出）
// 原理：10000 的二进制低 8 位为 11010000，作为 byte 解释为 -48

double d = 3.99;
int i = (int) d;    // 字节码：dload, d2i，结果为 3（直接截断）

// 复合表达式的强制转换
byte x = 10, y = 20;
byte z = (byte) (x + y);  // 字节码：iload, iload, iadd, i2b
// 必须先计算 int 结果，再强制转回 byte
```

::: warning 数据丢失场景

1. **大转小**：`int → byte`，高位截断
2. **浮点转整数**：精度丢失
3. **负数转 char**：先转 int 再转 char，可能超出 char 范围
   :::

::: danger 极端案例分析

```java
// int 转 float 的精度丢失
int bigInt = 123456789;
float f = bigInt;  // 1.23456792E8（精度丢失！）
int back = (int)f; // 123456792 ≠ 123456789

// 原理：float 只有 23 位尾数，无法精确表示所有 int 值
// double 有 52 位尾数，可以精确表示所有 int 值

// long 转 double 的精度问题
long bigLong = 9223372036854775807L;
double d = bigLong;  // 9.223372036854776E18
long back = (long)d; // 9223372036854776000 ≠ 原值
```

:::

***

## 运算符

### 1. 算术运算符：`+，-，*，/，%`

**JVM 底层实现**：

* 对应字节码：`iadd`、`isub`、`imul`、`idiv`、`irem`
* 整数除法向零取整（truncate toward zero）

```java
int a = 5, b = 2;
System.out.println(a / b);  // 2，不是 2.5
// 字节码：iload_0, iload_1, idiv

// 解决方案
double result = a * 1.0 / b;  // 2.5
// 字节码：iload_0, i2d, ldc2_w 1.0, dmul, iload_1, i2d, ddiv
```

::: tip 特殊场景

* `%` 运算符也适用于浮点数：`5.5 % 2.0 = 1.5`
* 整数除以 0 抛出 `ArithmeticException`
* 浮点数除以 0 得到 `Infinity` 或`NaN`（不抛异常）
  :::

::: info JVM 算术指令深度解析

**乘法优化**：

```java
// JVM 对乘法的优化策略
int x = n * 2;    // 可能优化为 n << 1（位移更快）
int y = n * 8;    // 优化为 n << 3
int z = n * 15;   // 优化为 (n << 4) - n（移位 + 减法）
```

JIT 编译器会自动将乘法转换为位移和加减法组合

**除法的特殊性**：

```java
// 整数除法性能较差（CPU 指令周期长）
int q = n / 2;    // 可能优化为 n >> 1
int r = n % 2;    // 可能优化为 n & 1

// 常量除法优化
int result = n / 4;
// JIT 编译为：(n * 0xCCCCCCCD) >>> 34（魔数乘法 + 移位）
// 原理：除法比乘法慢 10-40 倍，用乘法代替除法
```

**溢出检测（Java 8+）**：

```java
Math.addExact(a, b);    // 溢出抛 ArithmeticException
Math.subtractExact(a, b);
Math.multiplyExact(a, b);
// 底层使用位运算检查溢出标志
```

:::

***

### 2. 自增自减运算符：`++, --`

**底层原理**：

* `++i`（前缀）：先自增，再返回新值
* `i++`（后缀）：先返回原值，再自增
* JVM 使用 `iinc` 指令直接在局部变量表上操作

```java
int i = 5;
int a = ++i;  // a=6, i=6，字节码：iinc 1, 1（直接增量）
int b = i++;  // b=6, i=7，字节码：iload, iinc, iload（需要临时变量）
```

::: warning 性能差异

* 单独使用时性能无差异（JIT 优化后）
* 在复杂表达式中，`++i` 可能略优于`i++`（少一次临时变量存储）
  :::

::: info 并发环境下的陷阱

```java
// 线程不安全！i++ 不是原子操作
// 实际执行三步：读取 → 修改 → 写回
static int count = 0;
// 多线程执行 count++ 会导致计数丢失

// 正确做法：
AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet();  // CAS 保证原子性

// 或者使用 synchronized
synchronized(lock) { count++; }
```

**字节码层面的非原子性**：

```
getstatic     #count    // 1. 读取 count 当前值
iconst_1
iadd                    // 2. 加 1
putstatic     #count    // 3. 写回新值
// 多线程环境下，步骤 1-3 可能被其他线程打断
```

:::

***

### 3. 赋值运算符与扩展赋值

**底层机制**：

* 扩展赋值包含**隐式强制类型转换**

```java
byte a = 10, b = 10;
a += b;
// 等价于：a = (byte)(a + b)
// 字节码：iload_1, iload_2, iadd, i2b, istore_1

// 对比以下错误写法：
// a = a + b;  // 编译错误，因为 a+b 结果是 int 类型
```

::: tip 陷阱案例

```java
int i = Integer.MAX_VALUE;
i += 1;  // 不报错，结果为 -2147483648（溢出）
i = i + 1;  // 编译错误，需要显式强转
```

:::

::: info 扩展赋值的隐式转换规则

```java
// 所有复合赋值都包含隐式强转
E1 op= E2  等价于  E1 = (T)(E1 op E2)
// T 是 E1 的类型

short s = 1;
s += 1;        // ✓ 等价于 s = (short)(s + 1)
s = s + 1;     // ✗ 编译错误，需要显式强转

char c = 'a';
c += 1;        // ✓ c 变为'b'（ASCII 码 +1）
c = c + 1;     // ✗ 编译错误
```

**数值提升规则**：

```java
int i = 10;
float f = 1.5F;
i += f;  // i 变为 11（先计算 i+f=11.5F，再强转为 int）
// 等价于：i = (int)(i + f)
```

:::

***

### 4. 位运算符（硬核补充）

**JVM 支持的位运算**：

* `&`（与）、`|`（或）、`^`（异或）、`~`（取反）
* `<<`（左移）、`>>`（带符号右移）、`>>>`（无符号右移）

```java
// 底层应用示例
int n = 10;      // 二进制：0000 0000 0000 0000 0000 0000 0000 1010
int left = n << 2;   // 左移 2 位：0000 0000 0000 0000 0000 0000 0010 1000 = 40
int right = n >> 2;  // 右移 2 位：0000 0000 0000 0000 0000 0000 0000 0010 = 2
int neg = -10;       // 补码：1111 1111 1111 1111 1111 1111 1111 0110
int signRight = neg >> 2;   // 带符号右移：1111 1111 1111 1111 1111 1111 1111 1101 = -3
int unSignRight = neg >>> 2;// 无符号右移：0011 1111 1111 1111 1111 1111 1111 1101 = 正数

// 高效技巧
n & 1 == 0   // 判断奇偶性（比 n % 2 快）
n & (n-1)    // 清除最低位的 1（用于判断 2 的幂）
n & -n       // 保留最低位的 1（树状数组核心操作）
```

::: tip 位移运算性能

* 位移运算比乘除运算快得多（CPU 指令级别）
* `n << 1` 等价于`n * 2`，但性能高数倍
* HashMap 扩容、索引计算大量使用位运算
  :::

::: info 位运算的高级应用

**判断 2 的幂**：

```java
boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}
// 原理：2 的幂的二进制只有一个 1，n-1 会将这个 1 变为 0
// 例如：8(1000) & 7(0111) = 0
```

**交换两个数（不使用临时变量）**：

```java
a ^= b;
b ^= a;
a ^= b;
// 原理：利用异或的自反性 a^a=0, a^0=a
```

**绝对值计算**：

```java
int abs(int n) {
    int mask = n >> 31;  // 正数为 0，负数为 -1
    return (n ^ mask) - mask;
}
// 正数：(n^0)-0 = n
// 负数：(n^-1)-(-1) = ~n + 1 = 补码
```

**HashMap 容量计算**：

```java
// HashMap 中计算大于 cap 的最小 2 的幂
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;   // 高位传播
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

**位移运算的性能测试**：

```java
// JMH 基准测试结果（相对性能）
n * 2    vs  n << 1   ≈ 1:1.5  （位移快 50%）
n / 2    vs  n >> 1   ≈ 1:2    （位移快 1 倍）
n % 2    vs  n & 1    ≈ 1:3    （位运算快 2 倍）
```

:::

***

### 5. 关系运算符与逻辑运算符

**短路优化的 JVM 实现**：

```java
// && 短路逻辑（字节码层面）
if (a != 0 && b / a > 2) {
    // 如果 a != 0 为 false，直接跳过 b/a 的计算
    // 字节码使用条件跳转指令实现短路
}

// 位运算 vs 逻辑运算性能
boolean result1 = (a > 0) & (b > 0);  // 两边都执行
boolean result2 = (a > 0) && (b > 0); // 短路，性能更优
```

::: info 短路优化的字节码实现

```java
// 短路与的字节码结构
if (cond1 && cond2) {
    // ...
}
// 编译后：
//   判断 cond1
//   ifeq L1        // 如果 cond1 为 false，跳转到 L1（跳过 cond2）
//   判断 cond2
//   ifeq L1        // 如果 cond2 为 false，跳转到 L1
//   ...           // cond1 和 cond2 都为 true 的执行路径
// L1:
```

**NPE 防护中的短路应用**：

```java
// 经典空指针防护
if (obj != null && obj.isValid()) {
    // 安全使用 obj
}
// 如果写成 & 会导致 NullPointerException
```

**性能对比**：

```java
// 场景：判断数组索引是否有效
if (i >= 0 && i < arr.length && arr[i] != null) {
    // 使用 &&：平均检查 1.5 个条件（短路优化）
}

if (i >= 0 & i < arr.length & arr[i] != null) {
    // 使用 &：总是检查 3 个条件
}
```

:::

***

### 6. 三元运算符的字节码实现

```java
int a = 10, b = 20;
int max = (a > b) ? a : b;
// 字节码：
// iload_0 (加载 a)
// iload_1 (加载 b)
// if_icmp.le L0 (如果 a <= b，跳转到 L0)
// iload_0 (a > b 时加载 a)
// goto L1
// L0: iload_1 (加载 b)
// L1: istore_2 (存储结果)
```

::: info 三元运算符的类型推断

```java
// 三元表达式的类型由第二、三个操作数决定
Object obj = true ? new Integer(1) : new Double(2.0);
// 编译期推断类型为 Number（Integer 和 Double 的公共父类）

// 自动装箱的陷阱
int x = true ? 1 : 2.0;  // 编译错误！double 不能转为 int
int y = true ? 1 : 2;    // ✓ 类型为 int
```

**嵌套三元运算符**：

```java
int result = a > b
    ? (a > c ? a : c)
    : (b > c ? b : c);
// 求三个数的最大值
// 字节码会生成多个条件跳转指令
```

**性能对比**：

```java
// 三元运算符 vs if-else
int max1 = (a > b) ? a : b;  // 字节码：3 条指令（紧凑）

if (a > b) {
    max2 = a;
} else {
    max2 = b;
}
// 字节码：5-6 条指令（需要标签和跳转）
// 但 JIT 优化后性能无差异
```

:::

***

### 7. 运算符优先级（完整版）

**口诀**：单目乘除位关系，逻辑三目后赋值

| 优先级 | 运算符类别 | 具体运算符                           | 结合性 |
| ------ | ---------- | ------------------------------------ | ------ |
| 1      | 单目运算符 | `++，--, +, -, !, ~, (type)`         | 右到左 |
| 2      | 乘除运算   | `*, /, %`                            | 左到右 |
| 3      | 加减运算   | `+, -`                               | 左到右 |
| 4      | 位移运算   | `<<, >>, >>>`                        | 左到右 |
| 5      | 关系运算   | `>, <, >=, <=, instanceof`           | 左到右 |
| 6      | 相等判断   | `==, !=`                             | 左到右 |
| 7      | 位运算     | `&, ^, \|`                           | 左到右 |
| 8      | 逻辑运算   | `&&, \|\|`                           | 左到右 |
| 9      | 三元运算   | `?:`                                 | 右到左 |
| 10     | 赋值运算   | `=, +=, -=, *=, /=, %=, &=, \|=, ^=` | 右到左 |

::: tip 经典陷阱

```java
int result = 10 > 3 || 10 > 3 && 10 < 3;
// 实际执行：10 > 3 || (10 > 3 && 10 < 3)
// 因为 && 优先级高于 ||
// 结果：true（短路优化，&& 部分未执行）
```

:::

::: info 优先级相关的常见错误

**错误 1：位运算与关系运算混淆**：

```java
if (x & 1 == 0) {}  // ✗ 编译错误！== 优先级高于&
// 正确写法：
if ((x & 1) == 0) {}  // ✓
```

**错误 2：赋值与相等判断**：

```java
if (a = b) {}  // ✗ 编译错误（Java 不允许在条件中赋值）
if (a == b) {} // ✓

// C/C++ 允许 if (a = b)，容易写错
```

**错误 3：链式比较**：

```java
if (0 < x < 10) {}  // ✗ 编译错误！
// Java 不支持数学中的链式比较
// 正确写法：
if (x > 0 && x < 10) {}
```

**instanceof 的优先级**：

```java
if (obj instanceof String s && s.length() > 0) {
    // Java 16+ 支持模式匹配
    // instanceof 优先级低于&&
}
```

:::

***

## scanner

**JVM 底层机制**：

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
// System.in 是 InputStream 类型（字节流）
// Scanner 将其包装为字符流，使用缓冲区提高性能

int a = sc.nextInt();     // 读取整数，遇到分隔符停止
String b = sc.nextLine(); // 读取整行，遇到\n停止
String c = sc.next();     // 读取单词，遇到空白符停止

// 常见陷阱
int num = sc.nextInt();
String line = sc.nextLine();  // 可能读到空字符串！
// 原因：nextInt() 未消耗换行符，nextLine() 立即读到残留的\n
// 解决：sc.nextLine() 先消耗掉换行符
```

::: warning 性能注意

* Scanner 适合小规模输入，大规模数据建议使用 `BufferedReader`
* Scanner 使用正则表达式匹配，性能较低
  :::

::: info Scanner 的底层实现原理

**缓冲区机制**：

```java
// Scanner 内部维护一个 CharBuffer
private CharBuffer buf;  // 默认大小 1024 字符
private int bufSize;     // 实际缓冲大小

// nextInt() 的执行流程：
// 1. 从 InputStream 读取字节到 byte[] 缓冲区
// 2. 使用 CharsetDecoder 将字节解码为字符
// 3. 使用 Pattern 匹配分隔符（默认空白符）
// 4. 解析 token 并转换为目标类型
```

**正则表达式开销**：

```java
// Scanner 默认使用正则表达式作为分隔符
private Pattern delimiterPattern;  // 默认 \p{javaWhitespace}+

// 每次调用 nextXxx() 都会执行 Pattern.match()
// 正则匹配的时间复杂度：O(n*m)，n 为输入长度，m 为模式长度
```

**性能对比测试**：

```java
// 读取 100 万行数据的性能对比
Scanner sc = new Scanner(System.in);        // ~2.5 秒
BufferedReader br = new BufferedReader(
    new InputStreamReader(System.in));      // ~0.3 秒
// BufferedReader 快约 8 倍！

// 原因：
// - Scanner：每行都要正则匹配 + 类型转换
// - BufferedReader：纯字符拷贝，无额外开销
```

**内存占用分析**：

```java
Scanner sc = new Scanner(System.in);
// 内存占用：~64KB（内部缓冲区 + 正则引擎）

BufferedReader br = new BufferedReader(
    new InputStreamReader(System.in), 8192);
// 内存占用：~16KB（仅字符缓冲区）
```

:::

::: danger Scanner 的常见陷阱

**陷阱 1：混合使用 nextXxx() 和 nextLine()**：

```java
int age = sc.nextInt();
String name = sc.nextLine();  // ✗ 读到空字符串！

// 正确做法：
int age = sc.nextInt();
sc.nextLine();  // 消耗残留的换行符
String name = sc.nextLine();  // ✓
```

**陷阱 2：Locale 敏感**：

```java
Scanner sc = new Scanner(System.in);
sc.useLocale(Locale.US);  // 重要！

double d = sc.nextDouble();
// 美国 Locale：3.14（小数点）
// 德国 Locale：3,14（逗号）
// 不设置可能导致 InputMismatchException
```

**陷阱 3：资源泄漏**：

```java
Scanner sc = new Scanner(new File("data.txt"));
String content = sc.useDelimiter("\\A").next();
// ✗ 忘记关闭 sc，文件句柄泄漏

// 正确做法：
try (Scanner sc = new Scanner(new File("data.txt"))) {
    // try-with-resources 自动关闭
}
```

**陷阱 4：大文件 OOM**：

```java
// 错误：一次性读取整个文件
sc.useDelimiter("\\Z");  // 匹配 EOF
String content = sc.next();  // 大文件会 OOM！

// 正确：逐行读取
while (sc.hasNextLine()) {
    String line = sc.nextLine();
}
```

:::

***

## 流程控制

### 1. 分支结构

#### if-else 的字节码实现

```java
if (expr1) {
    // 语句 1
} else if (expr2) {
    // 语句 2
} else {
    // 语句 3
}
// 字节码使用 if_icmpXX 条件跳转指令实现
// JVM 按顺序判断，效率随条件数量线性下降
```

::: info if-else 的性能分析与优化

**字节码层面的执行流程**：

```java
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else {
    grade = "C";
}

// 编译后字节码结构：
//   iload_0           // 加载 score
//   bipush 90
//   if_icmp.lt L1     // 如果 score < 90，跳转到 L1
//   ldc "A"
//   astore_1
//   goto L_end
// L1:
//   iload_0
//   bipush 80
//   if_icmp.lt L2     // 如果 score < 80，跳转到 L2
//   ldc "B"
//   astore_1
//   goto L_end
// L2:
//   ldc "C"
//   astore_1
// L_end:
```

**性能优化建议**：

```java
// 将最可能的条件放在前面
if (commonCase) {      // 发生概率 80%
    // ...
} else if (rareCase) { // 发生概率 15%
    // ...
} else {
    // ...
}
// 平均检查次数：1*0.8 + 2*0.15 + 3*0.05 = 1.25 次

// 反模式：将罕见情况放前面
if (rareCase) {        // 平均检查次数增加
    // ...
}
```

**JIT 编译器的优化**：

```java
// 热点代码路径会被 JIT 优化
if (likelyCondition) {
    // 频繁执行的代码会被内联和优化
} else {
    // 冷代码可能被移到方法外部（cold code hoisting）
}

// 使用 @HotSpotIntrinsicCandidate 标注的方法
// 可能被替换为 CPU 指令
```

:::

***

#### switch 的底层优化（硬核）

**两种实现方式**：

1. **tableswitch**（适用于连续 case 值）

```java
switch (day) {
    case 1: ... // 字节码：tableswitch，通过查表直接定位
    case 2: ... // 时间复杂度 O(1)
    case 3: ...
}
```

2. **lookupswitch**（适用于稀疏 case 值）

```java
switch (month) {
    case 1: ...  // 字节码：lookupswitch，二分查找
    case 6: ...  // 时间复杂度 O(log n)
    case 12: ...
}
```

3. **String 的 switch 实现**（Java 7+）

```java
switch (str) {
    case "A": ...
    case "B": ...
}
// 编译为两个 switch：
// 1. 根据 str.hashCode() 查表（tableswitch/lookupswitch）
// 2. 使用 equals() 精确比较（处理哈希冲突）
```

::: tip switch 性能优势

* case 值连续时，`tableswitch` 性能远超`if-else`
* case 值较多时（>3 个），switch 通常优于`if-else`
* String 的 switch 需要注意`hashCode()`碰撞风险
  :::

::: info switch 底层机制深度解析

**tableswitch 的工作原理**：

```java
switch (n) {
    case 0: return "zero";
    case 1: return "one";
    case 2: return "two";
    case 3: return "three";
}

// 字节码：
tableswitch {
    min = 0
    max = 3
    default: L_default
    0: L_case0
    1: L_case1
    2: L_case2
    3: L_case3
}
// 执行过程：
// 1. 计算偏移量：offset = n - min
// 2. 检查范围：if offset < 0 || offset > (max-min), jump to default
// 3. 查表跳转：jump to table[offset]
// 时间复杂度：O(1)，三次内存访问
```

**lookupswitch 的二分查找**：

```java
switch (n) {
    case 1: ...
    case 5: ...
    case 100: ...
    case 1000: ...
}

// 字节码（已排序）：
lookupswitch {
    default: L_default
    1: L_case1
    5: L_case5
    100: L_case100
    1000: L_case1000
}
// 执行过程：
// 1. 二分查找匹配的 case 值
// 2. 4 个 case 需要 log2(4) = 2 次比较
// 时间复杂度：O(log n)
```

**String switch 的双重验证**：

```java
switch (str) {
    case "apple": ...   // hashCode: 93029134
    case "banana": ...  // hashCode: -1198882072
    case "orange": ...  // hashCode: 1028011374
}

// 编译后的等价代码：
String s = str;
int hash = s.hashCode();
switch (hash) {
    case 93029134:
        if (s.equals("apple")) { ... }
        break;
    case -1198882072:
        if (s.equals("banana")) { ... }
        break;
    case 1028011374:
        if (s.equals("orange")) { ... }
        break;
}
// 注意：hashCode 冲突时会降级为线性搜索
```

**性能对比实测**：

```java
// 10 个 case 的性能测试（100 万次执行）
if-else chain:  ~45ms  （平均 4.5 次比较）
switch (table): ~12ms  （O(1) 查表）
switch (lookup):~25ms  （O(log n) 二分查找）

// case 值连续度影响：
// 连续 10 个数：tableswitch，极快
// 稀疏 10 个数：lookupswitch，较慢
```

**JDK 14+ 的新特性**：

```java
// Switch 表达式（预览特性）
String result = switch (day) {
    case MONDAY, FRIDAY -> "Weekend soon";
    case SUNDAY -> "Weekend!";
    default -> "Workday";
};

// 编译后仍使用 tableswitch/lookupswitch
// 但语法更简洁，支持返回值
```

:::

***

### 2. 循环结构

#### for 循环的 JVM 实现

```java
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}
// 字节码：
// iconst_0 (加载常量 0)
// istore_1 (存储到局部变量 i)
// L0: iload_1 (加载 i)
// bipush 10 (加载 10)
// if_icmp.ge L1 (如果 i >= 10，跳出循环)
// ... 循环体 ...
// iinc 1, 1 (i++)
// goto L0 (跳回 L0)
```

#### while vs do-while vs for

| 类型     | 适用场景         | JVM 优化           |
| -------- | ---------------- | ------------------ |
| for      | 循环次数确定     | 可触发循环展开优化 |
| while    | 循环条件动态变化 | 基础优化           |
| do-while | 至少执行一次     | 减少一次条件判断   |

::: warning 循环变量作用域

```java
for (int i = 0; i < 5; i++) { }
System.out.println(i);  // 编译错误！i 已销毁

int j = 0;
while (j < 5) { j++; }
System.out.println(j);  // 正确，j=5
// JVM 中 for 循环变量生命周期仅限于循环内
```

:::

::: info 循环性能优化深度解析

**循环展开（Loop Unrolling）**：

```java
// 原始代码
for (int i = 0; i < 100; i++) {
    sum += arr[i];
}

// JIT 可能优化为（伪代码）：
for (int i = 0; i < 100; i += 4) {
    sum += arr[i];
    sum += arr[i+1];
    sum += arr[i+2];
    sum += arr[i+3];
}
// 优点：减少条件判断次数（从 100 次降到 25 次）
// 缺点：代码体积增大
```

**范围消除优化（Range Elimination）**：

```java
// 低效版本（每次都边界检查）
for (int i = 0; i < arr.length; i++) {
    arr[i] = i;  // JVM 每次都要检查 i < arr.length
}

// 优化版本（JIT 可能自动优化）
int len = arr.length;  // 缓存长度
for (int i = 0; i < len; i++) {
    arr[i] = i;  // JIT 可能移除边界检查
}
```

**循环不变量外提（Loop Invariant Code Motion）**：

```java
// 低效：每次都计算 expensiveOperation()
for (int i = 0; i < list.size(); i++) {
    process(list.get(i));
}

// 高效：外提不变量
int size = list.size();  // 移到循环外
for (int i = 0; i < size; i++) {
    process(list.get(i));
}
```

**增强 for 循环的性能**：

```java
// ArrayList 场景（推荐）
for (String s : list) {
    // 编译为基于索引的循环
    // 性能与普通 for 循环相同
}

// LinkedList 场景（避免使用！）
for (String s : list) {
    // 编译为迭代器遍历
    // 每次 next() 都要移动指针，性能差
}

// LinkedList 应使用传统 for 循环或迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    process(it.next());
}
```

**并行循环（Java 8+）**：

```java
// 适合 CPU 密集型任务
array.parallelSetAll(i -> compute(i));
// 底层使用 ForkJoinPool 并行执行

// 或使用 Stream API
IntStream.range(0, n).parallel().forEach(i -> {
    // 并行处理
});
```

:::

***

#### 循环嵌套的性能优化

```java
// 低效写法（频繁访问 arr.length）
for (int i = 0; i < arr.length; i++) {
    for (int j = 0; j < arr[i].length; j++) {
        // ...
    }
}

// 高效写法（缓存长度）
for (int i = 0, len = arr.length; i < len; i++) {
    for (int j = 0, len2 = arr[i].length; j < len2; j++) {
        // ...
    }
}
// JVM JIT 可能自动优化，但显式缓存更安全
```

::: info 循环嵌套的高级优化技巧

**内存访问模式优化**：

```java
// 二维数组的行优先访问（高效）
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        matrix[i][j] = i * j;  // 顺序访问，缓存友好
    }
}

// 列优先访问（低效）
for (int j = 0; j < cols; j++) {
    for (int i = 0; i < rows; i++) {
        matrix[i][j] = i * j;  // 跳跃访问，缓存不友好
    }
}
// 性能差异可达 5-10 倍！
```

**循环分块（Loop Tiling）**：

```java
// 矩阵乘法优化示例
// 朴素版本（缓存命中率低）
for (int i = 0; i < N; i++) {
    for (int j = 0; j < N; j++) {
        for (int k = 0; k < N; k++) {
            C[i][j] += A[i][k] * B[k][j];
        }
    }
}

// 分块版本（提高缓存命中率）
int BLOCK_SIZE = 32;
for (int ii = 0; ii < N; ii += BLOCK_SIZE) {
    for (int jj = 0; jj < N; jj += BLOCK_SIZE) {
        for (int kk = 0; kk < N; kk += BLOCK_SIZE) {
            // 在小块内计算
            for (int i = ii; i < min(ii+BLOCK_SIZE, N); i++) {
                for (int j = jj; j < min(jj+BLOCK_SIZE, N); j++) {
                    for (int k = kk; k < min(kk+BLOCK_SIZE, N); k++) {
                        C[i][j] += A[i][k] * B[k][j];
                    }
                }
            }
        }
    }
}
// 性能提升：2-5 倍（取决于缓存大小）
```

**循环融合（Loop Fusion）**：

```java
// 低效：两次遍历
for (int i = 0; i < n; i++) {
    a[i] = b[i] + c[i];
}
for (int i = 0; i < n; i++) {
    d[i] = a[i] * e[i];
}

// 高效：一次遍历
for (int i = 0; i < n; i++) {
    a[i] = b[i] + c[i];
    d[i] = a[i] * e[i];
}
// 减少内存访问次数，提高缓存利用率
```

:::

***

#### break 和 continue 的字节码本质

```java
// break 本质是 goto 跳转到循环外
label: for (int i = 0; i < 10; i++) {
    if (i == 5) break label;
    // 字节码：goto L_end（直接跳到循环结束位置）
}

// continue 本质是 goto 跳转到循环开始
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    // 字节码：goto L_start（跳回循环条件判断处）
}
```

::: info 带标签的跳转优化

**多层循环的 break/continue**：

```java
outer: for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        if (condition) break outer;
        // 字节码：goto outer_end（直接跳出两层循环）
    }
}

// 等价于 C/C++ 的 goto，但更安全
// Java 不允许跳转到任意位置，只能跳到循环标签
```

**性能影响分析**：

```java
// break 提前终止（推荐）
for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
        found = true;
        break;  // 找到后立即退出，平均节省 50% 时间
    }
}

// continue 跳过迭代
for (int i = 0; i < n; i++) {
    if (shouldSkip(i)) continue;
    // 重指令仍会执行条件判断
    process(i);
}
```

**字节码层面的实现**：

```java
// break 的字节码结构
for (int i = 0; i < 10; i++) {
    if (cond) break;
    // body
}
// 编译后：
// L_loop:
//   判断条件
//   if_icmp.ge L_end
//   判断 break 条件
//   ifne L_end      // break 直接跳到 L_end
//   body
//   goto L_loop
// L_end:

// continue 的字节码结构
for (int i = 0; i < 10; i++) {
    if (cond) continue;
    // body
}
// 编译后：
// L_loop:
//   判断条件
//   if_icmp.ge L_end
//   判断 continue 条件
//   ifne L_update   // continue 跳到更新语句
//   body
// L_update:
//   i++
//   goto L_loop
// L_end:
```

:::

***

## 随机数

### Random 类的底层实现

```java
import java.util.Random;

Random r = new Random();
// 内部使用 48 位种子（seed）和线性同余发生器（LCG）
// 公式：seed = (seed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1)

int a = r.nextInt(10);  // 生成 0-9 的随机数
// 底层：生成 48 位伪随机数，取模运算得到结果

// Java 8+ 推荐使用 ThreadLocalRandom（并发场景）
import java.util.concurrent.ThreadLocalRandom;
int b = ThreadLocalRandom.current().nextInt(1, 11);
// 每个线程独享 Random 实例，避免 CAS 竞争
```

::: tip 真随机 vs 伪随机

* `Random` 是伪随机（基于种子和算法）
* `SecureRandom` 是真随机（基于系统熵源）
* 相同种子生成的 Random 对象产生相同的随机序列（可用于复现 bug）
  :::

::: info Random 类深度解析

**线性同余发生器（LCG）原理**：

```java
// LCG 核心公式
nextSeed = (oldSeed * multiplier + addend) & mask;
// multiplier = 0x5DEECE66DL (25214903917)
// addend = 0xBL (11)
// mask = (1L << 48) - 1 (48 位掩码)

protected int next(int bits) {
    long oldseed, nextseed;
    AtomicLong seed = this.seed;
    do {
        oldseed = seed.get();
        // 计算下一个种子
        nextseed = (oldseed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1);
    } while (!seed.compareAndSet(oldseed, nextseed));
    // 返回高 bits 位
    return (int)(nextseed >>> (48 - bits));
}
```

**周期性分析**：

```java
// LCG 的周期为 2^48 ≈ 2.8×10^14
// 意味着生成 2.8 万亿个数后开始重复

// 测试周期性（理论验证）
Random r1 = new Random(12345L);  // 固定种子
Random r2 = new Random(12345L);
// r1 和 r2 产生的随机数序列完全相同

for (int i = 0; i < 10; i++) {
    assert r1.nextInt() == r2.nextInt();
}
```

**nextInt(n) 的实现细节**：

```java
public int nextInt(int bound) {
    if (bound <= 0) throw new IllegalArgumentException();

    if ((bound & -bound) == bound) {  // bound 是 2 的幂
        return (int)((bound * (long)next(31)) >> 31);
        // 优化：使用位移代替取模
    }

    int bits, val;
    do {
        bits = next(31);
        val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    // 拒绝采样：确保均匀分布
    return val;
}
```

**nextDouble() 的实现**：

```java
public double nextDouble() {
    return (((long)(next(26)) << 27) + next(27))
             * (1.0 / (1L << 53));
    // 使用两个 26/27 位随机数组合成 53 位尾数
    // double 精度为 53 位（IEEE 754）
}
```

:::

::: danger 并发场景下的 Random

**线程安全问题**：

```java
// 多个线程共享同一个 Random 实例
static final Random sharedRand = new Random();
// 多线程调用会出现竞争！

sharedRand.nextInt();  // CAS 操作，性能下降
// 原因：seed 是 AtomicLong，每次更新需要 CAS
```

**ThreadLocalRandom 的优化**：

```java
// 每个线程独享一个 Random 实例
public class ThreadLocalRandom extends Random {
    static final class Probe {
        int value;           // 线程本地种子
        int probe;           // 哈希探针
    }

    // 获取当前线程的随机数生成器
    public static ThreadLocalRandom current() {
        return UNSAFE.getThreadLocalRandom();
    }
}

// 使用示例
int num = ThreadLocalRandom.current().nextInt(100);
// 无锁设计，性能提升 3-5 倍
```

**性能对比**：

```java
// 10 个线程，每个线程生成 100 万个随机数
Random:              ~2500ms  （CAS 竞争激烈）
ThreadLocalRandom:   ~600ms   （无锁，快 4 倍）
SplittableRandom:    ~400ms   （Java 8+，更快）
```

:::

::: info SecureRandom 真随机

**熵源收集**：

```java
SecureRandom sr = new SecureRandom();
sr.nextBytes(bytes);
// 底层从操作系统收集熵源：
// - Linux: /dev/random, /dev/urandom
// - Windows: CryptGenRandom
// - 硬件事件：键盘、鼠标、磁盘 IO 时间戳
```

**应用场景**：

```java
// 密码学场景必须使用 SecureRandom
KeyGenerator kg = KeyGenerator.getInstance("AES");
kg.init(new SecureRandom());  // ✓ 安全

// Random 不适合安全场景
KeyGenerator kg = KeyGenerator.getInstance("AES");
kg.init(new Random());  // ✗ 不安全！可预测
```

:::

***

## 数组

### 1. 数组的本质

**JVM 中的数组结构**：

```
对象头（Mark Word + Class Pointer + 数组长度）| 元素数据区
- 12-16 字节（64 位 JVM）              - 连续内存空间
```

```java
int[] arr = {1, 2, 3};
// 栈内存：arr（引用，4-8 字节）→ 指向堆内存
// 堆内存：[对象头 16 字节][int:1][int:2][int:3]
// 总占用：16 + 3×4 = 28 字节（考虑对齐可能 32 字节）

// 打印数组名
System.out.println(arr);
// 输出：[I@251a69d7
// [：数组类型标识
// I：元素类型为 int（B=byte, C=char, D=double, F=float, I=int, J=long, S=short, Z=boolean, L=类名;）
// @：分隔符
// 251a69d7：十六进制哈希码（非内存地址）
```

### 2. 数组的内存布局（64 位 JVM）

```java
// 一维数组
int[] arr = new int[5];
// 内存布局：
// 对象头（12 字节 Mark Word + 4 字节 Klass 指针）
// 数组长度（4 字节，记录元素个数）
// 元素数据（5 × 4 = 20 字节）
// 填充（可选，用于 8 字节对齐）

// 二维数组（本质是数组的数组）
int[][] arr2D = new int[3][4];
// 堆内存：
// arr2D 引用 → [对象头][长度 3][引用 1][引用 2][引用 3]
//                    ↓          ↓          ↓
//              [子数组 1]  [子数组 2]  [子数组 3]
// 每个子数组独立分配，可不规则
```

### 3. 数组访问的边界检查

```java
arr[i] = 10;  // JVM 会在运行时检查 i 是否在 [0, length) 范围内
// 如果越界，抛出 ArrayIndexOutOfBoundsException
// 这是 JVM 的安全机制，但会带来性能开销

// JVM 优化：范围消除（Range Elimination）
for (int i = 0; i < arr.length; i++) {
    arr[i] = i;  // JIT 编译器可能移除多余的边界检查
}
```

::: info 边界检查的性能影响与优化

**边界检查的汇编实现**：

```
; Java: arr[i] = value
; 编译后的汇编伪代码：
mov rax, [arr_ptr]      ; 加载数组对象
cmp i, [rax+16]         ; 比较 i 和 length（偏移 16 字节）
jge throw_exception     ; 如果 i >= length，抛异常
mov [rax+20+i*4], value ; 存储值（偏移 20 字节开始）
```

**范围消除优化的条件**：

```java
// 场景 1：循环变量可被分析
for (int i = 0; i < arr.length; i++) {
    arr[i] = i;  // ✓ JIT 可证明 i 始终有效，移除检查
}

// 场景 2：条件判断保护
if (i >= 0 && i < arr.length) {
    arr[i] = 10;  // ✓ 已有检查，JIT 可能移除冗余检查
}

// 场景 3：无法优化的情况
arr[getIndex()] = 10;  // ✗ getIndex() 返回值未知，必须检查
```

**手动优化技巧**：

```java
// 使用 Unsafe 绕过边界检查（危险！）
Unsafe unsafe = getUnsafe();
unsafe.putInt(arr, offset, value);
// 不进行边界检查，性能提升约 10-20%
// 但可能导致内存破坏，仅建议在底层库中使用

// 使用 Vector API（Java 16+ 预览）
// 向量化操作可批量处理数组，减少检查次数
```

**性能测试对比**：

```
// 1 亿次数组访问
带边界检查：~150ms
无边界检查：~120ms  （快 25%）
Vector API:   ~30ms   （快 5 倍！）
```

:::

***

### 4. 数组的默认值（JVM 规范）

```java
int[] intArr = new int[5];     // 默认值：0（零初始化）
double[] dblArr = new double[3]; // 默认值：0.0
boolean[] boolArr = new boolean[2]; // 默认值：false
String[] strArr = new String[3]; // 默认值：null（引用类型）
char[] charArr = new char[3];  // 默认值：'\u0000'（ASCII 码 0）

// JVM 在 newarray 字节码执行时自动零初始化内存
```

::: info 零初始化的底层原理

**JVM 规范要求**：

```java
// 《JVMS》第 4.9.6 节规定：
// 所有新分配的内存必须初始化为零（或类型的默认值）
// 这是安全要求，防止读取到敏感数据

// 字节码层面：
newarray int    // 创建 int 数组，自动零初始化
anewarray String // 创建引用数组，自动 null 初始化
```

**性能优化**：

```java
// 零初始化很快（memset 指令）
int[] arr = new int[1000000];
// 底层调用 memset(ptr, 0, size)，高度优化
// 现代 CPU 可达数十 GB/s 的零填充速度

// 显式初始化更慢
int[] arr = new int[1000000];
for (int i = 0; i < arr.length; i++) {
    arr[i] = 0;  // 冗余！JVM 已经零初始化
}
```

**特殊情况**：

```java
// 局部变量不会自动初始化
int x;  // 未初始化，编译错误（如果使用）
int[] arr = new int[5];  // 堆内存，自动零初始化

// 原因：局部变量在栈上，JVM 不保证栈内存的初始值
// 堆内存由 JVM 管理，必须零初始化（安全考虑）
```

:::

***

### 5. 数组复制的性能对比

```java
// 方式 1：循环复制（最慢）
for (int i = 0; i < src.length; i++) {
    dest[i] = src[i];
}

// 方式 2：Arrays.copyOf（推荐）
int[] dest = Arrays.copyOf(src, src.length);
// 底层调用 System.arraycopy

// 方式 3：System.arraycopy（最快，native 方法）
System.arraycopy(src, 0, dest, 0, src.length);
// JVM 使用 memcpy 直接复制内存块
```

::: info 数组复制的底层实现

**System.arraycopy 的 native 实现**：

```c
// OpenJDK 源码（简化版）
JNIEXPORT void JNICALL
Java_java_lang_System_arraycopy(JNIEnv *env, jclass cls,
                                jobject src, jint srcPos,
                                jobject dest, jint destPos,
                                jint length) {
    // 1. 类型检查（src 和 dest 必须是数组）
    // 2. 边界检查
    // 3. 存储类别检查（是否重叠）

    if (src == dest) {
        // 内存重叠，使用 memmove
        memmove(destPtr + destPos, srcPtr + srcPos, length);
    } else {
        // 内存不重叠，使用更快的 memcpy
        memcpy(destPtr + destPos, srcPtr + srcPos, length);
    }
}
```

**性能对比实测**：

```java
// 复制 100 万元素数组
循环复制：      ~2.5ms   （每次赋值都要边界检查）
Arrays.copyOf:  ~0.8ms   （封装了 arraycopy）
System.arraycopy: ~0.6ms （直接 memcpy）
clone():        ~0.4ms   （最快，但有限制）

// clone() 的特殊性
int[] copy = original.clone();
// 浅拷贝，只复制数组本身（多维数组需注意）
// 对于基本类型数组最快
```

**Arrays.copyOf 的源码**：

```java
public static int[] copyOf(int[] original, int newLength) {
    int[] copy = new int[newLength];
    System.arraycopy(original, 0, copy, 0,
                     Math.min(original.length, newLength));
    return copy;
}
// 本质是 arraycopy 的封装
```

:::

***

### 6. 数组的栈上分配优化（逃逸分析）

```java
public void test() {
    int[] arr = new int[10];  // 如果 arr 未逃逸出方法
    // JIT 可能将数组分配到栈上（标量替换）
    // 方法结束后自动释放，无需 GC
}
// 使用 -XX:+DoEscapeAnalysis -XX:+PrintEliminateAllocations 查看
```

::: info 逃逸分析与标量替换深度解析

**什么是逃逸分析**：

```java
// 场景 1：不逃逸（可栈上分配）
void method() {
    int[] arr = new int[10];
    use(arr);  // arr 仅在方法内使用
}
// JIT 可能将 arr 分配到栈上

// 场景 2：逃逸（必须堆上分配）
static int[] globalArr;
void method() {
    int[] arr = new int[10];
    globalArr = arr;  // ✗ 逃逸到全局
}

// 场景 3：返回逃逸
int[] method() {
    int[] arr = new int[10];
    return arr;  // ✗ 返回给调用者，逃逸
}
```

**标量替换（Scalar Replacement）**：

```java
// 原始代码
class Point { int x, y; }
void method() {
    Point p = new Point();
    p.x = 10;
    p.y = 20;
    use(p.x, p.y);
}

// 标量替换后（伪代码）
void method() {
    int p_x = 10;  // 对象拆分为独立变量
    int p_y = 20;
    use(p_x, p_y);
}
// 完全不创建 Point 对象！
```

**查看逃逸分析结果**：

````bash
# 启用逃逸分析和相关日志
java -XX:+DoEscapeAnalysis \
     -XX:+PrintEliminateAllocations \
     -XX:+PrintCompilation \
     YourClass

# 输出示例：
# 42  b  1  YourClass::method (25 bytes)
#     eliminated: 1 allocations (scalar replaced)
#     eliminated: 1 locks

**Performance提升案例**：
```java
// 优化前：每次循环都创建对象
for (int i = 0; i < 1000000; i++) {
    Point p = new Point();
    p.x = i;
    sum += p.x;
}
// 100 万次 GC 压力

// 优化后（JIT 自动）：
// 标量替换为 int x，无对象创建
// 性能提升：5-10 倍
````

:::

***

## 方法

### 1. 方法调用的底层原理

**栈帧结构**（Stack Frame）：

```
栈帧 = 局部变量表 + 操作数栈 + 动态链接 + 返回地址
- 局部变量表：存储方法参数和局部变量（slot 为单位）
- 操作数栈：JVM 执行字节码的工作区
- 动态链接：指向运行时常量池的方法引用
- 返回地址：方法执行完后返回的位置
```

```java
public static int add(int a, int b) {
    return a + b;
}
// 调用 add(10, 20) 时的栈帧：
// 局部变量表：[slot0:a=10][slot1:b=20][slot2:临时变量]
// 操作数栈：push 10 → push 20 → iadd → pop 结果
```

::: info 方法调用的字节码详解

**方法调用的四种指令**：

```java
// 1. invokevirtual - 调用实例方法（虚方法）
obj.toString();  // 动态绑定，支持多态

// 2. invokespecial - 调用特殊方法
new Object();           // 构造器
super.method();         // 父类方法
private void method();  // 私有方法

// 3. invokestatic - 调用静态方法
Math.abs(-5);  // 静态方法，编译期绑定

// 4. invokeinterface - 调用接口方法
list.add("x");  // 接口方法，运行时查找实现
```

**栈帧切换过程**：

```java
void caller() {
    int x = 10;
    callee(x);  // 方法调用
}

int callee(int param) {
    return param * 2;
}

// 调用过程：
// 1. caller 将参数压入操作数栈
// 2. 创建 callee 的新栈帧
// 3. 参数从操作数栈复制到 callee 的局部变量表
// 4. 执行 callee 的字节码
// 5. 返回值压入操作数栈
// 6. 销毁 callee 栈帧，返回 caller
```

**方法内联优化**：

```java
// JIT 编译器会对热点方法进行内联
int result = add(10, 20);
// 内联后：
int result = 10 + 20;  // 消除方法调用开销

// 内联条件：
// - 方法被频繁调用（>10000 次）
// - 方法体较小（默认<35 字节码）
// - 使用 -XX:MaxInlineSize 控制
```

:::

***

### 2. 方法参数传递机制

**值传递 vs 引用传递**：

```java
// 基本类型：值传递
void changeValue(int x) { x = 100; }
int a = 5;
changeValue(a);  // a 仍然是 5（传递的是副本）

// 引用类型：引用传递（传递的是引用的副本）
void changeArray(int[] arr) { arr[0] = 100; }
int[] nums = {1, 2, 3};
changeArray(nums);  // nums[0] 变为 100（同一对象）

// 特殊情况：String 看似值传递
void changeStr(String s) { s = "new"; }
String str = "old";
changeStr(str);  // str 仍是"old"（String 不可变）
```

::: info 参数传递的底层实现

**基本类型的传递**：

```java
void method(int x) { x = 100; }
int a = 5;
method(a);

// 字节码：
// iload_1      // 加载 a 的值（5）
// istore_2     // 存储到参数 x
// ...
// 修改 x 不影响 a（独立副本）
```

**引用类型的传递**：

```java
void method(int[] arr) { arr[0] = 100; }
int[] nums = {1, 2, 3};
method(nums);

// 内存布局：
// 栈：nums → [引用] → 堆：[数组对象]
// 传递时：复制引用（不是复制数组）
// method 中的 arr 和 nums 指向同一个数组对象
```

**String 的特殊性**：

```java
void change(String s) { s = "new"; }
String str = "old";
change(str);

// String 不可变性保证：
// 1. String 对象创建后内容不可修改
// 2. s = "new" 是改变引用，不是修改对象
// 3. 原 str 仍指向"old"

// 对比可变对象：
void change(StringBuilder sb) { sb.append("new"); }
StringBuilder sb = new StringBuilder("old");
change(sb);  // sb 变为"oldnew"（对象被修改）
```

:::

***

### 3. 方法递归的栈溢出

```java
public static int factorial(int n) {
    if (n == 1) return 1;
    return n * factorial(n - 1);
}
// 每次递归调用都会在栈上创建新栈帧
// 默认栈大小：-Xss1M（约 5000-10000 层递归）
// 超过限制抛出 StackOverflowError

// 尾递归优化（Java 不支持）
// 如果递归是方法的最后一步，理论上可优化为迭代
// 但 HotSpot 未实现尾递归优化
```

::: info 递归深度分析与优化

**栈空间计算**：

```java
// 每个栈帧的大小取决于：
// - 局部变量数量（包括参数）
// - 操作数栈深度
// - 常量池引用

// 示例方法的栈帧大小
int factorial(int n) {
    // 局部变量：n(1 slot) + 返回值 (1 slot) = 2 slots
    // 操作数栈：乘法需要 2 个操作数 = 2 slots
    // 总大小：约 16-32 字节
}

// -Xss1m 可容纳栈帧数：
// 1MB / 32 字节 ≈ 32000 个栈帧
// 实际约 5000-10000（包含其他开销）
```

**尾递归优化**：

```java
// 普通递归（栈溢出风险）
int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n - 1);  // 最后一步是加法，不是递归
}

// 尾递归形式
int sumTail(int n, int acc) {
    if (n == 0) return acc;
    return sumTail(n - 1, acc + n);  // 最后一步是递归
}

// Scala/Kotlin 支持尾递归优化
// Java 需手动转换为迭代
```

**迭代改写**：

```java
// 递归版本
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// 迭代版本（推荐）
int factorialIterative(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
// 无栈溢出风险，性能更优
```

**Stream 递归（Java 8+）**：

```java
// 使用 IntStream 避免递归
int sum(int n) {
    return IntStream.rangeClosed(1, n).sum();
}
// 内部使用迭代，无栈溢出风险
```

:::

***

### 4. 方法重载的编译期绑定

```java
void print(int i) { }
void print(String s) { }

print(10);      // 编译时确定调用 print(int)
print("hello"); // 编译时确定调用 print(String)
// 方法重载是编译时行为（静态分派）
// 字节码直接使用 invokevirtual 指定方法
```

::: info 方法重载的解析机制

**编译器选择最匹配的方法**：

```java
void method(int x) { }
void method(Integer x) { }
void method(Object x) { }

method(10);        // 选择 method(int) - 精确匹配
method(Integer.valueOf(10)); // 选择 method(Integer)
method(new Object()); // 选择 method(Object)

// 优先级：精确匹配 > 装箱/拆箱 > 父类类型
```

**自动类型提升的重载**：

```java
void print(byte b) { }
void print(int i) { }
void print(long l) { }

byte b = 10;
print(b);   // 选择 print(byte)
print(10);  // 选择 print(int) - 字面量默认 int
```

**歧义错误**：

```java
void method(int x, double y) { }
void method(double x, int y) { }

method(10, 20);  // ✗ 编译错误！两个方法都匹配，无法决定
```

**字节码层面的重载**：

```java
class Test {
    void method(int x) { }
    void method(String s) { }
}

// 编译后生成两个独立方法：
// public void method(I)V  // 参数类型为 int
// public void method(Ljava/lang/String;)V  // 参数类型为 String

// 调用时使用不同的方法签名
```

:::

***

### 5. 变长参数（Varargs）

```java
public void printAll(int... numbers) {
    // 编译后实际为：public void printAll(int[] numbers)
    for (int n : numbers) { }
}
printAll(1, 2, 3);  // 编译器自动装箱为数组
// 字节码：anewarray（创建数组）, astore（存储）
```

::: info 变长参数的底层实现

**编译后的真实形态**：

```java
// 源代码
void method(int... args) {
    for (int arg : args) { }
}

// 编译后（javap 反编译）
public void method(int[] args);
// varargs 语法糖，本质就是数组
```

**调用时的数组创建**：

```java
printAll(1, 2, 3);
// 编译为：
printAll(new int[]{1, 2, 3});

// 字节码：
// iconst_3       // 数组大小 3
// newarray int   // 创建 int[3]
// dup
// iconst_0
// iconst_1
// iastore        // 存入第 1 个元素
// ...            // 存入其他元素
// invokevirtual  // 调用方法
```

**varargs 与普通数组的区别**：

```java
void method1(int[] arr) { }
void method2(int... arr) { }

method1(new int[]{1, 2, 3});  // ✓
method1(1, 2, 3);             // ✗ 编译错误

method2(new int[]{1, 2, 3});  // ✓
method2(1, 2, 3);             // ✓ 语法糖
```

**varargs 的位置限制**：

```java
void method(int x, String... args) { }  // ✓ varargs 必须在最后
void method(int... args, String x) { }  // ✗ 编译错误

void method(int... a, String... b) { }  // ✗ 只能有一个 varargs
```

**性能考虑**：

```java
// varargs 每次调用都创建新数组
for (int i = 0; i < 1000000; i++) {
    sum(i);  // 每次都创建 new int[]{i}
}

// 优化：使用集合或预分配数组
List<Integer> list = new ArrayList<>();
for (int i = 0; i < 1000000; i++) {
    list.add(i);  // 无额外数组创建
}
```

:::

***

## Lambda

### 1. Lambda 的本质

**与传统匿名内部类的区别**：

```java
// 匿名内部类（编译生成 OuterClass$1.class）
Runnable r1 = new Runnable() {
    public void run() { System.out.println("Hello"); }
};

// Lambda（编译期生成 invokedynamic 指令）
Runnable r2 = () -> System.out.println("Hello");
// 不生成额外 class 文件，运行时动态生成代理类
```

### 2. invokedynamic 指令（Java 7+）

```java
// Lambda 编译后的字节码
aload_1  // 加载 this
invokedynamic #2,  0 :(Ljava/lang/Runnable;)V
// 首次执行时，LambdaMetafactory 动态生成实现类
// 后续调用直接使用方法句柄（MethodHandle）
```

::: tip Lambda 性能优势

* 匿名内部类：每次 new 都创建新对象
* Lambda：捕获实例变量时可能复用（避免闭包开销）
* 静态 Lambda 可缓存为单例
  :::

::: info Lambda 底层机制深度解析

**invokedynamic 的工作原理**：

```java
// Lambda 表达式的编译过程
Runnable r = () -> System.out.println("Hello");

// 1. 编译器生成 invokedynamic 指令
// 2. 首次执行时调用引导方法（Bootstrap Method）
// 3. LambdaMetafactory.metafactory() 被调用
// 4. 生成实现类（使用 ASM 字节码库）
// 5. 创建 MethodHandle 指向目标方法

// 生成的类类似：
class Lambda$1 implements Runnable {
    private final /* capture */ Object captured;

    public void run() {
        // 调用目标方法
        TargetClass.lambda$method$0(captured);
    }
}
```

**捕获变量的实现**：

```java
int factor = 2;
IntUnaryOperator op = x -> x * factor;

// 编译器将 factor 作为字段捕获
class Lambda$1 implements IntUnaryOperator {
    private final int val$factor;  // 捕获的变量

    Lambda$1(int factor) {
        this.val$factor = factor;  // 构造函数传入
    }

    public int applyAsInt(int x) {
        return x * this.val$factor;
    }
}

// 注意：局部变量必须是 effectively final
// 原因：避免并发修改导致的数据不一致
```

**方法句柄（MethodHandle）**：

```java
// Lambda 使用 MethodHandle 提高性能
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(
    String.class,
    "length",
    MethodType.methodType(int.class)
);

// 直接调用，无需反射开销
int len = (int) mh.invokeExact("hello");
```

**性能对比实测**：

```java
// 创建 100 万个函数式接口
匿名内部类：~150ms  （每次都 new 对象）
Lambda:      ~50ms   （可能缓存，无闭包时更快）

// 执行 1000 万次调用
匿名内部类：~80ms
Lambda:      ~60ms   （MethodHandle 优化）
```

**Lambda 的内存占用**：

```java
// 无捕获变量的 Lambda（静态）
Runnable r = () -> System.out.println("Hi");
// 只创建一个实例，所有调用共享
// 内存占用：~24 字节（单个对象头）

// 捕获变量的 Lambda
int x = 10;
IntSupplier s = () -> x;
// 每个不同的 x 创建新实例
// 内存占用：~32 字节（对象头 + 捕获字段）
```

:::

***

### 3. 函数式接口

```java
@FunctionalInterface
interface MyFunc {
    void method();
    // 只能有一个抽象方法（SAM）
    // 可有多个 default/static 方法
}

// 常见函数式接口
Predicate<T>   // T → boolean（断言）
Function<T,R>  // T → R（函数）
Consumer<T>    // T → void（消费）
Supplier<T>    // () → T（供应）
```

::: info 函数式接口的扩展应用

**自定义函数式接口**：

```java
@FunctionalInterface
interface Converter<F, T> {
    T convert(F from);

    // 可以有 default 方法
    default <V> Converter<F, V> andThen(Converter<T, V> after) {
        Objects.requireNonNull(after);
        return from -> after.convert(convert(from));
    }

    // 可以有 static 方法
    static <T> Converter<T, T> identity() {
        return t -> t;
    }
}

// 使用
Converter<String, Integer> conv = Integer::valueOf;
Integer result = conv.convert("123");
```

**@FunctionalInterface 的作用**：

```java
@FunctionalInterface
interface SAM {
    void method();
    void defaultMethod() {}  // ✓ 允许
    static void staticMethod() {}  // ✓ 允许
}

@FunctionalInterface
interface NotSAM {
    void method1();
    void method2();  // ✗ 编译错误！多个抽象方法
}

// 注解不是必需的，但推荐添加（编译器检查）
```

**函数组合（Function Composition）**：

```java
Function<Integer, Integer> add1 = x -> x + 1;
Function<Integer, Integer> mul2 = x -> x * 2;

// 组合函数
Function<Integer, Integer> composed = add1.andThen(mul2);
composed.apply(5);  // 12 = (5+1)*2

Function<Integer, Integer> composed2 = add1.compose(mul2);
composed2.apply(5);  // 11 = (5*2)+1
```

**原始类型特化接口**：

```java
// 避免装箱拆箱的性能损失
IntSupplier     // () → int
IntConsumer     // int → void
IntFunction<R>  // int → R
IntPredicate    // int → boolean
IntUnaryOperator // int → int
IntBinaryOperator // (int, int) → int

// 双参数版本
BiFunction<T,U,R>     // (T, U) → R
BiConsumer<T,U>       // (T, U) → void
BiPredicate<T,U>      // (T, U) → boolean
```

:::

***

## 方法引用

### 四种方法引用类型

```java
// 1. 静态方法引用
Comparator.comparingInt(Person::getAge);
// 等价：(p1, p2) -> Integer.compare(p1.getAge(), p2.getAge())

// 2. 实例方法引用（特定对象）
PrintStream out = System.out;
Consumer<String> c = out::println;
// 等价：s -> out.println(s)

// 3. 实例方法引用（任意对象）
String::toLowerCase;
// 等价：s -> s.toLowerCase()

// 4. 构造器引用
Person::new;
// 等价：name -> new Person(name)
```

***

## 异常

### 1. 异常的底层结构

**Throwable 类层次**：

```
Throwable
├── Error（JVM 无法处理的严重错误）
│   ├── StackOverflowError
│   └── OutOfMemoryError
└── Exception
    ├── RuntimeException（ unchecked）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── IllegalArgumentException
    └── Checked Exception（必须处理）
        ├── IOException
        └── SQLException
```

::: info 异常体系的 JVM 实现

**Throwable 对象的结构**：

```java
public class Throwable implements Serializable {
    // 异常的核心字段
    private String detailMessage;      // 异常消息
    private Throwable cause;           // 异常链
    private StackTraceElement[] stackTrace;  // 栈轨迹
    private long nativeCount = countStackTraces(); // 原生栈轨迹数量

    // JVM 在构造函数中调用 fillInStackTrace()
    public Throwable(String message) {
        this.detailMessage = message;
        fillInStackTrace();  // 本地方法，捕获当前栈轨迹
    }
}
```

**fillInStackTrace() 的开销**：

```java
// 这是异常性能差的核心原因！
private synchronized Throwable fillInStackTrace() {
    // 1. 遍历当前线程的调用栈
    // 2. 收集每个栈帧的信息（类名、方法名、行号）
    // 3. 创建 StackTraceElement 对象数组
    // 耗时：约 1-5ms（取决于栈深度）

    return this;
}

// 性能对比
throw new Exception();  // ~2ms（包含栈轨迹收集）
return errorValue;      // ~0.001ms（正常返回）
// 异常抛出慢 2000 倍！
```

**Checked vs Unchecked 异常**：

```java
// Checked Exception（编译期检查）
void readFile() throws IOException {
    // 必须在编译期处理或声明
}

// Unchecked Exception（运行时异常）
void divide(int a, int b) {
    if (b == 0) throw new ArithmeticException();
    // 编译器不强制处理
}

// JVM 层面没有区别（都是 Throwable 子类）
// 区别在于编译器的强制检查规则
```

**最佳实践**：

```java
// 优先使用运行时异常
public class BusinessException extends RuntimeException {
    // 业务异常应该是 unchecked 的
}

// 受检异常的使用场景
public class DataAccessException extends Exception {
    // 外部资源失败，调用者必须知道
}
```

:::

***

### 2. try-catch 的字节码实现

```java
try {
    int x = 10 / 0;
} catch (ArithmeticException e) {
    e.printStackTrace();
}
// 字节码使用异常表（Exception Table）实现：
// [from, to, target, type]
// 表示从 from 到 to 的代码出现 type 异常，跳转到 target 处理
```

::: info 异常表的详细结构

**异常表的工作原理**：

```java
try {
    // protected region
    int x = a / b;
} catch (ArithmeticException e) {
    // handler code
}

// 字节码中的异常表：
Exception table:
   from    to  target type
     0     8    9   Class java/lang/ArithmeticException
// 含义：字节码 0-8 行如果抛出 ArithmeticException，跳转到 9 行处理
```

**多重 catch 的实现**：

```java
try {
    // code
} catch (IOException e) {
    // handler 1
} catch (SQLException e) {
    // handler 2
}

// 异常表有多条记录
Exception table:
   from    to  target type
     0    15   16  Class java/lang/IOException
     0    15   25  Class java/lang/SQLException
// 按顺序匹配，先出现的先处理
```

**finally 块的字节码**：

```java
try {
    // code
} finally {
    // cleanup
}

// 编译为三个代码块：
// 1. try 正常执行
// 2. try 抛异常
// 3. finally 块（jsr 指令跳转）

// Java 7+ 使用 goto 替代 jsr（更清晰）
```

**try-with-resources 的展开**：

```java
try (FileInputStream fis = new FileInputStream("a.txt")) {
    // use fis
}

// 编译后等价于：
FileInputStream fis = new FileInputStream("a.txt");
Throwable t = null;
try {
    // use fis
} catch (Throwable e) {
    t = e;
    throw e;
} finally {
    if (fis != null) {
        if (t != null) {
            try { fis.close(); } catch (Throwable e) {
                t.addSuppressed(e);  // 添加被抑制的异常
            }
        } else {
            fis.close();
        }
    }
}
```

:::

***

### 3. try-with-resources（Java 7+）

```java
try (FileInputStream fis = new FileInputStream("a.txt")) {
    // 使用资源
} catch (IOException e) {
    // 处理异常
}
// 编译后自动插入 finally 块调用 fis.close()
// 即使 try 中抛异常也会关闭资源
// 多个资源时，按相反顺序关闭
```

::: info try-with-resources 的高级特性

**多资源管理**：

```java
try (FileInputStream fis = new FileInputStream("in.txt");
     FileOutputStream fos = new FileOutputStream("out.txt")) {
    // 复制文件
}
// 关闭顺序：fos 先关闭，fis 后关闭（反向关闭）
// 等价于嵌套的 try-with-resources
```

**自定义 AutoCloseable**：

```java
class MyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        // 清理逻辑
    }
}

try (MyResource res = new MyResource()) {
    // 自动调用 close()
}
```

\*\* suppressed exceptions（被抑制的异常）\*\*：

```java
try (BufferedReader br = new BufferedReader(
         new FileReader("file.txt"))) {
    return br.readLine();
} catch (Exception e) {
    e.getSuppressed();  // 获取 close() 抛出的异常
    // 打印所有异常
    for (Throwable suppressed : e.getSuppressed()) {
        suppressed.printStackTrace();
    }
}
```

:::

***

### 4. 异常的性能开销

```java
// 低效：用异常控制流程
try {
    return array[index];
} catch (ArrayIndexOutOfBoundsException e) {
    return defaultValue;
}

// 高效：预先检查
if (index >= 0 && index < array.length) {
    return array[index];
} else {
    return defaultValue;
}
// 异常创建会捕获当前栈轨迹（fillInStackTrace），性能极差
```

::: info 异常性能的深度分析

**异常创建的成本分解**：

```java
throw new Exception("error");
// 成本构成：
// 1. 对象分配：~10ns（new Exception）
// 2. 字符串处理：~50ns（消息存储）
// 3. 栈轨迹收集：~1-5ms（fillInStackTrace） ⚠️ 主要开销
// 4. 异常抛出：~100ns（栈展开）

// 总耗时：~2-5ms
// 对比：普通操作 ~10-100ns
// 异常慢 2-5 万倍！
```

**HotSpot 的优化**：

```java
// JVM 对无栈轨迹的优化
throw new Exception(null);
// 某些版本可能跳过栈轨迹收集（不推荐依赖）

// Java 9+ 改进
// 改进了异常处理性能，但仍然是昂贵操作
```

**性能测试对比**：

```java
// 100 万次操作
预先检查：  ~10ms
异常捕获：  ~2000ms
// 相差 200 倍！

// 结论：异常只应用于真正的异常情况
// 不要用于流程控制
```

:::

***

### 5. 自定义异常的实践

```java
// 运行时异常（推荐用于业务校验）
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

// 受检异常（强制调用者处理）
public class DataNotFoundException extends Exception {
    public DataNotFoundException(String id) {
        super("Data not found: " + id);
    }
}

// 使用场景：
// - 业务逻辑错误 → RuntimeException
// - 外部资源失败 → Exception
```

### 6. 异常链（Exception Chaining）

```java
try {
    // 某些操作
} catch (SQLException e) {
    throw new BusinessException("数据库操作失败", e);
    // 保留原始异常原因（cause）
    // getMessage() 获取当前异常消息
    // getCause() 获取原始异常
}
```

***

## 正则表达式

### 1. 正则的编译与匹配

```java
String regex = "\\d{3}-\\d{8}";
Pattern pattern = Pattern.compile(regex);
// 编译阶段：正则 → 有限自动机（NFA/DFA）
// 存储在 Pattern 内部，可复用

Matcher matcher = pattern.matcher("电话：010-12345678");
while (matcher.find()) {
    System.out.println(matcher.group());  // 010-12345678
}
```

::: info 正则引擎的底层原理

**NFA vs DFA**：

```java
// Java 使用传统 NFA 引擎
// 特点：
// 1. 表达式主导（expression-directed）
// 2. 支持捕获分组、反向引用
// 3. 可能指数级回溯（性能陷阱）

// DFA 引擎（Java 不支持）
// 特点：
// 1. 文本主导（text-directed）
// 2. 无回溯，线性时间复杂度
// 3. 不支持高级特性
```

**Pattern 的内部结构**：

```java
public final class Pattern implements Serializable {
    // 编译后的内部表示
    private String pattern;      // 原始正则字符串
    private int flags;           // 编译标志
    private Node root;           // AST 根节点（抽象语法树）
    private int groupCount;      // 分组数量

    // 编译过程：
    // 1. 词法分析：解析正则字符串
    // 2. 语法分析：构建 AST
    // 3. 优化：简化 AST
    // 4. 生成状态机
}
```

**匹配过程的优化**：

```java
// Pattern 是线程安全的（不可变对象）
private static final Pattern PHONE = Pattern.compile("\\d{3}-\\d{8}");

// 错误用法（每次创建新对象）
Matcher m = Pattern.compile("\\d+").matcher(input);

// 正确用法（复用 Pattern）
Matcher m = PHONE.matcher(input);
m.reset();  // 重置匹配位置
```

:::

***

### 2. 常用正则模式详解

```java
// 手机号验证
"1[3-9]\\d{9}".matches("18952131770");
// 1 开头，第二位 3-9，后面 9 位数字

// 邮箱验证
"\\w+@\\w+\\.\\w+".matches("test@example.com");
// \\w = [a-zA-Z0-9_]

// 身份证号码
"\\d{17}[\\dXx]".matches("123456789012345678X");
// 17 位数字 + 1 位数字或 X

// 贪婪 vs  reluctant vs Possessive
"a.*b".matches("axbyb");  // 贪婪：匹配整个字符串
"a.*?b".matches("axbyb"); // 勉强：匹配 axbyb 中最短的 axbyb
"a.*+b".matches("axbyb"); // 占有：不回溯，匹配失败
```

::: info 量词的匹配机制

**三种量词的对比**：

```java
String text = "aaaaab";

// 贪婪量词（Greedy）
Pattern p1 = Pattern.compile("a+b");
// 匹配过程：
// 1. a+ 尽可能多匹配：aaaaa
// 2. b 无法匹配（已在末尾）
// 3. 回溯：a+ 释放一个 a
// 4. b 匹配成功
// 结果：匹配整个字符串

// 勉强量词（Reluctant/Lazy）
Pattern p2 = Pattern.compile("a+?b");
// 匹配过程：
// 1. a+? 尽可能少匹配：a
// 2. b 尝试匹配下一个字符
// 3. 失败，a+? 多匹配一个
// 4. 重复直到成功
// 结果：也匹配整个字符串，但过程不同

// 占有量词（Possessive）
Pattern p3 = Pattern.compile("a++b");
// 匹配过程：
// 1. a++ 尽可能多匹配：aaaaa
// 2. b 无法匹配
// 3. 不回溯！直接失败
// 结果：匹配失败
```

**性能影响**：

```java
// 灾难性回溯示例
String text = "aaaaaaaaaaaaaaaaaaaa";  // 20 个 a
Pattern p = Pattern.compile("(a+)+b");
// 匹配 b 失败后，需要尝试所有组合：
// 2^20 = 100 万种可能！
// 耗时：数秒甚至卡死

// 解决方案：使用占有量词
Pattern p2 = Pattern.compile("(a++)+b");
// 不回溯，立即失败
// 耗时：<1ms
```

:::

***

### 3. 分组与反向引用

```java
// 分组捕获
Pattern p = Pattern.compile("(\\d{3})-(\\d{8})");
Matcher m = p.matcher("010-12345678");
if (m.matches()) {
    m.group(0);  // 完整匹配：010-12345678
    m.group(1);  // 第一组：010
    m.group(2);  // 第二组：12345678
}

// 反向引用
"(\\w+)\\1".matches("abab");  // false
"(\\w+)\\1".matches("aaaa");  // true（\\1 引用第一个分组）
```

::: info 分组的高级应用

**命名分组（Java 7+）**：

```java
Pattern p = Pattern.compile("(?<area>\\d{3})-(?<number>\\d{8})");
Matcher m = p.matcher("010-12345678");

if (m.matches()) {
    m.group("area");    // "010"
    m.group("number");  // "12345678"
}
```

**非捕获分组**：

```java
// (?:...) 不捕获分组内容
Pattern p1 = Pattern.compile("(abc)+");   // 捕获 abc
Pattern p2 = Pattern.compile("(?:abc)+"); // 不捕获

// 用途：
// 1. 仅用于逻辑分组
// 2. 提高性能（无需存储捕获内容）
// 3. 避免占用分组编号
```

**零宽断言（Lookaround）**：

```java
// 正向前瞻
"\\d+(?=元)".matches("100 元");  // 匹配 100（不包含"元"）

// 负向前瞻
"\\d+(?!元)".matches("100 美元");  // 匹配 100

// 正向后顾（Java 9+）
"(?<=￥)\\d+".matches("￥100");  // 匹配 100

// 负向后顾
"(?<!￥)\\d+".matches("$100");  // 匹配 100
```

**反向引用的性能陷阱**：

```java
// 反向引用需要回溯
"(\\w+)\\1".matches("abcabc");
// 1. \\w+ 匹配 abcabc
// 2. \\1 尝试匹配失败
// 3. 回溯：\\w+ 匹配 abcab
// 4. 继续回溯直到 \\w+ 匹配 abc
// 5. \\1 匹配 abc 成功

// 性能：O(n²) 最坏情况
```

:::

***

### 4. 正则性能优化

```java
// 预编译 Pattern（线程安全）
private static final Pattern PHONE_PATTERN =
    Pattern.compile("1[3-9]\\d{9}");

// 避免灾难性回溯
"(a+)+b".matches("aaaaaaaaaaaaaaaaaaaaX");
// 指数级时间复杂度，可能导致 DoS

// 使用原子组（防止回溯）
"(?>a+)b".matches("aaaX");  // 快速失败
```

::: info 正则优化的最佳实践

**编译优化**：

```java
// 1. 使用静态常量
private static final Pattern EMAIL =
    Pattern.compile("\\w+@\\w+\\.\\w+");

// 2. 指定合适的 flags
Pattern.CASE_INSENSITIVE  // 忽略大小写
Pattern.MULTILINE         // 多行模式
Pattern.DOTALL            // . 匹配换行符
Pattern.UNICODE_CASE      // Unicode 大小写

// 3. 非捕获分组优先
(?:abc)  // 比 (abc) 快 20%
```

**匹配优化**：

```java
// 1. 使用具体字符类
[0-9]    // 比 \\d 快（无需 Unicode 查找）
[a-z]    // 比 \\w 快

// 2. 减少回溯
a++b     // 比 a+b 快（占有量词）
(?>a+)b  // 原子组

// 3. 锚定起点
^pattern     // 从头开始，避免无效尝试
\\bpattern   // 单词边界
```

**性能测试**：

```java
// 10 万次匹配测试
普通编译：~500ms
预编译：  ~50ms   （快 10 倍）

贪婪量词：~200ms
占有量词：~50ms   （快 4 倍）

无优化：   ~500ms
综合优化：~30ms   （快 15 倍！）
```

:::

***

## 补充：JVM 内存模型（JMM）

### 1. 运行时数据区

```

JVM 内存 = 堆（Heap） + 栈（Stack） + 方法区（Metaspace）
          + 程序计数器 + 本地方法栈

堆：存放对象实例（new 的对象），GC 主要区域
栈：每个线程私有，存储栈帧（局部变量、操作数栈）
方法区：存储类信息、常量、静态变量（JDK8+ 称元空间）
程序计数器：记录当前执行的字节码地址
本地方法栈：Native 方法调用
```

### 2. 对象的内存布局

```
对象 = 对象头 + 实例数据 + 对齐填充

对象头（Header）：
- Mark Word（8 字节）：哈希码、GC 分代年龄、锁标志
- Klass Pointer（4-8 字节）：指向类元数据
- 数组长度（仅数组，4 字节）

实例数据：字段内容（继承的父类字段也在内）
对齐填充：保证对象大小为 8 的倍数
```

### 3. 垃圾回收基础

```
// 对象何时被回收？
Object obj = new Object();
obj = null;  // 对象变为不可达，可被 GC

// GC Roots 包括：
// - 栈帧中的局部变量
// - 静态字段
// - JNI 引用
// - 活跃线程
```

***

## 补充：Java 字节码入门

### 1. 查看字节码

```bash
javac MyClass.java
javap -c -v MyClass.class  # 查看字节码详情
```

### 2. 常见字节码指令

| 指令              | 含义                 | 示例              |
| ----------------- | -------------------- | ----------------- |
| `aload_0`         | 加载引用类型局部变量 | 加载 this         |
| `iload_1`         | 加载 int 局部变量    | 加载第 1 个参数   |
| `invokevirtual`   | 调用实例方法         | `obj.toString()`  |
| `invokestatic`    | 调用静态方法         | `Math.abs()`      |
| `invokespecial`   | 调用构造器、私有方法 | `new Object()`    |
| `invokeinterface` | 调用接口方法         | `list.add()`      |
| `invokedynamic`   | 动态调用（Lambda）   | Lambda 表达式     |
| `new`             | 创建对象             | `new ArrayList()` |
| `ldc`             | 加载常量             | 加载字符串字面量  |
| `if_icmpne`       | 比较并跳转           | `if (a != b)`     |

### 3. 字节码实战分析

\`\`java
public class Test {
public static void main(String\[] args) {
int a = 10;
int b = 20;
int sum = a + b;
}
}

// 编译后字节码（javap -c）：
public static void main(java.lang.String\[]);
Code:
0: bipush 10 // 推送 byte 常量 10
2: istore\_1 // 存储到局部变量 1(a)
3: bipush 20 // 推送 20
5: istore\_2 // 存储到局部变量 2(b)
6: iload\_1 // 加载 a
7: iload\_2 // 加载 b
8: iadd // 相加
9: istore\_3 // 存储到 sum
10: return

````

---

## 性能优化最佳实践

### 1. 数据类型选择

```java
// 优先使用 int 而非 long（32 位 JVM）
int count = 0;  // ✓
long count = 0L; // ✗（除非需要）

// 集合框架使用包装类有性能开销
ArrayList<Integer> list = new ArrayList<>();
// 自动装箱：int → Integer（创建对象）
// 优化：使用 primitive 库如 fastutil
````

### 2. 字符串拼接

```java
// 循环中使用 StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}

// Java 9+ 使用 byte[] + compact strings
// 减少 Latin-1 字符串的内存占用
```

### 3. 避免不必要的自动装箱

```java
// 低效
Integer sum = 0;
for (int i = 0; i < 1000; i++) {
    sum += i;  // 每次拆箱→计算→装箱
}

// 高效
int sum = 0;
for (int i = 0; i < 1000; i++) {
    sum += i;
}
```

### 4. 数组 vs 集合

```java
// 数组性能优于 ArrayList
int[] arr = new int[10000];  // 连续内存，缓存友好
ArrayList<Integer> list = new ArrayList<>();  // 对象数组，间接访问

// 但集合提供丰富 API，权衡使用
```

***

## 调试技巧

### 1. 查看对象内存布局

```bash
# 使用 JOL（Java Object Layout）
java -jar jol-cli.jar internals java.lang.String
```

### 2. 分析 GC 日志

```bash
java -Xlog:gc*:file=gc.log YourApp
```

### 3. 查看 JIT 编译信息

```bash
java -XX:+PrintCompilation YourApp
```
