---
url: /java/special/javaapi.md
---
# 线程

## 创建线程

### Runnable

```java
//Threadclass.java
public class Runclass implements  Runnable{
    //让类实现Runnable接口,然后重写run()方法
    @Override
    public void run() {
        System.out.println("Thread is running");
    }
}
//main主文件
public static void main(String[] args) {
   Runclass runclass = new Runclass(); //创建Runnable对象
   Thread thread = new Thread(runclass); //把Runnable对象传给Thread
   thread.start(); //启动线程
   System.out.println("main thread"); //main主线程任务
}
```

```java
//匿名内部类写法
Thread thread = new Thread(new Runnable() {
   @Override
   public void run() {
      System.out.println("hello world");
   }
});
//lambda简化
Thread thread = new Thread(() -> System.out.println("hello world"));
```

### Callable

这个接口可以在线程结束时返回数据

```java
// Threadclass.java
public class Runclass implements Callable<String> {
    private int n;
    public Runclass(int n) {
        this.n = n;
    }
    //让类实现Callable接口,然后重写call()方法
    @Override
    public String call() throws Exception {
        int sum = 0;
        for (int i = 0; i <= n; i++) {
            sum += i;
        }
        return "线程返回String类型,和为"+ sum; //返回对应的数据类型
    }
}
//main主函数文件
//创建Callable对象
Callable<String> call = new Runclass(10); //传入构造器参数
//把Callable对象封装成FutureTask任务对象,写明返回的数据类型
FutureTask<String> future = new FutureTask<>(call);
//把任务对象扔进线程并启动
new Thread(future).start();
//获取线程执行结果,调用FutureTask对象的get方法
//get方法会阻塞当前线程,直到线程执行完毕,才会返回结果
String result = future.get();
System.out.println(result);
```

## 线程方法

```java
//Threadclass.java
public class Threadclass extends Thread {
   public Threadclass(String name){ //构造器,可以自定义线程名
      super(name); //把线程名传到父类Thread,然后就可以调用这个构造器
   }
   @Override
   public void run() {
      System.out.println("Runnable");
   }
}
//main主函数文件
        for (int i = 0; i <10 ; i++) {
            if (i == 5){
                Thread.sleep(5000); //让当前执行的线程休眠5秒
            }
            System.out.println(i);
        }
        Thread t1 = new Threadclass("送入构造器的名字");
        t1.start();
        t1.join(); //调用Join的方法会优先执行,然后才执行后面的代码,可以保证执行顺序
        t1.setName("自定义线程名"); //设置线程名
        System.out.println(t1.getName()); //获取线程名,Thread-0
        //直接通过构造器设置线程名
        Thread t2 = new Threadclass("二号线程");
        t2.start();
        t2.join(); //确保t1执行完再执行t2,而不会是其他线程,t2是第二个
        Thread mainthread = Thread.currentThread(); //获取当前执行的线程,也就是main
        System.out.println(mainthread.getName());
```

## 线程同步

如果两个线程同时取钱,就会同时判断还有钱,这样就取了两次,会导致线程安全问题,所以必须上锁,每次只让一个线程进去

```java
//main主函数文件
Atm acc = new Atm("0001", 1000); //这是第一家银行卡,夫妻两人同时来取钱
        new Threadopt(acc,"小明").start();
        new Threadopt(acc,"小红").start();

Atm acc1 = new Atm("0002", 1000);//这是第二家银行卡,夫妻两人同时来取钱
        new Threadopt(acc1,"joli").start();
        new Threadopt(acc1,"kitty").start();

//Threadopt.java
public class Threadopt extends Thread{ //继承Thread类
   private Atm acc;
   public Threadopt(Atm acc , String name) {
      super(name); //把线程名传到父类Thread
      this.acc = acc; //传入银行卡对象
   }
   public void run(){
      acc.draw(1000); //调用取钱方法
   }
}
//Atm.java
private final Lock lk = new ReentrantLock(); //在Atm这个类创建一个锁,final修饰让他不被修改
//写一个取钱方法
//另一种上锁方法是 public synchronized void draw(double drawMoney),加synchronized修饰给这个操作共享资源的方法上锁
public void draw(double drawMoney)
{
   try {
      lk.lock(); //从这个地方上锁,确保这个对象的两个线程只有一个进入
      if(money>=drawMoney)
      {
         System.out.println(Thread.currentThread().getName()+"取钱成功，取了"+drawMoney); //查看当前线程名
         money-=drawMoney;
         System.out.println("取钱成功，余额为"+money);
      }
      else
      {
         System.out.println(Thread.currentThread().getName()+"取钱失败，余额不足");
      }
   } catch (Exception e) {
      throw new RuntimeException(e);
   } finally {
      lk.unlock(); //如果上面的代码出错了,确保可以解锁,避免解不了锁了
   }
}
```

