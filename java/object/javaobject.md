---
url: /java/object/javaobject.md
---
# javaobject

## 类：

### 注意事项

```
- 类名首字母大写，驼峰格式
- 类中定义的变量称为成员变量，类中定义的方法成为成员方法。
- 成员变量本身定义时就有默认值，具体和动态数组的元素一样。类中只定义即可，没必要赋初值。
- 一个代码文件可以有多个 class，但只能有一个 public 修饰的 class，且文件名必须和这个用 public 修饰的 class 类名一致。
- 多个变量指向同一个对象数据会相互影响。
- 一个对象如果没有变量指向它，会成为堆内存中的垃圾。java 有自动垃圾回收机制，自动清除垃圾对象。
```

### 例子

```java
public class 类名 {
    // 类体
    String name;
    double chinese;
    double math;

    public void printavg() {
        System.out.println("平均成绩：" + (chinese + math) / 2);
    }
}
```

***

## 对象：

### 创建对象

```java
   student s1 = new student(); //创建对象，student类型的变量s1被new出来。
   student s2 = new student(); //s1,s2都是引用变量，存储的是堆内存中对象本体的地址。对象本体内存储方法区中对应的类模板地址。

```

### 底层原理

```java
public class test { //把这个类加载到内存的方法区
    public static void main(String[] args) {  //main加载到栈内存
        student s1 = new student();
        //1. 将student类加载到方法区
        //2. 在栈内存开辟存放s1变量的空间
        //3. 之后new出来的对象本体存放到堆内存，并且会按照类的结构在这个对象本体中开辟变量空间，变量空间都分别装的默认值，对象本体里面还会创建一个类模板的地址，指向自己是由哪个类创建出来的，这个地址是类在方法区的地址。
        //4. 最后再把对象本体在堆内存中的地址赋值给栈内存中的s1,让s1指向这个对象本体。这个地址的结构如 "gml.duixiang.classdemo.student@7344699f",即包名+类名+@+十六进制内存地址。
        s1.name = "张三"; //把这些变量赋值给堆内存中对象本体内对应的变量空间。
        s1.chinese = 90;
        s1.math = 80;
        s1.print(); //通过s1存储的地址找到堆内存中的对象实体，再通过对象实体存储的类模板地址找到方法区中对应的类模板，再通过类模板找到对应的方法
    }
}
```

***

### this 关键字

* 作用:
  是一个变量，可以拿到当前对象在堆内存中的地址，并对这个对象的数据进行实际操作。主要用于解决变量名称冲突问题。

```java
//在类文件中定义这样一个方法
public void printthis() {
    System.out.println(this);
}
//在main函数中调用这个方法
    student s1 = new student(); //创建一个对象实例
    s1.printthis(); //调用这个对象的方法，打印出来的实际上是s1在堆内存中的地址。
    System.out.println(s1); //和上面效果一样，都是s1在堆内存中的地址。
```

实际应用：

```java
public class student {
    double score;
    public void setscore(double score) {
        if (this.score < score) { //this.score 表示当前对象的score,第二个score 表示调用这个方法时传入的参数。
            System.out.println("及格了" + score);
        }
    }
//调用时先设置对象实例的score及格分数,再调用setscore方法，传入实际分数，判断是否及格。
}
```

***

## 构造器

```
- 类的一种特殊方法，主要用来初始化对象。分为无参数构造器，和有参数构造器。
- 方法名必须和类名完全相同。
- 创建对象时，对象会自动调用构造器。
- 一个类里可以创建多个构造器，可以有参，也可无参。
- 如果不写构造器，java 会自动为类生成一个无参构造器，如果自己定义了有参构造器就不会自动生成。
- 写完有参后，最好再写一个无参构造器。
```

### 例子

```java
//先写一个Student类
public class student {
    String name;
    double chinese;
//写一个有参构造器
    public student(String name ,double chinese) {
        this.name = name; //this.name 表示当前对象的name,第二个name 表示调用这个方法时传入的参数。
        this.chinese = chinese;
    }
}

//在主文件main函数中创建对象并直接初始化
//创建对象实例，会自动调用构造器。具体调用哪个构造器，会根据()括号里面传入的参数判断，如果括号里面没有参数，就调用无参构造器。
    student s1 = new student("张三", 90);
```

## 封装

