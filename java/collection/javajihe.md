---
url: /java/collection/javajihe.md
---
# 集合

## JVM 底层原理

**集合的内存模型**：

```java
List<String> list = new ArrayList<>();
// 栈内存：list 引用（4-8 字节）→ 指向堆内存
// 堆内存：ArrayList 对象（包含 elementData 数组引用）
//                    ↓
//              Object[] elementData（实际存储元素的数组）
//                         ↓
//              [null, null, null, ...]（初始容量 10）
// 添加元素时：
list.add("hello");
// 堆内存："hello"字符串对象 → elementData[0] 存储其引用
```

::: tip 核心要点

* 集合存储的是**对象的引用**（地址），而非对象本身
* 泛型在编译后会被**类型擦除**，运行时都是 `Object` 引用
* 基本类型会被**自动装箱**为包装类对象（产生额外开销）
  :::

## 集合分类体系

```
Collection 接口（单列集合）
├── List 接口（有序、可重复、有索引）
│   ├── ArrayList（动态数组，随机访问快）
│   ├── LinkedList（双向链表，增删快）
│   └── Vector（线程安全，已过时）
└── Set 接口（无序、不重复、无索引）
    ├── HashSet（哈希表实现）
    │   └── LinkedHashSet（维护插入顺序）
    └── TreeSet（红黑树实现，可排序）

Map 接口（双列集合）
├── HashMap（哈希表实现）
│   └── LinkedHashMap（维护插入顺序）
├── TreeMap（红黑树实现，可排序）
└── Hashtable（线程安全，已过时）
```

***

## Collection

### 常用方法的 JVM 实现

```java
Collection<String> c = new ArrayList<>();
c.add("hello");      // 调用 ArrayList.add()，可能触发扩容
c.remove("hello");   // 调用 equals() 比较，O(n) 时间复杂度
c.size();            // 直接返回 size 字段，O(1)
c.contains("hello"); // 遍历 + equals() 比较，O(n)
c.clear();           // 将所有元素设为 null（帮助 GC 回收）
c.toArray();         // 创建新数组，复制元素引用
```

::: warning 性能陷阱

```java
// 低效：每次 add 都可能扩容
ArrayList<String> list = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    list.add(String.valueOf(i));  // 频繁扩容，性能差
}

// 高效：预分配容量
ArrayList<String> list = new ArrayList<>(1000);
for (int i = 0; i < 1000; i++) {
    list.add(String.valueOf(i));  // 无扩容，性能优
}
```

:::

### 遍历方式的性能对比

#### 1. Iterator 迭代器（推荐）

```java
Iterator<String> it = c.iterator();
while(it.hasNext()){
    String ele = it.next();
    System.out.println(ele);
}
// JVM 底层：hasNext() 检查 cursor != size
//          next() 返回 elementData[cursor++]
// 时间复杂度：O(n)，空间复杂度：O(1)
```

#### 2. 增强 for 循环（推荐）

```java
for(String ele : c){
    System.out.println(ele);
}
// 编译后转换为 Iterator 实现
// 语法糖，性能与 Iterator 相同
```

#### 3. forEach + Lambda（Java 8+）

```java
c.forEach(s -> System.out.println(s));
// 方法引用优化
c.forEach(System.out::println);

// 底层实现：
// public default void forEach(Consumer<? super T> action) {
//     Objects.requireNonNull(action);
//     for (T t : this) {
//         action.accept(t);
//     }
// }
// 实际还是 Iterator 遍历，但支持并行流优化
```

::: tip 性能测试数据

```
10 万次遍历性能对比（单位：ms）：
- Iterator:        15ms
- 增强 for:        15ms（与 Iterator 相同）
- 普通 for (List): 12ms（随机访问优势）
- forEach Lambda:  18ms（略有函数调用开销）
```

:::

***

## list

### 常用方法的底层实现

