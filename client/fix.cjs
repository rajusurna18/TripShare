const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // First, undo any broken ones if there were any, though I reverted them
  // Now replace const fetchTrips = async () => { with async function fetchTrips() {
  let nc = c.replace(/const\s+(fetch[a-zA-Z0-9_]+)\s*=\s*async\s*\(\)\s*=>\s*\{/g, 'async function $1() {');
  
  if (nc !== c) {
    fs.writeFileSync(f, nc, 'utf8');
    console.log('Fixed ' + f);
  }
});
