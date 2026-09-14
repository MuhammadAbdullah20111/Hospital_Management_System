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

const dir = path.join(__dirname, '../../frontend/src/pages/admin');
const files = walk(dir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We only care about files that use local state for formData and have toast.error validation.
  if (content.includes('useFormik')) continue;
  if (!content.includes('const [formData, setFormData] = useState')) continue;
  
  // Skip if already processed
  if (content.includes('const [errors, setErrors] = useState({});')) continue;

  let lines = content.split('\n');
  let modified = false;

  // 1. Add `const [errors, setErrors] = useState({});` after `const [formData...`
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [formData, setFormData] = useState')) {
      const indentMatch = lines[i].match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      lines.splice(i, 0, `${indent}const [errors, setErrors] = useState({});`);
      modified = true;
      break;
    }
  }

  if (!modified) continue;

  // 2. Transform the handleSubmit validation logic.
  let inHandleSubmit = false;
  let validationChecks = [];
  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const handleSubmit =') || lines[i].includes('async function handleSubmit')) {
      inHandleSubmit = true;
    }
    
    if (inHandleSubmit) {
      if (lines[i].includes('setIsLoading(true)') || lines[i].includes('try {')) {
        endIdx = i;
        break;
      }
      
      // Look for if (!formData.field) { toast.error("..."); return; }
      let match = lines[i].match(/if\s*\(\!formData\.([a-zA-Z0-9_]+)(\.trim\(\))?(\s*\|\|\s*!formData\.([a-zA-Z0-9_]+))*/);
      
      if (match && !lines[i].includes('Object.keys')) {
        if (startIdx === -1) startIdx = i;
      }
    }
  }

  // Very simplified: replace any `if (!formData.name...)` with the standard block.
  // Actually, rewriting this is safer via manual regex or custom manual edits because there are complex logical blocks in some files.

}
