---
url: /arch/arch.md
---
# arch

#### 基本系统安装:

1. 进入BIOS，选择UEFI启动
2. 禁止终端蜂鸣器: `rmmod pcspkr`
3. 确认是否为UEFI模式:`ls /sys/firmware/efi/efivars`
4. 联网: `iwctl`进入交互式，`device list`查看网卡名，比如wlan0，`station wlan0 scan`扫描网络，`station wlan0 get-networks`列出网络，`station wlan0 connect wifi-name`联网，`exit`退出，`ping bing.com`查看是否联网。
5. 校时: `timedatectl set-ntp true`，`timedatectl status`验证是否成功
6. 换源: `vim /etc/pacman.d/mirrorlist`，`Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch # 清华大学开源软件镜像站`
7. 转换磁盘为GPT类型:`parted /dev/nvme0n1`， 输入`mktable`，然后gpt，yes，最后quit
8. `cfdisk`，先建立512MB的EFI分区，再创建大于内存60％的swap分区，最后剩余空间全部分给btrfs系统分区。
9. 格式化EFI分区:`mkfs.fat -F32 /dev/nvme0n1p1`，格式化swap分区`mkswap /dev/nvme0n1p2`，`mkfs.btrfs -L myArch /dev/nvme0n1p3`。
10. 创建btrfs子卷:，先挂载btrfs分区到/mnt:， `mount -t btrfs -o compress=zstd /dev/nvme0n1p3 /mnt`，`df -h`查看是否挂载成功，`btrfs subvolume create /mnt/@ ` 创建根目录子卷，`btrfs subvolume create /mnt/@home` 创建home子卷，`btrfs subvolume list -p /mnt`，查看挂载情况。将/mnt卸载以挂载子卷，`umount /mnt`。
11. 挂载各分区和以及子卷`mount -t btrfs -o subvol=/@,compress=zstd /dev/nvme0n1p3 /mnt`  挂载 / 目录。 `mkdir /mnt/home` ，创建 /home 目录，`mount -t btrfs -o subvol=/@home,compress=zstd /dev/nvmexn1p3 /mnt/home` ， 挂载 /home 目录。`mkdir -p /mnt/boot` # 创建 /boot 目录，`mount /dev/nvme0n1p1  /mnt/boot` # 挂载 /boot 目录。`swapon /dev/nvme0n1p2` # 挂载交换分区。`df -h`查看挂载情况，`free -h`查看交换分区挂载情况。
12. 安装基础包和基础软件: `pacstrap /mnt base base-devel linux linux-firmware btrfs-progs networkmanager neovim sudo zsh zsh-completions pacman`。内核构建可能报`file not found: /etc/vconsole.conf`，需要手动创建，`echo "KEYMAP=us" > /etc/vconsole.conf &&  echo "FONT=lat9w-16" >> /etc/vconsole.conf`
13. 根据挂载情况生成定义磁盘分区的文件/etc/fstab，`genfstab -U /mnt > /mnt/etc/fstab`，要确保无误`cat /mnt/etc/fstab`
14. 切换到新安装的系统，`arch-chroot /mnt`
15. 设置主机名和时区，`nvim /etc/hostname`，键入主机名，如tzgml，然后`nvim /etc/hosts`，输入如下:

```shell
127.0.0.1   localhost
::1         localhost
127.0.1.1   tzgml.localdomain tzgml
```

17. 设置时区，`ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime`
18. 将系统时间同步到硬件时间，`hwclock --systohc`。
19. 设置locale，`nvim /etc/locale.gen`，去掉`en_US.UTF-8 UTF-8`和` zh_CN.UTF-8 UTF-8` 注释，然后生成locale: `locale-gen`，设置locale: `echo 'LANG=en_US.UTF-8'  > /etc/locale.conf`，在这里先不能设置中文locale。
20. ` passwd root`，为root设置密码。
21. `pacman -S amd-ucode`安装显卡微码，比如amd。
22. 安装引导程序，`pacman -S grub efibootmgr os-prober`，安装grub到efi分区，`grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH`，编辑`nvim /etc/default/grub`，`GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 nowatchdog quiet module.sig_enforce=0 zswap.enabled=0"`。 `GRUB_DISABLE_OS_PROBER=false`引导win10。禁用子菜单`GRUB_DEFAULT_SUBMENU=y`，缩短启动时间`GRUB_TIMEOUT=0`，更改系统名称`GRUB_DISTRIBUTOR="Arch"`，最终生成grub配置文件，`grub-mkconfig -o /boot/grub/grub.cfg`
23. `exit`退出chroot环境，换到iso中。`umount -R /mnt`，卸载新分区，拔掉U盘，`reboot`重启进入arch。第一阶段安装结束。