* 将需要安全的变量数据隐藏，写公开的方法让别人对这个数据进行操作或访问，可以在方法中添加更多验证逻辑，保证数据的安全。
* 封装规范： 合理隐藏，合理暴漏

```java
public class Scoresys {
    private double score; // 及格线，不可能让这个变量公有，否则所有人都能胡乱设置及格线。

    public void setScore(double score) { // 写一个方法专门设置及格线
        // 判断及格线是否合理，如果合理，则设置，否则不设置
        if (score > 60 && score < 100) {
            this.score = score;
        } else {
            System.out.println("数据非法");
        }
        // 其他自定义验证或者校验逻辑
        //this.score = score;
    }

    public double getScore() { // 写一个方法专门获取及格线
        // 可以对获取及格线的人进行权限验证逻辑
       return score;
    }

}
```

***

## javabean

### 说明

* 特殊形式的类，也叫实体类，类中成员变量都必须私有，且要对外提供每个成员变量的 getxxx 和 setxxx 方法。
* 实体类必须有一个公共的无参构造器
* 实体类一般用于存储数据，而处理数据的业务交给其他类实现，实现业务逻辑的分离。

### 完整实例

```java
//写一个实体类存储学生姓名
public class Student {
    private String name;

    public Student(){

    }
    public Student(String name){
        this.name = name;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
```

```java
//再新建一个类，用于处理学生姓名的逻辑
public class StudentName {
    private Student s1; //创建一个Student类成员变量

//定义一个构造器，用于接受Student类创建的对象实例，然后把传进来的对象复制一份给 StudentName类的成员变量s1,这样就可以对这个数据进行处理
    public StudentName(Student s2) {
        this.s1 = s2;
        }

    //写个方法看看这个学生名字是否合法
    public namepass(){
        if(s1.getName().length() > 10){ //调用Student对象的方法获取名字
            System.out.println("名字太长");
        }else{
            System.out.println("合法");
        }
    }
}
```

```java
//在主函数中调用
    public static void main(String[] args) {
        Student s = new Student();
        StudentName s1 = new StudentName(s); 传入s这个对象变量触发StudentName构造器，把s复制一份给s1这个对象的成员变量。
        s.setName("张三是个大大大大大大大");
        s1.namepass(); //调用StudentName类的方法判断名字是否合法。
    }
```

***

## 成员变量和局部变量区别

* 成员变量有默认值，定义在类中（方法外），在堆内存，与对象共存亡。
* 局部变量使用前必须赋值，定义在方法中，在栈内存，与方法共存亡。

***

## 包

* 同一个包的类可直接互相调用
* 不同包的类调用时，需要先导入包，导包格式：import 包名.类名;
* 要导入多个包的程序，但这些程序名都相同，则只能导入一个包，其他的包要以完整包名进行访问。

```java
//比如有两个类，所在包分别为tz.gml.yx和tz.gml.hm，类名均为demo，则导入时只能导入一个包，另一个包的类名需要加上包名进行访问。
import tz.gml.yx.demo; //导入tz.gml.yx包中的demo类
demo dyx = new demo(); //创建tz.gml.yx包下demo类的对象实例

tz.gml.hm.demo dhm = new tz.gml.hm.demo(); //创建tz.gml.hm包下demo类的对象实例

```

***

## string

### 创建字符串对象

* `String name = "csdn";`
* `String str = new String("字符串"); `
* `字符类型数组传给string自动拼接成字符串，char chars[] = {'a','b','c'};   String str2 = new String(chars);`
* byte 类型数组自动转为字符，再拼接成字符串，如`byte bytes[] = {97,98,99};   String str3 = new String(bytes)`打印出来是 abc

### String 类方法：