## 线程池

### 创建线程池

任务会进入到线程池中,线程池有固定的线程数,每个线程处理一个任务,剩下的任务都放在队列中等待有线程空余\
创建线程池的接口是 ExecutorService,它的实现类是 ThreadPoolExecutor\
参数含义:

1. corePoolSize:核心线程数,就是正式工
2. maximumPoolSize:最大线程数, 正式工+临时工. 当核心线程都忙, 而且任务队列满员了, 就开始创建临时线程
3. keepAliveTime: 临时线程空闲多长时间销毁, 临时工空闲了多长时间时间就要辞退
4. unit: keepAliveTime 的单位,默认 TimeUnit.SECONDS,TimeUnit.MILLISECONDS,TimeUnit.MINUTES,TimeUnit.HOURS,TimeUnit.DAYS
5. workQueue:当核心线程都在忙 , 任务要到任务队列等待核心线程忙完,new LinkedBlockingQueue<>()不限制容器大小, new ArrayBlockingQueue<>(4)限制队列容器大小为 4
6. threadFactory:线程工厂,用于创建那些线程,也就是创建合同工和临时工 , 默认 Executors.defaultThreadFactory(),
7. handler:拒绝策略: - new ThreadPoolExecutor.AbortPolicy() 直接抛出异常 - new ThreadPoolExecutor.CallerRunsPolicy() 主线程 main 直接来处理任务 - new ThreadPoolExecutor.DiscardOldestPolicy() 丢弃等待时间最久的任务, 把当前任务加入队列中

* 计算密集型程序, 核心线程数 = cpu 核数 + 1
* IO 密集型程序, 核心线程数 = cpu 核数 x 2
  cpu 核数通过 ` System.out.println(Runtime.getRuntime().availableProcessors());`查看

```java

         ExecutorService pl = new ThreadPoolExecutor(2, 4, 1000, TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(3), Executors.defaultThreadFactory() , new ThreadPoolExecutor.AbortPolicy());
```

### 处理 runnable 线程池

```java
//Myrunnable.java
public class Myrunnable  implements  Runnable{
   @Override
   public void run() {
      System.out.println(Thread.currentThread().getName() + "    输出666");
      try {
         Thread.sleep(Integer.MAX_VALUE); //让线程处于阻塞状态,一直处理这个任务
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
   }
}

//main主函数文件
  Runnable target = new Myrunnable();
        pl.execute(target); //把任务对象交给线程池, 会自动创建线程并处理
        pl.execute(target); //再交一个任务对象, 让他再创建新线程并处理
        //现在线程池中两个核心线程都被滞留在他的任务上 ,由于任务类run方法中 Thread.sleep(Integer.MAX_VALUE); 休眠函数
        //如果没有设置无限制休眠 ,那么核心线程忙完后会继续处理下面的任务

        pl.execute(target);
        pl.execute(target);
        pl.execute(target); //来三个任务到任务队列, 这时候任务队列满了

        pl.execute(target); //这时候又来了一个任务, 但是核心线程都在忙, 而且任务队列满了, 那么开始创建一个临时线程
        pl.execute(target); //又来一个 ,再创建一个临时线程
        //现在核心线程和临时线程都滞留在他的任务上 ,而且任务队列还是3个任务, 满了 ,那么 这时候再来一个新任务就会触发拒绝策略

        pl.execute(target); //所有线程都在忙而且任务队列满了 ,再来一个会触发拒绝策略 , 如果拒绝策略是ThreadPoolExecutor.CallerRunsPolicy() ,会由主线程main来执行这个任务,也就是老板亲自接待
        pl.shutdown(); //所有任务执行完毕后关闭线程池
        //pl.shutdownNow(); //立即关闭线程池, 不管有没有执行完
```

