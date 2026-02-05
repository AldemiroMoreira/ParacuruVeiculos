#!/bin/bash

# Paracuru Veiculos - Provisions Script for Ubuntu 24.04
# Usage: sudo ./setup.sh

set -e

DOMAIN="paracuruveiculos.com.br"
APP_DIR="/var/www/paracuru-veiculos"
DB_NAME="paracuru_veiculos"
DB_USER="paracuru_user"
# Generates a random secure password for the DB if not set
DB_PASS=${DB_PASS:-$(openssl rand -base64 12)}

echo ">>> Starting Provisioning for $DOMAIN..."

# 1. Update System
echo ">>> Updating system packages..."
apt update && apt upgrade -y

# 2. Install Dependencies
echo ">>> Installing dependencies (Nginx, MariaDB, Node.js, Git, Certbot)..."
apt install -y nginx mariadb-server git curl unzip certbot python3-certbot-nginx

# 3. Install Node.js 20 (LTS)
if ! command -v node &> /dev/null; then
    echo ">>> Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# 4. Install PM2
echo ">>> Installing PM2..."
npm install -g pm2

# 5. Configure MariaDB
echo ">>> Configuring MariaDB..."
systemctl start mariadb
systemctl enable mariadb

# Check if DB exists
if ! mysql -e "USE $DB_NAME" 2>/dev/null; then
    echo ">>> Creating Database and User..."
    mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
    mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
    mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    echo ">>> Database Created. User: $DB_USER, Pass: $DB_PASS"
    echo "DB_PASS=$DB_PASS" > /root/db_password.txt
    echo "Saved DB password to /root/db_password.txt"
else
    echo ">>> Database already exists."
fi

# 6. Setup App Directory
echo ">>> Setting up App Directory at $APP_DIR..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR # Temporarily own by current user for copy
chmod -R 755 /var/www

# 7. Configure Nginx
echo ">>> Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000; # Node App
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 8. Firewall (UFW)
echo ">>> Configuring Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw enable # Unleash manually to avoid locking yourself out if SSH works on diff port

echo "=========================================="
echo ">>> PROVISIONING COMPLETE!"
echo ">>> Database Password is in /root/db_password.txt"
echo ">>> Next steps:"
echo "    1. Upload code to $APP_DIR"
echo "    2. Run 'npm install' in $APP_DIR"
echo "    3. Run 'npm run seed:prod' (if needed)"
echo "    4. Start with 'pm2 start backend/server.js --name app'"
echo "=========================================="