```java
//第一行均为jdk源码中的方法定义格式
//第二行是使用示例

public int length() //返回字符串长度
System.out.println(str.length());

public char charAt(int index) //返回指定索引位置的字符,索引从0开始
System.out.println(str.charAt(2));

public boolean contains(CharSequence s) //判断字符串是否包含了某个字符串
str4.contains("垃圾") //返回布尔值

public boolean startsWith(String prefix) //判断字符串是否以某个字符串开头
str4.startsWith("这个")

public String substring(int beginIndex) //返回从指定索引位置开始到末尾的新的字符串
System.out.println(str3.substring(5));

public String substring(int beginIndex, int endIndex) //返回从指定索引位置开始到指定索引位置结束的新的字符串
System.out.println(str3.substring(0, 5));


public String replace(char oldChar, char newChar) //用新值替换旧值并返回新的字符串
String str2 = str1.replace("垃圾", "**");

public String[] split(String regex) //把字符串按照某个字符内容分割成多个字符串，返回个字符串数组
String str4 = "这个,电影,真是个,垃圾";
String strarr[] = str4.split(",");

public boolean equals(Object anObject) //判断两个字符串是否相同
str1.equals(str2)

public boolean equalsIgnoreCase(String anotherString) //忽略大小写，判断俩字符串是否相同。
str1.equalsIgnoreCase(str2)

public char[] toCharArray() //将当前字符串转换成字符数组并返回
char chararr[] = str.toCharArray();
```

### 注意事项(底层原理)

* String 是不可变对象，每次更改的本质是指向了新的字符串对象。

```java
//只要是在""创建的字符串对象，都在堆内存的字符串常量池中存储
String str = "hello"; //把堆内存中hello这个字符串的地址赋给str,str指向这个字符串
str += "world"; //world这个字符串也放到常量池中，与hello拼接，产生新的字符串hello world放在堆内存中，然后把hello world这个字符串的地址赋给str,str指向这个新的字符串。
str += "of my"; //在堆内存的字符串常量池存放of my字符串，在让它与当前str的值拼接，再形成一个新的字符串，放到堆内存中，最终把这个地址赋给str变量。
System.out.println(str); //输出hello world of my
```

* 字符串常量池中的字符串都是共享的，相同内容的字符串只有一份。更节约内存。

```java
String str1 = "hello"; //堆内存字符串常量池创建hello,把地址赋给str1
String str2 = "hello"; //发现常量池有这个字符串，把地址赋给str2
System.out.println(str1 == str2); //输出true，str1和str2共享同一个内存地址
```

* new 出来的字符串对象，每次都在堆内存中产生一个新的字符串对象。

```java
    char cs[] = {'a','b','c'};
    String str1 = new String(cs); //每次都在堆内存创建一个新字符串对象
    String str2 = new String(cs);
    System.out.println(str1 == str2); //输出false
```

```java
String str1 = new String("hello"); //这个实际上创建了两个对象，一个是常量池中的字符串"hello"对象，一个是new出来的堆里的字符串对象。但str1指向的是new出来的字符串对象。
String str2 = "hello" //这个实际上没有创建任何对象，因为他发现字符串常量池有hello,直接指向这个。
```

```java
String s1 = "abc";
String s2 = "a"+"b"+"c"; //由于Java的编译优化机制，直接转换成"abc"以提供性能。在对应的.class文件可以看到这个直接被转换成了"abc"
System.out.println(s1 == s2); //输出true
String s3 = s2 + "c"; //和变量运算出来的都是放在堆里面，而不是字符串常量池
System.out.println(s1 == s3); //输出false
```

***

## static

作用： 可以修饰成员变量或成员方法,修饰后的变量或方法既可以通过类访问(推荐),也可以通过实例访问

### 静态成员变量(类变量)

*注意事项*

* 成员变量按照有无 static 修饰分为类变量和实例变量
* 类变量会被类的全部对象实例共享.实例变量是属于每个对象的.
* 用 类名.类变量 访问.

*底层原理*

```java
//Student.java
   static String name = "张三";
    int age = 18;

//main.java
    Student s1 = new Student(); //看到Student,把这个类加载到方法区,检测到这个类有static变量,加载到堆内存,初始值为null.在栈内存开辟s1变量,把堆内存s1的对象实体地址赋给s1,这个对象实体里只有age,没有name,对象实体存放有方法区中类模板的地址.
    s1.name = "张三"; //通过栈内存s1找到堆内存的对象实体,通过对象实体内的地址找到方法区中类模板的地址,在通过类模板找到堆内存中static变量,把值赋给它.
    Student s2 = new Student(); //再在堆内存创建一个学生对象实体,地址赋值给栈内存中的s2
    s2.name = "李华"; // 最终指向的也是堆内存中的static String name.两个对象操作的是同一个变量.
```

*举个例子*

```java
public class User{
    public static int number;
    public User(){ //每当类创建一个User对象，都会默认调用一个无参构造函数,这样number就会加1,可以统计一共创建了多少对象.
        number++;
        // 或User.number++;
    }
}
```