### 处理 Callable 线程池

```java
//Mycallable.java
public class Mycallable implements Callable<String> {
    private int n;

    public Mycallable(int n) { //构造函数
        this.n = n;
    }
    @Override
    public String call() throws Exception {
        return "这是第" + n + "个老弟";
    }
}

//main主函数文件
  ExecutorService pl = new ThreadPoolExecutor(2, 4, 1000, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(3), Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.CallerRunsPolicy());

        Future<String> f1 = pl.submit(new Mycallable(5)); //submit接收一个Callable对象,自动交给线程池并执行, 返回一个未来任务对象, Futrue<返回数据类型>.
        Future<String> f2 = pl.submit(new Mycallable(10));
        Future<String> f3 = pl.submit(new Mycallable(20));
        System.out.println(f1.get()); //.get()获取第一个线程任务返回的那个字符串

```

## 并发与并行

每个正在运行的软件是一个进程, 进程里包含很多线程, 线程由 cpu 调度

1. 比如只有一个核心, 有很多线程, 那么这个 cpu 核心就会以极快的速度在这些线程来回切换进行处理, 前一秒还在处理 a,下一秒就切换到 b, 这样疯狂切换 ,这就叫并发.
2. 比如有有四个核心, 他们在同一时刻处理四个线程, 那么这时候这四个线程就在并行
3. 系统运行是以并行为单位的并发, 比如有 4 个核心, 在同一时刻同时处理 4 个线程, 下一时刻就立刻去处理另外四个线程, 以四个线程的并行 为单位 不断的切换(并发), 每次切换将同时处理四个线程.

## 线程生命周期

定义在 Thread.state 中,是枚举类:
NEW,RUNNABLE,BLOCKED,WAITING,TIMED\_WAITING,TERMINATED;

1. new 新建一个线程, 调用 start 方法执行它, 就变成了 Runnable, 执行完毕或出现异常就被终止了,就是 Terminated .
2. 如果一个线程在 Runnable 状态抢一个锁 lock 没抢到,会进入 Blocked 锁阻塞状态,等到锁被释放抢到锁了,就进入了 Runable 继续运行,如果这个线程得到锁后,调用了 wait 方法,就会进入无限等待 waiting, 如果别的线程唤醒 notify 这个线程, 这个线程起来就要和其他线程再次抢锁,没抢到就锁阻塞 Blocked,抢到了再进入 Runnable
3. 一个 Runnable 状态的线程调用了 sleep(),进入 Timed Waiting 计时等待,sleep 时间到了就会进入 Runnable。调用 sleep 不会释放锁,抢到锁了就睡觉,醒来也不会释放锁,继续运行。 但如果是调用了 wait,被其他线程唤醒后就要开始抢锁, 得到锁对象才能进入 Runnable,没抢到锁对象进入 Blocked 状态.

***

# 文件处理

## 创建文件对象

```java
        // win下也能用/,如果用\,需要写成\\,避免转义字符
        // 绝对路径的话,linux下从home目录开始找,win下从盘符开始找
        File f2 = new File("/home/tzgml/mycode/learnjava/src/gml/file/test1.java");
        // linux下写相对路径,是相对于项目根目录,不是当前文件,win下一样,但是Linux不能写项目名(项目根目录名),直接从第二层目录开始写,根目录本身不存在相对,若要访问,直接写绝对路径
        File f1 = new File("src/gml/file/test.java"); //根目录下的src文件夹
        File f5 = new File("javaapi.md"); // 这个文件直接位于根目录下
        File f6 = new File("test/1.html"); // 根目录下的test文件夹
        // 用File.separator可以得到当前系统的分隔符
        File f3 = new File("src" + File.separator + "gml" + File.separator + "file" + File.separator + "test.java");
        File f4 = new File("src/gml/file"); // 可以是文件夹,取length会是文件夹本身大小,不含里面的文件;
        System.out.println(f5.exists() + "" + f5.length());
```

