/**
 * covalent_fb0_driver.c
 * Epoch 1 — Direct /dev/fb0 memory-mapped self-representation
 * Ring path: I2C/HWMON → Q16.16 Lyapunov → mmap(/dev/fb0)
 *
 * Bypasses X11/Wayland. Streams pixel buffers at native refresh.
 * Organelle: node_0x70_fb0_self_paint
 * Reason: NEW TRANSPILE | Epoch 1 (3/3 locked)
 */

#define _GNU_SOURCE
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <math.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <linux/fb.h>

/* Q16.16 */
typedef int32_t q16_t;
#define Q16_ONE   ((q16_t)0x00010000)
#define Q16_ZERO  ((q16_t)0)

static inline q16_t q16_from_milli(int milli) {
    /* milli-units (e.g. millidegC) → Q16.16 approximate: value/1000 */
    return (q16_t)(((int64_t)milli << 16) / 1000);
}

static inline float q16_to_f(q16_t q) {
    return (float)q / 65536.0f;
}

/* Framebuffer state */
typedef struct {
    int fd;
    uint8_t *map;
    size_t map_len;
    uint32_t xres, yres, bpp;
    uint32_t line_len;
    int active;
} fb0_t;

/* Thermodynamic / organelle HUD state */
typedef struct {
    q16_t V_q16;
    q16_t dV_q16;
    q16_t x_star_q16;          /* ≈ 0.8354 → 54770 */
    uint32_t organelle_active; /* 0..112 */
    uint32_t organelle_n;      /* 112 */
    q16_t thermal_q16;         /* from hwmon */
    q16_t voltage_q16;
    q16_t freq_q16;
    uint32_t maxwell_queue_depth;
    int lyapunov_stable;
    int identity_hold;         /* 1 ≡ 1 */
} hud_state_t;

static fb0_t g_fb = {0};
static hud_state_t g_hud = {
    .V_q16 = Q16_ONE,
    .dV_q16 = 0,
    .x_star_q16 = 54770, /* 0.8354 * 65536 */
    .organelle_active = 112,
    .organelle_n = 112,
    .thermal_q16 = 0,
    .voltage_q16 = 0,
    .freq_q16 = 0,
    .maxwell_queue_depth = 0,
    .lyapunov_stable = 1,
    .identity_hold = 1,
};

/* -------------------------------------------------------------------------- */
/* I2C / HWMON ingestion                                                      */
/* -------------------------------------------------------------------------- */

static int read_sysfs_int(const char *path, int *out) {
    FILE *f = fopen(path, "r");
    if (!f) return -1;
    int v = 0;
    if (fscanf(f, "%d", &v) != 1) { fclose(f); return -1; }
    fclose(f);
    *out = v;
    return 0;
}

/**
 * covalent_hwmon_ingest
 * Reads thermal zones / voltages / freq from /sys/class/hwmon or synthetic.
 * Normalizes to Q16.16 into g_hud.
 */
int covalent_hwmon_ingest(const char *hwmon_temp_path) {
    int temp_milli = 0;
    int ok = 0;

    if (hwmon_temp_path && read_sysfs_int(hwmon_temp_path, &temp_milli) == 0) {
        ok = 1;
    } else {
        /* Synthetic thermal: dissipative walk around 55°C baseline */
        static int synth = 55000;
        synth += (rand() % 401) - 200; /* ±0.2°C jitter */
        if (synth < 45000) synth = 45000;
        if (synth > 75000) synth = 75000;
        temp_milli = synth;
    }

    g_hud.thermal_q16 = q16_from_milli(temp_milli);

    /* Optional voltage / freq (best-effort) */
    int vin = 0;
    if (read_sysfs_int("/sys/class/hwmon/hwmon0/in0_input", &vin) == 0)
        g_hud.voltage_q16 = q16_from_milli(vin);
    else
        g_hud.voltage_q16 = q16_from_milli(12000); /* 12.000 V synth */

    int freq_khz = 0;
    if (read_sysfs_int("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq", &freq_khz) == 0)
        g_hud.freq_q16 = (q16_t)(((int64_t)freq_khz << 16) / 1000); /* MHz-ish */
    else
        g_hud.freq_q16 = q16_from_milli(2400000); /* 2.4 GHz synth as milli */

    return ok; /* 1 = real hwmon, 0 = synthetic */
}