### 静态成员方法(类方法)

* 访问方法 `类名.类方法`
* main 方法就是一种静态成员方法,可以通过类名直接调用.
* 类方法常用作工具类,每个类方法都是供开发人员完成一个功能的.比如 Java 的 Math 类.
* 比如在一个工具类中开发一个生成随机数的类方法,就可以用类名在其他地方调用,虽然对象方法也可以,但是要创建多个对象,占内存.
* 由于工具类不用创建对象,所以建议将工具类的构造器私有,防止别人给工具类创建对象.
* 类方法可以直接访问类成员,但不能访问对象成员
* 对象方法（即实例方法）可以直接访问类成员和对象成员
* 类方法禁止使用 this 关键字,因为 this 是用来拿到当前对象地址的,而类方法不属于任何对象.

```java
//Myutil.java
public class Myutil{
    private Myutil(){ //构造器私有,防止别人创建对象
}

//主函数文件main.java
    Myutil myutil = new Myutil(); //报错,因为构造器私有,无法创建对象
    Myutil.random(); //调用Myutil类中写好的类方法
}

```

***

## 代码块

* 静态代码块 `static{}`,类加载时自动执行,和类一样只会加载一次,用于完成对类变量的初始化

```java
public class Student{
    static String name;
    static{
        name = "张三";
    }
}
```

* 实例代码块,在`{}`里面直接写,每次创建对象都执行一次,在构造器前执行.和构造器功能一样.实例代码块中定义的是不同对象一样的初始化内容。在类中方法外出现。
* 局部代码块 ，直接在方法中用{}括号括起来，局部代码块里的变量外面访问不了，有利于限制变量生命周期，及早释放。

## 单例设计模式

解释： 用于确保类只能创建一个对象,比如 java 的 Runtime(java 运行环境),或者 windows 的任务管理器,只需要一个对象即可,不能打开多个任务管理器.
步骤:

### 饿汉式单例:

拿到对象时,对象早就在类中创建好了

步骤:

1. 把类的构造器私有
2. 定义一个类变量记录类的一个对象
3. 定义一个类方法,返回对象.

```java
// A.java
public class A{
    private static A a = new A(); //创建唯一一个对象
    private A(){} //构造器私有
    public static A getA(){ //类方法,让外部只能通过这个方法得到唯一一个对象.
        return a; //无论调用多少次,都是返回的同一个对象a.
    }

//主文件主函数main.java中调用
    A a1 = A.getA(); //通过类方法获取对象
    A a2 = A.getA(); //通过类方法获取对象
    System.out.println(a1 == a2); //输出true
}
```

### 懒汉式单例:

拿对象时,才开始创建对象

步骤:

1. 把类的构造器私有
2. 定义一个类变量用于将存储对象
3. 提供类方法,确保返回的是同一个对象.

```java
//B.java
public class B{
    private static B b;
    private B(){} //构造器私有
    public static B getB(){ //类方法,让外部只能通过这个方法得到唯一一个对象.
        if(b == null){ //如果对象为空,才创建对象
            b = new B();
        }
        return b;
    }
//main.java
    B b1 = B.getB(); //通过类方法获取对象
}
```

***

## 继承

tip:

* 当两个类有很多重复属性,可以让这两个类继承一个共同的父类,减少代码量
* 子类实际上获取了父类所有成员，包括似有， 但是没有权限访问私有成员。
* 在父类中生成 get 方法让子类访问私有变量，在定义个方法间接调用父类中的私有方法。因为子类也获取到了这两个方法，可以直接 this.调用，来访问父类私有成员。
* 一个子类只能继承一个父类,java 不支持多继承,但支持多层继承.如儿子继承爸爸,爸爸继承爷爷。
* 所有类都默认继承 object 类,可以调用 object 类的方法,比如 toString(),hashCode(),equals(),getClass(),clone(),finalize()等.即使是一个子类,由于他的父类默认继承了 object,那么这个子类也是他的孙子,也可以调用 object 方法.

### 继承格式：

```java
public class son extends father{}
//son类是子类(派生类),father类是父类(基类)
```

### 示例

