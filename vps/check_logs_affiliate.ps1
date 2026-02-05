$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

ssh $DEST_USER_HOST "pm2 logs app --lines 200 --nostream | grep 'Affiliate'"
