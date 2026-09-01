import dotenv from 'dotenv';
dotenv.config();

const pk = process.env.FIREBASE_PRIVATE_KEY;
console.log('Raw length:', pk.length);
console.log('Has literal backslash-n:', pk.includes('\\n'));

// Check if there are literal \n characters (backslash followed by n) mixed with real newlines
let literalBackslashN = 0;
let realNewlines = 0;
for (let i = 0; i < pk.length; i++) {
  if (pk[i] === '\n') realNewlines++;
  if (pk[i] === '\\' && i + 1 < pk.length && pk[i + 1] === 'n') {
    literalBackslashN++;
    i++; // skip the 'n'
  }
}
console.log('Real newlines:', realNewlines);
console.log('Literal \\n sequences:', literalBackslashN);

// Show the line lengths
const lines = pk.split('\n');
console.log('Lines after split on newline:', lines.length);
for (let i = 0; i < lines.length; i++) {
  console.log(`  Line ${i}: length=${lines[i].length} start="${lines[i].substring(0, 20)}" end="${lines[i].substring(lines[i].length - 10)}"`);
}