## 常用 API

### 文件信息

```java
 File f1 = new File("src/gml/file/test1.java");
        System.out.println(f1.exists()); // 判断文件是否存在
        System.out.println(f1.isFile()); // 判断是否为文件
        System.out.println(f1.isDirectory()); // 判断是否为目录
        System.out.println(f1.getName()); // 获取文件名(含后缀)
        System.out.println(f1.getPath()); // 获取创建文件对象时用的文件路径
        System.out.println(f1.getAbsolutePath()); // 获取文件的绝对路径
        System.out.println(f1.length()); // 获取文件的字节数
        Long time = f1.lastModified(); // 获取文件的最后修改时间
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        System.out.println(sdf.format(time)); // 需要格式化时间
```

### 文件增删

```java
         // 先创建一个不存在的文件对象,然后创建这个文件
        File f1 = new File("src/gml/file/test1.java");
        try { // 创建文件需要捕获异常
            System.out.println(f1.createNewFile());
        } catch (Exception e) {
            e.printStackTrace();
        }
        File dir = new File("src/gml/file/test"); // 只创建test文件夹
        File dir = new File("src/gml/file/test/1/2/3"); // 创建多级目录
        try {
            System.out.println(dir.mkdirs()); //或mkdir
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 只能删除文件和空文件夹,不能删除非空文件夹,删除后文件不会进回收站
        //要删除非空文件夹,要先删完里面全部文件,再删文件夹
        System.out.println(f1.delete());
```

### 文件夹遍历

```java
    File f1 = new File("/home/tzgml/mycode/learnjava");
        String listfile[] = f1.list(); // 获取所有一级文件或文件夹名称,返回一个字符串数组,他仅仅只是获得名称
        for (String l : listfile) { // 增强for遍历
            System.out.println(l);
        }

     File files[] = f1.listFiles(); // 获取所有一级文件对象,返回一个一级文件对象数组
        for (File f : files) {
            System.out.println(f.getAbsolutePath());
        }
```

### 批量更改文件夹名称

```java
    File f1 = new File("test"); //获取文件夹对象
    File f[] = f1.listFiles(); //获取该文件夹下所有文件对象
    for (File z : f) {
        String fname = z.getName(); //获取每个文件名称
        String begin = fname.substring(0, 1); //截取文件名的索引
        String end = fname.substring(1, fname.length()); //截取文件名剩下的部分
        String newname = (Integer.valueOf(begin) + 18) + end; //合并成新字符串
        z.renameTo(new File(z.getParent(), newname)); //更改文件名
    }
```

### 搜索文件

```java
       //在主函数Main中调用
       File home1 = new File("/home");
        search(home1, "hypr");

    /**
     * 递归遍历文件夹
     *
     * @param dir  目录对象
     * @param name 要搜索的文件名
     */
    public static void search(File dir, String name) {
        // 把非法的参数先处理掉
        if (dir == null || !dir.exists() || dir.isFile()) {
            return;
        }
        File list[] = dir.listFiles(); // 获取当前目录下所有一级文件对象
        if (list != null && list.length > 0) { // 判断是否为真正拿到了文件对象列表
            for (File l : list) {
                if (l.isDirectory()) { // 如果是目录，则递归调用
                    search(l, name);
                } else { // 如果是文件，则判断是否是要搜索的文件
                    if (l.getName().contains(name)) {
                        System.out.println("找到文件：" + l.getAbsolutePath());
                    }
                }
            }
        }
    }
```

listFiles 注意事项:

1. 如果主调是文件而非目录,或路径不存在,或没有权限访问文件夹,则返回 Null
2. 主调空文件夹,返回长度为 0 的数组
3. listFiles 返回的数组中可以有隐藏文件

### 删除非空文件夹

