---
url: /java/base/javabase.md
---
# javabase

## 基本数据类型 (四类八种)

| 类型       | 关键词              | 占用内存(字节) | 取值范围       |
| ---------- | ------------------- | -------------- | -------------- |
| 整数类型   | byte,short,int,long | 1,2,4,8        |                |
|            | byte                | 1              | -128 ~ 127     |
|            | short               | 2              | -32768 ~ 32767 |
|            | int                 | 4              |                |
|            | long                | 8              |                |
| 浮点数类型 | float,double        | 4,8            |                |
| 字符类型   | char                | 2              | 0 ~ 65535      |
| 布尔类型   | boolean             | 1              | true,false     |

::: tip

* 整型字面量默认为 int 类型，即使是 long a = 28493274;也是 int,若转 long,加 L 后缀
* 浮点型字面量默认为 double 类型，若要为 float,加 F 后缀
  :::

***

### 数据类型转换

1. 自动类型转换

   * 小范围的类型自动转换为范围大的类型
     * int 的 100 转 double 为 100.0
     * char 的'a'转 int 为 97
   * 表达式运算结果类型为表达式中范围最大的类型
     * 表达式中，byte,short,char 类型的变量都直接转换成 int 参与运算，byte + short = int , byte + byte = int

2. 强制类型转换
   * 可能造成数据丢失
   * 浮点转整型，小数部分直接舍弃

例子：

```java
    byte c = (byte) 10000;
    byte c = (byte)a;
    byte c = (byte) (a + b);
```

***

## 运算符

1. 基本数据类型： +，- ，\*，/，%

   * 整数相除，结果为整数，`5 / 2 =2`,不是 2.5，若必须为 2.5,可以在两整型变量运算时`*1.0`
   * `+` 可用于字符串连接
   * `-`在数字前表示负数

2. 自增自减运算符: ++ , --

   * `a++`可以单独作为代码语句,单独使用则运算符放前放后没区别
     * ++a 先自增，再赋值
     * a++ 先赋值，再自增

3. 赋值运算符: = 与扩展赋值： += ，-= ，\*= ，/= ，%=

   * 注意: a+=b,底层代码形式为： a = (a 的类型)(a + b)，强制转换为 a 的类型并赋值，

     ```java
         byte a=10, b=10;
         //a = a+b会报错，因为两byte类型相加自动转换为Int
         a+=b;//底层代码为  a = (byte)(a+b)
     ```

4. 关系运算符
   ` > >= < <= == !=`

   * 注意！ >=是大于或等于，a=10,b=10,a>=b 结果为 true

5. 逻辑运算符

   * & 逻辑与，两边都为 true 结果为 true
   * | 逻辑或，有一个 true,结果为 true
   * ! 逻辑非，取反,!true == false ,!false == true
   * ^ 逻辑异或，两边结果相同为 false,不同为 true，如 true^true == false,true^false == true
   * && 短路与结果和逻辑与一样，但左边是 false,右边就不执行，所以在判断中如果右边是表达式要注意，它并未被执行，还是原来的状态。
   * || 短路或结果和逻辑或一样，但左边是 true,右边就不执行

6. 三元运算符

   * 格式： 条件表达式？表达式 1：表达式 2
   * 条件表达式为 true,执行表达式 1,否则执行表达式 2

     如果是比较三个数大小，则:

     ```java
         int a = 10, b = 20, c = 30;
         int max = (a > b) ? (a > c ? a : c) : (b > c ? b : c);
     ```

     或

     ```java
         int temp = (a > b) ? a : b;
         int max = (temp > c) ? temp : c;
     ```

7. 运算符优先级:

* 口诀：单目乘除位关系，逻辑三目后赋值。

  * 单目：`++，--，+（正），-（负），!，~`
  * 乘除：`*，/，%，+，-`
  * 位运算：`>>>，>>，<<`
  * 关系：`>，<，>=，<=，instanceof,==，!=`
  * 逻辑：`&，^,|，&&,||,`
  * 三目：`?：`
  * 赋值：`=，+=，-=，*=，/=，%=`

    * && 比 || 优先级高，`10>3 || 10>3 && 10<3`结果为 true，先执行`10>3 && 10<3`为 false，再执行`10>3 || false`为 true

  ***