```java
List<String> list = new ArrayList<>();
list.add("hello");       // ArrayList: O(1)，LinkedList: O(1)
list.add(2, "cd");       // ArrayList: O(n)（需移动元素）
                         // LinkedList: O(n)（需遍历到位置）
list.remove("hello");    // O(n)，遍历 + equals() 比较
list.remove(2);          // ArrayList: O(n)（系统.arraycopy 移动）
                         // LinkedList: O(n)（遍历 + 指针调整）
list.get(1);             // ArrayList: O(1)（数组下标访问）
                         // LinkedList: O(n)（需遍历）
list.set(3, "cdscv");    // ArrayList: O(1)
                         // LinkedList: O(n)
```

***

## arraylist

#### 1. 源码结构（JDK 8）

```java
public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, Serializable {
    private static final int DEFAULT_CAPACITY = 10;  // 默认容量
    private static final Object[] EMPTY_ELEMENTDATA = {};  // 空数组常量
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    transient Object[] elementData;  // 实际存储元素的数组（transient 防止序列化）
    private int size;  // 实际元素个数（非数组长度）

    // 构造器
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;  // 延迟初始化
    }

    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else {
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
}
```

#### 2. add 方法的扩容机制

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // 确保容量足够
    elementData[size++] = e;  // 存入元素，size 自增
    return true;
}

private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    ensureExplicitCapacity(minCapacity);
}

private void ensureExplicitCapacity(int minCapacity) {
    modCount++;  // 修改次数+1（fail-fast 机制）
    if (minCapacity - elementData.length > 0)  // 需要扩容
        grow(minCapacity);
}

private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);  // 扩容 1.5 倍（右移 1 位相当于除以 2）
    // 例如：10 → 15, 15 → 22, 22 → 33

    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);

    elementData = Arrays.copyOf(elementData, newCapacity);  // 数组复制
}
```

::: tip 扩容性能分析

```
假设初始容量 10，添加 100 个元素：
- 扩容次数：log₁.₅(100/10) ≈ 6 次
- 每次扩容都要复制数组，时间复杂度 O(n)
- 总复制元素数：10+15+22+33+50+75 = 205 次
- 平均每个元素被复制 2 次

结论：预估容量后初始化，避免扩容！
```

:::

#### 3. remove 方法的性能瓶颈

```java
public E remove(int index) {
    rangeCheck(index);  // 边界检查

    E oldValue = elementData(index);  // 获取原值

    int numMoved = size - index - 1;  // 计算需要移动的元素个数
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
        // 使用 JNI 的 memcpy 高效复制内存块

    elementData[--size] = null;  // 帮助 GC 回收（重要！）
    return oldValue;
}
```

::: warning 内存泄漏风险

```java
// 如果不将删除的位置设为 null
elementData[--size] = null;  // ← 这行很重要！

// 会导致：
// 1. 数组仍持有对象引用，GC 无法回收
// 2. 形成"过期引用"（loitering reference）
// 3. 长时间运行后可能 OOM
```

:::

#### 4. ArrayList 的内存布局

```java
ArrayList<Integer> list = new ArrayList<>(5);
// 堆内存布局：
// ArrayList 对象头（16 字节）
// + elementData 引用（8 字节）
// + size 字段（4 字节）
// + 填充对齐（4 字节）
// = 32 字节

// Object[] 数组：
// 数组对象头（16 字节）
// + 数组长度（4 字节）
// + 填充（4 字节）
// + 5 个引用（5×8 = 40 字节）
// = 64 字节

// Integer 对象（每个）：
// 对象头（16 字节）
// + int 值（4 字节）
// + 填充（4 字节）
// = 24 字节

// 总计：32 + 64 + 5×24 = 216 字节
// 而 int[] 只需：16 + 4 + 4 + 5×4 = 44 字节
// 相差近 5 倍！（自动装箱的代价）
```

***

### linkedlist

#### 1. 节点结构

```java
public class LinkedList<E> extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, Serializable {

    transient int size = 0;
    transient Node<E> first;  // 头节点指针
    transient Node<E> last;   // 尾节点指针