***

#### 系统初始化

1. 重启后进入tty1，先`rmmod pcspkr`root为账户名，登录后联网: `systemctl enable --now NetworkManager`设置网络管理器开机自启，禁用systemd-networkd `sudo systemctl disable systemd-networkd && sudo systemctl disable systemd-networkd-wait-online`, 在`sudo systemctl disable NetworkManager-wait-online.service && sudo systemctl mask NetworkManager-wait-online.service`,然后`nmcli dev wifi list `用于显示附近的 Wi-Fi ，`nmcli dev wifi connect "Wi-Fi名" password "网络密码"`联网，然后ping个地址测试。
2. `pacman -Syyu`，更新整个系统
3. 增加普通用户:`useradd -m -G wheel -s /bin/bash tzgml`，`passwd tzgml`设置密码，更改sudo设置`sudo nvim /etc/sudoers`，把`%wheel ALL=(ALL:ALL) NOPASSWD: ALL`和`%sudo ALL=(ALL) NOPASSWD: ALL`和`ALL ALL=(ALL) NOPASSWD: ALL`改成上述模样并取消注释，。然后`su tzgml`切换到普通用户。
4. 配置pacman，`sudo nvim /etc/pacman.conf`，去掉color注释开启彩色输出，然后`CleanMethod = KeepCurrent`减少缓存包保留，`ParallelDownloads = 20`开启并行下载, `SigLevel= Never`禁止校验签名， 最后去掉`[multilib]`那两行的注释开启32位库支持，末尾添加archlinuxcn源，最后别忘`pacman -Syyu`:

```shell
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch # 清华大学开源软件镜像站
```

5. 在本地信任farseerfc的key，`sudo pacman-key --lsign-key "farseerfc@archlinux.org"`，然后`sudo pacman -Syyu`，然后安装`sudo pacman -S archlinuxcn-keyring`，再`sudo pacman -Syyu`
6. 安装基础功能包如下:

```shell
sudo pacman -S sof-firmware alsa-firmware alsa-ucm-conf # 声音固件
sudo pacman -S ntfs-3g # 可识别 NTFS 格式硬盘
sudo pacman -S wqy-zenhei # 上文泉驿字体解决大多 wine 应用中文方块的问题
sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra # 谷歌开源字体及表情
sudo pacman -S yay #AUR助手
sudo pacman -S ttf-victor-mono-nerd #nerd字体zsh主体和nvim的powerline乱码
sudo pacman -S noto-fonts-emoji #解决不显示emoji的问题，如果还不显示，则fc-cache，然后reboot
yay -S  ttf-harmonyos-sans #鸿蒙字体，解决hcml乱码
sudo pacman -S pacman-contrib
sudo pacman -S bluez bluez-utils
```

7. 配置桌面环境

```shell
git clone --depth=1 https://github.com/JaKooLit/Arch-Hyprland.git
cd Arch-Hyprland
chmod +x install.sh
./install.sh
```

`git clone https://github.com/LibreGML/ArchConfig.git`, 复制sddm主题到`/usr/share/sddm/themes`,然后`sudo nvim /etc/sddm.conf`,`Current=simple_sddm_2（主题文件夹名）`，然后重启服务`sudo systemctl restart sddm`。\
复制grub主题文件到/usr/share/grub/themes, `sudo nvim /etc/default/grub`, `GRUB_THEME="/usr/share/grub/themes/SekiroShadow/theme.txt"`，然后`sudo grub-mkconfig -o /boot/grub/grub.cfg`。顺便禁用systemd-boot,`sudo systemctl disable systemd-boot-update && sudo systemctl disable systemd-boot-clear-sysfail`

1. 安装AMD显卡驱动: `sudo pacman -S mesa lib32-mesa xf86-video-amdgpu vulkan-radeon lib32-vulkan-radeon`
2. 更改系统语言为中文: `sudo nvim /etc/locale.gen`，添加`zh_CN.UTF-8 UTF-8`，然后`sudo locale-gen`，然后`sudo nvim /etc/environment`，添加`LANG=zh_CN.UTF-8`。
3. `sudo nvim /etc/systemd/system.conf`，找到`DefaultTimeoutStopSec`和`DefaultTimeoutStartSec`，取消注释，值改成0s，然后`sudo systemctl daemon-reload`，改变开关机被阻碍问题。
4. `sudo nvim /etc/systemd/journald.conf`，然后`Storage=none`，之后`sudo journalctl --vacuum-size=0M && sudo journalctl --vacuum-time=0s`，`sudo rm -rf /var/log/* && sudo rm -rf /run/log/journal/*`。然后`sudo pacman -Scc  && yay -Scc`，然后`sudo paccache -rk0`。
5. 重启检查，基础系统安装完毕！

