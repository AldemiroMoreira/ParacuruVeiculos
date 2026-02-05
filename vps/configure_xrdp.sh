#!/bin/bash

# Configure session for root
echo "xfce4-session" > /root/.xsession
echo "xfce4-session" > /home/paracuru_user/.xsession

# Restart XRDP
echo "Restarting XRDP..."
service xrdp restart

# Check/Open Firewall (UFW)
if command -v ufw > /dev/null; then
    echo "Opening port 3389 on UFW..."
    ufw allow 3389/tcp
fi

# Ensure xrdp user is in ssl-cert group
adduser xrdp ssl-cert

echo "XRDP Configured. Connect via Port 3389."