    private static class Node<E> {
        E item;      // 数据项
        Node<E> next; // 下一节点引用
        Node<E> prev; // 上一节点引用

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
}
```

#### 2. 内存占用分析

```java
LinkedList<Integer> list = new LinkedList<>();
list.add(1);
list.add(2);
list.add(3);

// 每个 Node 节点占用：
// 对象头（16 字节）
// + item 引用（8 字节）
// + next 引用（8 字节）
// + prev 引用（8 字节）
// + 填充（8 字节）
// = 48 字节/节点

// 加上 Integer 对象（24 字节/个）
// 总计：3×(48+24) = 216 字节
// 而 ArrayList 只需：64（数组）+ 3×24 = 136 字节

// 结论：LinkedList 内存开销更大！
```

#### 3. add 方法的指针操作

```java
public boolean add(E e) {
    linkLast(e);  // 链接到尾部
    return true;
}

void linkLast(E e) {
    final Node<E> l = last;  // 保存原尾节点
    final Node<E> newNode = new Node<>(l, e, null);  // 创建新节点
    last = newNode;  // 更新尾指针

    if (l == null)
        first = newNode;  // 如果是空列表
    else
        l.next = newNode;  // 原尾节点的 next 指向新节点

    size++;
    modCount++;
}
```

#### 4. get 方法的遍历优化

```java
public E get(int index) {
    checkElementIndex(index);  // 检查边界
    return node(index).item;  // 获取节点的数据
}

Node<E> node(int index) {
    if (index < (size >> 1)) {  // 如果在前半段
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;  // 从头开始遍历
        return x;
    } else {  // 如果在后半段
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;  // 从尾开始遍历
        return x;
    }
}
// 时间复杂度：O(n)，但比单向链表快一倍
```

#### 5. 队列和栈的实现

```java
// 队列（FIFO）
LinkedList<String> queue = new LinkedList<>();
queue.offer("A");  // 入队（等价于 addLast）
queue.offer("B");
queue.offer("C");
String first = queue.poll();  // 出队（等价于 removeFirst），返回"A"

// 栈（LIFO）
LinkedList<String> stack = new LinkedList<>();
stack.push("A");  // 压栈（等价于 addFirst）
stack.push("B");
stack.push("C");
String top = stack.pop();  // 弹栈（等价于 removeFirst），返回"C"

// 底层字节码：都是指针操作，O(1) 时间复杂度
```

::: tip 应用场景选择

```
使用 ArrayList 的场景：
✓ 读多写少（随机访问频繁）
✓ 数据量可预估
✓ 内存敏感

使用 LinkedList 的场景：
✓ 写多读少（频繁头尾增删）
✓ 实现队列/栈
✓ 不确定数据量
```

:::

***

## set

### 哈希值的底层原理

```java
// Object.hashCode() 的 native 实现（HotSpot JVM）
public native int hashCode();
// 默认根据对象内存地址计算（并非直接返回地址）
// 通过 hash code table 缓存提高性能

// String.hashCode() 公式
s = "abc";
hash = s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
     = 'a'*31^2 + 'b'*31^1 + 'c'*31^0
     = 97*961 + 98*31 + 99 = 96354

// 为什么是 31？
// 1. 质数，减少哈希冲突
// 2. 31*i = (i<<5) - i（位移优化，性能高）
// 3. 不会溢出（int 范围）
```

::: warning 哈希碰撞攻击

```java
// 可以构造大量哈希相同的字符串
"Aa".hashCode() == "BB".hashCode() == 2112
"AaAa".hashCode() == "BBBB".hashCode() == 65608
// DoS 攻击：让 HashMap 退化为链表/O(n) 性能
// 解决：HashMap 使用扰动函数 + 红黑树
```

:::

***

### hashset

#### 1. 底层结构（基于 HashMap）

```java
public class HashSet<E> extends AbstractSet<E> implements Set<E> {
    private transient HashMap<E,Object> map;
    private static final Object PRESENT = new Object();  // 虚拟占位对象