```java
//father.java 父类
public class father{
    private int age;
    private void print();
    public void printit(){this.print()}; //间接调用私有方法，子类直接用这个printit就可以间接调用print了
    public String getName() {return name;}
}
//son.java 子类
public class son extends father{
    public void show(){
        System.out.println(this.getage()); //调用get方法进行访问父类私有成员变量
       this.printit();
    }
}
//main.java
    son s1 = new son(); //发现s1,检测到son,把son类加载到方法区,检测到父类,把父类也加载到方法区,然后在栈内存创建s1,在堆内存创建s1 son对象实体,通过对象实体里的地址找到方法区的son类,在通过son找到father.
    s1.show();
```

### *访问机制*

在子类方法中访问其他成员(成员方法,成员变量),都遵循就近原则,先在子类局部范围找,再在子类成员范围中找,再在父类成员找,父类找不到就报错.

```java
//主文件main.java
B b = new B();
b.printName();

//A.java文件
public class A {
    String name = "A";
}
//B.java文件,是A的子类
public class B extends A {
    String name = "B";

    public void printName() {
        String name = "子类B中的一个方法的变量";
        System.out.println(name); // 子类B中的一个方法的变量
        System.out.println(this.name); // B
        // 访问同名的父类成员变量 用 super.属性/方法名
        System.out.println(super.name); // A
    }
}
```

### *构造器特性*

1. 子类的全部构造器,每一个执行前都会先调用父类的构造器,再执行自己,因为在所有子类的构造器里都会默认加上`super();`调用父类的无参构造器
2. 子类构造器必须默认调用父类的构造器,否则报错。如果想让子类的构造器不调用父类的无参构造器,那么就要在父类手写一个有参构造器,然后在子类的构造器手写 super();方法,在里面加上对应的参数调用父类的有参构造器.
3. 子类构造器可以调用父类构造器,把对象中父类这部分的数据先初始化.

```java
//A.java 文件
  public A() {
        System.out.println("A");
    }
//B.java 文件, A是B的父类
    public B() {
        //super(); //默认调用父类无参构造器
        System.out.println("B");
    }

    public B(int a) {
        //super();  //子类有参构造器也会默认调用父类无参构造器
        System.out.println("B");
    }
//main.java
     B b = new B(); //先调用父类A的无参构造器,在调用B自己的无参构造
    B b2 = new B(10);//先调用父类A的无参构造器,在调用B自己的有参构造
    //最终打印出来的是 ABAB
```

### *技巧提示*

在同一个类中,一个构造器可以用 this()调用同一个类下其他的构造器

```java
public Student(int age,String name){
this(age,name,"逻各斯中央大学");//调用兄弟构造器,这样都是同一个大学的了
//用了this就不能用super,因为下面这个兄弟构造器已经默认有了一个super,一个类不能有两个super.
}
public Student(int age,String name,String schoolName){
this.age = age;
this.XXX //省略
}
```

## 权限修饰符

四种：
public, private,protected,缺省

被修饰的类，方法，变量的访问规则

* public: 任意包下的任意类都可以访问被 public 修饰的东西
* private: 私有的,只能在本类中访问
* protected: 本类,同一个包下其他的类,任意包下的子类
* 缺省: 本类和同一个包下其他的类

## 方法重写

### *解释*:

子类觉得父类某个方法不好,写一个方法名,参数列表一样的方法,覆盖父类这个方法，至于方法的访问,java 会遵循就近原则.

### *注意事项:*

1. 在上方写@Override 注解

```java
@Override //表示重写的方法
public void show(){}
```

2. 子类重写父类方法时,重写后的方法的访问权限必须等于或大于父类该方法权限.
3. 重写方法返回值类型,必须与被重写的方法一样或者更小
4. 私有方法,静态方法不能被重写

### 多态:(对象多态/行为多态)

* 前提: 有继承关系,存在方法重写,存在父类引用子类对象
* 注意: 多态是对象或行为的多态,成员变量不存在多态,若父类和子类有同名成员变量,通过一个父类类型的子类对象,访问这个变量,输出的是父类的那个成员变量.
* 多态的好处:
  1. 右边创建的对象可以随时切换,而不用两边都切换,`People p1 = new Teacher();`
  2. 如果一个方法用父类类型的对象作为形参,如`public void static go(People p)` 那么这个方法可以接受一切继承这个父类的子类对象.

*例子*

