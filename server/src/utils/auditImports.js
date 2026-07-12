import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, "..");
let hasErrors = false;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules") scanDir(fullPath);
    } else if (file.endsWith(".js")) {
      auditFile(fullPath);
    }
  }
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  // Regex to find import statements: import { ... } from "..." or import x from "..."
  const importRegex = /import\s+.*?\s+from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Ignore external dependencies like "express", "mongoose", etc.
    if (!importPath.startsWith(".") && !importPath.startsWith("/")) continue;
    
    // In ES modules, local imports MUST have .js extension unless it's a directory (which might fail in native node esm without --experimental-specifier-resolution=node)
    // Actually native Node ES modules require explicit .js extensions.
    
    const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
    
    if (!fs.existsSync(absoluteImportPath)) {
      console.error(`\x1b[31m[ERROR]\x1b[0m Broken import in ${filePath.replace(baseDir, '')}`);
      console.error(`        -> ${importPath}`);
      hasErrors = true;
    } else if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && fs.statSync(absoluteImportPath).isFile()) {
        console.warn(`\x1b[33m[WARNING]\x1b[0m Missing extension in ${filePath.replace(baseDir, '')} for ${importPath}`);
    }
  }
}

console.log("Starting Import Audit...");
scanDir(baseDir);
if (!hasErrors) {
  console.log("\x1b[32mAll local imports resolved successfully!\x1b[0m");
} else {
  console.log("Audit complete with errors.");
}