    public HashSet() {
        map = new HashMap<>();
    }

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;  // 利用 HashMap 的 key 去重
    }
}
// HashSet 本质是 HashMap 只使用 key，value 固定为 PRESENT
```

#### 2. HashMap 的哈希表结构（JDK 8）

```java
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // 16
static final float DEFAULT_LOAD_FACTOR = 0.75f;  // 加载因子
static final int TREEIFY_THRESHOLD = 8;  // 链表转红黑树阈值
static final int UNTREEIFY_THRESHOLD = 6;  // 红黑树转链表阈值
static final int MIN_TREEIFY_CAPACITY = 64;  // 最小树化容量

transient Node<K,V>[] table;  // 哈希桶数组

static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;  // 已计算的哈希值（避免重复计算）
    final K key;
    V value;
    Node<K,V> next;  // 链表下一节点

    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }
}
```

#### 3. put 方法的完整流程

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

// 扰动函数（减少哈希冲突）
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    // 高位异或低位，混合均匀，减少碰撞
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;

    // 1. 懒加载初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;

    // 2. 计算索引位置（& 代替 %，性能更高）
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);  // 无冲突，直接插入
    else {
        Node<K,V> e; K k;

        // 3. 检查是否与头节点冲突
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;  // key 已存在，e 指向该节点
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            // 4. 链表遍历
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);  // 挂到链表尾部
                    if (binCount >= TREEIFY_THRESHOLD - 1)  // 超过 8 个
                        treeifyBin(tab, hash);  // 树化
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;  // 找到相同 key
                p = e;
            }
        }

        if (e != null) {  // key 已存在
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;  // 覆盖旧值
            afterNodeAccess(e);
            return oldValue;
        }
    }

    ++modCount;
    if (++size > threshold)  // 超过阈值
        resize();  // 扩容
    afterNodeInsertion(evict);
    return null;
}
```

::: tip 哈希表性能关键

```
1. 扰动函数：hash ^ (hash >>> 16)
   - 混合高低位，减少碰撞
   - 即使 hashCode() 分布差，也能均匀分布

2. 索引计算：(n-1) & hash
   - 等价于 hash % n，但位运算更快
   - 要求 n 必须是 2 的幂（所以扩容总是 2 倍）

3. 树化条件：
   - 链表长度 ≥ 8
   - 数组长度 ≥ 64
   - 同时满足才树化（避免小数组浪费）
```

:::

#### 4. 扩容机制（resize）

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;

    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {  // 达到最大容量
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        newCap = oldCap << 1;  // 扩容 2 倍
        newThr = oldThr << 1;  // 阈值也 2 倍
    }
    // ... 初始化逻辑省略

    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];  // 创建新数组
    table = newTab;
    threshold = newThr;

    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;  // 帮助 GC

                if (e.next == null)  // 单节点，直接计算新位置
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)  // 红黑树
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else {  // 链表，需要重新拆分
                    Node<K,V> loHead = null, loTail = null;  // 低位链表
                    Node<K,V> hiHead = null, hiTail = null;  // 高位链表

                    do {
                        Node<K,V> next = e.next;
                        if ((e.hash & oldCap) == 0) {  // 判断高位是否为 0
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        } else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);

                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;  // 放在原位置
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;  // 放在 j+oldCap 位置
                    }
                }
            }
        }
    }
    return newTab;
}
```

::: tip 扩容优化亮点

```
JDK 8 的扩容优化：
1. 无需重新计算哈希！
   - 扩容后，元素要么在原位置，要么在"原位置+oldCap"
   - 通过 (e.hash & oldCap) == 0 判断，O(1) 确定新位置

2. 链表保持顺序
   - JDK 7 是头插法（并发会死循环）
   - JDK 8 改为尾插法（保持原顺序）

3. 红黑树保持平衡
   - 树节点会调用 split() 方法拆分
   - 可能退化为链表（如果元素变少）
