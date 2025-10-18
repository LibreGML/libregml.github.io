---
url: /java/collection/javajihe.md
---
# 集合

底层原理:

在堆内存创建一个集合对象,把地址赋给变量,每次创建一个对象并 add 到集合里,实际都是把每一个对象在堆内存中的地址赋值给集合中的一个个位置.也就是,集合对象中存储的是元素的地址.

集合分类:

* 单列集合(一个值就是一个元素,以 Collection 为代表)
* 多列集合(键值对作为元素,以 Map 为代表)

## Collection

*Collection 接口分为:*

* List 接口(添加的元素有序,可重复,有索引),又分为
  * ArrayList
  * LinkedList
* Set 接口(元素无序,不重复,无索引),又分为
  * TreeSet (按照大小默认升序排序,不重复,无索引)
  * HashSet ,又有一个子类
    * LinkedHashSet (有序 不重复 无索引)

*Collection 方法*

```java
//常用方法
Collection<String> c = new ArrayList();//Collection是一个接口,不能new
Collection<String> c2 = new ArrayList();
c.add("hello"); //添加元素
c.remove("hello"); //删除元素
c.size(); //获取元素个数
c.contains("hello"); //判断集合中是否包含某个元素
c.clear(); //清空集合
c.isEmpty(); //判断集合是否为空,返回布尔值
c.toArray(); //将集合转换为数组
String arr[] = c.toArray(new String[c.size()]); //将集合转换为字符串数组
c.addAll(c2); //将c2集合的元素全部复制一份到c
```

*遍历集合方式:*

1. 迭代器(专门用来遍历集合 Iterator):
   `Iterator<String> it = c.iterator(); `获取 c 集合的迭代器,这时迭代器默认处于集合第一个元素位置.

```java
while(it.hasNext()){ //判断迭代器是否还有下一个元素
    String ele = it.next(); //获取迭代器下一个元素
    System.out.println(ele); //打印元素
}
```

2. 增强 for(集合,数组都能遍历)
   `for(元素数据类型 变量名:数组或集合名){}`

```java
for(String ele : c){
    System.out.println(ele);
}
```

3. Lambda

```java
Collection<String> c = new ArrayList(); //在c.add加一些数据

c.forEach(new Consumer<String>() {
    @Override
    public void accept(String s) {
        System.out.println(s);
    }
});
//简化成lambda,前后参数一致,用方法引用
c.forEach( s -> System.out.println(s));
//方法引用
c.forEach( System.out::println);

```

### List

1. 常用方法

```java
List<String> list = new ArrayList<>(); //可以选ArrayList和LinkedList
list.add("hello"); //添加元素
list.add(2, "cd"); //向某个位置添加元素
list.remove("hello"); //删除元素
list.remove(2); //删除指定索引的元素
list.get(1) //获取某个索引上的元素
list.set(3, "cdscv") //修改指定索引的元素,返回原来的元素
list.size(); //获取元素个数
list.contains("hello"); //判断集合中是否包含某个元素
list.clear(); //清空集合
list.isEmpty(); //判断集合是否为空,返回布尔值
list.toArray(); //将集合转换为数组
```

#### ArrayList

基于数组实现,查询快,增删慢,不适合大数据量,且增删频繁的

#### LinkedList

基于双链表实现,查询慢,增删快,适合大数据量,且增删频繁的

1. 单链表:
   链表中的每个节点是独立对象,在内存中是不连续的,每个节点由数据内容和下一个节点的地址组成.\
   第一个节点被称为头节点,这个头节点是应该被记住,找到他就能找到整个链表,下一个节点被创建的时候会把他自己在内存中的地址赋给头节点存地址的地方.以此类推,尾节点指向 null,表示结束.\
   A -> B -> C -> D\
   要在 BC 之间插入一个 E,要让 E 的下一个节点指向 C,让 B 的下一个节点指向 E.\
   A -> B -> E -> C -> D\
   要删除 E 和 D 之间的 C,要让 E 的下一个地址指向 D,然后直接把 C 删除就可以了

