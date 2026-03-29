#!/usr/bin/env bash
# =============================================================================
# Vito Local Test Server Setup
# Membuat Docker container Ubuntu 24.04 dengan SSH untuk test provisioning Vito
# =============================================================================

set -e

# ── Config ────────────────────────────────────────────────────────────────────
CONTAINER_NAME="vito-test-server"
SSH_PORT=2222
VITO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_KEY_PATH="$VITO_ROOT/storage/ssh-public.key"
PRIVATE_KEY_PATH="$VITO_ROOT/storage/ssh-private.pem"
ENV_FILE="$VITO_ROOT/.env"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Vito Local Test Server Setup           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Cek prasyarat ─────────────────────────────────────────────────────
info "Mengecek prasyarat..."

command -v docker &>/dev/null || fail "Docker tidak ditemukan. Install Docker terlebih dahulu."
docker info &>/dev/null       || fail "Docker daemon tidak berjalan. Jalankan Docker terlebih dahulu."
ok "Docker tersedia"

[[ -f "$PUBLIC_KEY_PATH" ]]  || fail "SSH public key tidak ditemukan: $PUBLIC_KEY_PATH"
[[ -f "$PRIVATE_KEY_PATH" ]] || fail "SSH private key tidak ditemukan: $PRIVATE_KEY_PATH"
ok "SSH key pair ditemukan"

# ── Step 2: Konfigurasi .env ──────────────────────────────────────────────────
info "Mengecek konfigurasi .env..."

if grep -q "RESTRICT_SERVER_IPS" "$ENV_FILE" 2>/dev/null; then
    sed -i 's/^RESTRICT_SERVER_IPS=.*/RESTRICT_SERVER_IPS=false/' "$ENV_FILE"
    ok "RESTRICT_SERVER_IPS diupdate ke false"
else
    echo "RESTRICT_SERVER_IPS=false" >> "$ENV_FILE"
    ok "RESTRICT_SERVER_IPS=false ditambahkan ke .env"
fi

# Clear config cache jika artisan tersedia
if command -v php &>/dev/null && [[ -f "$VITO_ROOT/artisan" ]]; then
    php "$VITO_ROOT/artisan" config:clear --quiet 2>/dev/null && ok "Config cache dibersihkan" || warn "Gagal clear config cache, lakukan manual: php artisan config:clear"
fi

# ── Step 3: Hapus container lama jika ada ────────────────────────────────────
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    warn "Container '$CONTAINER_NAME' sudah ada, menghapus..."
    docker rm -f "$CONTAINER_NAME" &>/dev/null
    ok "Container lama dihapus"
fi

# Cek port sudah dipakai
if ss -tlnp "sport = :$SSH_PORT" 2>/dev/null | grep -q ":$SSH_PORT"; then
    fail "Port $SSH_PORT sudah digunakan. Hentikan proses yang memakai port tersebut atau ubah SSH_PORT di script ini."
fi

# ── Step 4: Jalankan container ────────────────────────────────────────────────
info "Membuat container Docker '$CONTAINER_NAME'..."

docker run -d \
    --name "$CONTAINER_NAME" \
    --privileged \
    -p "${SSH_PORT}:22" \
    -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
    --cgroupns=host \
    jrei/systemd-ubuntu:24.04 &>/dev/null

ok "Container berjalan (port $SSH_PORT → 22)"

# ── Step 5: Install & konfigurasi SSH ────────────────────────────────────────
info "Menginstall OpenSSH server di container..."

sleep 3 # beri waktu systemd init

docker exec "$CONTAINER_NAME" bash -c "
    apt-get update -qq 2>/dev/null
    apt-get install -y openssh-server sudo -qq 2>/dev/null
    mkdir -p /root/.ssh
    chmod 700 /root/.ssh
    echo 'PermitRootLogin yes'       >> /etc/ssh/sshd_config
    echo 'PubkeyAuthentication yes'  >> /etc/ssh/sshd_config
    echo 'PasswordAuthentication no' >> /etc/ssh/sshd_config
    systemctl enable ssh
    systemctl start ssh
    rm -f /run/nologin
" &>/dev/null

ok "SSH server berjalan di container"

# ── Step 6: Copy public key ───────────────────────────────────────────────────
info "Menyalin SSH public key Vito ke container..."

PUBLIC_KEY_CONTENT=$(cat "$PUBLIC_KEY_PATH")
docker exec "$CONTAINER_NAME" bash -c "echo '$PUBLIC_KEY_CONTENT' > /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys" &>/dev/null

ok "Public key berhasil disalin"

# ── Step 7: Pastikan tidak ada user vito ─────────────────────────────────────
info "Memverifikasi tidak ada user 'vito' di container..."

if docker exec "$CONTAINER_NAME" id vito &>/dev/null; then
    warn "User 'vito' ditemukan, menghapus..."
    docker exec "$CONTAINER_NAME" userdel vito &>/dev/null
    ok "User 'vito' dihapus"
else
    ok "Tidak ada user 'vito' (aman)"
fi

# ── Step 8: Hapus pam_nologin ─────────────────────────────────────────────────
info "Menghapus nologin restriction..."
docker exec "$CONTAINER_NAME" bash -c "
    rm -f /run/nologin /etc/nologin
    # Pastikan systemd tidak re-create nologin
    systemctl mask systemd-user-sessions.service 2>/dev/null || true
" &>/dev/null
ok "nologin restriction dihapus"

# ── Step 9: Bersihkan known_hosts ────────────────────────────────────────────
KNOWN_HOSTS="$HOME/.ssh/known_hosts"
if [[ -f "$KNOWN_HOSTS" ]]; then
    ssh-keygen -f "$KNOWN_HOSTS" -R "[localhost]:$SSH_PORT" &>/dev/null || true
    ssh-keygen -f "$KNOWN_HOSTS" -R "[127.0.0.1]:$SSH_PORT" &>/dev/null || true
    ok "known_hosts dibersihkan untuk port $SSH_PORT"
fi

# ── Step 9: Test koneksi SSH ──────────────────────────────────────────────────
info "Menguji koneksi SSH..."

sleep 1 # beri waktu sshd siap

SSH_TEST=$(ssh -i "$PRIVATE_KEY_PATH" \
    -p "$SSH_PORT" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    root@127.0.0.1 \
    "echo OK" 2>/dev/null || echo "FAIL")

if [[ "$SSH_TEST" == "OK" ]]; then
    ok "Koneksi SSH berhasil!"
else
    fail "Koneksi SSH gagal. Cek log: docker logs $CONTAINER_NAME"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Selesai! 🎉                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Daftarkan server baru di Vito dengan detail:"
echo ""
echo -e "  ${YELLOW}Provider   :${NC} Custom"
echo -e "  ${YELLOW}IP Address :${NC} 127.0.0.1"
echo -e "  ${YELLOW}Port       :${NC} $SSH_PORT"
echo -e "  ${YELLOW}SSH User   :${NC} root"
echo -e "  ${YELLOW}OS         :${NC} Ubuntu 24.04"
echo ""
echo -e "  Untuk menghapus container:"
echo -e "  ${BLUE}docker rm -f $CONTAINER_NAME${NC}"
echo ""