## scanner

1. 导包 `import java.util.Scanner;`
2. 得到 scanner 对象实例，如 `Scanner sc = new Scanner(System.in);`

```java
    int a = sc.nextInt();
    String b = sc.nextLine();
    String c = sc.next();
    // 遇空格结束，用nextLine()
    // 遇回车结束，用next()
    //System,String 在 jdk.lang 包中，无需导包
```

***

## 流程控制

### 1. 分支结构

* if

```java
    if(表达式1){
        //执行语句1;
    }else if (表达式2){
        //执行语句2;
    }else if (表达式3){
        //执行语句3;
    }else{
        //执行语句4;
    }

```

* switch 性能更高，直接定位 case 值

```java
    switch(表达式){
        case 值1:
            //执行语句1;
            break;
        case 值2:
            //执行语句2;
            break;
        case 值3:
            //执行语句3;
            break;
        default:
            //执行语句4;
            break;
    }
```

::: tip
switch 注意事项：

* 表达式只能是 byte,short,char,int，enum,String。不支持 double,float,long，不支持浮点数是因为浮点运算不精确，case 值无法确定。不支持 long 因为值是数字的话默认为 int,long 无法自动转为 int.
* case 值不能重复
* case 值只能是常量，不能是变量，不能是表达式
* 不写 break，会继续执行下一个 case，直到遇到 break 为止。所以如果好几个 case 执行语句相同，可以只写最后一个 case 的执行语句和 break 用于简化代码。
* default 语句可以省略
  :::

### 2. 循环结构

* for

```java
    for(初始化语句;循环条件;步进语句){
        //执行语句;
    }

    for (int i = 1; i <= 10; i+=2) {
        System.out.println(i);
    }

      //可以和判断语句嵌套
        int sum = 0;
        for (int i = 1; i <= 20; i++) {
            if (i % 2 == 1) {
                sum += i;
                if (sum % 2 == 0) {
                    System.out.println(sum);
                }
            }
        }
```

* while（不知道循环几次用）

```java
    while(循环条件){
        循环语句;
        步进语句；//没有这个会死循环
    }
```

* do-while（至少执行一次）

```java
    do{
        循环语句;
        步进语句；
    }while(判断语句);
```

::: warning
循环变量 i 在 for 循环外无法使用，而 i 在 while 外可以，并且保持循环结束后的值
:::

* 死循环

```java
while(true){
    //执行语句;
}

for(;;){
    //执行语句;
}

do{
    执行语句;
}while(true);
```

* 循环嵌套 （外部循环每执行一次，内部循环就会全部执行一轮）

```java
    for(初始化语句1;循环条件1;步进语句1){
        for(初始化语句2;循环条件2;步进语句2){
            //执行语句;
        }
    }
    //比如，老婆让我这三天每天喊五遍“我爱你”
      for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 5; j++) {
                System.out.println("我爱你" + "第" + i + "天" + "第" + j + "次");
            }
            System.out.println("------------------------------");
        }


        for (int i = 1; i <= 3; i++) { //循环打印三行这样的*
            for (int j = 1; j <= 4; j++) { //不换行的打印四次*
                System.out.print("*"); //每次只不换行打印一颗星星
            }
            System.out.println();//打印完一行四个*后换行，再打印这样的一行四个星星
        }

```

* 跳出循环

  1. break(直接跳出当前循环不再执行) ,
     break 只能用在循环语句和 switch 中，不能单独用在比如 if(){} 语句中,如果 if 嵌套在循环语句中可以。

  ```java
        // 老婆生气罚我说五次我爱你
        for (int i = 1; i <= 5; i++) {
            System.out.println("我爱你");
            // 说到第三次心软了让我停下
            if (i == 3) {
                break;
            }
        }
  ```

  2. continue(跳出当前循环的当次执行，继续下一次执行)
     只能在循环中使用

  ```java
        // 老婆生气罚我洗碗5天，第三天我表现不错不刷碗，但第四天继续
        for (int i = 1; i <= 5; i++) {
            if (i == 3) {
                continue;
            }
            System.out.println("洗碗" + "第" + i + "天");
        }
  ```

  3. 为 continue 定义标签，比如在找素数中使用

