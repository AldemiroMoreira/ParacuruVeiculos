const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const date = new Date().toISOString().replace(/[:.]/g, '-');
const dumpFile = path.join(backupDir, `backup_local_${date}.sql`);

console.log('Iniciando backup do banco de dados local...');
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`Arquivo de destino: ${dumpFile}`);

// Construct the mysqldump command
// Note: mysqldump must be in the system PATH or point to the executable directly
// We assume 'mysqldump' is available since MariaDB/MySQL is installed.
// If password is set, use -p
const passwordPart = process.env.DB_PASS ? `-p"${process.env.DB_PASS}"` : '';
const command = `mysqldump -u ${process.env.DB_USER} ${passwordPart} -h ${process.env.DB_HOST} -P ${process.env.DB_PORT} ${process.env.DB_NAME} > "${dumpFile}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao criar backup: ${error.message}`);
        return;
    }
    if (stderr) {
        // mysqldump writes warnings to stderr, not necessarily errors
        console.log(`Avisos do mysqldump: ${stderr}`);
    }
    console.log(`Backup criado com sucesso em: ${dumpFile}`);
});