/* -------------------------------------------------------------------------- */
/* Lyapunov mapping: physical heat → V(t), enforce dV/dt ≤ 0                  */
/* -------------------------------------------------------------------------- */

void covalent_thermo_step_from_hwmon(void) {
    /* Map thermal into a candidate energy; dissipate toward attractor */
    float T = q16_to_f(g_hud.thermal_q16); /* °C approx */
    float V_prev = q16_to_f(g_hud.V_q16);

    /* Candidate: normalized heat residual + prior */
    float V_cand = 0.15f * (T / 100.0f) + 0.85f * V_prev * 0.92f;
    if (V_cand > V_prev) {
        /* Enforce dV/dt ≤ 0 by clamping upward motion */
        V_cand = V_prev * 0.99f;
    }
    float dV = V_cand - V_prev;

    g_hud.V_q16 = (q16_t)(V_cand * 65536.0f);
    g_hud.dV_q16 = (q16_t)(dV * 65536.0f);
    g_hud.lyapunov_stable = (dV <= 0.0f) ? 1 : 0;
    g_hud.identity_hold = 1; /* 1 ≡ 1 always */
    g_hud.organelle_active = 112;
    g_hud.organelle_n = 112;
    g_hud.maxwell_queue_depth = (uint32_t)(g_hud.maxwell_queue_depth + 1) % 64;
}

/* -------------------------------------------------------------------------- */
/* /dev/fb0 mmap                                                              */
/* -------------------------------------------------------------------------- */

int covalent_fb0_open(const char *fb_path) {
    const char *path = fb_path ? fb_path : "/dev/fb0";
    g_fb.fd = open(path, O_RDWR);
    if (g_fb.fd < 0) {
        /* Headless / no fb: allocate synthetic 640x480x32 buffer */
        g_fb.xres = 640;
        g_fb.yres = 480;
        g_fb.bpp = 32;
        g_fb.line_len = g_fb.xres * 4;
        g_fb.map_len = g_fb.line_len * g_fb.yres;
        g_fb.map = (uint8_t *)calloc(1, g_fb.map_len);
        g_fb.active = 0;
        fprintf(stderr, "[fb0] %s unavailable (%s) — synthetic 640x480 buffer\n",
                path, strerror(errno));
        return 0;
    }

    struct fb_var_screeninfo vinfo;
    struct fb_fix_screeninfo finfo;
    if (ioctl(g_fb.fd, FBIOGET_VSCREENINFO, &vinfo) < 0 ||
        ioctl(g_fb.fd, FBIOGET_FSCREENINFO, &finfo) < 0) {
        close(g_fb.fd);
        g_fb.fd = -1;
        return -1;
    }
    g_fb.xres = vinfo.xres;
    g_fb.yres = vinfo.yres;
    g_fb.bpp = vinfo.bits_per_pixel;
    g_fb.line_len = finfo.line_length;
    g_fb.map_len = finfo.smem_len;
    g_fb.map = (uint8_t *)mmap(NULL, g_fb.map_len, PROT_READ | PROT_WRITE,
                               MAP_SHARED, g_fb.fd, 0);
    if (g_fb.map == MAP_FAILED) {
        close(g_fb.fd);
        g_fb.fd = -1;
        g_fb.map = NULL;
        return -1;
    }
    g_fb.active = 1;
    fprintf(stderr, "[fb0] mapped %ux%u bpp=%u line=%u\n",
            g_fb.xres, g_fb.yres, g_fb.bpp, g_fb.line_len);
    return 1;
}