```java

标签名:    //定义标签，为外部循环指定标签
int count = 0; //定义一个计数器用于计算素数个数。
for(int i = startnum ;i<= endnum;i++){ //循环遍历此范围内所有的数
    for(int j = 2;j<= i/2;j++){ //定义个变量从2开始作为被除数，一直到i/2为止
        if(i % j == 0){ //如果i能被j整除，则i不是素数
        continue 标签名; //直接跳到定义的标签名处，执行下一次循环
        }
    }
    count++; //计数器计算素数的个数
    System.out.println(i); //打印在此范围内所有素数。
}
```

***

## 随机数

导包 `import java.util.Random;`
创建实例：`Random r = new Random();`
生成随机数：

```
    int a = r.nextInt(n); //生成0到n-1的随机数
   int a = r.nextInt(1, 11);//生成1到10的随机数

```

***

## 数组

1. 静态初始化数组（三种写法）：
   > 什么类型的数组只能存放什么类型的数据

* `int[] arr = new int[]{1,2,3};`
* `int[] arr = {1,2,3,4,5};`
* `int arr[] = {1,2,3,4,5};`

2. java 内存分配：方法区，堆，栈

* .class 文件先加载到方法区。
* 把 main 方法以及变量加载到栈内存。
* new 出来的东西都加载到堆内存，如数组
* 数组会在栈内存开辟空间存储数组名，在堆内存开辟空间分成 n 部分存放 n 个数据，再将此内存地址赋值给数组名，让数组名指向这个对象。
* 定义一个数组，打印他的数组名,出现这个`[I@251a69d7`，`[`说明是数组类型，`I`表示整型数组，@`后面是数组在内存中的地址，`251a69d7\`是十六进制数组在内存中的地址。即数组名是一个变量，存储数组在内存中的地址。

3. 访问数组：`数组名[索引]`,数组每个元素都在内存中有索引号，从 0 开始。
   如`arr[i] = 2;`。
   访问数组长度，即元素个数： `arr.length`。
   获取数组最大索引，就是 `arr.length -1`,前提是数组至少一个数据。 `arr[arr.length - 1]`访问最大索引上的数据。

   * 遍历数组：

```java
for(int i = 0; i < arr.length;i++){
    System.out.println(arr[i]);
}

//求和
    int all = 0;
    int arr[] = { 2, 3, 4, 5 };
    for (int i = 0; i < arr.length; i++)  {
        all += arr[i];
    }
    System.out.println(all);

```

4. 动态初始化数组： `int arr[] = new int[n];`
   动态初始化数组元素默认值：

   * 整型数组，默认值为 0
   * 浮点型数组，默认值为 0.0
   * 布尔型数组，默认值为 false
   * 引用类型（类，接口，数组，String），默认值为 null
   * char 默认值需转成 int,才为 0

```java
char[] arr = new char[5];
System.out.println((int) (arr[0]));
```

5. 多个变量指向同一个数组

```java
int arr1[] = { 1, 2, 3, 4, 5 };
int arr2[] = arr1; //将arr1存储的数组内存地址复制一份给arr2,两个操作的是同一个数组数据。

```

6. 寻找最大值：

```java
    int arr[] = { 6, 2, 1, 2, 20 };
    int max = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    System.out.println("最大值为：" + max);
```

7. 数组反转：

```java
      int temp;
        for (int i = 0, j = arr.length - 1; i < j; i++, j--) {
            temp = arr[i]; //先把第一个元素赋值给临时变量
            arr[i] = arr[j]; //把最后一个元素赋值给第一个元素
            arr[j] = temp; //把临时变量（也就是原先第一个元素的值）赋值给最后一个元素
        } //最后再写个循环打印出数组