```java
  public static void main(String[] args) {
        File d = new File("src/gml/ticket");
        deleteFile(d);
    }

    public static void deleteFile(File dir) {
        if (dir == null || !dir.exists()) {
            return;
        }

        if (dir.isFile()) {
            dir.delete();
            return; //如果是递归调用时的return,会跳到主调的地方继续向下执行
        }

        File list[] = dir.listFiles(); //获取当前文件夹下一级文件对象
        if (list == null) {
            return;
        }
        for (File l : list) {
            if (l.isFile()) {
                System.out.println("删除文件" + l.delete());
            } else {
                deleteFile(l); //如果是文件夹，则递归调用自己，再遍历子文件夹
            }
        }
        dir.delete(); //删完所有子文件夹跳出上面的循环，来这删除空文件夹自己
    }
```

## 字符集

1. 标准 ASCII，每个一个字节，以二进制编码，但为了凑成一个字节，会补位，首尾都是 0，一共 128 个，每个字符的序号称为码点
2. GBK,汉字编码字符集，一个中文字符两字节，兼容 ASCII,解码的时候为了区分汉字和 ASCII,规定汉字第一个字节第一位为 1,而 ASCII 是 0，遇到 1,就识别两字节，0 就一字节。
3. Unicode,国际通用字符集,编码方法如下：
   * 最早为 UTF-32,4 个字节一个字符,但是不同字符需要空间不一样,这样一刀切会增大占用。
   * UTF-8,可变长编码方案，有四个长度，1/2/3/4 个字节，ASCII 字符占 1 个字节，中文字符占 3 个字节。凡是 ASCII,二进制都以 0 开头，凡是两个字节的，第一个字节开头必须 110,第二个字节必须 10,然后写二进制位。凡是三个字节的，每个字节开头必须分别为 1110,10,10,凡是四个字节，每个字节开头必须是 11110,10,10,10。开发应当用 UTF-8 编码！

## 编解码

```java
        byte[] bytes = code.getBytes(); // 按照IDE默认编码转换为字节数组
        byte[] bytegbk = code.getBytes("GBK"); // 按照指定字符集编码

        String jiema1 = new String(bytes); // 通过String构造器进行平台默认字符集解码
        String jiema2 = new String(bytegbk, "GBK"); // 通过String构造器进行指定字符集解码
```

## 输入输出流

分为字节输入/输出流，字符输入/输出流，具体为四个接口：

* InputStream 和 OutputStream 是字节流，适合图像，音视频
* Reader,Writer 是字符流，适合文本

1. InputStream ,实现类有 FileInputStream，BufferedInputStream
2. OutputStream,实现类有 FileOutputStream,BufferedOutputStream
3. Reader,实现类有 FileReader
4. Writer,实现类有 FileWriter

### InputStream

```java
    File obg = new File("javaapi.md");
    InputStream newobg = new FileInputStream(obg); // 通过文件对象创建输入流，就是建立与文件的连接
    // 通过文件路径创建输入流，他内部实际上是根据路径new一个文件对象，底层就是上一种方法。
    InputStream newpath = new FileInputStream("javaapi.md");

    // 如果没有数据了，返回-1
    int b = newpath.read(); // 读取一个字节的数据
    System.out.println((char) b);
    newobg.close(); // 用完必须关闭与文件的连接

    InputStream is = new FileInputStream("src/gml/file/1.txt"); //比如这个文件有abcde五个字符
    byte many[] = new byte[3]; // 设置读取文件三个字节
    is.read(many); // 返回Int,表示读取了多少字节，这时候已经把文件读取到数组中，读取完了返回-1
    String zifu = new String(many); // 用String解码
    System.out.println(zifu); // 这时候读取了前三个字节abc
    is.read(many); // 再读取三个字节,但这时候不存在第三个字节，就会只读取前两个，装到many这个数组的前两位，后一位还是原来的。
    String zifu1 = new String(many); // 用String解码
    System.out.println(zifu1); // 输出dec
    is.close(); // 用完必须关闭与文件的连接

    //为避免上述情况，读多少向数组倒入多少，把String改成如下：
    String zifu = new String(many,0,is.read(many));
    // tring(byte[] bytes, int offset, int length)
    //表示从数组的第0位开始，读到这次读取的长度为止。


    byte all[] = put.readAllBytes(); // 读取文件全部字节，返回一个字节数组，若大于内存，则报错
    System.out.println(new String(all));
```

### OutputStream