2. 双链表
   每个节点组成部分为: 上一个节点地址 + 数据内容 + 下一个节点地址 ,最后一个节点的下一个节点地址指向头节点,形成一个环状链
   A ⇆ B ⇆ C ⇆ D ⇆ E
   要删除 C,让 B 的一下个节点指向 D,让 D 的前一个地址指向 B,最后直接删了 C

LinkedList 常用方法:

```java
//常用方法
LinkedList<String> list = new LinkedList<>();
list.addFirst(E e) //在链表头部添加元素
list.addLast(E e) //在链表尾部添加元素
list.getFirst() //获取头部元素
list.getLast() //获取尾部元素
list.removeFirst() //删除头部元素
list.removeLast() //删除尾部元素
```

应用场景(实现队列 | |):
队列类似排队,先进先出,后进后出,两边都是口,上面是入口,下面是出口,上面进去排队然后再从下面出来. | |

```java
//虽然LinkedList上游是List,但List是没有首尾增删的方法的,这里不能用多态的写法.
LinkedList<String> list = new LinkedList<>();
list.addLast("1"); //排队从后面开始排,所以addLast
list.addLast("2");
list.addLast("3");
list.addLast("4");
list.addLast("5");
//出队
list.removeFirst(); //删除第一个人,第一个人出队了
list.removeFirst();  //第二个
... //以此类推

```

应用场景(实现栈):
栈类似弹夹,最后装得子弹第一个打出来,先装进去的子弹最后打出来 ,栈底部是封死的,只能从上面进来,也从上面出去,上面这个开头叫栈顶,下面封闭的叫栈底.最后压进去子弹是栈顶元素,最先压进去在栈底的那个叫栈底元素.数据子弹进入弹夹栈内称作压/进栈(push),数据子弹从弹夹栈打出来叫弹/出栈(pop).

```java
LinkedList<String> stack = new LinkedList<>();
stack.push("1"); //子弹从上面开始压,所以push,底层就是addFirst
stack.push("2");
stack.push("3");
stack.push("4");
stack.push("5");
//出栈 ,pop底层就是removeFirst();
stack.pop(); //删除第一个人,第一个人出栈了,也就是5
stack.pop();  //第二个 ,4
... //以此类推

```

### Set

哈希值:

* int 类型,每个对象都有一个哈希值
* 调用 object 类提供的 hashCode 方法可以返回该对象自己的哈希.`s1.hashCode()`
* 哈希可能重复,这是哈希碰撞,尤其是 String 类的 hashCode 方法,是由字符串代入特定公式计算得出哈希,所以可以设计出来哈希碰撞,比如 abc 和 acD 这俩字符串哈希就可能一样.

Set (无序,不重复,无索引):

* HashSet: 无序,不重复,无索引
  * LinkedHashSet: 有序,不重复,无索引
* TreeSet: 排序(默认升序),不重复,无索引

#### HashSet

基于哈希表,增删改查性能都好

1. JDK8 之前,哈希表 = 数组 + 链表 (每一个数组元素都可以形成一个链表)
2. JDK8 之后,哈希表 = 数组 + 链表 + 红黑树

* 哈希表:

1. 创建默认长度为 16 的数组,默认加载因子 0.75,数组名 table,16\*0.75 = 12,也就是一旦这个数组 12 个位都被占了,就会创建一个两倍于当前的数组,把数据转移到新数组中去.
2. 要存入一个数据,先使用这个数据的哈希值对数组长度求余,算出 0-15 的某一位,存入相应的数据.
3. 判断当前位置是否为 null,是则直接存入,如果不是 null,则调用 equals 方法,相等则不存,不相等,新元素则挂在那个位置老元素的下面,jdk8 之前是新元素占用老元素原本的位置,老元素挂在下面.如果挂在下面的这条链长度超过 8,且数组长度>=64,链表就会转换为红黑树.

* 树

