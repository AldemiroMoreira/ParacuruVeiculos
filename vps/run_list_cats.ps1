$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

scp "vps/list_categories.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/list_categories.js"
ssh $VPS_USER@$VPS_IP "cd /var/www/paracuru-veiculos/backend; node list_categories.js"