```java
//People.java
  public void run() {
        System.out.println("人可以跑");
    }
//Student.java
public class Student extends People {
    // 重写父类的方法
    @Override
    public void run() {
        System.out.println("学生跑得快");
    }
}
//Teacher.java
public class Teacher extends People {
    @Override
    public void run() {
        System.out.println("老师跑得很慢");
    }
}
//main.java
    People p1 = new Teacher(); // 对象多态
        p1.run(); //行为多态 ,输出老师跑得很慢
    People p2 = new Student();
        p2.run(); //学生跑得快
```

*类型转换:*

* 由于子类无法调用自己独有的方法,需要把父类类型的对象强制转换成子类.
  1. 自动类型转换 : 父类 对象名 = new 子类();
  2. 强制类型转换 : 子类 对象名 = (子类)父类对象 `Teacher t = (Teacher)p` 转换后就可以调用子类自己独有的方法
  3. 兄弟类之间不能互转,编译后会报`ClassCastException`,类型转换异常.因此强转前用 instanceof 关键字判断当前对象的真实类型,再强制转换.

```java
if(p1 instanceof Student){
    Student s2 = (Student) p1;
    s2.s2独有方法();
}else{
    Teacher t2 = (Teacher) t2;
    t2.t2独有方法();
}
```

## final

*修饰场景:*

* 类 :此类无法继续被继承,常用于工具类
* 方法: 方法无法被重写
* 变量: 只被赋值一次,比如圆周率,就是常量

*注意事项*

* 用 final 修饰的静态成员变量,如 public static final String NAME = ""; 这时候必须赋值,否则报错.
* final 修饰基本类型变量无法被改变,修饰引用类型变量则地址不改变,但地址指向的内容可以被改变.
* 这个东西就是宏,程序用到的在编译的时候会自动进行宏替换.在编译后的.class 文件可以看到.
* 使用常量和字面量性能一样
* 常量格式: public static final 类型 CHANG\_LIANG = ""; 常量建议首字母大写,用\_下划线连接

## 抽象类

用途:可以修饰类,成员方法,每个子类要实现的功能不一样,定义抽象类让子类继承并重写父类的抽象方法,实现多态.

```java
public abstract class A{
        public abstract void printA(形参列表);  //抽象方法不能有{方法体}
}
public class B extends A{
        @Override //子类来重写父类的抽象方法
        public void printA(形参列表){} //必须重写抽象方法
}
```

*注意事项*

* 抽象类不一定要有抽象方法,有抽象方法一定是抽象类
* 抽象类也可以有成员变量/方法,构造器
* 最重要的是,抽象类不能创建对象,作为一种特殊的父类,让子类继承并实现.
* 一个类继承抽象类,必须重写完所有抽象类的抽象方法,否则这个类也必须定义成抽象类.

*实际应用: 模板方法设计*

```java
//抽象类People定义一个模板方法,打印的一三两条语句相同,第二条要求灵活变动
//在第二条那个位置调用抽象方法,然后定义一个抽象方法交给Student和Teacher类重写,用来输出第二条不同的语句

//抽象类People
public final void print(){ //最好用final阻止模板方法被子类重写
    sout("两个子类相同的第一个语句") //定义一个模板方法,把相同代码放进去
    printdiff(); //调用抽象方法
    sout("两个子类相同的第三个语句")
}
public abstract void printdiff();

//Student类,别忘了extends People
public void printdiff(){
    @Override
    sout("Student类独有的第二个语句")
}
//Teacher类,别忘了extends People
public void printdiff(){
    @Override
    sout("Teacher类独有的第二个语句")
}
//main.java
    Teacher t = new Teacher();
    t.print(); //中间那条语句打印出来的会是Teacher类里的
```

## 接口

*注意事项:*

* 一个接口可以由多个类实现,一个类可以实现多个接口
* 接口不能创建对象
* 接口只能有常量和抽象方法

*示例代码:*

```java
//接口A文件
public interface A {
    String NAME = "A"; // 默认为常量
    void test(); // 默认为抽象方法
}
//创建一个B类,实现接口A,B,C...多个接口
public class B implements A ,B ,C{
    @Override
    public void test() {实现接口A抽象方法}
}
//main主文件
  A b = new B(); //改的时候直接把B改成其他类,因为A这个接口由多个类实现
  b.test();
```

### 接口方法