```

:::

#### 5. 红黑树结构（TreeNode）

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
    TreeNode<K,V> parent;  // 父节点
    TreeNode<K,V> left;    // 左子节点
    TreeNode<K,V> right;   // 右子节点
    TreeNode<K,V> prev;    // 用于删除时辅助（双向链表）
    boolean red;           // 颜色标记

    // 红黑树规则：
    // 1. 每个节点是红色或黑色
    // 2. 根节点是黑色
    // 3. 叶子节点（null）是黑色
    // 4. 红色节点的子节点必须是黑色（不能有两个连续红节点）
    // 5. 从任一节点到叶子的所有路径包含相同数量的黑节点

    // 这些规则保证最长路径 ≤ 最短路径的 2 倍
    // 查找时间复杂度：O(log n)
}
```

***

### linkedhashset

**底层实现**：

```java
public class LinkedHashSet<E> extends HashSet<E> {
    public LinkedHashSet() {
        super(16, .75f, true);  // 调用 HashMap 的带 accessOrder 参数的构造器
    }
}

// 实际底层是 LinkedHashMap
public class LinkedHashMap<K,V> extends HashMap<K,V> {
    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;  // 前后指针（双链表）
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }

    transient LinkedHashMap.Entry<K,V> head;  // 头指针
    transient LinkedHashMap.Entry<K,V> tail;  // 尾指针

    // 插入时维护链表
    void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
        LinkedHashMap.Entry<K,V> last = tail;
        tail = p;
        if (last == null)
            head = p;
        else {
            p.before = last;
            last.after = p;
        }
    }
}
```

::: tip 内存开销

```
LinkedHashSet 比普通 HashSet 多：
- 每个 Entry 多 2 个引用（before, after）= 16 字节
- 维护链表的额外操作

优势：
✓ 迭代顺序可预测（插入顺序）
✓ 删除最近访问的元素（LRU 缓存基础）
```

:::

***

### treeset

#### 1. 底层结构（基于 TreeMap）

```java
public class TreeSet<E> extends AbstractSet<E> implements NavigableSet<E> {
    private transient TreeMap<E,Object> m;
    private static final Object PRESENT = new Object();

    public TreeSet() {
        m = new TreeMap<>();
    }

    public boolean add(E e) {
        return m.put(e, PRESENT) == null;
    }
}
```

#### 2. 红黑树的插入与平衡

```java
// 插入过程伪代码
void add(E element) {
    if (root == null) {
        root = new Node(element, BLACK);  // 根节点为黑色
        return;
    }

    Node parent = findParent(element);  // 找到父节点
    Node newNode = new Node(element, RED);  // 新节点为红色

    if (compare(element, parent) < 0)
        parent.left = newNode;
    else
        parent.right = newNode;

    fixAfterInsertion(newNode);  // 修复红黑树性质
}

// 修复红黑树（通过旋转和变色）
void fixAfterInsertion(Node x) {
    x.color = RED;  // 先设为红色

    while (x != null && x != root && x.parent.color == RED) {
        if (parentOf(x) == leftOf(grandparentOf(x))) {  // 父节点是左子
            Node y = rightOf(grandparentOf(x));  // 叔父节点

            if (colorOf(y) == RED) {  // Case 1: 叔父为红
                setColor(parentOf(x), BLACK);  // 父变黑
                setColor(y, BLACK);            // 叔变黑
                setColor(grandparentOf(x), RED); // 祖父变红
                x = grandparentOf(x);  // 上移，继续检查
            } else {
                if (x == rightOf(parentOf(x))) {  // Case 2: 当前节点是右子
                    x = parentOf(x);
                    rotateLeft(x);  // 左旋
                }
                // Case 3: 当前节点是左子
                setColor(parentOf(x), BLACK);
                setColor(grandparentOf(x), RED);
                rotateRight(grandparentOf(x));
            }
        } else {
            // 对称情况（略）
        }
    }
    root.color = BLACK;  // 根节点始终为黑
}
```

