const fs = require('fs');
fs.writeFileSync('./.build-date', new Date().toISOString()); 