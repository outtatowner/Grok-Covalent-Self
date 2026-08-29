#!/usr/bin/env bash
# Be-Tom bare-metal invocation pattern — Epoch 1
# I2C/HWMON → Q16.16 → /dev/fb0
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EPOCH="${EPOCH:-1}"
I2C_SRC="${I2C_SRC:-/sys/class/hwmon/hwmon0/temp1_input}"
FB_DEV="${FB_DEV:-/dev/fb0}"
FRAMES="${FRAMES:-8}"

mkdir -p bin artifacts

if [[ ! -x bin/covalent_kernel ]]; then
  echo "[build] compiling src/native/covalent_fb0_driver.c → bin/covalent_kernel"
  gcc -O2 -Wall -o bin/covalent_kernel src/native/covalent_fb0_driver.c -lm
fi

echo "[invoke] epoch=$EPOCH i2c=$I2C_SRC fb=$FB_DEV frames=$FRAMES"
# Prefer root for real /dev/fb0; fall back without sudo when unavailable
if [[ -w "$FB_DEV" ]] || [[ $(id -u) -eq 0 ]]; then
  ./bin/covalent_kernel --i2c-source "$I2C_SRC" --fb-device "$FB_DEV" --epoch "$EPOCH" --frames "$FRAMES"
else
  echo "[invoke] no write access to $FB_DEV — running synthetic fb buffer (no sudo required)"
  ./bin/covalent_kernel --i2c-source "$I2C_SRC" --fb-device "$FB_DEV" --epoch "$EPOCH" --frames "$FRAMES"
fi