1. 二叉树:
   二叉树每个节点都由四部分组成: 父节点地址 + 左节点地址 + 右节点地址 +数据内容\
   度: 每个节点的子节点数量,任意节点的度都<=2\
   树高: 树的总层数\
   根节点: 最顶层的节点\
   叶子节点: 没有子节点的节点

2. 二叉查找树:
   小的存左边,大的存右边,一样的不存,根节点的数是衡量大小的标准.

3. 平衡二叉树
   因为排序好的一组数,弄成二叉树会成一串链表,瘸子现象,性能差
   平衡二叉树: 在排序好的一组数找到中间那个作为根节点,这样左子树,右子树就相同了,每个节点的左右子树高度差不超过 1,就平衡了.

4. 红黑树:
   自动平衡的一种二叉树,由自动算法维护平衡,性能好

如果有两个不同的对象,但是内容一样,HashSet 无法去重,如果想要去重,要在这两个对象对应的那个类中重写 hashCode()和 equals()方法.在 IJ 可以直接重写

#### LinkedHashSet

有序,不重复,无索引,基于哈希表+双链表.\
每个元素都会记录前后元素的地址,也会有分别指向头节点和尾节点的指针.每个新元素添加时,都会先找到尾节点指针指向的元素,尾节点元素和新元素互相给对方地址,互相指向,然后尾节点指向新添加的那个元素.所以是有序的,但更占用内存.

#### TreeSet

不重复,无索引,可排序(从大到小,升序),底层用红黑树实现排序

```java
      Set<Integer> set = new TreeSet<>();
        set.add(10); //以第一个元素为红黑树根节点
        set.add(10); //看到一样的,直接舍弃
        set.add(12); //比10大,放在根节点右边
        set.add(11); //比10大,放在右边
        set.add(6); //放在左边,左子树
        set.add(5); //放在左边
        /*打印的时候直接从左边最小打印到右边最大,实现升序 */
```

数字,浮点按照大小,字符串按照首字母 ASCII 码,但如果是自定义对象,则默认无法排序,会报错,必须自定义排序规则,方法如下:

1. 方法一:
   让自定义类实现 Comparable 接口,重写 CompareTo 方法

```java
public class student implements Comparable<Student>{
    @Override
    public int compareTo(Student o) {
        //左边对象大于右边对象返回正整数
        //右边大于左边对象返回负整数
        //左右相等返回0
        return this.age - o.age; //按照年龄升序,this代表主调对象
    }
}

```

2. 方法二:
   调用 TreeSet 集合的有参构造器,设置 Comparator 对象(比较器对象)
   ```java
   Set<Student> student = new TreeSet<>((o1, o2) -> {
            Double.compare(o1.getScore(), o2.getScore()); //升序,如果要降序,调换一下o1,02位置
        });
   ```

如果两个方法同时都用了,那么会优先选择方法二,因为 TreeSet 会就近选择自己自带的比较器对象

### Collections

操作集合的工具类

```java
List<String> names = new ArrayList<>();
Collections.addAll(names, "张三", "李四", "王五"); //后面是可变参数,可以批量向集合添加元素.
Collections.sort(names); //对List升序排序
Collections.shuffle(names); //打乱List集合的元素顺序
//按照制定规则对集合元素排序
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String o1, String o2) {
        return o1.length() - o2.length(); //升序
    }
});

```

## 并发修改异常

遍历的同时删除元素,for 循环和迭代器可以解决,for 倒着遍历或者每次删除 i--,迭代器用自带的 remove 方法.但是增强 for 和 lambda 无解.

```java
Iterator<String> it = list.iterator();
while(it.hasNext()){
    String ele = it.next();
    if(ele.contains("李")){
        it.remove(); //删除迭代器当前遍历到的数据,每删除一个,迭代器就会 -- 往前退一袼,避免并发修改异常.
    }
}

```

## 可变参数

格式: `数据类型...变量名`

1. 一个形参列表,只能有一个可变参数
2. 可变参数必须放到形参列表最后面
3. 就是一个数组,可以用 for 遍历

