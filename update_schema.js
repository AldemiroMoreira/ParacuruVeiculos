const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const fabricantesPath = path.join(__dirname, 'database', 'fabricantes.json');
const modelosPath = path.join(__dirname, 'database', 'modelos.json');

const fabricantes = JSON.parse(fs.readFileSync(fabricantesPath, 'utf8'));
const modelos = JSON.parse(fs.readFileSync(modelosPath, 'utf8'));

let schema = fs.readFileSync(schemaPath, 'utf8');

// Define Create Table statements
const fabricantesTable = `
-- Fabricantes table
CREATE TABLE IF NOT EXISTS fabricantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);`;

const modelosTable = `
-- Modelos table
CREATE TABLE IF NOT EXISTS modelos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fabricante_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id)
);`;

// Generate INSERT statements
const generateInsert = (table, data, keys) => {
    const values = data.map(item => {
        const row = keys.map(k => {
            const val = item[k];
            return typeof val === 'string' ? `'${val.replace(/'/g, "\\'")}'` : val;
        }).join(', ');
        return `(${row})`;
    }).join(',\n');
    return `INSERT INTO ${table} (${keys.join(', ')}) VALUES \n${values}\nON DUPLICATE KEY UPDATE id=id;`;
};

const insertFabricantes = generateInsert('fabricantes', fabricantes, ['id', 'nome']);
const insertModelos = generateInsert('modelos', modelos, ['id', 'fabricante_id', 'nome']);

// Append to schema.sql if not already present (simple check)
if (!schema.includes('CREATE TABLE IF NOT EXISTS fabricantes')) {
    schema += `\n${fabricantesTable}\n`;
    schema += `\n${insertFabricantes}\n`;
}

if (!schema.includes('CREATE TABLE IF NOT EXISTS modelos')) {
    schema += `\n${modelosTable}\n`;
    schema += `\n${insertModelos}\n`;
}

// Write back to schema.sql
fs.writeFileSync(schemaPath, schema);
console.log('Schema updated with Manufacturers and Models.');

// Optional: Also execute these against the DB if running? User just asked to modify schema.sql.
// We will only modify Schema.sql as requested.