```

8. 打乱数组：

```java
/**
 * 定义个一个动态数组
 * 定义个循环，每到一个数据，就生成一个随机索引，再让当前数据和随机索引处的数据进行交换
 */
       int arr[] = new int[5]; //定义一个动态数组
        Random r = new Random();
        Scanner sc = new Scanner(System.in);
        for (int a = 0; a < 5; a++) {
            System.out.println("请输入第" + (a + 1) + "个数");
            arr[a] = sc.nextInt();
        } //弄个循环初始化数组
        int temp; //定义中间变量用于赋值
        for (int i = 0; i < 5; i++) {
            int j = r.nextInt(arr.length); //生成一个0-5的随机索引下标
            temp = arr[j]; //将随机索引下标的值赋值给中间变量
            arr[j] = arr[i]; //将当前索引下标的值赋值给随机索引下标的值
            arr[i] = temp; //将中间变量的值（也就是原来随机索引下标的值）赋值给当前索引下标的值
        }
    //定义循环打印出数组
```

* 数组可能等于 null,写方法是要注意用 if 语句判断,一定要注意，判断数组是否相同别忘了有 null 这种情况。
* 如果数组 = {},arr.length == 0,没有任何问题。如下：

```java

        System.out.print("[");
        for (int k = 0; k < arr.length; k++) {  //arr.length = 0,k不小于0,直接结束当前循环。
            System.out.print(arr[k] + "，");
        }
        System.out.print("]"); //最终打印出[]
```

***

## 方法

1. 底层原理:
   方法调用时进入栈内存运行。栈先进后出，类似弹夹，后装的子弹先打出，数据用完就清掉。

2. 定义方法：

   * 不支持方法嵌套定义
   * return 应返回和方法返回值类型相同的数据，如果方法返回值是 void,不应用 return

```java
    修饰符 返回值类型 方法名(参数){
        //方法体;
    }
```

3. 调用方法：`方法名(参数);`

* 传递给方法的参数如果是值传递，那么传递给方法形参的实际上是实参变量的副本，对形参的修改不会影响实参变量的值。
* 如果是引用传递，比如传递一个数组名给方法，那么实际上就是给方法传递数组内存地址，在方法中修改数组，就实际修改了。

```java
//在Main函数定义数组和调用方法
    int arr[] = { 1, 2, 3, 4, 5 };
        array(arr);//22
        System.out.println(arr[1]);//22
//在Main函数外定义方法修改数组数据
    public static void array(int arr[]) {
        arr[1] = 22;
        System.out.println(arr[1]);
    }

```

4. 方法递归:

* 直接递归如果没有终止,会导致栈内存溢出
* 间接递归,方法调用其他方法,其他方法再调用自己

```java
public static int f(int n){ //阶乘的实现
    if(n == 1){
        return 1;
    }
    return n * f(n - 1);
}
```

5. 方法重载:常用于处理一类业务，但需要多种解决方案：
   * 方法名相同，只要参数列表不同，那就是方法重载，不管其他的。参数列表不同指的是个数/类型/顺序不同，不关心名称。
   * 修饰符和返回值可以不同。编译器可以自行判断是哪个方法。

```java
    public static void main(String[] args) {
        fire();
        fire("美国");
        fire("英国", 2);
    }

    public static void fire() {
        // 默认发射一枚武器
        fire("日本"); //直接调用方法2，2再调用3
    }

    public static void fire(String country) {
        // 指定地区发射一枚武器
        fire(country, 1); //调用方法三，默认发射1个
    }

    public static void fire(String country, int number) {
        //指定地区发射多次
        System.out.println("向" + country + "fire" + number + "次");
    }
```

::: tip

* return 在无返回值的方法中单独使用，立即跳出当前的方法
* 常用于在方法执行一些运算前判断传入的参数是否为 0 或 null,如果是，就是 if 判断中直接 return 跳出。
  :::

***

## lambda

(简化匿名内部类的代码写法)

```java

Swimming s = new Swimming(){
    @Override
    public void swim() {
        System.out.println("swimming");
    }
};
//简化成, 只有拥有一个抽象函数的接口才可以用lambda简化,这样的接口也叫做函数式接口.
Swimming s = () -> { System.out.println("swimming");}