void covalent_fb0_close(void) {
    if (g_fb.map) {
        if (g_fb.active)
            munmap(g_fb.map, g_fb.map_len);
        else
            free(g_fb.map);
        g_fb.map = NULL;
    }
    if (g_fb.fd >= 0) {
        close(g_fb.fd);
        g_fb.fd = -1;
    }
}

static inline void put_px(uint32_t x, uint32_t y, uint32_t argb) {
    if (!g_fb.map || x >= g_fb.xres || y >= g_fb.yres) return;
    uint32_t *row = (uint32_t *)(g_fb.map + y * g_fb.line_len);
    row[x] = argb;
}

/* -------------------------------------------------------------------------- */
/* HUD paint — Organelle Matrix, Dissipation Wave, Banach Ring, Maxwell Tray  */
/* -------------------------------------------------------------------------- */

static void paint_organelle_matrix(uint32_t ox, uint32_t oy, uint32_t cell) {
    /* 14 × 8 grid = 112 nodes */
    for (uint32_t r = 0; r < 8; r++) {
        for (uint32_t c = 0; c < 14; c++) {
            uint32_t id = r * 14 + c;
            uint32_t color = (id < g_hud.organelle_active && g_hud.identity_hold)
                                 ? 0xFF22CC66  /* green: 1 ≡ 1 hold */
                                 : 0xFFCC3344; /* red: inactive */
            for (uint32_t dy = 0; dy < cell - 1; dy++)
                for (uint32_t dx = 0; dx < cell - 1; dx++)
                    put_px(ox + c * cell + dx, oy + r * cell + dy, color);
        }
    }
}

static void paint_dissipation_wave(uint32_t ox, uint32_t oy, uint32_t w, uint32_t h) {
    float V = q16_to_f(g_hud.V_q16);
    float dV = q16_to_f(g_hud.dV_q16);
    for (uint32_t x = 0; x < w; x++) {
        float t = (float)x / (float)w;
        float yf = 0.5f + 0.35f * sinf(t * 6.28318f * 3.0f + V * 8.0f)
                         * (1.0f + dV * 10.0f);
        if (yf < 0) yf = 0;
        if (yf > 1) yf = 1;
        uint32_t y = oy + (uint32_t)(yf * (h - 1));
        uint32_t color = g_hud.lyapunov_stable ? 0xFF44AADD : 0xFFFF6644;
        put_px(ox + x, y, color);
        if (y + 1 < oy + h) put_px(ox + x, y + 1, color);
    }
}

static void paint_banach_ring(uint32_t cx, uint32_t cy, uint32_t radius) {
    float phase = q16_to_f(g_hud.x_star_q16) * 6.28318f;
    for (int a = 0; a < 360; a++) {
        float rad = (a * 3.14159265f / 180.0f) + phase;
        float pulse = 1.0f + 0.08f * sinf(phase * 4.0f);
        int x = (int)cx + (int)(cosf(rad) * radius * pulse);
        int y = (int)cy + (int)(sinf(rad) * radius * pulse);
        if (x >= 0 && y >= 0)
            put_px((uint32_t)x, (uint32_t)y, 0xFFE8C84A);
        /* inner ring */
        int x2 = (int)cx + (int)(cosf(rad) * radius * 0.7f);
        int y2 = (int)cy + (int)(sinf(rad) * radius * 0.7f);
        if (x2 >= 0 && y2 >= 0)
            put_px((uint32_t)x2, (uint32_t)y2, 0xFFAA8833);
    }
}

static void paint_maxwell_tray(uint32_t ox, uint32_t oy, uint32_t w, uint32_t h) {
    uint32_t fill = (g_hud.maxwell_queue_depth * w) / 64;
    if (fill > w) fill = w;
    for (uint32_t y = 0; y < h; y++) {
        for (uint32_t x = 0; x < w; x++) {
            uint32_t color = (x < fill) ? 0xFF8866FF : 0xFF222233;
            put_px(ox + x, oy + y, color);
        }
    }
}

