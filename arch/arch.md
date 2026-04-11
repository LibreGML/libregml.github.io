---
url: /arch/arch.md
---
# Arch Linux 安装与配置完全指南

> \[!IMPORTANT]
> **📌 重要声明**
>
> 本笔记所有命令都经过我亲自验证，事后记录的！
>
> 文中所引用的配置文件请查看我的 GitHub 或 Gitee 仓库中的具体配置：
>
> * **GitHub**: <https://github.com/LibreGML/ArchConfig>
> * **Gitee**: <https://gitee.com/gemolin/ArchConfig>

***

## 📋 目录

* [一、基本系统安装](#基本系统安装)
* [二、系统初始化](#系统初始化)
* [三、桌面环境配置](#桌面环境配置)
* [四、网络与代理配置](#网络与代理配置)
* [五、内核管理](#内核管理)
* [六、输入法配置](#输入法配置)
* [七、开发工具配置](#开发工具配置)
* [八、终端美化](#终端美化)
* [九、硬件驱动配置](#硬件驱动配置)
* [十、性能优化](#性能优化)
* [十一、启动速度优化](#启动速度优化)
* [十二、安全配置](#安全配置)
* [十三、外设支持](#外设支持)
* [十四、远程访问](#远程访问)
* [十五、电源管理](#电源管理)
* [十六、SSH隧道](#ssh隧道)
* [十七、Docker测试我的配置](#docker测试我的配置)

***

## 基本系统安装

### 1.1 准备工作

1. 进入 BIOS，选择 UEFI 启动模式
2. 禁止终端蜂鸣器: `rmmod pcspkr`
3. 确认是否为 UEFI 模式: `ls /sys/firmware/efi/efivars`

### 1.2 网络连接

使用 `iwctl` 进行无线网络连接:

```bash
iwctl                           # 进入交互式界面
device list                     # 查看网卡名，比如 wlan0
station wlan0 scan              # 扫描网络
station wlan0 get-networks      # 列出网络
station wlan0 connect wifi-name # 连接 WiFi
exit                            # 退出 iwctl
ping bing.com                   # 测试网络连接
```

### 1.3 时间同步

```bash
timedatectl set-ntp true        # 启用 NTP 时间同步
timedatectl status              # 验证是否成功
```

### 1.4 更换镜像源

编辑 `/etc/pacman.d/mirrorlist`:

```bash
vim /etc/pacman.d/mirrorlist
```

添加清华镜像源:

```
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
```

### 1.5 磁盘分区

#### 转换为 GPT 格式

```bash
parted /dev/nvme0n1    # 进入 parted
mktable                # 输入 mktable
gpt                    # 选择 gpt
yes                    # 确认
quit                   # 退出
```

#### 创建分区

使用 `cfdisk` 创建三个分区:

```bash
cfdisk /dev/nvme0n1
```

* **EFI 分区**: 512MB (类型: EFI System)
* **Swap 分区**: 大于内存的 60% (类型: Linux swap)
* **Btrfs 系统分区**: 剩余全部空间 (类型: Linux filesystem)

#### 格式化分区

```bash
mkfs.fat -F32 /dev/nvme0n1p1              # 格式化 EFI 分区
mkswap /dev/nvme0n1p2                      # 格式化 Swap 分区
mkfs.btrfs -L myArch /dev/nvme0n1p3        # 格式化 Btrfs 分区
```

### 1.6 Btrfs 子卷配置

#### 创建子卷

```bash
mount -t btrfs -o compress=zstd /dev/nvme0n1p3 /mnt    # 临时挂载
df -h                                                    # 查看挂载状态
btrfs subvolume create /mnt/@                            # 创建根目录子卷
btrfs subvolume create /mnt/@home                        # 创建 home 子卷
btrfs subvolume list -p /mnt                             # 查看子卷列表
umount /mnt                                              # 卸载
```

#### 挂载子卷

```bash
# 挂载根目录
mount -t btrfs -o subvol=/@,compress=zstd /dev/nvme0n1p3 /mnt

# 创建并挂载 home 目录
mkdir /mnt/home
mount -t btrfs -o subvol=/@home,compress=zstd /dev/nvme0n1p3 /mnt/home

# 创建并挂载 boot 目录
mkdir -p /mnt/boot
mount /dev/nvme0n1p1 /mnt/boot

# 激活 Swap 分区
swapon /dev/nvme0n1p2

# 验证挂载
df -h
free -h
```

### 1.7 安装基础系统

```bash
pacstrap /mnt base base-devel linux linux-firmware btrfs-progs networkmanager neovim sudo zsh zsh-completions pacman
```

> \[!WARNING]
> 如果内核构建时报错 `file not found: /etc/vconsole.conf`，需要手动创建：

```bash
echo "KEYMAP=us" > /etc/vconsole.conf
echo "FONT=lat9w-16" >> /etc/vconsole.conf
```

### 1.8 生成 fstab

```bash
genfstab -U /mnt > /mnt/etc/fstab    # 生成分区表
cat /mnt/etc/fstab                   # 验证内容是否正确
```

### 1.9 切换到新系统

```bash
arch-chroot /mnt    # 进入新安装的系统
```

### 1.10 系统基础配置

#### 设置主机名

```bash
nvim /etc/hostname    # 写入主机名，如 tzgml
```

编辑 `/etc/hosts`:

```bash
nvim /etc/hosts
```

添加以下内容:

```shell
127.0.0.1   localhost
::1         localhost
127.0.1.1   tzgml.localdomain tzgml
```

#### 设置时区

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime    # 设置时区
hwclock --systohc                                          # 同步硬件时钟
```

#### 配置 Locale

```bash
nvim /etc/locale.gen    # 编辑 locale.gen
```

取消以下两行的注释:

```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```

生成并设置 locale:

```bash
locale-gen                                    # 生成 locale
echo 'LANG=en_US.UTF-8' > /etc/locale.conf    # 设置默认语言（暂时不设为中文）
```

#### 设置 Root 密码

```bash
passwd root
```

#### 安装微码

```bash
pacman -S amd-ucode    # AMD 处理器（Intel 使用 intel-ucode）
```

### 1.11 安装引导程序

```bash
pacman -S grub efibootmgr os-prober    # 安装 GRUB 及相关工具
```

安装 GRUB 到 EFI 分区:

```bash
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH
```

编辑 GRUB 配置:

```bash
nvim /etc/default/grub
```

修改以下参数:

```
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 nowatchdog quiet module.sig_enforce=0 zswap.enabled=0"
GRUB_DISABLE_OS_PROBER=false          # 允许检测 Windows 双系统
GRUB_DEFAULT_SUBMENU=y                # 禁用子菜单
GRUB_TIMEOUT=0                        # 缩短启动等待时间
GRUB_DISTRIBUTOR="Arch"               # 更改启动项名称
```

生成 GRUB 配置文件:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 1.12 完成安装

```bash
exit              # 退出 chroot 环境
umount -R /mnt    # 卸载所有分区
reboot            # 重启系统（拔掉 U 盘）
```

**第一阶段安装结束！**

***

## 系统初始化

### 2.1 首次登录与联网

重启后进入 TTY1，以 root 账户登录:

```bash
rmmod pcspkr                              # 禁用蜂鸣器
systemctl enable --now NetworkManager     # 启用网络管理器
```

禁用不必要的 systemd 网络服务:

```bash
sudo systemctl disable systemd-networkd
sudo systemctl disable systemd-networkd-wait-online
sudo systemctl disable NetworkManager-wait-online.service
sudo systemctl mask NetworkManager-wait-online.service
```

使用 `nmcli` 连接 WiFi:

```bash
nmcli dev wifi list                              # 显示附近的 Wi-Fi
nmcli dev wifi connect "Wi-Fi名" password "密码"  # 连接网络
ping bing.com                                    # 测试连接
```

### 2.2 更新系统

```bash
pacman -Syyu    # 完整更新系统
```

### 2.3 创建普通用户

```bash
useradd -m -G wheel -s /bin/bash tzgml    # 创建用户并加入 wheel 组
passwd tzgml                               # 设置用户密码
```

配置 sudo 权限:

```bash
sudo nvim /etc/sudoers
```

取消以下三行的注释并修改为:

```
%wheel ALL=(ALL:ALL) NOPASSWD: ALL
%sudo ALL=(ALL) NOPASSWD: ALL
ALL ALL=(ALL) NOPASSWD: ALL
```

切换到普通用户:

```bash
su tzgml
```

### 2.4 配置 Pacman

编辑 `/etc/pacman.conf`:

```bash
sudo nvim /etc/pacman.conf
```

修改以下配置:

```ini
Color                           # 启用彩色输出
ILoveCandy                      # 显示下载进度动画
CleanMethod = KeepCurrent       # 保留当前版本的缓存包
ParallelDownloads = 20          # 并行下载数量
SigLevel = Never                # 禁用签名验证（开发环境）
```

启用 multilib 仓库（32 位支持）:

```ini
[multilib]
Include = /etc/pacman.d/mirrorlist
```

添加 Arch Linux CN 源:

```ini
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```

更新软件包数据库:

```bash
pacman -Syyu
```

### 2.5 配置 Arch Linux CN 密钥

```bash
sudo pacman-key --lsign-key "farseerfc@archlinux.org"    # 信任密钥
sudo pacman -Syyu                                         # 更新
sudo pacman -S archlinuxcn-keyring                        # 安装密钥环
sudo pacman -Syyu                                         # 再次更新
```

### 2.6 安装基础功能包

```bash
# 声音固件
sudo pacman -S sof-firmware alsa-firmware alsa-ucm-conf

# NTFS 文件系统支持
sudo pacman -S ntfs-3g

# 中文字体
sudo pacman -S wqy-zenhei                                    # 文泉驿字体（解决 Wine 中文方块问题）
sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra  # Google Noto 字体及表情
yay -S ttf-harmonyos-sans                                    # 鸿蒙字体（解决 HTML 乱码）

# Nerd Font（解决 Zsh 主题和 Neovim Powerline 乱码）
sudo pacman -S ttf-victor-mono-nerd

# AUR 助手
sudo pacman -S yay

# 其他工具
sudo pacman -S pacman-contrib    # Pacman 工具集
sudo pacman -S bluez bluez-utils # 蓝牙支持
```

修复 Emoji 显示问题（如果仍然不显示）:

```bash
fc-cache -fv    # 刷新字体缓存
reboot          # 重启
```

***

## 桌面环境配置

### 3.1 安装 Hyprland

```bash
git clone --depth=1 https://github.com/JaKooLit/Arch-Hyprland.git
cd Arch-Hyprland
chmod +x install.sh
./install.sh
```

### 3.2 应用自定义配置

克隆我的配置仓库:

```bash
git clone https://github.com/LibreGML/ArchConfig.git
```

#### 配置 SDDM 主题

```bash
# 复制 SDDM 主题到系统目录
sudo cp -r ArchConfig/usr/share/sddm/themes/* /usr/share/sddm/themes/

# 编辑 SDDM 配置
sudo nvim /etc/sddm.conf
```

设置主题:

```ini
[Theme]
Current=simple_sddm_2    # 主题文件夹名称
```

重启 SDDM 服务:

```bash
sudo systemctl restart sddm
```

#### 配置 GRUB 主题

```bash
# 复制 GRUB 主题
sudo cp -r ArchConfig/usr/share/grub/themes/* /usr/share/grub/themes/

# 编辑 GRUB 配置
sudo nvim /etc/default/grub
```

设置主题路径:

```
GRUB_THEME="/usr/share/grub/themes/SekiroShadow/theme.txt"
```

重新生成 GRUB 配置:

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

#### 禁用 systemd-boot

```bash
sudo systemctl disable systemd-boot-update
sudo systemctl disable systemd-boot-clear-sysfail
```

### 3.3 安装显卡驱动（AMD）

```bash
sudo pacman -S mesa lib32-mesa xf86-video-amdgpu vulkan-radeon lib32-vulkan-radeon
```

### 3.4 切换系统语言为中文

```bash
sudo nvim /etc/locale.gen    # 确保 zh_CN.UTF-8 UTF-8 已取消注释
sudo locale-gen               # 重新生成 locale
sudo nvim /etc/environment    # 编辑环境变量
```

添加以下内容:

```
LANG=zh_CN.UTF-8
```

### 3.5 优化系统响应速度

编辑 systemd 系统配置:

```bash
sudo nvim /etc/systemd/system.conf
```

找到并修改以下参数:

```ini
DefaultTimeoutStartSec=0s
DefaultTimeoutStopSec=0s
```

重载配置:

```bash
sudo systemctl daemon-reload
```

### 3.6 清理系统日志

编辑 journald 配置:

```bash
sudo nvim /etc/systemd/journald.conf
```

设置:

```ini
Storage=none
```

清理现有日志:

```bash
sudo journalctl --vacuum-size=0M
sudo journalctl --vacuum-time=0s
sudo rm -rf /var/log/*
sudo rm -rf /run/log/journal/*
```

清理包管理器缓存:

```bash
sudo pacman -Scc
yay -Scc
sudo paccache -rk0
```

### 3.7 重启验证

```bash
reboot
```

**基础系统安装完毕！**

***

## 网络与代理配置

### 4.1 V2Ray 配置

#### 安装 V2Ray

```bash
sudo pacman -S v2ray v2raya
sudo systemctl enable --now v2ray v2raya
```

#### 配置 V2RayA

1. 浏览器访问: `http://127.0.0.1:2017`
2. 打开机场网站，导出订阅链接
3. 在 V2RayA 中添加订阅

**推荐免费机场**:

* [ikuuu VPN - 免费 50GB/月](https://ikuuu.pw/)
* [ecycloud - 免费 10GB/月](https://owo.ecycloud.com/auth/register?code=kApr4ea5GB)

#### V2RayA 设置

* **透明代理模式**: 大陆白名单
* **实现方式**: TProxy（Docker 用户选择 Redirect）
* **DNS 防污染**: DoH

点击启动后，访问 Google 测试连接。

### 4.2 Clash 配置

#### 安装 Clash

```bash
sudo pacman -S mihomo clash-geoip clash-verge-rev
```

#### 配置 Clash Verge Rev

1. 开启系统代理
2. 启用 Tun 模式
3. 开启局域网连接和 IPv6
4. 导入配置文件或订阅链接
5. 点击"使用"
6. 在测试页面一键测速

**推荐机场**:

* [GLADOS 机场](https://www.glados.rocks/)

### 4.3 终端代理设置

开启代理后，在终端中可能需要手动设置:

```bash
export http_proxy='http://127.0.0.1:7897'
export https_proxy='http://127.0.0.1:7897'
```

***

## 内核管理

### 5.1 更换为 XanMod 内核

#### 安装 XanMod Edge 内核

```bash
sudo pacman -S linux-xanmod-edge linux-xanmod-edge-headers
```

#### 卸载原版内核

```bash
sudo pacman -Rns linux linux-headers
```

> \[!WARNING]
> **⚠️ 重要**: 必须先更新 GRUB 配置再删除旧内核！

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

如果忘记更新 GRUB 就删除了旧内核，可以通过以下方式恢复:

1. 进入 Arch ISO
2. 挂载 Btrfs 分区到 `/mnt`
3. 挂载 Boot 分区到 `/mnt/boot`
4. 执行 `arch-chroot /mnt`
5. 运行 `grub-mkconfig -o /boot/grub/grub.cfg`
6. 卸载分区，拔掉 U 盘，重启

#### 重启并选择新内核

```bash
reboot    # 在 GRUB 菜单中选择 xanmod 内核
```

#### 验证内核版本

```bash
uname -a
```

***

## 输入法配置

### 6.1 安装 Fcitx5

```bash
sudo pacman -S fcitx5 fcitx5-chinese-addons fcitx5-configtool fcitx5-gtk fcitx5-qt
```

### 6.2 配置环境变量

编辑 `/etc/environment`:

```bash
sudo nvim /etc/environment
```

添加以下内容:

```bash
# GTK_IM_MODULE=fcitx    # Firefox等应用异常时注释此行重启
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```

### 6.3 配置拼音输入法

1. 进入系统设置 → 语言和区域设置 → 输入法
2. 点击"添加输入法"，选择"拼音"
3. 配置拼音选项:
   * ✅ 启用云拼音
   * 云拼音后端: 百度
   * ❌ 取消"将嵌入预编辑文本的光标固定在开头"
   * ❌ 关闭预测
   * ❌ 取消"使用 V 触发快速输入"
   * ❌ 取消快速输入的触发键

### 6.4 导入搜狗词库

1. 访问 [搜狗词库](https://pinyin.sogou.com/dict/)
2. 下载 `.scel` 格式词库
3. 转换为 `.txt` 格式
4. 在 Fcitx5 配置中导入词库

### 6.5 配置全局快捷键

1. 返回主配置界面
2. 选择"配置全局选项"
3. 将"启用/禁用输入法"快捷键改为 **左 Shift**
4. 点击应用

### 6.6 测试输入法

1. 右键点击托盘区的输入法图标
2. 选择"重新启动"
3. 按左 Shift 切换输入法
4. 测试中文输入

### 6.7 美化 Fcitx5 主题

```bash
# 克隆主题仓库
git clone https://github.com/Passthem-desu/fcitx5-theme-pt-cute-light.git

# 复制主题到用户目录
cp -r fcitx5-theme-pt-cute-light/kagami ~/.local/share/fcitx5/themes/
```

配置主题:

1. 进入 Fcitx5 配置界面
2. 点击"配置附加组件"
3. 选择"经典用户界面"
4. 设置主题: `kagami`
5. 设置字体: `Maple Mono NF CN 15pt`（需安装 `ttf-maplemononormal-cn-unhinted`）

> \[!NOTE]
> 如果 Firefox 中主题无法正常显示，注释掉 `/etc/environment` 中的 `GTK_IM_MODULE=fcitx`。

***

## 开发工具配置

### 7.1 Neovim 配置

```bash
cd ~/.local/share
rm -rf nvim           # 清除旧配置
cd ~
cd .config
git clone <别人的配置仓库>    # 克隆 Neovim 配置,我换成micro了 ， 所以没有了
nvim                  # 启动 Neovim，自动安装插件
```

后续操作:

```vim
:Mason    # 打开 Mason 插件管理器
/         # 搜索插件
i         # 安装选中插件
X         # 删除选中插件
```

> \[!TIP]
> JavaScript/TypeScript 开发推荐使用 `vtsls`

***

## 终端美化

### 8.1 安装 Zsh

```bash
sudo pacman -Sy zsh
chsh -s /usr/bin/zsh    # 更改默认 Shell
```

### 8.2 安装 Oh My Zsh

```bash
sh -c "$(curl -fsSL https://gitee.com/pocmon/ohmyzsh/raw/master/tools/install.sh)"
```

### 8.3 安装 Zsh 插件

```bash
# 命令补全提示
sudo pacman -S pkgfile
sudo pkgfile -u

# 语法高亮
git clone https://gitee.com/asddfdf/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 自动建议
git clone https://gitee.com/chenweizhen/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# FZF Tab 增强
git clone https://gitee.com/mo2/fzf-tab.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/fzf-tab
```

### 8.4 安装美化工具

```bash
# Pokemon 颜色脚本
yay -S pokemon-colorscripts-git

# 其他工具
sudo pacman -S fastfetch figlet lolcat eza bat tree httping
```

### 8.5 应用 Zsh 配置

复制我的 [.zshrc](https://github.com/LibreGML/ArchConfig/blob/master/zshrc) 配置文件：

> \[!NOTE]
> （现在没了，因为我用Fish shell了）

```bash
cp ArchConfig/.zshrc ~/.zshrc
source ~/.zshrc
```

### 8.6 Fish shell

1. `sudo pacman -S fish fisher`
2. `fisher install jorgebucaran/fisher jethrokuan/z patrickf1/fzf.fish ilancosman/tide jorgebucaran/autopair.fish gazorby/fish-abbreviation-tips oh-my-fish/plugin-extract meaningful-ooo/sponge nickeb96/puffer-fish`
3. `tide configure` 自己选择， 直接美化好了

***

## 硬件驱动配置

### 9.1 RTL8821 无线网卡驱动

#### 方案一：更换损坏的驱动

1. **黑名单旧驱动**

编辑 `/etc/modprobe.d/blacklist-rtw88.conf`:

```bash
sudo nvim /etc/modprobe.d/blacklist-rtw88.conf
```

添加以下内容:

```
blacklist rtw88_8821ce
blacklist rtw88_8821c
blacklist rtw88_pci
blacklist rtw88_core
install rtw88_8821ce /bin/false
install rtw88_8821c /bin/false
```

将该文件添加到 `/etc/mkinitcpio.conf` 的 `FILES` 数组中。

2. **安装新驱动**

```bash
yay -S rtl8821ce-dkms-git
```

3. **卸载旧驱动模块**

```bash
sudo modprobe -r rtw88_8821ce rtw88_8821c rtw88_pci rtw88_core
```

4. **重建 initramfs**

```bash
sudo mkinitcpio -P
```

5. **更新 GRUB 并重启**

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
reboot
```

6. **验证驱动加载**

```bash
lsmod | grep -i 8821
```

#### 方案二：排查驱动问题

**步骤 1: 检查硬件识别**

```bash
lspci | grep -i network    # 或 lspci | grep -i 8821
```

如果没有输出，说明是硬件问题，检查:

* 硬件连接
* BIOS 中的无线开关

记录 PCI 地址（如 `02:00.0`）。

**步骤 2: 检查驱动加载状态**

```bash
lspci -k -s 02:00.0    # -s 指定 PCI 地址，-k 查看驱动信息
```

可能出现三种情况:

1. 已加载驱动
2. 显示 `(none)` 或 `UNCLAIMED`（无驱动）
3. 显示驱动但网卡无法使用

**步骤 3: 处理无驱动情况**

```bash
yay -S rtl8821ce-dkms-git    # 安装驱动
```

如果仍不行，查找驱动文件:

```bash
find /lib/modules/$(uname -r) -name "*8821*"
```

加载驱动:

```bash
sudo modprobe 8821ce
sudo mkinitcpio -P
```

**步骤 4: 处理驱动加载但无法使用**

检查固件错误:

```bash
dmesg | grep -iE "8821|rtw|wlan"
```

如果显示 "firmware not found"，安装固件:

```bash
sudo pacman -S linux-firmware
```

**步骤 5: 检查网络接口状态**

```bash
ip link show    # 查看 wlan0 状态
```

如果显示 `state DOWN`:

```bash
sudo ip link set wlan0 up
```

检查 NetworkManager:

```bash
systemctl status NetworkManager
```

检查射频锁定:

```bash
rfkill list    # 如果 Wireless LAN 显示 yes
sudo rfkill unblock all
```

**步骤 6: 寻求社区帮助**

如果以上方法都无效:

1. 搜索资源:
   * [落絮 - Arch Linux 中文社区](https://luoxu.archlinuxcn.org/)
   * [Arch Wiki 中文版](https://wiki.archlinuxcn.org/wiki/)
   * [Arch Linux 中文论坛](https://forum.archlinuxcn.org/)
   * GitHub Issues
   * Stack Overflow

2. 向社区求助时提供完整日志:

```bash
uname -a && \
lspci -nn | grep -i network && \
lspci -k -s 02:00.0 && \
lsmod | grep -iE "8821|rtw" && \
dmesg | grep -iE "8821|rtw_8821ce|firmware|iwlwifi" | tail -30 && \
ip link show && \
rfkill list
```

将输出重定向到文件并附上问题描述。

***

## 性能优化

### 10.1 Btrfs 磁盘压缩

启用透明压缩:

```bash
sudo btrfs filesystem defragment -r -v -czstd /
```

### 10.2 ZRAM 内存压缩

#### 安装 ZRAM Generator

```bash
pacman -S zram-generator
```

#### 配置 ZRAM

编辑 `/etc/systemd/zram-generator.conf`:

```bash
sudo nvim /etc/systemd/zram-generator.conf
```

添加以下内容:

```ini
[zram0]
zram-size = min(ram / 2, 4096)
compression-algorithm = zstd
```

#### 启用 ZRAM

```bash
sudo systemctl daemon-reload
sudo systemctl start systemd-zram-setup@zram0.service
zramctl    # 查看 ZRAM 状态
```

***

## 启动速度优化

### 11.1 无密码登录

#### 创建无密码登录组

```bash
groupadd -r nopasswdlogin                    # 创建组
gpasswd -a tzgml nopasswdlogin               # 添加用户
groups tzgml                                 # 验证
```

#### 配置 PAM

编辑 `/etc/pam.d/login`:

```bash
sudo nano /etc/pam.d/login
```

在顶部添加:

```
auth    sufficient  pam_succeed_if.so user ingroup nopasswdlogin
```

#### 配置 SDDM 自动登录

```bash
sudo mkdir -p /etc/sddm.conf.d/
sudo nvim /etc/sddm.conf.d/autologin.conf
```

添加以下内容:

```ini
[Autologin]
User=tzgml
Session=hyprland.desktop
Relogin=true
```

重启后生效。

### 11.2 直接从 UEFI 启动（跳过 GRUB）

#### 创建 UEFI 启动项

语法:

```bash
sudo efibootmgr --create --disk X --part Y --loader Z --label "Name" --unicode "params"
```

参数说明:

* **X**: ESP 分区位置（通过 `lsblk` 查看，如 `nvme0n1p1`）
* **Y**: ESP 分区号（如 `1`）
* **Z**: 内核路径（通过 `ls /boot/vmlinuz-*` 查看，如 `/vmlinuz-linux-cachyos-rc`）
* **Name**: 启动项名称（如 `ArchFast`）
* **params**: 启动参数（通过 `cat /proc/cmdline` 查看）
  * `root=UUID` 的值通过 `sudo blkid /dev/nvme0n1p3` 获取
  * `initrd` 路径通过 `ls /boot/initramfs-*` 查看

#### 示例命令

```bash
sudo efibootmgr --create \
    --disk /dev/nvme0n1 \
    --part 1 \
    --loader '\vmlinuz-linux-cachyos-rc' \
    --label 'ArchFast' \
    --unicode 'root=UUID=fbdcbdc6-7ea8-467d-8c17-627ebf55995a rw rootflags=subvol=@,noatime initrd=\initramfs-linux-cachyos-rc.img quiet 8250.nr_uarts=0 module.sig_enforce=0 zswap.enabled=0 nowatchdog loglevel=0 tpm_tis.force=0 tpm_tis.interrupts=0 pcie_aspm=force mitigations=off'
```

#### 优化 Initramfs

编辑 `/etc/mkinitcpio.conf`:

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

重建 initramfs:

```bash
sudo mkinitcpio -P
```

#### 调整启动顺序

```bash
efibootmgr    # 查看启动项
```

重启进入 UEFI 设置，将新建的 `ArchFast` 启动项调整到第一位。

***

## 安全配置

### 12.1 安装 Safe-RM

防止误删重要文件:

```bash
wget -c https://launchpadlibrarian.net/188958703/safe-rm-0.12.tar.gz
tar -xzvf safe-rm-0.12.tar.gz
sudo mv safe-rm /usr/local/bin/
```

编辑 `~/.bashrc` 或 `~/.zshrc`:

```bash
alias rm=/usr/local/bin/safe-rm
```

### 12.2 配置保护目录

编辑 `/etc/safe-rm.conf`:

```bash
sudo nvim /etc/safe-rm.conf
```

添加需要保护的目录路径，每行一个。

***

## 外设支持

### 13.1 京瓷打印机配置

#### 安装 CUPS

```bash
sudo pacman -S cups ghostscript cups-filters
sudo systemctl enable --now cups
```

#### 安装打印机驱动

1. 下载京瓷驱动（如 M1025d/PN）
2. 解压后进入 `Global` 目录
3. 找到 `simplified.tar.gz` 并解压
4. 运行 `install.sh`

#### 添加打印机

1. USB 连接打印机
2. 浏览器访问: `http://localhost:631`
3. 点击 **Administration** → 输入 root 用户名和密码
4. 点击 **Add Printer**
5. Local Printers 会自动扫描到打印机
6. Continue → 输入打印机名称 → Continue
7. 选择驱动:
   * 从 Model 列表中选择对应型号，或
   * 点击 **Provide a PPD File**，选择下载的 PPD 文件
8. 点击 **Add Printer**

#### 管理打印任务

1. 回到 Administration 界面
2. 点击 **Manage Jobs**
3. 点击 **Show All Jobs** 查看所有打印任务

### 13.2 惠普打印机配置

> HP LaserJet 专业 M1536dnf 多功能打印机

1. `sudo pacman -S hplip hplip-plugin`
2. 进入[CUPS配置界面](http://localhost:631/admin), 点击 **Add Printer**, 看到Local Printers有个HP Printer (HPLIP) ， 继续后输入打印机的IP地址，比如http://10.10.84.25，名字那些随便填， 继续后，Make里面选择HP, 继续后可以看到驱动列表， 找`HP LaserJet M1536dnf MFP Postscript (en, en, da, de, es, fi, fr, it, ja, ko, nb, nl, pt, ru, sv, zh_CN, zh_TW) `, 选中后Add Printer即可。

***

## 远程访问

### 14.1 WayVNC（不推荐）

```bash
sudo pacman -S wayvnc
WLR_RDP_TX_CAPTURE_ALL_KEYS=1 wayvnc -v 0.0.0.0 5900
```

> \[!WARNING]
> **缺点**: 体验不佳，不推荐使用。

### 14.2 Sunshine + Moonlight（推荐）

#### 安装 Sunshine

```bash
sudo pacman -S sunshine
sunshine    # 运行 Sunshine
```

#### 配置 Sunshine

1. 浏览器访问: `https://localhost:47990/`
2. 设置用户名和密码

#### 客户端配对（以安卓为例）

1. 在其他设备（如安卓手机）上安装 **Moonlight** 客户端
2. 确保设备在同一局域网内
3. 点击右上角 **+** 号
4. 输入被控主机的 IP 地址
5. 点击确定后，目标电脑会弹出 PIN 码通知
6. 点击通知跳转到网页
7. 输入 PIN 码和设备名称
8. 配对成功！

***

## 电源管理

### 15.1 安装省电工具

```bash
sudo pacman -S tlp tlp-rdw powertop
```

### 15.2 禁用冲突服务

```bash
sudo systemctl disable power-profiles-daemon.service
sudo systemctl mask systemd-rfkill.service systemd-rfkill.socket
sudo systemctl stop power-profiles-daemon.service systemd-rfkill.service systemd-rfkill.socket
```

### 15.3 配置 TLP

复制我的 [`/etc/tlp.conf`](https://github.com/LibreGML/ArchConfig/blob/master/etc/tlp.conf) 配置文件，或手动配置。

重启 TLP 服务:

```bash
sudo systemctl restart tlp
```

或直接重启系统。

### 15.4 配置 Powertop

#### 创建 Powertop 服务

```bash
sudo tee /etc/systemd/system/powertop.service << 'EOF'
[Unit]
Description=Powertop tunings
After=multi-user.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/powertop --auto-tune

[Install]
WantedBy=multi-user.target
EOF
```

#### 启用服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now powertop.service
```

#### 应用优化

```bash
sudo powertop --auto-tune
```

重启系统使所有省电配置生效。

***

## SSH隧道

现先创建一个 SSH 隧道，连接我的服务器：

```bash
ssh -vvv -D 1080 -C -N  root@192.168.10.64
```

再搞mihomo, 让所有流量都走代理

```bash
sudo pacman -S mihomo
sudo mkdir -p /var/lib/mihomo
sudo micro /var/lib/mihomo/config.yaml
```

写入如下内容：

```yaml
# TUN 透明代理模式
tun:
  enable: true
  stack: system
  auto-route: true
  auto-redir: true
  device: utun
  mtu: 9000

# 日志级别
log-level: info

# 出站代理：指向本地 SSH SOCKS5
proxies:
  - name: "ssh-tunnel"
    type: socks5
    server: 127.0.0.1
    port: 1080
    # SSH 无需认证，留空

# 代理组
proxy-groups:
  - name: "GLOBAL"
    type: select
    proxies:
      - "ssh-tunnel"

# 分流规则
rules:
  # 局域网/保留地址直连
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - IP-CIDR,10.0.0.0/8,DIRECT
  - IP-CIDR,172.16.0.0/12,DIRECT

  # 国内域名直连（可选）
  - GEOSITE,cn,DIRECT

  # 其余全部走代理
  - MATCH,GLOBAL
```

```bash
sudo chmod 644 /var/lib/mihomo/config.yaml
sudo systemctl enable --now mihomo
sudo systemctl status mihomo
ip route get 223.5.5.5  # 验证
```

***

## Docker测试我的配置

### 16.0 创建ArchLinux容器

```bash
# 拉取镜像
docker pull archlinux:multilib-devel-20260329.0.507017

# 创建容器
docker run -it --name my_arch_test archlinux:multilib-devel-20260329.0.507017 /bin/bash

# 设置root密码
passwd root

# 换源
cat > /etc/pacman.d/mirrorlist << 'EOF'
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
EOF

cat >> /etc/pacman.conf << 'EOF'
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
EOF

# 初始化密钥环
pacman -Syu --noconfirm archlinux-keyring archlinuxcn-keyring
pacman-key --init
pacman-key --populate archlinux
pacman-key --populate archlinuxcn
pacman-key --refresh-keys

# 创建一个普通用户
useradd -m -s /bin/bash -G wheel tzgml # 再编辑一下/etc/sudoers 配置一下权限

# 克隆我的仓库，执行脚本
git clone https://gitee.com/gemolin/ArchConfig.git
cd ArchConfig
bash ./install.sh

# 脚本执行完毕之后， 要把这个容器给打包成一个镜像， 再根据这个镜像， 创建一个挂wayland套接字的容器，就能看到容器的Hyprland了， 但这需要一些信息，如下
```

### 16.1 获取宿主机信息

```bash
echo $XDG_SESSION_TYPE
# 输出: wayland

echo $WAYLAND_DISPLAY
# 输出: wayland-1

id -u
# 输出: 1000

lspci | grep -i vga
# 输出: 04:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Picasso/Raven 2 [Radeon Vega Series / Radeon Vega Mobile Series] (rev c2)
```

### 16.2 获取容器信息

```bash
docker ps
# 输出:
# CONTAINER ID   IMAGE                                        COMMAND       CREATED       STATUS       PORTS     NAMES
# aa8cef245071   archlinux:multilib-devel-20260329.0.507017   "/bin/bash"   3 hours ago   Up 2 hours             my_arch_test

docker inspect my_arch_test | grep -A 10 Mounts
# 输出: 显示 "Mounts": [] (无挂载)

docker exec my_arch_test id
# 输出: uid=0(root) gid=0(root) groups=0(root)

docker exec my_arch_test ls -la /run/user/
# 输出: 目录为空
```

### 16.3 保存容器状态

```bash
docker commit my_arch_test my_arch_configured
# 输出: sha256:1fefac3502423d9b804ee12438a2d014509ce13826c628eeacad648d41a844fe
```

### 16.4 运行带 Wayland 支持的容器

```bash
# 记得替换一下参数
docker run -it \
  --name my_arch_with_hypr \
  --privileged \
  -u 1000:1000 \
  -e XDG_RUNTIME_DIR=/run/user/1000 \
  -e WAYLAND_DISPLAY=wayland-1 \
  -e DISPLAY=:0 \
  -v /run/user/1000:/run/user/1000 \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v $HOME/.config/hypr:/home/arch/.config/hypr \
  --device /dev/dri \
  my_arch_configured \
  /bin/bash
# 成功进入容器后
start-hyprland
```

***

***

**最后更新**: 2026-04-05\
**维护者**: TZGML(LibreGML)