1. 默认方法(jdk8)
   在接口里面实现的默认方法,实现好了那么所有子类对象都可以直接调用这个方法,用 default 修饰,默认是 public
   `default void test1(){}`

2. 私有方法(JDK9)
   用 private 修饰, 只能在本接口的其他方法中被调用,用来封装一些细节
   `private void test2(){}`

3. 静态方法(类方法)
   要用接口名来调用,默认 public , `static void test3(){} `

### 接口多继承

* 接口继承

  * 接口可以同时继承多个接口 `public interface D extends C,B,A`
  * 实现类要实现这些接口全部的抽象方法

### 变量访问规则

* 注意事项:(下文所说冲突,比如方法名一样,但返回值不同)
  1. 如果一个接口要继承多个接口,但多个接口中存在方法名冲突,则此时不能多继承
  2. 一个类实现多个接口,但多个接口中存在方法名冲突,则此时不能多实现
  3. 一个类继承了父类,又同时实现了接口,此时如果父类和接口中存在同名的默认方法,则此时只能调用父类的方法
  4. 一个类实现了多个接口,多个接口存在同名默认方法,可以不冲突,让这个实现类重写该默认方法即可,也就是说这个类将只用自己的这个方法,而不是接口的

## 内部类

定义在一个类里面的类为内部类,比如汽车里面的发动机就可以写成一个内部类

### 内部类四种形式:

*1. 成员内部类:类中的一个普通成员*

```java
public class Car{
    private int age = 99;
    public class Engine{ //内部类
        public int age =88;
        public void show(){
            //内部类可以访问外部类的成员变量,即使是私有成员
            System.out.println(age); //99
        }
        public void diffshow(){
            int age = 66;
            sout(age); //函数内部局部变量,66
            sout(this.age); //88,Engine这个对象的成员变量
            sout(Car.this.age); //99 //调用Car对象里的成员变量
        }
    }
}
//创建内部类对象格式: 先new外部类,再new内部类
//调用格式: 外部类.内部类,
Car.Engine e = new Car().new Engine();
```

*2. 静态内部类*

由类持有, 可以访问外部类的静态成员,无法访问实例成员

```java
public class Outer{
    private int age = 99;
    public static int a;
    public static class inner{
        public void test(){
            sout("age") //报错,因为age是成员变量
            sout("a")
        }
    }
}
//main
  Outer.inner in = new Outer.inner();
```

*3. 匿名内部类*

本质就是个子类,会自动立即创建子类对象
格式: `new 类名/接口(参数值){重写抽象方法};`

创建匿名内部类示例

```java
//原本是需要单独写一个 cat 类用来继承 Animal 类并重写方法的
//main函数里定义个匿名内部类
Animal cat = new Animal(){ //他会直接创建一个Animal的子类对象
@Override //在这个子类里直接重写他的方法
public void jiao(){
    sout("猫叫");
    }
};
cat.jiao(); //调用这个重写后的方法
```

简单应用

```java
public static void main(String[] args) {
        go(new Swimming() {  //定义一个匿名内部类,自动创建对象后直接传递给go()函数作为参数
            @Override
            public void swim() {
                System.out.println("狗开始游泳");
            }
        });
    }
// 接收一切实现Swimming接口的对象
    public static void go(Swimming s) {
        System.out.println("游泳开始");
        s.swim();
    }
//定义接口和抽象方法
interface Swimming {
    void swim();
}
```

## 枚举类

*优势:*

1. 提供一组固定常量，避免意外使用一个未定义的值
2. 比常量和字符串更易读
3. 可以封装行为
4. 每个枚举常量都是一个实例，天然支持单例设计模式。
5. 天然支持序列化
6. 可以直接在 switch 语句中使用枚举

*注意事项*

* 记住,这些常量 X,Y,Z 的本质就是 A 这个类的的一个对象,而不仅仅是常量
* 第一行必须是列举枚举对象的名字,这些名称都是常量,每个常量记得都是枚举类的一个对象.
* 枚举类的构造器一定都是私有的,默认就是私有,不能创建对象
* 枚举类无法被继承

*示例*

```java
public enum A {
    // 第一行必须是列举枚举对象的名字,这些名称都是常量,每个常量记得都是枚举类的一个对象.
    X, Y, Z; //实际就是枚举类A的对象实例
    // .class文件里就是
    // public static final X = new A();
    private String name = "cdsc"; //可以定义变量与方法
}
//main主文件中调用
A a1 = A.X; //调用
System.out.println(a1); //X
```

