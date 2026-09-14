const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, files);
    } else if (filePath.match(/(Create|Edit).*\.jsx$/)) {
      files.push(filePath);
    }
  }
  return files;
}

const dir = path.join(__dirname, '../../frontend/src/pages/admin');
const files = walk(dir);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<SearchableSelect')) {
      // Look for the name or value prop
      let valueMatch = lines[i].match(/value=\{formik\.values\.(\w+)\}/) || [];
      for (let j = 0; j < 6; j++) {
         if (lines[i+j] && lines[i+j].includes('value={formik.values.')) {
            valueMatch = lines[i+j].match(/value=\{formik\.values\.(\w+)\}/);
            break;
         }
      }
      
      const fieldName = valueMatch ? valueMatch[1] : 'UNKNOWN';
      
      // Check next 10 lines for formik.errors
      let hasErrorRender = false;
      for (let j = 0; j < 15; j++) {
        if (lines[i+j] && lines[i+j].includes(`formik.errors.${fieldName}`)) {
          hasErrorRender = true;
          break;
        }
      }
      if (!hasErrorRender && fieldName !== 'UNKNOWN') {
        console.log(`Missing error render in ${path.basename(file)} for SearchableSelect field: ${fieldName}`);
      }
    }
  }
}