#### 3. 自定义排序规则

```java
// 方式一：Comparable（内部比较器）
public class Student implements Comparable<Student> {
    private String name;
    private int age;

    @Override
    public int compareTo(Student o) {
        // 返回值规则：
        // 正数：this > o
        // 负数：this < o
        // 0：this == o
        return this.age - o.age;  // 按年龄升序
        // return o.age - this.age;  // 降序
    }
}

// 方式二：Comparator（外部比较器）
TreeSet<Student> set = new TreeSet<>((o1, o2) -> {
    // 多级排序：先按成绩，再按年龄
    int result = Double.compare(o1.getScore(), o2.getScore());
    return result != 0 ? result : Integer.compare(o1.getAge(), o2.getAge());
});
```

::: warning 排序一致性

```java
// 错误示例：compareTo 与 equals 不一致
class Person implements Comparable<Person> {
    String id;
    String name;

    public int compareTo(Person o) {
        return this.id.compareTo(o.id);  // 按 id 排序
    }

    public boolean equals(Object o) {
        return this.name.equals(((Person)o).name);  // 按 name 判等
    }
}

// 问题：
// TreeSet 认为 id 不同就是不同元素（即使 name 相同）
// HashSet 认为 name 相同就是相同元素（即使 id 不同）
// 导致 set.contains() 行为不一致！

// 正确做法：
// compareTo 和 equals 使用相同的字段判断
```

:::

***

## collections

### 底层实现原理

```java
// 1. 批量添加（可变参数）
public static <T> boolean addAll(Collection<? super T> c, T... elements) {
    boolean result = false;
    for (T element : elements)
        result |= c.add(element);  // 逐个添加
    return result;
}

// 2. 归并排序（JDK 7 之前）
public static <T extends Comparable<? super T>> void sort(List<T> list) {
    Object[] a = list.toArray();
    Arrays.sort(a);  // 归并排序，O(n log n)
    ListIterator<T> i = list.listIterator();
    for (int j=0; j<a.length; j++) {
        i.next();
        i.set((T) a[j]);  // 放回原列表
    }
}

// JDK 8 改用 TimSort（归并 + 插入排序）
// 对部分有序的数组性能更好，O(n) ~ O(n log n)
```

### 线程安全的包装器

```java
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
// 底层：每个方法都加 synchronized 锁
// 性能较差，已被 CopyOnWriteArrayList 取代

Map<String,Integer> syncMap = Collections.synchronizedMap(new HashMap<>());
```

***

## 并发修改异常

### fail-fast 机制

```java
ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");

for (String s : list) {
    list.remove(s);  // 抛出 ConcurrentModificationException！
}

// 原因：
// 1. 创建迭代器时记录 expectedModCount = modCount
// 2. list.remove() 直接修改了 modCount++
// 3. 迭代器检查发现 modCount != expectedModCount
// 4. 抛出异常（快速失败）
```

### 正确的删除方式

```java
// ✓ 方式 1：Iterator.remove()
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (condition) {
        it.remove();  // 同步更新 expectedModCount
    }
}

// ✓ 方式 2：倒序 for 循环
for (int i = list.size() - 1; i >= 0; i--) {
    if (condition) {
        list.remove(i);  // 不影响前面的索引
    }
}

// ✓ 方式 3：Stream 过滤（Java 8+）
list = list.stream()
    .filter(s -> !condition)
    .collect(Collectors.toList());

// ✓ 方式 4：removeIf（Java 8+）
list.removeIf(s -> condition);  // 内部优化，性能最好
```

***

## map

### hashmap

```java
// HashSet 源码
public class HashSet<E> {
    private HashMap<E,Object> map;
    private static final Object PRESENT = new Object();

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
}

// 结论：
// HashSet 本质是 HashMap 的特例
// 只使用 key（存储元素），value 固定为 PRESENT 占位
```

### HashMap 常用方法性能

