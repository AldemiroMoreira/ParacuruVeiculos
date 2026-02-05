$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"
$LOCAL_FILE = "vps/nginx_ssl.conf"

Write-Host ">>> UPLOADING NGINX CONFIG..." -ForegroundColor Cyan

# Read local content
$Content = Get-Content $LOCAL_FILE -Raw

# Escape double quotes for shell
$ContentEscaped = $Content -replace '"', '\"'

# Construct command: echo content | cat > remote_file
# Using Here-String for cleaner passing might be hard with SSH args.
# We will pipe the content to ssh.

# PowerShell to SSH piping:
# type file | ssh host "cat > remote"
# But we need sudo/root write. Root login handles that.

type $LOCAL_FILE | ssh $VPS_USER@$VPS_IP "cat > /etc/nginx/sites-available/$DOMAIN; ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/; nginx -t && systemctl restart nginx; echo '>>> CONFIG UPLOADED & RESTARTED'"
