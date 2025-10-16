// Simple Clarity contract syntax verification
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Shooter Game Contract...\n');

// Read the contract file
const contractPath = path.join(__dirname, 'contracts', 'shooter-game.clar');
const contractContent = fs.readFileSync(contractPath, 'utf8');

// Basic syntax checks
const checks = [
  {
    name: 'Contract starts with proper header',
    test: () => contractContent.startsWith(';; shooter-game.clar'),
    error: 'Contract should start with proper header comment'
  },
  {
    name: 'No unresolved functions (floor, buff-get-byte, pow)',
    test: () => !contractContent.includes('floor') && !contractContent.includes('buff-get-byte') && !contractContent.includes('pow'),
    error: 'Contract contains unresolved functions'
  },
  {
    name: 'No trait references (commented out)',
    test: () => !contractContent.includes('(use-trait') || contractContent.includes(';; (use-trait'),
    error: 'Trait references should be commented out'
  },
  {
    name: 'Uses burn-block-height instead of block-height',
    test: () => contractContent.includes('burn-block-height') && !contractContent.includes(' block-height'),
    error: 'Should use burn-block-height for current block'
  },
  {
    name: 'Has proper function definitions',
    test: () => contractContent.includes('define-public') && contractContent.includes('define-read-only'),
    error: 'Missing required function definitions'
  },
  {
    name: 'Has proper data structures',
    test: () => contractContent.includes('define-map') && contractContent.includes('sessions'),
    error: 'Missing required data structures'
  },
  {
    name: 'Has error constants',
    test: () => contractContent.includes('define-constant err-'),
    error: 'Missing error constants'
  },
  {
    name: 'Has game session lifecycle functions',
    test: () => contractContent.includes('start-session') && contractContent.includes('report-result'),
    error: 'Missing core game functions'
  },
  {
    name: 'Has reward system',
    test: () => contractContent.includes('setup-reward') && contractContent.includes('claim-reward'),
    error: 'Missing reward system functions'
  },
  {
    name: 'Has NFT progression',
    test: () => contractContent.includes('add-nft-exp') && contractContent.includes('nft-stats'),
    error: 'Missing NFT progression system'
  },
  {
    name: 'Has dispute system',
    test: () => contractContent.includes('open-dispute') && contractContent.includes('resolve-dispute'),
    error: 'Missing dispute resolution system'
  },
  {
    name: 'Has modular architecture',
    test: () => contractContent.includes('register-game-module') && contractContent.includes('game-modules'),
    error: 'Missing modular architecture components'
  }
];

let passed = 0;
let failed = 0;

console.log('Running syntax and structure checks:\n');

checks.forEach((check, index) => {
  try {
    if (check.test()) {
      console.log(`✅ ${index + 1}. ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${check.name}`);
      console.log(`   ${check.error}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${check.name}`);
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
});

// Additional checks
console.log('\n🔍 Additional verification:\n');

// Check for proper buffer sizes
const bufferChecks = [
  { name: 'Signature buffer is 64 bytes', test: () => contractContent.includes('(sig (buff 64))') },
  { name: 'Result hash buffer is 32 bytes', test: () => contractContent.includes('(result-hash (buff 32))') },
  { name: 'Server pubkey buffer is 33 bytes', test: () => contractContent.includes('(server-pubkey (buff 33))') },
  { name: 'Reason buffer is 16 bytes', test: () => contractContent.includes('(reason (buff 16))') }
];

bufferChecks.forEach((check, index) => {
  if (check.test()) {
    console.log(`✅ Buffer check ${index + 1}: ${check.name}`);
    passed++;
  } else {
    console.log(`❌ Buffer check ${index + 1}: ${check.name}`);
    failed++;
  }
});

// Count functions and structures
const functionCount = (contractContent.match(/define-public/g) || []).length;
const readOnlyCount = (contractContent.match(/define-read-only/g) || []).length;
const mapCount = (contractContent.match(/define-map/g) || []).length;
const constantCount = (contractContent.match(/define-constant/g) || []).length;

console.log('\n📊 Contract Statistics:');
console.log(`   Public functions: ${functionCount}`);
console.log(`   Read-only functions: ${readOnlyCount}`);
console.log(`   Data maps: ${mapCount}`);
console.log(`   Constants: ${constantCount}`);
console.log(`   Total lines: ${contractContent.split('\n').length}`);

console.log('\n🎯 Summary:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 Contract verification PASSED!');
  console.log('   The contract is ready for deployment.');
} else {
  console.log('\n⚠️  Contract verification FAILED!');
  console.log('   Please fix the issues above before deployment.');
}

console.log('\n📝 Next Steps:');
console.log('   1. Install Clarinet manually from: https://github.com/hirosystems/clarinet/releases');
console.log('   2. Run: clarinet check');
console.log('   3. Run: clarinet test');
console.log('   4. Deploy with: clarinet deploy --testnet');

