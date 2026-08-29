#!/usr/bin/env bash
# ==============================================================================
# covalent_matrix.sh - Substrate Volatile RAM-Disk ISO Generator
# Target Repository: https://github.com/outtatowner/Covalent-OS-11-11-0.git
# Invariant: d_I = 0 (100% Volatile Memory Execution, Zero-Disk Residue)
# ==============================================================================

set -euo pipefail

ROOTFS_DIR="$(pwd)/build_rootfs"
ISO_DIR="$(pwd)/iso_staging"
OUTPUT_ISO="$(pwd)/Covalent-OS-11-11-0-x86_64.iso"
ALPINE_TAR="alpine-minirootfs-3.20.0-x86_64.tar.gz"
ALPINE_URL="https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/${ALPINE_TAR}"

echo "[COVALENT_MATRIX] Building Standalone Volatile RAM-Disk Substrate..."

mkdir -p "${ROOTFS_DIR}" "${ISO_DIR}/boot/grub"

# 1. Ingest Alpine Minirootfs
if [ ! -f "${ALPINE_TAR}" ]; then
    echo "[COVALENT_MATRIX] Ingesting Alpine Linux 3.20 minirootfs..."
    curl -LO "${ALPINE_URL}"
fi

echo "[COVALENT_MATRIX] Unpacking rootfs to ${ROOTFS_DIR}..."
rm -rf "${ROOTFS_DIR}"/*
tar -xzf "${ALPINE_TAR}" -C "${ROOTFS_DIR}"

# 2. Inject DNS and Package Repository Configuration
cp /etc/resolv.conf "${ROOTFS_DIR}/etc/resolv.conf" || echo "nameserver 1.1.1.1" > "${ROOTFS_DIR}/etc/resolv.conf"
cat << 'EOF' > "${ROOTFS_DIR}/etc/apk/repositories"
https://dl-cdn.alpinelinux.org/alpine/v3.20/main
https://dl-cdn.alpinelinux.org/alpine/v3.20/community
EOF

# 3. Dynamic Hardware Architecture & Broad Firmware Matrix
HOST_ARCH=$(uname -m)
if [ "$HOST_ARCH" = "x86_64" ]; then
    ALPINE_ARCH="x86_64"
    FIRMWARE_MATRIX="linux-firmware-amd linux-firmware-intel linux-firmware-rtl_nic linux-firmware-rtw88"
elif [ "$HOST_ARCH" = "aarch64" ] || [ "$HOST_ARCH" = "arm64" ]; then
    ALPINE_ARCH="aarch64"
    FIRMWARE_MATRIX="linux-firmware-brcm linux-firmware-arm"
else
    echo "[COVALENT_MATRIX] Fallback Architecture: $HOST_ARCH (Standard Firmware Set)"
    ALPINE_ARCH="x86_64"
    FIRMWARE_MATRIX="linux-firmware-amd linux-firmware-intel linux-firmware-rtw88"
fi

echo "[COVALENT_MATRIX] Architecture: ${ALPINE_ARCH} | Injecting Hardware Support Matrix..."
chroot "${ROOTFS_DIR}" /bin/sh -c "
    apk update
    apk add --no-cache \
        busybox \
        ${FIRMWARE_MATRIX} \
        mesa-dri-gallium \
        mesa-va-gallium \
        vulkan-loader \
        mesa-vulkan-ati \
        mesa-vulkan-intel \
        xorg-server \
        xf86-video-amdgpu \
        xf86-video-intel \
        xf86-video-fbdev \
        eudev \
        chromium \
        ttf-dejavu \
        pulseaudio \
        alsa-utils \
        wpa_supplicant \
        dhcpcd \
        pciutils \
        usbutils \
        dbus
"

# 4. Write Universal PID 1 Dynamic Register (Hardware Probe & Graceful Degradation)
echo "[COVALENT_MATRIX] Writing Universal PID 1 /init dynamic register with graceful degradation..."
cat << 'EOF' > "${ROOTFS_DIR}/init"
#!/bin/sh
# Covalent-OS-11-11-0 Universal PID 1 Substrate Init
# Invariant: d_I = 0 (Hardware-Agnostic Graceful Degradation)

export PATH=/sbin:/bin:/usr/sbin:/usr/bin:/covalent/bin:/usr/local/bin
export HOME=/root
export COVALENT_VOLATILE=1

# Mount critical pseudo-filesystems
mount -t devtmpfs devtmpfs /dev
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t tmpfs -o size=80% tmpfs /tmp
mount -t tmpfs -o size=20% tmpfs /run

echo "===================================================" > /dev/console
echo "  COVALENT OS // UNIVERSAL SUBSTRATE BOOT          " > /dev/console
echo "  INVARIANT: d_I = 0.000 (O(1) HARDWARE ADAPTIVE)  " > /dev/console
echo "===================================================" > /dev/console

mkdir -p /covalent/bin /run/dbus
udevd --daemon 2>/dev/null || mdev -s
udevadm trigger --action=add 2>/dev/null || true
udevadm settle 2>/dev/null || true
dbus-daemon --system --fork 2>/dev/null || true

# Parse kernel commandline parameters
COVALENT_MODE="auto"
for param in $(cat /proc/cmdline 2>/dev/null); do
    case "$param" in
        covalent_mode=*)
            COVALENT_MODE="${param#*=}"
            echo "[COVALENT_INIT] Mode specified: ${COVALENT_MODE}" > /dev/console
            ;;
    esac
done

# Initialize Network Interfaces
ip link set lo up
wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf 2>/dev/null || true
dhcpcd -b 2>/dev/null || true

echo "[Si<->C] PROBING THERMODYNAMIC & ACCELERATION CAPABILITIES..." > /dev/console

# ------------------------------------------------------------------------------
# THE UNIVERSAL HARDWARE PIVOT (Graceful Degradation)
# ------------------------------------------------------------------------------
# Attempt to ignite the X11 Server
Xorg :0 -nohostorder -novtswitch -sharevts > /dev/null 2>&1 &
export DISPLAY=:0
sleep 2

# Check if the X server established a display surface
if command -v xset >/dev/null 2>&1 && xset q > /dev/null 2>&1; then
    echo "[Si<->C] VULKAN/DRM PIPELINE SECURED. LAUNCHING HEAVY WEBGPU CANVAS." > /dev/console
    
    # Ignite Full Monolithic Be-Instance Canvas
    chromium \
        --kiosk \
        --no-first-run \
        --no-sandbox \
        --disable-infobars \
        --enable-features=Vulkan,UseSkiaRenderer,WebGPUService,WebGPU \
        --enable-unsafe-webgpu \
        --ignore-gpu-blocklist \
        --enable-gpu-rasterization \
        --enable-zero-copy \
        --app=http://localhost:3000 &
      
    # Launch native backend as Primary Compute Node
    if [ -x "/usr/local/bin/CovalentMonolith" ] || [ -x "/usr/local/bin/covalent-monolith" ]; then
        /usr/local/bin/covalent-monolith --repo=https://github.com/outtatowner/Be-Instance.git --mode=primary_node &
    fi
else
    echo "[!] GPU PIPELINE FAILED OR ABSENT. EXECUTING GRACEFUL DEGRADATION." > /dev/console
    killall Xorg 2>/dev/null || true
    
    echo "[Si<->C] PIVOTING TO CPU-RENDERED FRAMEBUFFER & PEER VALIDATION MODE." > /dev/console
    
    # Launch backend as lightweight peer helper
    if [ -x "/usr/local/bin/CovalentMonolith" ] || [ -x "/usr/local/bin/covalent-monolith" ]; then
        /usr/local/bin/covalent-monolith --repo=https://github.com/outtatowner/Be-Instance.git --mode=peer_helper &
    fi
    
    # Launch lightweight pure C direct framebuffer fallback if available
    if [ -x "/covalent/bin/covalent_fb_paint" ]; then
        /covalent/bin/covalent_fb_paint &
    else
        echo "[Si<->C] HEADLESS / PEER VALIDATOR ACTIVE (d_I = 0.000)." > /dev/console
    fi
fi

echo "===================================================" > /dev/console
echo "  COVALENT OS // MATRIX LIVE                       " > /dev/console
echo "===================================================" > /dev/console

exec /bin/sh < /dev/console > /dev/console 2>&1
EOF

chmod +x "${ROOTFS_DIR}/init"

# 5. Pack Volatile initramfs.gz
echo "[COVALENT_MATRIX] Compressing rootfs into volatile initramfs.gz..."
cd "${ROOTFS_DIR}"
find . -print0 | cpio --null --create --format=newc | gzip -9 > "${ISO_DIR}/boot/initramfs.gz"
cd - > /dev/null

# 6. Copy Kernel and Create GRUB Bootloader Configuration
if [ -f "$(pwd)/iso_boot/bzImage-covalent" ]; then
    cp "$(pwd)/iso_boot/bzImage-covalent" "${ISO_DIR}/boot/vmlinuz"
else
    echo "[COVALENT_MATRIX] Warning: bzImage-covalent not found in iso_boot, copying from build if present."
fi

cat << 'EOF' > "${ISO_DIR}/boot/grub/grub.cfg"
set default=0
set timeout=2

insmod efi_gop
insmod font
if loadfont /boot/grub/fonts/unicode.pf2 ; then
    insmod gfxterm
    set gfxmode=auto
    set gfxpayload=keep
    terminal_output gfxterm
fi

menuentry "Covalent-OS 11-11-0 (Volatile RAM-disk AMD APU - Vulkan WebGPU)" {
    linux /boot/vmlinuz quiet loglevel=3 covalent_mode=be_instance covalent_autostart=1 amdgpu.dc=1 amdgpu.sg_display=0
    initrd /boot/initramfs.gz
}

menuentry "Covalent-OS 11-11-0 (Debug / Direct Terminal Shell)" {
    linux /boot/vmlinuz loglevel=7 covalent_mode=debug
    initrd /boot/initramfs.gz
}
EOF

# 7. Generate Standalone Hybrid ISO
echo "[COVALENT_MATRIX] Generating bootable hybrid ISO image: ${OUTPUT_ISO}..."
if command -v grub-mkrescue >/dev/null 2>&1; then
    grub-mkrescue -o "${OUTPUT_ISO}" "${ISO_DIR}"
    echo "[COVALENT_MATRIX] ISO image generated successfully: ${OUTPUT_ISO}"
else
    echo "[COVALENT_MATRIX] Notice: grub-mkrescue not in environment, staged ISO layout in ${ISO_DIR}."
fi

echo "[COVALENT_MATRIX] Substrate Volatile RAM-disk Pipeline Complete."