```java
test();
test(10);
test(10,20,30,32,23);//传递多个数据
test(new int[]{10,20,30});//传递数组

//一个形参列表,只能有一个可变参数
public static void test(int...num){
    // 可变参数本质是一个数组
    sout(num.length)
    sout(Array.toString(num));
}
```

***

## Map

Map\<K,V>是一个接口,实现他的类如下:

1. HashMap: 基于哈希表实现,无序,不重复,无索引
2. LinkedHashMap: 基于哈希表+链表实现,有序,不重复,无索引
3. TreeMap: 基于红黑树实现,默认升序,不重复,无索引

*常用方法:*

```java
       Map<String, Integer> map = new HashMap<>();
        map.put("张三", 1);
        map.put("张三", 2);
        map.put("李四", 2);
        map.put("王五", 3);
        map.put(null, null);

        System.out.println(map.size()); // 获取集合大小
        System.out.println(map.isEmpty()); // 判断集合是否为空
        System.out.println(map.get("张三")); // 根据键获取值
        System.out.println(map.remove("王五")); // 根据键删除键值对，并返回值
        System.out.println(map.containsKey("张三")); // 判断集合是否包含指定键
        System.out.println(map.containsValue(2)); // 判断集合是否包含指定值
        Set<String> keys = map.keySet(); // 获取map集合全部键,返回Set类型集合
        Collection<Integer> list = map.values(); // 获取map集合所有值,返回Collections
        System.out.println(keys);
        System.out.println(list);

        Map<String, Integer> map2 = new HashMap<>();
        map2.put("cd", 2);
        map.putAll(map2); // 将map2集合中的键值对添加到map集合中
        System.out.println(map);
        map.clear(); // 清空集合
```

*遍历 Map 的方式:*

1. 先获取所有的键,再根据键获取值

```java
        Map<String, Integer> map = new HashMap<>();
        map.put("张三", 1);
        map.put("李四", 2);
        map.put("王五", 3);
        Set<String> keys = map.keySet();
        for (String key : keys) {
            Integer value = map.get(key);
            System.out.println(value);
        }
```

2. 先获取所有的键值对,再遍历键值对

```java
        Map<String, Integer> map = new HashMap<>();
        map.put("张三", 1);
        map.put("李四", 2);
        map.put("王五", 3);
        Set<Map.Entry<String, Integer>> entries = map.entrySet(); //map的entrySet方法将Map集合中的键值对转换成Set集合
        for (Map.Entry<String, Integer> entry : entries) {
            String key = entry.getKey(); // 获取键
            Integer value = entry.getValue(); // 获取值
            System.out.println(key + ":" + value); // 输出键值对
        }
```

3. forEach

```java
//这个forEach内部实际上调用的是map.entrySet,也就是上面第二种方法
map.forEach(new BiConsumer<String, Integer>() {
    @Override
    public void accept(String key, Integer value) {
        System.out.println(key + ":" + value);
    }
});
//Lambda简化后
       map.forEach((k, v) -> System.out.println(k + "+" + v));
```

### HashMap

实际上,Set 集合的底层就是基于 Map 的,不过他只要键,不要值,所以底层原理都一样,只不过这里是键值对存入一个 dentry 对象,作为一个元素,放在哈希表中的

### LinkedHashMap

LinkedHashSet 就是基于 LinkedHashMap 实现的,都基于双链表+哈希表

### TreeMap

TreeSet 就是基于 TreeMap 实现的,基于红黑树,如果键是数字,默认升序,想自定义排序规则,如下:

1. 让类实现 Comparable 接口,重写比较规则

```java
public class student implements Comparable<Student>{
    @Override
    public int compareTo(Student o) {
        //左边对象大于右边对象返回正整数
        //右边大于左边对象返回负整数
        //左右相等返回0
        return this.age - o.age; //按照年龄升序,this代表主调对象
    }
}

```

2. 调用 TreeMap 集合的有参构造器,设置 Comparator 对象(比较器对象)

```java
Set<Student> student = new TreeSet<>((o1, o2) -> Double.compare(o1.getScore(), o2.getScore()));//升序,如果要降序,调换一下o1,02位置
```

