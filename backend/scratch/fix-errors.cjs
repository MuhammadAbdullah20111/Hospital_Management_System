const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, files);
    } else if (filePath.match(/\.jsx$/)) {
      files.push(filePath);
    }
  }
  return files;
}

const dir = path.join(__dirname, '../../frontend/src/pages');
const files = walk(dir);

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  let inTag = false;
  let currentTag = '';
  let fieldName = null;
  let tagLines = [];
  let tagStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTag) {
      if (line.match(/<(SearchableSelect|input|textarea|select)\b/)) {
        const match = line.match(/<(SearchableSelect|input|textarea|select)\b/);
        currentTag = match[1];
        inTag = true;
        fieldName = null;
        tagLines = [line];
        tagStartIdx = i;
      }
    } else {
      tagLines.push(line);
    }

    if (inTag) {
      // Check for tag closing. Depending on tag it might be /> or >
      let closed = false;
      if (currentTag === 'input' || currentTag === 'SearchableSelect') {
        if (line.includes('/>') || line.match(/></)) closed = true;
        if (line.includes('>') && !line.includes('<SearchableSelect') && !line.includes('<input')) {
           if (line.trim().endsWith('>')) closed = true;
        }
      } else if (currentTag === 'textarea' || currentTag === 'select') {
        if (line.includes(`</${currentTag}>`)) closed = true;
      }

      if (closed) {
        inTag = false;
        const tagText = tagLines.join(' ');
        
        let fieldMatch = tagText.match(/formik\.setFieldValue\(['"](\w+)['"]/);
        if (fieldMatch) fieldName = fieldMatch[1];
        
        if (!fieldName) {
          fieldMatch = tagText.match(/\.\.\.formik\.getFieldProps\(['"](\w+)['"]\)/);
          if (fieldMatch) fieldName = fieldMatch[1];
        }
        
        if (!fieldName) {
          fieldMatch = tagText.match(/value=\{formik\.values\.(\w+)\}/);
          if (fieldMatch) fieldName = fieldMatch[1];
        }

        if (!fieldName) {
          fieldMatch = tagText.match(/\bname=['"](\w+)['"]/);
          if (fieldMatch && fieldMatch[1] !== 'search') fieldName = fieldMatch[1];
        }

        if (fieldName && fieldName !== 'search' && fieldName !== 'submit' && fieldName !== 'button' && fieldName !== 'checkbox') {
          // Check if next 5 lines already have error rendering
          let hasError = false;
          for (let j = 1; j <= 5; j++) {
            if (lines[i+j] && lines[i+j].includes(`formik.errors.${fieldName}`)) {
              hasError = true;
              break;
            }
          }
          
          if (!hasError) {
            const indentMatch = lines[i].match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1] : '';
            const errorStr = `${indent}{formik.touched.${fieldName} && formik.errors.${fieldName} && (\n${indent}    <p className="text-xs text-red-500 font-medium mt-1">{formik.errors.${fieldName}}</p>\n${indent})}`;
            lines.splice(i + 1, 0, errorStr);
            modified = true;
            console.log(`Added error for ${fieldName} in ${path.basename(file)}`);
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'));
  }
}

for (const file of files) {
  if (!file.includes('node_modules')) {
     fixFile(file);
  }
}
