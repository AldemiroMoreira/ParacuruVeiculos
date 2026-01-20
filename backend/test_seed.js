const fs = require('fs');
const path = require('path');

console.log("Hello from test script");
try {
    const { State } = require('./models');
    console.log("Models imported successfully");
} catch (e) {
    console.error("Error importing models, writing to file...");
    fs.writeFileSync('import_error.log', e.toString() + "\\n" + e.stack);
}