```java
       //根据文件路径创建输出流
       OutputStream p1 = new FileOutputStream("javaapi.md");
        //根据File文件对象创建
       OutputStream p1 = new FileOutputStream(File file);
        // 以上两种方式，如果后面加了true, 则表示追加写入，而不是覆盖
        OutputStream p1 = new FileOutputStream("src/gml/file/1.txt", true);

        byte all[] = "草拟啊没得比".getBytes(); //定义一个字符串转换成byte数组
        p1.write(86); // 写入单一一个字符
        p1.write(all); //写入一个byte数组
        p1.write(all, 0, 9); // 起始位置，往后要的字节长度
        p1.write("\r\n".getBytes()); // 换行
        p1.close(); // 关闭通信管道

    //文件复制功能,这两个字符串是文件路径
    public static void copy(String d1, String d2) throws Exception {
        InputStream is = new FileInputStream(d1);
        OutputStream os = new FileOutputStream(d2);
        byte filedata[] = is.readAllBytes();
        os.write(filedata);
        is.close();
        os.close();
    }
```

### FileReader

```java
      FileReader fr = new FileReader("src/gml/file/1.txt"); // 创建文件字符流
        int c = fr.read(); // 读取一个字符返回
        System.out.println((char) c); // 转成字符
        char c1[] = new char[12]; // 定义一个字符数组存储
        int c2 = fr.read(c1); // 读取12个字符，返回读了多少字符
        for (char i : c1) {
            System.out.print(i);
        }
```

### FileWriter

```java

        try ( // 字符输出流写出数据后必须刷新或关闭流才能生效 ，写在try里自动关闭
                // 创见FileWriter对象，传入文件路径或File对象，末尾加true表示末尾追加
            FileWriter fw = new FileWriter("src/gml/file/1.txt", true);
            ) {
            fw.write(48); // 写入ascll字符 0
            fw.write("你好".toString()); // 写入字符串
            fw.write("草你麻痹", 0, 1); // 写入字符串的指定部分
            char ca[] = { 'a', 'b', 'c', 'd', 'e' };
            fw.write(ca); // 写入字符数组
            fw.write("\r\n"); // 换行
            fw.write(ca, 0, 4); // 写入数组的指定部分
        } catch (Exception e) {
            e.printStackTrace();
        }
```

### 缓冲流

```java
// 字节缓冲
    InputStream put = new BufferedInputStream(new FileInputStream("src/gml/file/1.txt"), 8192 * 2); // 是对InputStream的包装，速度更快,他会在内存中开辟8kb缓冲区，先读取一部分数据到缓冲区，再从缓冲区读取数据，减少磁盘读写次数,new这个对象时，第二个参数指定缓冲区大小，方法和InputStream一样
//字符缓冲
     Reader newobg = new BufferedReader(new FileReader("src/gml/file/1.txt"), 8192 * 2);
    String line = newobg.readLine(); // 可以读取一行数据,读完了返回null ,要调这个方法只能是BufferedReader
    String line1 = newobg.readLine(); // 读取下一行数据

       try (BufferedWriter newobg = new BufferedWriter(new FileWriter("src/gml/file/1.txt", true), 8192 * 2);) {
            newobg.write("dcdefv");
            newobg.newLine(); // 换行
            newobg.write("dcdefv");
        } catch (Exception e) {}
```

### 转换流

```java
// 字符输入转换流
    try (
            InputStream is = new FileInputStream("src/gml/file/1.txt"); //创建一个原始字节输入流
            Reader rd = new InputStreamReader(is, "GBK"); // 使用GBK编码的转换流进行转换
            BufferedReader rfb = new BufferedReader(rd); // 用缓冲流包装转换过得流
        ) {
            String line = rfb.readLine();
            System.out.println(line);
        } catch (Exception e) {}

// 字符输出转换流
        try (
            OutputStream is = new FileOutputStream("src/gml/file/1.txt"); // 创建一个原始字节输出流
            Writer rd = new OutputStreamWriter(is, "GBK"); // 使用GBK编码的转换流进行转换
            BufferedWriter rfb = new BufferedWriter(rd); // 用缓冲流包装转换过得流
        ) {
            rfb.write("你好，世界！"); //写入数据
        } catch (Exception e) {}
```

### 打印流