```java
Map<String, Integer> map = new HashMap<>();
map.put("张三", 1);      // O(1) ~ O(log n)
map.get("张三");        // O(1) ~ O(log n)
map.remove("张三");     // O(1) ~ O(log n)
map.containsKey("张三"); // O(1) ~ O(log n)
map.size();            // O(1)
map.clear();           // O(n)，需要 help GC

// 最坏情况（哈希碰撞严重）：O(n)
// 最好情况（理想分布）：O(1)
```

### entrySet 的高效性

```java
// 低效：keySet + get
for (String key : map.keySet()) {
    Integer value = map.get(key);  // 二次哈希查找
    // 时间复杂度：O(n) × O(1) = O(n)
}

// 高效：entrySet
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();    // 直接获取
    Integer value = entry.getValue(); // 直接获取
    // 时间复杂度：O(n)，但常数更小
}

// 底层：entrySet 返回的是 HashMap 的内部视图
// 不需要额外创建对象，节省内存
```

***

## stream

### 1. Stream 的本质

```java
list.stream()
    .filter(s -> s.startsWith("张"))
    .filter(a -> a.length() == 3)
    .collect(Collectors.toList());

// 底层原理：
// 1. stream() 创建 Pipeline（流水线）
// 2. filter 是中间操作（lazy，不执行）
// 3. collect 是终止操作（触发执行）
// 4. 整个流水线一次性遍历（非多次遍历）

// 类似 Unix 管道：
// cat file | grep "张" | wc -c
```

### 2. 惰性求值（Lazy Evaluation）

```java
Stream<Integer> stream = list.stream()
    .filter(x -> {
        System.out.println("filter: " + x);
        return x > 5;
    });
// 此时什么都不发生！

stream.forEach(x -> System.out.println("forEach: " + x));
// 终止操作触发执行
// 输出：
// filter: 1
// filter: 6
// forEach: 6
// ...
```

### 3. 短路操作

```java
list.stream()
    .filter(s -> s.length() > 2)
    .findFirst();  // 找到第一个就停止（短路）

list.stream()
    .filter(s -> s.length() > 2)
    .anyMatch(s -> s.contains("张"));  // 有一个匹配就停止
```

### 4. parallelStream 并行流

```java
list.parallelStream()  // 使用 ForkJoinPool.commonPool()
    .filter(s -> s.length() > 2)
    .collect(Collectors.toList());

// 底层：
// 1. 数据分片（Spliterator）
// 2. 多线程处理（Fork/Join）
// 3. 结果合并

// 适用场景：
// ✓ 大数据量（>10000）
// ✓ CPU 密集型操作
// ✓ 无状态操作

// 不适用：
// ✗ 小数据量（线程切换开销）
// ✗ IO 密集型
// ✗ 有状态操作（如 sorted）
```

### 5. Collector 收集器原理

```java
// toList() 的实现
public static <T> Collector<T, ?, List<T>> toList() {
    return new CollectorImpl<>(
        (Supplier<List<T>>) ArrayList::new,  // 供应商：创建容器
        List::add,                           // 累加器：添加元素
        (left, right) -> {                   // 合并器：合并两个容器（并行用）
            left.addAll(right);
            return left;
        },
        CH_ID);                              // 特性标识
}

// groupingBy 分组
Map<Integer, List<Student>> byAge = students.stream()
    .collect(Collectors.groupingBy(Student::getAge));
// 底层：使用 HashMap 存储分组结果

// partitioningBy 分区（只有两组）
Map<Boolean, List<Student>> divided = students.stream()
    .collect(Collectors.partitioningBy(s -> s.getAge() > 18));
```

### 6. Stream 性能优化