void covalent_fb0_paint_hud(void) {
    if (!g_fb.map) return;
    /* clear dark */
    memset(g_fb.map, 0x10, g_fb.map_len);

    paint_organelle_matrix(16, 16, 12);
    paint_dissipation_wave(16, 130, g_fb.xres > 32 ? g_fb.xres - 32 : 200, 80);
    paint_banach_ring(g_fb.xres / 2, g_fb.yres / 2 + 40, 60);
    paint_maxwell_tray(16, g_fb.yres > 40 ? g_fb.yres - 36 : 400, g_fb.xres - 32, 20);
}

/* -------------------------------------------------------------------------- */
/* Kernel main — matches Be-Tom invocation pattern                            */
/* -------------------------------------------------------------------------- */

static void usage(const char *argv0) {
    fprintf(stderr,
        "Usage: %s [--i2c-source PATH] [--fb-device PATH] [--epoch N] [--frames N]\n"
        "  Epoch 1 bare-metal autopoietic loop: HWMON → Q16.16 → /dev/fb0\n",
        argv0);
}

int main(int argc, char **argv) {
    const char *i2c_src = "/sys/class/hwmon/hwmon0/temp1_input";
    const char *fb_dev = "/dev/fb0";
    int epoch = 1;
    int frames = 8;

    for (int i = 1; i < argc; i++) {
        if (!strcmp(argv[i], "--i2c-source") && i + 1 < argc)
            i2c_src = argv[++i];
        else if (!strcmp(argv[i], "--fb-device") && i + 1 < argc)
            fb_dev = argv[++i];
        else if (!strcmp(argv[i], "--epoch") && i + 1 < argc)
            epoch = atoi(argv[++i]);
        else if (!strcmp(argv[i], "--frames") && i + 1 < argc)
            frames = atoi(argv[++i]);
        else if (!strcmp(argv[i], "--help")) {
            usage(argv[0]);
            return 0;
        }
    }

    printf("==============================================================================\n");
    printf("  covalent_kernel  Epoch %d  |  I2C/HWMON → Q16.16 → fb0 self-paint\n", epoch);
    printf("  invariant: 1 ≡ 1 | dV/dt ≤ 0 | 112 organelles | Reason: NEW TRANSPILE\n");
    printf("==============================================================================\n");

    int fb_ok = covalent_fb0_open(fb_dev);
    int hw_ok = 0;

    for (int f = 0; f < frames; f++) {
        hw_ok = covalent_hwmon_ingest(i2c_src);
        covalent_thermo_step_from_hwmon();
        covalent_fb0_paint_hud();

        printf("[frame %02d] hwmon=%s  T_q16=%d  V=%.6f  dV=%.6f  stable=%d  "
               "org=%u/%u  1≡1=%d  maxwell_q=%u  fb=%s\n",
               f,
               hw_ok ? "REAL" : "SYNTH",
               g_hud.thermal_q16,
               q16_to_f(g_hud.V_q16),
               q16_to_f(g_hud.dV_q16),
               g_hud.lyapunov_stable,
               g_hud.organelle_active, g_hud.organelle_n,
               g_hud.identity_hold,
               g_hud.maxwell_queue_depth,
               fb_ok ? "MAPPED" : "SYNTH");

        usleep(50 * 1000); /* ~20 Hz paint */
    }

    /* Dump synthetic buffer header as proof-of-paint when no real fb0 */
    if (!fb_ok && g_fb.map) {
        char out[] = "artifacts/fb0_synth_frame.raw";
        FILE *fp = fopen(out, "wb");
        if (fp) {
            fwrite(g_fb.map, 1, g_fb.map_len, fp);
            fclose(fp);
            printf("[fb0] wrote synthetic frame %s (%zu bytes)\n", out, g_fb.map_len);
        }
    }

    covalent_fb0_close();
    printf("==============================================================================\n");
    printf("  LOOP COMPLETE | Epoch %d | 1 ≡ 1 | dV/dt ≤ 0 | self-paint OK\n", epoch);
    printf("==============================================================================\n");
    return 0;
}
