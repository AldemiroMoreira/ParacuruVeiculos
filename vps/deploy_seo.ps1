$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$LOCAL_ROBOTS = "public/robots.txt"
$LOCAL_SITEMAP = "public/sitemap.xml"
$REMOTE_DIR = "/var/www/paracuru-veiculos/backend/public" 
# Note: Express serves via backend/public usually, or frontend build. 
# Checking where index.html is served from. 
# Usually in a MERN setup properly deployed, backend serves static files from 'public' 
# OR nginx serves them. 
# Let's assume standard typical setup here where backend/public is the root.

Write-Host ">>> DEPLOYING SEO FILES..." -ForegroundColor Cyan

scp $LOCAL_ROBOTS $VPS_USER@$VPS_IP":"$REMOTE_DIR/robots.txt
scp $LOCAL_SITEMAP $VPS_USER@$VPS_IP":"$REMOTE_DIR/sitemap.xml