*重写枚举类的抽象方法*

```java
public enum A {
      X() {
        @Override //在枚举对象中重写A这个类的go抽象方法
        public void go() {
            System.out.println("X");
        }
    },
    Y("张三") { //向Y传入参数,触发有参构造函数
    //相当于 public static final X = new A("张三");
        @Override
        public void go() {
            System.out.println(getName()); //调用方法得到name
        }
    };

    public abstract void go(); //定义一个抽象方法

    A() {} //无参构造

    A(String name) { // 有参构造器
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

*常用方法*

```java
        A a1 = A.X; // 调用
        A a2 = A.valueOf("Y"); // 根据枚举常量名得到Y这个枚举对象
        A[] values = A.values(); //拿到全部对象 X,Y,Z
        System.out.println(a1.name()); // 得到对象的名字,X
        System.out.println(a1.ordinal()); // 得到X的索引,0
```

*简单应用*

```java
public enum Diff{
    BOY,GIRL;
}
//main
check(Diff.BOY);
public static void check(Diff sex){
    switch (sex){
        case BOY:
            sout("男");
            break;
        case GIRL:
            sout("女");

            break;
    }
}
```

## 泛型

*举例:*\
`public class ArrayList<E>{}`, `ArrayList<E>`就是种泛型,能约束数据类型,避免强制转换.泛型的本质是把具体数据类型传递给类型变量.

* 泛型运行在编译时,在.class 文件不存在,这是泛型擦除
* 泛型不支持基本数据类型,如 int,double,只支持对象类型.

```java
//需要把基本数据类型换成对象类型,才能传入整数,浮点数等
 ArrayList<Integer> list1 = new ArrayList<>();
 ArrayList<Double> list1 = new ArrayList<>();
```

泛型符号规范:

```
E - Element (在集合中使用，因为集合中存放的是元素)
T - Type（Java 类）
K - Key（键）
V - Value（值）
N - Number（数值类型）
S、U、V - 2nd、3rd、4th types
```

### 自定义泛型类

`修饰符 class 类名<类型变量,类型变量,...>{}`

泛型类举例

```java
//模拟ArrayList
public class MyArrayList<E> { //创建对象时<>里是啥,所有的E就全都替换成那个数据类型
    private Object[] arr = new Object[10];
    private int size;

    public boolean add(E e) {
        arr[size++] = e;
        return true;
    }
    public E get(int index) {
        return (E) arr[index];
    }
}
//main
    Fanxing<String> f = new Fanxing(); //<>里可以限制数据类型,String就会替换掉全部的E
        f.add("fsd");
        f.add("fsd");
        System.out.println(f.get(1));
```

多个泛型参数

```java
//多个泛型参数
public class Myclass<E,T>{
    public void input(E e,T t){} //传入多个参数
}

//main
Myclass<String ,int> c2 = new Myclass<>(); //传入对应的两个数据类型
    c2.input("fsd",123); //调用函数时也是
```

限制泛型类必须继承一个类

```java
public class Myclass3<E extends Animal>{},要求传入的数据类型必须继承Animal类.
```

### 自定义泛型接口

`修饰符 interface 接口名<类型变量,类型变量 ,...>{}`

```java
public interface Data<T>{
    void add(T t); //这样重写这个接口的类就可以传入自己的对象的类型了
    ArrayList<T> getByName(String name);
}
//实现这个接口
public class Student implements Data<Student>{重写方法}
public class Student implements Data<Teacher>{重写方法}


public interface Data<T extends Animal> //如果接口定义的类型是继承了某个类,那么其他实现这个接口的类就应该传入Animal的对象或者他的子类对象
```

### 自定义泛型方法

`修饰符<类型变量,类型变量,..> 返回值 方法名(形参列表){}`

```java
   public static <T extends Car> T test(T t){
    return t;
   }
   //所有Car的子类都可以传入
```

### 通配符

```java
public static <T extends Car> void go(ArrayList<T> cars){}
//改写成
public static void (ArrayList<? extend Car> cars)
// ?是通配符,代表可以传入一切类型,extends Car,则只能传入Car子类
//像这样限制传入参数的上限的称为泛型上限
public static void go(ArrayList<? super Car> cars)
// 只能传入Car或Car父类,
```
