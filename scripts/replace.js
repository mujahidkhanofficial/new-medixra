const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/Medixra/g, 'Pakmedinex');
    content = content.replace(/medixra/g, 'pakmedinex');
    content = content.replace(/MEDIXRA/g, 'PAKMEDINEX');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            if (/\.(ts|tsx)$/.test(file)) {
                replaceInFile(fullPath);
            }
        }
    }
}

['app', 'components', 'lib'].forEach(dir => walkDir(path.join(process.cwd(), dir)));
