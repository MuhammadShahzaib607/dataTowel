import dotenv from 'dotenv';
dotenv.config();

const pk = process.env.FIREBASE_PRIVATE_KEY;

// Extract base64
const base64Content = pk
  .replace(/-----BEGIN [A-Z ]+-----/, '')
  .replace(/-----END [A-Z ]+-----/, '')
  .replace(/\s/g, '');

console.log('Total base64:', base64Content.length);
console.log('Remainder mod 4:', base64Content.length % 4);

// The correct length for a 2048-bit RSA PKCS#8 key is 1628 (1220 DER bytes * 4/3 = 1626.7, padded to 1628)
// We have 1629 - one extra character

// Try removing each character from the bad line (line 18, the one with 65 chars)
const lines = pk.split('\n');
const badLineIdx = 18;
const badLine = lines[badLineIdx];

// Reconstruct the full base64
const allB64Lines = lines.filter(l => l && !l.startsWith('-----'));
const totalLines = allB64Lines.join('');

// Find where line 18 starts in the total
let pos = 0;
for (let i = 0; i < badLineIdx; i++) {
  pos += allB64Lines[i].length;
}
const line18Start = pos;

console.log('\nBad line starts at position', line18Start, 'in total base64');
console.log('Bad line:', badLine);
console.log('Bad line length:', badLine.length);

// Try removing each character from the bad line
const { createPrivateKey } = await import('node:crypto');

for (let i = 0; i < badLine.length; i++) {
  const candidate = totalLines.slice(0, line18Start + i) + totalLines.slice(line18Start + i + 1);
  
  if (candidate.length % 4 !== 0) continue;
  
  const der = Buffer.from(candidate, 'base64');
  try {
    const key = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
    console.log(`\n✅ FOUND! Removing char at position ${i} in bad line ('${badLine[i]}')`);
    console.log('Key type:', key.type, key.asymmetricKeyType, key.asymmetricKeySize, 'bits');
    
    // Also try the full PEM
    const fixedBase64 = candidate;
    const fixedPem = `-----BEGIN PRIVATE KEY-----\n${fixedBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;
    try {
      const key2 = createPrivateKey(fixedPem);
      console.log('✅ PEM form also works');
      
      // Save fixed PEM for reference
      const fs = await import('fs');
      fs.writeFileSync('fixed-key.pem', fixedPem + '\n');
      console.log('Saved to fixed-key.pem');
      
      // Also create the fixed .env value
      const fixedEnvKey = fixedPem.replace(/\n/g, '\\n');
      console.log('\nFixed FIREBASE_PRIVATE_KEY value:');
      console.log(`FIREBASE_PRIVATE_KEY="${fixedEnvKey}"`);
    } catch(e2) {
      console.log('❌ PEM form failed:', e2.message);
    }
    break;
  } catch(e) {
    // Not this position
  }
}