```java
  try (
            // PrintStream ps = new PrintStream("/src/gml/file/1.txt" ,
            // Charset.forName("UTF-8"); //指定字符编码
            PrintStream ps = new PrintStream("src/gml/file/1.txt");
            PrintWriter pw = new PrintWriter("src/gml/file/1.txt");
        )
        {
            ps.println("Hello World"); //PrintStream偏向写字节
            ps.println(97); //97 println写入什么就是什么
            ps.println(true); //true
            ps.write(97); //a
            pw.write("你是什么sb"); //PrintWriter支持写字符
        } catch (Exception e) {
            e.printStackTrace();
        }
```

*打印流重定向*

```java
      //将系统的打印流设置为自己的打印流,让原本在控制台的输出重定向到一个文件里
            System.setOut(ps);
            System.out.println("这是一个日志");
```

### 序列化流

```java
 try (
         //向文件写入对象,参数为一个OutPutStream的实现类
            ObjectOutputStream op = new ObjectOutputStream(new FileOutputStream("src/gml/file/1.txt"));//读取文件中的对象
            ObjectInputStream is = new ObjectInputStream(new FileInputStream("src/gml/file/1.txt"));
        )
        {
           Student s = new Student("joli",15,99.8);
           //调用序列化输出流的writeObject方法,填入一个对象,向文件写入这个对象
            //类必须implements Serializable ,实现序列化接口
           op.writeObject(s);
           System.out.println(is.readObject());
           //如果想让某个属性不读取,要加transient,如 private transient double score;

        } catch (Exception e) {
            e.printStackTrace();
        }
```

### 文件读写框架

用 apache 的 Commons-io

***

# 网络编程

## InetAddress

```java

    InetAddress myip = InetAddress.getLocalHost(); // 获取自己主机的ip
    System.out.println(myip.getHostName() + myip.getHostAddress()); // getHostName()获取主机名，getHostAddress()获取ip地址
    InetAddress bz = InetAddress.getByName("www.bilibili.com"); // 根据域名获取ip
    System.out.println(bz.isReachable(20000)); // 判断主机是否能到达,设置超时时间为20秒
```

## UDP

1. 要先启动服务端,再启动客户端,客户端对象不要指定端口,可以客户端多开
2. 服务端对象不要 close();客户端要

```java
//Client.java
//写之前别忘了把这整个main方法throws Exception
        byte tz[] = new byte[] { (byte) 192, (byte) 168, (byte) 43, (byte) 1 }; //new一个Byte数组,将ip地址每段都转换成Byte存进去
        InetAddress tz1 = InetAddress.getByAddress(tz); //InetAddress.getAddress(),根据地址获得InetAddress对象
        DatagramSocket client = new DatagramSocket(); // 创建客户端对象
        Scanner sc = new Scanner(System.in);
        while (true) { //弄一个死循环不停发消息
            System.out.println("发送信息:");
            String cmsg = sc.nextLine(); // 获取用户输入的信息
            if (cmsg.equals("exit")) {
                System.out.println("客户端退出");
                break;
            }
            byte meg[] = cmsg.getBytes(); // 创建一个比特类型的数组
            DatagramPacket cpacket = new DatagramPacket(meg, meg.length, tz1, 6666); // 创建这个数据包对象,参数分别为: byte数组,数组长度,目标ip,目标端口号
            client.send(cpacket); // 发送数据包
            System.out.println("发送成功");
        }
        client.close();

//Server.java
        DatagramSocket server = new DatagramSocket(6666); // 创建服务端对象,指定服务端对象的端口
        byte[] data = new byte[1024 * 64]; // 创建接收数据的数组,64bit
        DatagramPacket spacket = new DatagramPacket(data, data.length); // 创建服务端接受数据包的对象,接受一个byte数组和接受数据包的长度
        while (true) {
            server.receive(spacket); // 接收数据包
            int len = spacket.getLength(); //getLength()获取数据包长度
            String msg = new String(data, 0, len); //根据数据包实际长度,存储为String
            System.out.println("客户端发送了:" + msg);
            System.out.println("来自" + spacket.getAddress() + ":" + spacket.getPort()); //根据数据包查询源地址和源端口
        }
```