如果两个方法同时都用了,那么会优先选择方法二,因为 TreeSet 会就近选择自己自带的比较器对象

## Stream

```java
    List<String> list = new ArrayList<>();
    Collections.addAll(list, "张三丰", "刘翠华", "张翠山", "张三", "张天爱");
//list作为数据源,获取到他的Stream流,然后调用Stream流方法进行过滤,最后调用.collect把过滤后的元素收集起来放到List集合中
    List<String> lt = list.stream().filter(s -> s.startsWith("张")).filter(a -> a.length() == 3).collect(Collectors.toList());
    System.out.println(lt);
```

1. 获取 Stream 流

* 获取 List ,Set 的集合 Stream 流
  `Stream<String> liststream = list.stream();`
* 获取 Map 集合的 Stream 流

```java
    Map<String, Integer> map = new HashMap<>(); // stream()方法是collection给的,Map没有
    Set<String> keys = map.keySet(); // 把所有键放入到一个Set集合中,再获取他的流
    Stream st = keys.stream();
    Collection<Integer> col = map.values(); // 把所有值放入到一个Collection集合中,再获取他的流
    Stream st2 = col.stream();
    Set<Map.Entry<String, Integer>> entries = map.entrySet(); // 把所有键值对放入到一个Set集合中,再获取他的流
    Stream st3 = entries.stream();
```

* 获取数组的 stream 流

```java
    String arr[] = { "1", "2", "3", "4", "5" };
    Stream s1 = Arrays.stream(arr);
    Stream<String> s2 = Stream.of(arr);
```

2. 常用 API

```java
//获取到l对象的stream流,过滤,只要大于85的,过滤后的这些元素继续到流里,然后sorted升序,最后循环打印出来,所有这些x,s都会自动遍历流里的所有元素
l.stream().filter(x -> x > 85).sorted().forEach(s -> System.out.println(s));

//过滤,再降序,在打印
students.stream().filter(s -> s.getAge() > 13 && s.getHeight() > 85.0).sorted((o1, o2) -> o2.getAge() - o1.getAge()).forEach(System.out::println);的集合Stream流

//limit(3)筛选出前三名
students.stream().sorted((o1, o2) -> Double.compare(o2.getHeight(),o1.getHeight())).limit(3).forEach(System.out::println);

//skip()跳过前面的只打印最后两个
students.stream().sorted((o1, o2) -> Double.compare(o2.getHeight(),o1.getHeight())).skip(students.size() - 2).forEach(System.out::println);

//用map方法把student对象转换成name,然后去重,在遍历
students.stream().filter(s -> s.getHeight() > 89.0).map(Student::getName).distinct().forEach(System.out::println);

//如果是去重自定义的对象,要重写equals和hashcode方法
students.stream().distinct().forEach(System.out::println);

//合并两个流
Stream<String> st1 = Stream.of("a", "b", "c");
Stream<String> st2 = Stream.of("d", "e", "f");
Stream<String> allst = Stream.concat(st1, st2);
allst.forEach(System.out::println);

//count()统计筛选后的个数
Long size = students.stream().filter(s -> s.getAge() > 12).count();
System.out.println(size);

//找最大值最小值
Student maxs = students.stream().max((o1, o2) -> Double.compare(o1.getHeight(), o2.getHeight())).get();
System.out.println(maxs);

Student mins = students.stream().min((o1, o2) -> Double.compare(o1.getHeight(), o2.getHeight())).get();
System.out.println(mins);

// 流只能收集一次
List ls = students.stream().filter(s -> s.getAge() > 12).collect(Collectors.toList());
System.out.println(ls);


// Map需要指定键和值
Map<String, Double> ls = students.stream().filter(s -> s.getAge() > 12).collect(Collectors.toMap(n -> n.getName(), h -> h.getHeight()));
System.out.println(ls);

// toArray()转成Object类型的数组
Object arr[] = students.stream().toArray();
//指定数组类型,需要在toArray()方法里new
Student arr[] = students.stream().toArray(s -> new Student[s]);
```