***

#### 配置代理

v2ray:

1. 安装v2ray与v2raya:`sudo pacman -S v2ray v2raya`
2. 设置开机启动并立刻执行，`sudo systemctl enable --now v2ray v2raya`
3. 打开浏览器进入127.0.0.1:2017
4. 打开机场，导出订阅，并寻找节点列表

* [ikuuuvpn免费50GB/月](https://ikuuu.pw/)
* [ecycloud10GB/月免费](https://owo.ecycloud.com/auth/register?code=kApr4ea5GB)
* 将节点vmess链接复制到v2ray的SERVER中，点击设置，透明代理和规则端口的分流模式选择大陆白名单模式，透明代理实现方式选择tproxy，需要docker则选择redirect。防止DNS污染选择DOH。

5. 点击启动，去谷歌测试

clash:

1. `sudo pacman -S mihomo clash-geoip clash-verge-rev`
2. 开启系统代理，Tun模式，局域网连接和ipv6，导入配置文件或链接，点击使用，再去测试里一键测试。
3. [GLADOS机场](https://www.glados.rocks/)

开启代理后，在终端可能需要 `export http_proxy='http://127.0.0.1:7897' && export https_proxy='http://127.0.0.1:7897' `

#### 更换内核

1. 安装cachyos内核   `sudo pacman -S linux-cachyos-rc linux-cachyos-rc-headers`
2. 卸载linux原版内核，`sudo pacman -Rns linux linux-headers`
3. 更新grub配置，`sudo grub-mkconfig -o /boot/grub/grub.cfg`，这一步一定要有！否则删除旧内核后会进不了系统！如果忘了进入iso，挂载btrfs分区到/mnt，再挂载boot分区到/mnt/boot，然后`arch-chroot /mnt`，然后`grub-mkconfig -o /boot/grub/grub.cfg`，然后umount，拔掉U盘reboot。
4. `reboot`选择xanmod内核回车进入
5. 查看当前系统内核 `uname -a`

#### 配置输入法

1. 安装fcitx:

```
sudo pacman -S fcitx5 fcitx5-chinese-addons fcitx5-configtool fcitx5-gtk fcitx5-qt
```

2. 设置环境变量:   `sudo nvim /etc/environment`，写入:

```
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```

1. 进入设置，点击语言和区域设置。再点击输入法，点击添加输入法添加拼音，配置拼音，勾选启用云拼音，配置云拼音，后端选择百度，把将嵌入预编辑文本的光标固定在开头那个选项去掉，关闭预测，取消使用V触发快速输入，取消快速输入的触发键。然后去[搜狗词库]('https://pinyin.sogou.com/dict/') 下载.scel词库，转换为.txt，导入fcitx5。
2. 之后退出来选择配置全局选项，将切换"启用/禁用输入法"的快捷键换为左shift，应用。
3. 点击右下角托盘的输入法。右键选择重新启动，之后按左shift或者右键选拼音，测试输入中文。
4. `yay fcitx5-skin-fluentdark-git`, 进入fcitx配置界面，点击配置附加组件，配置经典用户界面，把主题换成FluentDark-Solid,再调下字体。

#### 配置nvim

`cd .local/share`
`rm -rf nvim`
`cd ~`
`cd .config`
`git clone`
`nvim`
之后会自动装插件
后续键入`:Mason`装插件，输入`/`开始搜索，键入i下载，X删除，JS推荐使用vtsls

#### 美化终端:

1. 安装zsh:`sudo pacman -Sy zsh`
2. 更改默认终端:`chsh -s /usr/bin/zsh`
3. 安装oh-my-sh: `sh -c "$(curl -fsSL https://gitee.com/pocmon/ohmyzsh/raw/master/tools/install.sh)"`
4. `sudo pacman -S pkgfile`,   `sudo pkgfile -u`
5. `git clone https://gitee.com/asddfdf/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`
6. `git clone https://gitee.com/chenweizhen/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`
7. `git clone https://gitee.com/mo2/fzf-tab.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/fzf-tab`
8. `yay -S pokemon-colorscripts-git`,再`sudo pacman -S fastfetch figlet lolcat eza bat tree httping`
9. 再复制[我的.zshrc](https://github.com/LibreGML/ArchConfig/blob/master/zshrc)即可。

#### RTL8821网卡驱动

1. `sudo nvim /etc/modprobe.d/blacklist-rtw88.conf`
2. 写入如下内容：
   `blacklist rtw88_8821ce`
   `blacklist rtw88_8821c`
   `blacklist rtw88_pci`
   `blacklist rtw88_core`
   `install rtw88_8821ce /bin/false`
   `install rtw88_8821c /bin/false` 再把该文件添加进/etc/mkinitcpio.conf的FILE数组中。
3. `yay  -S rtl8821ce-dkms-git`安装新驱动
4. `sudo modprobe -r rtw88_8821ce rtw88_8821c rtw88_pci rtw88_core`，
5. `sudo mkinitcpio -P`
6. 更新grub，重启
7. `lsmod | grep -i 8821`验证

#### 内存与磁盘压缩

1. 磁盘压缩
   `sudo btrfs filesystem defragment -r -v -czstd /` 透明压缩。

2. 内存压缩

* `pacman -S zram-generator`
* `sudo nvim /etc/systemd/zram-generator.conf`, 写入如下

```
[zram0]
zram-size = min(ram / 2, 4096)
compression-algorithm = zstd
```

* `sudo systemctl daemon-reload`
* `sudo systemctl start systemd-zram-setup@zram0.service`
* `zramctl` 查看是否开启。

`sudo btrfs filesystem defragment -r -v -czstd /` 透明压缩。

#### tty显示中文

1. `pacman -S kmscon wqy-microhei ttf-dejavu`
2. `systemctl disable getty@tty1.service && systemctl enable kmsconvt@tty1.service`
3. `ln -s /usr/lib/systemd/system/kmsconvt\@.service /etc/systemd/system/autovt\@.service`
4. `sudo nvim /etc/kmscon/kmscon.conf`, 键入如下：

```bash
font-name=DejaVu Sans Mono, WenQuanYi Micro Hei Mono 
font-size=18
# 其他选项看情况开启
```

#### 优化启动速度

一，无密码登录

1. `groupadd -r nopasswdlogin`创建无密码组，` gpasswd -a tzgml nopasswdlogin`, `groups tzgml`验证。
2. `sudo nano /etc/pam.d/login`， 在顶部添加 `auth    sufficient  pam_succeed_if.so user ingroup nopasswdlogin`。
3. `sudo mkdir -p /etc/sddm.conf.d/`，`sudo nvim /etc/sddm.conf.d/autologin.conf`，键入如下内容, 重启后生效：

```
[Autologin]
User=tzgml
Session=hyprland.desktop
Relogin=true

```

二， 直接从UEFI启动

* 语法： `sudo efibootmgr --create --disk X --part Y --loader Z --label "Name" --unicode "params"`

* 其中：
  1. X 为ESP分区位置，`lsblk`查看，比如nvme0n1p1
  2. Y 为ESP分区的分区号，nvme0n1p1的分区号为1
  3. Z 为引导加载器位置，`ls /boot/vmlinuz-*`查看，比如`/vmlinuz-linux-cachyos-rc`
  4. Name 为引导项名称，比如ArchFast
  5. params 为启动参数，用`cat /proc/cmdline`查看。root=UUID的值可用`sudo blkid /dev/nvme0n1p3`查看。initrd可用`ls /boot/initramfs-*`查看。

* 举例如下：

```bash
sudo efibootmgr --create \
    --disk /dev/nvme0n1 \
    --part 1 \
    --loader '\vmlinuz-linux-cachyos-rc' \
    --label 'ArchFast' \
    --unicode 'root=UUID=fbdcbdc6-7ea8-467d-8c17-627ebf55995a rw rootflags=subvol=@,noatime initrd=\initramfs-linux-cachyos-rc.img quiet 8250.nr_uarts=0 module.sig_enforce=0 zswap.enabled=0 nowatchdog loglevel=0 tpm_tis.force=0 tpm_tis.interrupts=0 pcie_aspm=force mitigations=off' 
```

6.

```bash
sudo tee /etc/mkinitcpio.conf > /dev/null << 'INITRD'
MODULES=()
BINARIES=()
FILES=()
HOOKS=(base systemd autodetect modconf kms sd-vconsole block filesystems fsck)
COMPRESSION="zstd"
COMPRESSION_OPTIONS="-1"
INITRD
```

7. `sudo mkinitcpio -P`
8. `efibootmgr`查看是否创建，然后重启进入UEFI调整顺序，将ArchFast放在最前面。

#### 安全配置

1. `wget -c https://launchpadlibrarian.net/188958703/safe-rm-0.12.tar.gz` , 解压得到safe-rm文件。
2. `sudo mv safe-rm /usr/local/bin/`，在.bashrc中添加`alias rm=/usr/local/bin/safe-rm`
3. `sudo nvim /etc/safe-rm.conf`配置安全列表。