(被重写方法的参数列表) -> {被重写方法的方法体代码;};

```

函数式接口上方一般有`@FunctionalInterface`的注解

* 参数类型可以省略
* 只有一个参数,可以省略()
* 方法体代码只有一个行,可省略{},同时要省略执行语句末尾分号; 若这个执行语句是 return,可以省略 return 这个字母,只剩返回语句

## 方法引用

(简化 lambda 表达式)

* 静态方法引用
  类名::静态方法

```java
//CompareByData
public class CompareByData {
    public static int Data(Person p1, Person p2) { //一个静态类方法
        return p1.getData() - p2.getData();
    }
}
(p1, p2) -> p1.getData() - p2.getData()  //Lambda简化
(p1, p2) -> CompareByData.Data(p1, p2)  //第二次简化
//如果在一个lambda中,如果前后参数形式一致,可以 类名::方法名
CompareByData::Data  //最终静态方法引用
```

* 实例方法引用
  对象名::实例方法

```java
//CompareByData
public class CompareByData {
    public int Data(Person p1, Person p2) { //一个实例方法
        return p1.getData() - p2.getData();
    }
}

(p1,p2) -> {p1.getData() - p2.getData()} //lambda表达式
//方法引用,先创建一个对象
CompareByData cbd = new CompareByData();
(p1,p2) -> cbd.Data(p1, p2)  //第一次简化,前后参数一致
cbd::CompareByData //最终实例方法引用
```

* 特定类型方法引用
  类型::方法名

```java

new Comparator<String>(){
    @Override
    public int compare(String o1, String o2) {
        return o1.compareToIgnoreCase(o2);
    }
}
//lambda
(o1,o2) ->  o1.compareToIgnoreCase(o2)
//如果一个lambda里调用了一个实例方法,且前面参数列表中第一个参数是作为方法的主调,第二个参数作为这个实例方法的参数,则用特定类型的方法引用.
String::compareToIgnoreCase //最终特定类型方法引用, 类型::方法名
```

* 构造器引用

```java
Create cc = new Create(){
    @Override
    public Person create(String name) {
        return new Person(name);  //单纯要创建一个对象.
    }
}
//lambda
(name) -> new Person(name); //lambda表达式里只是在创建一个对象.

Person::new //最终构造器引用
```

## 异常

异常分为运行时异常,和编译时异常,运行时异常编译时不会报错,在运行后才打印异常信息,编译异常.编译时就会报错。

如果写代码报错了,但检查不出来,就要捕获并打印异常

```java
try{
    //可能出现异常的代码
}catch(异常类型 变量名){
    //异常处理逻辑;
}

public static void main(String[] args) throws 异常类型1,异常2,{} //抛出这个方法里可能出现这种异常类型的错误在控制台打印出来
```

#### 自定义异常

* 自定义运行时异常
  * 定义个异常类继承 RuntimeException
  * 重写构造器
  * 通过 throw new 异常类();创建异常对象并抛出,运行时报错
* 自定义编译时异常
  * 定义一个异常类继承 Exception
  * 重写构造器
  * 通过 throw new 异常类();创建异常对象并抛出,编译时报错

```java
//自定义个异常类继承 RuntimeException
public class AgeIllegalRuntimeException extends RuntimeException{
    public AgeIllegalRuntimeException(String message){ //重写构造器
        super(message);
    }
}

//main
public static void main(String[] args) {
    try //把这个异常对象抓住
    {
        saveAge(-1);
    }catch(Exception e){
       e.printStackTrace(); //打印出异常信息
    }
}

public static void saveAge(int age){
    if(age > 0 && age < 150){
        sout("年龄被保存");
    }
    else{
      throw new AgeIllegalRuntimeException("年龄非法"); //创建并抛出这个自定义异常对象,throw就是抛出
    }
}
```

```java
//自定义个异常类继承 Exception
public class AgeIllegalException extends Exception{
    public AgeIllegalRuntimeException(String message){ //重写构造器
        super(message);
    }
}