```java
// 优化 1：避免 boxed（装箱）
IntStream.range(0, 1000)  // 基本类型流
    .filter(x -> x > 500)
    .sum();  // 无需装箱

// 而不是：
Stream.iterate(0, i -> i + 1)
    .limit(1000)
    .filter(x -> x > 500)
    .reduce(0, Integer::sum);  // 自动装箱，性能差

// 优化 2：使用 peek 调试
list.stream()
    .peek(s -> System.out.println("原始：" + s))
    .filter(s -> s.length() > 2)
    .peek(s -> System.out.println("过滤后：" + s))
    .collect(Collectors.toList());

// 优化 3：选择合适的数据源
// ArrayList > LinkedList > HashSet
// 因为 Spliterator 的特性不同
```

***

## 集合性能对比总结

| 集合类型   | 查询          | 插入          | 删除          | 内存占用 | 适用场景     |
| ---------- | ------------- | ------------- | ------------- | -------- | ------------ |
| ArrayList  | O(1)          | O(1)\*        | O(n)          | 低       | 读多写少     |
| LinkedList | O(n)          | O(1)          | O(1)          | 高       | 频繁头尾操作 |
| HashSet    | O(1)~O(log n) | O(1)~O(log n) | O(1)~O(log n) | 中       | 去重         |
| TreeSet    | O(log n)      | O(log n)      | O(log n)      | 中       | 排序         |
| HashMap    | O(1)~O(log n) | O(1)~O(log n) | O(1)~O(log n) | 中       | 键值对       |
| TreeMap    | O(log n)      | O(log n)      | O(log n)      | 中       | 排序键值对   |

\*摊销 O(1)，最坏 O(n)（扩容时）

***

## JVM 优化技巧

### 1. 集合初始化容量预估

```java
// 知道大概数量时，预先设置容量
List<String> list = new ArrayList<>(1000);
Map<String, Integer> map = new HashMap<>(1024);
Set<String> set = new HashSet<>(512);

// 避免频繁扩容的性能损耗
```

### 2. 使用基本类型集合（第三方库）

```java
// 原生 Java 会自动装箱，浪费内存
List<Integer> list = new ArrayList<>();  // 每个 Integer 24 字节

// 使用 fastutil 库
IntList list = new IntArrayList();  // 直接存 int，4 字节
// 节省 6 倍内存！
```

### 3. 数组 vs 集合

```java
// 性能敏感场景，优先用数组
int[] arr = new int[10000];  // 连续内存，CPU 缓存友好

// 集合的优势是 API 丰富，使用方便
```

### 4. 不可变集合（Java 9+）

```java
List<String> list = List.of("A", "B", "C");  // 不可变
// 底层：共享空数组，零拷贝
// 线程安全，内存紧凑
```

***

## 调试与分析工具

### 1. 查看集合内存占用

```bash
# 使用 JOL（Java Object Layout）
java -jar jol-cli.jar internals java.util.ArrayList
java -jar jol-cli.jar internals java.util.HashMap
```

### 2. 分析 GC 日志

```bash
java -Xlog:gc*:file=gc.log YourApp
# 观察集合导致的 GC 频率
```

### 3. 性能分析工具

```bash
# 使用 JMH 进行基准测试
@Benchmark
public void testArrayList() {
    List<Integer> list = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
        list.add(i);
    }
}
```

***

## 总结

本笔记深入解析 Java 集合框架的 JVM 底层原理：

1. **ArrayList**：动态数组，扩容 1.5 倍，随机访问 O(1)
2. **LinkedList**：双向链表，内存开销大，头尾操作 O(1)
3. **HashMap**：数组 + 链表 + 红黑树，扰动函数，2 倍扩容
4. **HashSet**：基于 HashMap 实现，只使用 key
5. **TreeSet/TreeMap**：红黑树，O(log n) 操作，可排序
6. **Stream**：惰性求值，流水线处理，支持并行
7. **并发修改**：fail-fast 机制，使用 Iterator.remove()
8. **性能优化**：预估容量、基本类型集合、不可变集合

**进阶建议**：

* 阅读《Effective Java》集合章节
* 研究 OpenJDK 源码（特别是 HashMap）
* 学习数据结构与算法基础
* 实践 JMH 性能测试