## TCP

```java
//Server.java
   ServerSocket serversocket = new ServerSocket(8888); // 创建socket对象,注册服务端端口
        while (true) { //可以不断的接收socket对象
            Socket socket = serversocket.accept(); // 接受客户端发送过来的socket对象
            System.out.println(socket.getRemoteSocketAddress() + "上线了"); //上线提醒
            new SocketThread(socket).start(); //把接收到的socket对象扔到子线程里
        }

//SocketThread.java
public class SocketThread extends Thread {  //必须继承Thread类
    private Socket socket; //用于记录当前socket对象
    public SocketThread(Socket socket) { //从主线程接一个socket对象
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            InputStream in = socket.getInputStream(); // 获取到字节输入流对象
            DataInputStream din = new DataInputStream(in); // 将in这个字节输入流转换成数据输入流
            while (true) {
                try { // 如果客户端退出了,服务端会报错,这时候要捕获异常
                    String msg = din.readUTF(); // 使用数据输入流读取客户端发送的信息
                    System.out.println(msg);
                } catch (Exception e) {
                    System.out.println(socket.getRemoteSocketAddress() + "对方离线了");
                    // getRemoteSocketAddress();获取客户端Ip
                    socket.close(); //关闭socket对象
                    din.close();  //关闭数据流对象
                    break; // 客户端退出了,服务端用break直接跳出
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}


//Client.java
        Socket socket = new Socket("127.0.0.1", 8888); // 创建socket对象,填写服务端信息,ip+端口

        OutputStream os = socket.getOutputStream(); // 从socket对象中获取字节输出流

        DataOutputStream dos = new DataOutputStream(os); // 将os这个字节输出流转换成数据输出流
        Scanner sc = new Scanner(System.in);
        while (true) {
            String msg = sc.nextLine();
            if ("exit".equals(msg)) {
                System.out.println("即将退出");
                dos.close(); // 关闭数据流
                socket.close(); // 关闭客户端socket对象
                break;
            }
            dos.writeUTF(msg); // 发送信息
            dos.flush(); // 让数据立刻发出去而不是滞留在客户端内存
        }

```

## 浏览器服务器架构

一般都是这种,只需要做服务端,客户端是浏览器

```java
//Server.java
   public static void main(String[] args) throws Exception {
        ServerSocket serversocket = new ServerSocket(8080); // 创建socket对象,注册服务端端口
        // 创建一个线程池,避免线程过多导致系统瘫痪
        // 核心线程数: 如果是io密集型,要是服务器线程数量*2
        // 最大线程数: 和第一个一样的话,那就固定是这个数量
        // 空闲线程存活时间: 设置成秒
        // TimeUnit: 存活时间单位
        // 最大可以缓存多少客户端的请求
        // 线程工厂,创建这些核心线程
        // 拒绝策略,这里采用了默认的拒绝策略,直接抛出异常
        ThreadPoolExecutor pool = new ThreadPoolExecutor(8 * 2, 8 * 2, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(8),
                Executors.defaultThreadFactory(), new ThreadPoolExecutor.AbortPolicy());
        while (true) {
            Socket socket = serversocket.accept(); //接受一个浏览器发送过来的socket对象
            // 把这个socket作为一个线程任务处理
            pool.execute(new ServerThread(socket));
        }
    }
//ServerPool.java
//让他实现一个任务类
public class ServerPool implements Runnable {
    private Socket socket; //用于接受传过来的socket对象
    public ServerThread(Socket socket) { //有参构造器
        this.socket = socket;
    }
    @Override
    public void run() {
        try {
            OutputStream os = socket.getOutputStream(); //获取数据输出流
            PrintStream dos = new PrintStream(os); // 封装成打印流
            // 必须为HTTP协议格式
            dos.println("HTTP/1.1 200 OK"); // 协议版本, 状态码, 状态码描述
            dos.println("Content-Type: text/html; charset=UTF-8"); // 数据类型
            dos.println(); // 必须换行
            dos.println("<html><body><h1>葛墨林万岁!</h1></body></html>"); // 实际内容
            dos.close(); //用完必须关掉
            socket.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
```

***
