# Local Server Testing dengan Docker

Panduan ini menjelaskan cara setup server test lokal menggunakan Docker untuk mencoba fitur provisioning Vito tanpa memerlukan VPS/cloud server.

---

## Prasyarat

- Docker terinstal dan berjalan
- Vito sudah tersetup dan bisa diakses di browser
- Queue worker sudah berjalan (lihat Langkah 5)

---

## Langkah 1: Konfigurasi Vito

### 1.1 Izinkan IP Lokal

Tambahkan baris berikut ke file `.env`:

```env
RESTRICT_SERVER_IPS=false
```

Lalu clear config cache:

```bash
php artisan config:clear && php artisan cache:clear
```

> **Catatan:** Jangan set ini di production. Hanya untuk local development.

### 1.2 Ambil SSH Public Key Vito

Vito menggunakan key pair tersendiri untuk autentikasi ke server. Ambil public key-nya:

```bash
cat storage/ssh-public.key
```

---

## Langkah 2: Setup Docker Container

> **Penting:** Gunakan image `jrei/systemd-ubuntu` bukan `ubuntu` biasa.
> Container Ubuntu standar tidak menjalankan `systemd` sebagai PID 1, sehingga
> `systemctl` tidak bisa digunakan dan provisioning akan gagal saat merestart service
> (Nginx, PHP-FPM, dll).

### 2.1 Jalankan Container dengan Systemd

```bash
docker run -d \
  --name vito-test-server \
  --privileged \
  -p 2222:22 \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  --cgroupns=host \
  jrei/systemd-ubuntu:24.04
```

### 2.2 Install SSH Server di Container

```bash
docker exec vito-test-server bash -c "
  apt update -qq && apt install -y openssh-server -qq
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh
  echo 'PermitRootLogin yes'       >> /etc/ssh/sshd_config
  echo 'PubkeyAuthentication yes'  >> /etc/ssh/sshd_config
  echo 'PasswordAuthentication no' >> /etc/ssh/sshd_config
  systemctl enable ssh
  systemctl start ssh
"
```

### 2.3 Copy SSH Public Key Vito ke Container

```bash
PUBLIC_KEY=$(cat storage/ssh-public.key)
docker exec vito-test-server bash -c \
  "echo '$PUBLIC_KEY' > /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"
```

### 2.4 Verifikasi Tidak Ada User `vito`

Vito akan menolak server yang sudah punya user `vito` (untuk mencegah provisioning ke server Vito sendiri):

```bash
docker exec vito-test-server id vito 2>&1
# Harus output: id: 'vito': no such user
```

Jika user `vito` ada, hapus:

```bash
docker exec vito-test-server userdel vito
```

---

## Langkah 3: Bersihkan known_hosts

Tiap kali container direbuild, host key SSH berubah. Bersihkan entri lama:

```bash
ssh-keygen -f ~/.ssh/known_hosts -R '[localhost]:2222'
ssh-keygen -f ~/.ssh/known_hosts -R '[127.0.0.1]:2222'
```

---

## Langkah 4: Test Koneksi SSH

Sebelum daftarkan ke Vito, pastikan SSH bisa connect:

```bash
ssh -i storage/ssh-private.pem \
    -p 2222 \
    -o StrictHostKeyChecking=no \
    root@127.0.0.1 \
    "echo 'Koneksi berhasil!'"
```

Jika output `Koneksi berhasil!`, lanjut ke Langkah 5.

---

## Langkah 5: Jalankan Queue Worker

Provisioning dijalankan via queue. Gunakan `--timeout=0` agar tidak dimatikan saat instalasi berlangsung lama (apt upgrade, install PHP, Nginx, dll bisa memakan beberapa menit):

```bash
php artisan queue:work --queue=ssh --timeout=0
```

---

## Langkah 6: Daftarkan Server di Vito

Buka Vito di browser, tambahkan server baru dengan detail:

| Field | Value |
|-------|-------|
| **Provider** | Custom |
| **Name** | Docker Test Server |
| **IP Address** | `127.0.0.1` |
| **Port** | `2222` |
| **SSH User** | `root` |
| **OS** | Ubuntu 24.04 |

---

## Langkah 7: Pantau Proses Provisioning

### Via UI
Buka halaman server di Vito — ada progress bar real-time.

### Via Queue Worker
Output queue worker akan menampilkan status job secara live.

### Via Log File
```bash
# List log terbaru
ls -lt storage/app/server-logs/ | head -20

# Baca log tertentu
cat storage/app/server-logs/<nama-file>.log
```

---

## Cara Cepat: Gunakan Script Otomatis

Semua langkah di atas (kecuali daftar server di UI) sudah diotomasi:

```bash
./scripts/setup-local-test-server.sh
```

Script akan:
1. Patch `.env` dengan `RESTRICT_SERVER_IPS=false`
2. Hapus container lama jika ada
3. Buat container baru dengan systemd
4. Install dan konfigurasi SSH
5. Copy SSH public key Vito
6. Bersihkan `known_hosts`
7. Test koneksi SSH dan tampilkan detail untuk diisi di UI

---

## Troubleshooting

### "Cannot connect to server"
- Pastikan SSH daemon berjalan: `docker exec vito-test-server systemctl status ssh`
- Cek port mapping: `docker port vito-test-server`
- Test manual: `ssh -i storage/ssh-private.pem -p 2222 -o StrictHostKeyChecking=no root@127.0.0.1`

### "You cannot perform this action on Vito's server itself"
- Container punya user `vito` — hapus dengan: `docker exec vito-test-server userdel vito`

### "IP address is restricted"
- Pastikan `.env` sudah ada `RESTRICT_SERVER_IPS=false`
- Jalankan `php artisan config:clear && php artisan cache:clear`

### "System has not been booted with systemd" / systemctl gagal
- Kamu menggunakan image `ubuntu` biasa, bukan `jrei/systemd-ubuntu`
- Hapus container dan buat ulang menggunakan image yang benar (lihat Langkah 2.1)

### Queue worker `killed` di tengah instalasi
- Jalankan dengan `--timeout=0`: `php artisan queue:work --queue=ssh --timeout=0`
- Instalasi lengkap bisa memakan waktu 5-15 menit

### WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED
- Bersihkan known_hosts: `ssh-keygen -f ~/.ssh/known_hosts -R '[127.0.0.1]:2222'`

---

## Reset / Cleanup

Hapus container dan mulai dari awal:

```bash
docker rm -f vito-test-server
```

Hapus server dari UI Vito atau database, lalu ulangi dari Langkah 2.