//main
public static void main(String[] args) {
    try //把这个异常对象抓住
    {
        saveAge(-1);
    }catch(Exception e){
       e.printStackTrace(); //打印出异常信息
    }
}

//throws用于捕获方法中所有出现的这个类型的异常,用于方法
public static void saveAge(int age) throws AgeIllegalException{
    if(age > 0 && age < 150){
        sout("年龄被保存");
    }
    else{
      throw new AgeIllegalException("年龄非法"); //创建并抛出这个自定义异常对象,throw就是抛出
    }
}

```

#### 异常的处理方式

* 把方法出现的异常全都往上抛,在最上层统一打印错误信息,如果不知道具体的异常,就直接全部用 Exception 就可以

```java
public static void main(String[] args){
    try{
      test1();//调用方法一,test1()抛出的两个异常都抛到这,用try抓住
    }//分别处理这两个异常
    catch(FileNotFoundException e){
        e.printStackTrace();
    }
    catch(ParseException e){
         e.printStackTrace();
    }

}

//两个方法的异常一起抛给调用了test1的方法
public static void test1() throws FileNotFoundException ,ParseException{
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    Date date = sdf.parse("2020-01"); //少些一个日期
    test2();//调用第二个函数
}

//抛出这个异常到test1()方法;
public static void test2() throws FileNotFoundException{
    InputStream is = new FileInputStream("a.txt"); //传一个不存在的文件

}

```

#### 尝试处理异常

```java
//如果不try catch,那么这时候输入一串字母的话,程序会崩溃并退出,但这样就可以一直修复错误直到正确
 public static void main(String[] args) {
        while (true) {
            try {
                System.out.println(getMoney());
                break;  //输入正确就跳出
            } catch (Exception e) {
                System.out.println("输入合法数字");
            }
        }
    }
    public static double getMoney() {
        Scanner sc = new Scanner(System.in);
        while (true) {
            System.out.println("输入金额");
            double m = sc.nextDouble();
            if (m > 0) {
                return m;
            } else {
                System.out.println("非法");
            }
        }
    }
```

#### finally

* finally 块总是会被执行,无论前方是否出现异常

```java
try{
    //可能出现异常的代码
}catch(异常类型 变量名){
    //异常处理逻辑;
}finally{
    //无论是否出现异常,都会执行的代码;
    //一般用于释放资源,无论是否出现异常,都要释放资源;
    //但是一般都会报错，因为如果try中的程序没有执行到我们想要的部分就报错了，比如没有成功建立字符输入输出流，那么在这里关闭流就会异常，这时候要检查是否会出现这种情况，如果不会，就再套一层try catch
    try{
     if(os!=null) os.close();
     if(is!=null) is.close();
    }catch{}
}

```

#### try-with-resources

* 自动关闭资源，把资源定义放在 try 的括号里，他会自动关闭
* try(这里只能定义系统资源，比如 IO 流，网络等资源)

```java
    try (
            InputStream is = new FileInputStream("d:\\a.txt");
            OutputStream os = new FileOutputStream("d:\\b.txt");
            ) {
            // 各种可能出现异常的处理
        } catch (异常类型 变量名) {
            // 异常处理逻辑;
        }

```

## 正则表达式

```java
  // .matches是String类的方法,接受一个正则表达式的字符串
        // 以下规则一次均只能匹配单个符合规则的字符,结合数量词可匹配多次
        "a".matches("[abcd]"); // true [abcd]表示匹配abcd中的任意一个字符,如果没有[]里的字符返回false
        "a".matches("[^ab]"); // false [^ab] ^表示不能出现a和b这两个字母
        "b".matches("[a-zA-Z]"); // true 只能是a-z或A-Z中的某个字母
        "k".matches("[a-z&&[^bc]]"); // true 匹配a-z的一个字母,但排除掉b和c
        "4".matches("[a-zA-Z0-9]"); // true 匹配一个大小写字母或数字
        "45f".matches("[a-zA-Z0-9]"); // false ,一次只能匹配一个字符
        "啊".matches("."); // .可以匹配任意字符一次
        "1".matches("\\d"); // \d表示匹配任意一个数字一次, 前面还有一个\ 是为了转义
        " ".matches("\\s"); // \s表示匹配空格一次
        "a".matches("\\S"); // \S 大写S表示匹配非空白字符
        "_".matches("\\w"); // \w表示匹配一次数字字母下划线,相当于 [a-zA-Z_0-9]
        "啊".matches("\\W"); // \\W ,大写W表示不能是数字字母下划线

        // 数量词
        // ? 匹配的字符要么0次,要么1次
        // * 匹配的字符至少0次
        // + 匹配的字符至少出现过1次
        // {n} 正好出现n次
        // {n,} 至少出现n次
        // {n,m} 至少出现n次,最多出现m次

        "".matches("\\w?"); // 匹配字母数字下划线0个或1个,0个也行哦,1个以上就false了
        "ad993".matches("\\w*"); // 匹配0个或多个数字字母下划线 , 0 个也行!
        "".matches("\\w+"); // 匹配数字字母下划线1个以上, 必须至少有1个,否则false
        "abt".matches("\\w{3}"); // 匹配到符合条件的字符必须只有3个,多一个少一个都不行
        "abcdfr".matches("\\w{3,}"); // 匹配符合条件的字符数量必须有3个及以上, 少了不行
        "ascds".matches("\\w{3,9}"); // 符合条件的字符数量必须在3个及以上,9个及以下
        "ABs".matches("(?i)abs"); // (?i)表示忽略abs的大小写
        "aBs".matches("a((?i)b)s"); // (b)把b单独分一组, ((?i)b)表示忽略b的大小写,其他字母不忽略
        "asr".matches("\\d{3}|[a-z]{3}"); // 表示匹配三个数字 或 三个小写字母, | 表示或 ,\\d表示任意数字, | 左右不能有空格
        "我爱编程编程666666".matches("我爱(编程)+(666)+"); // 必须以"我爱"开头,+表示必须出现一次或多次"编程,至少一组666,666是连续的一组

        // 如筛选一大段文本,先把这一大段话定义成一个字符串,用+连接每段
        String data = "18952131770" + "cdscvedncieno"; // 例子, 加入这里是一堆包含邮箱和手机号的信息
        // 定义一个正则表达式的字符串
        // (1[3-9]\\d{9})匹配手机号,(0\\d{2,7}-?[1-9]\\d{4,19}) 匹配座机号
        // (\\w{2,}@\\w{2,20}(\\.\\w{2,20}){1,2}) 匹配邮箱 , \\.代表. 第一个\是为了转义第二个\,第二个\是为了转义.
        // (\\.\\w{2,20}){1,2} 是为了匹配类似.com.cn这样的邮箱后缀
        // (400-?\\d{3,7}-?\\d{3,7}) 匹配热线电话,如 400-618-9090
        String regex = "(1[3-9]\\d{9})|(0\\d{2,7}-?[1-9]\\d{4,19})|(\\w{2,}@\\w{2,20}(\\.\\w{2,20}){1,2})"
                + "|(400-?\\d{3,7}-?\\d{3,7})";
        // 把正则表达式封装成Pattern对象, 这时候Pattern对象就代表正则表达式
        Pattern pt = Pattern.compile(regex);
        // 创建一个匹配器对象 pt代表正则表达式, data是要筛选的字符串
        Matcher mt = pt.matcher(data);
        // matcher这个匹配器会根据正则表达式去data找
        // 定义while循环反复在字符串中查找符合规则的内容并返回出来,因为正则表达式每次只能匹配到一个电话或者邮箱
        while (mt.find()) { // find方法根据有没有查到结果返回布尔值
            System.out.println(mt.group()); // group方法返回筛选出来的字符串
        }

        String str = "古力娜扎cidno面具人cdi牛逼啊";
        // replaceAll用指定字符替换掉匹配到的字符
        System.out.println(str.replaceAll("\\w+", "-"));
        String strarr[] = str.split("\\w+"); // 根据指定的字串, 对这个字符串进行分割,返回一个字符串数组
        System.out.println(Arrays.toString(strarr));

```
