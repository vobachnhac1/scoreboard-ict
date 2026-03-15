/**
 * Test file for IpMasker utility
 * Chạy test: node app/common/IpMasker.test.js
 */

import IpMasker from './IpMasker.js';

console.log('=== IP MASKER TEST ===\n');

const testIPs = [
  '192.168.1.100',
  '192.168.0.50',
  '10.0.0.1',
  '172.16.5.123'
];

console.log('📝 TEST 1: maskAsHash() - One-way hash (không decode được)\n');
testIPs.forEach(ip => {
  const hash = IpMasker.maskAsHash(ip);
  console.log(`  ${ip} => ${hash}`);
});

console.log('\n📝 TEST 2: encodeIP() - Encode + Decode (hai chiều)\n');
testIPs.forEach(ip => {
  const encoded = IpMasker.encodeIP(ip);
  const decoded = IpMasker.decodeIP(encoded);
  const match = decoded === ip ? '✅' : '❌';
  console.log(`  ${ip}`);
  console.log(`    Encoded: ${encoded}`);
  console.log(`    Decoded: ${decoded} ${match}`);
  console.log('');
});

console.log('\n📝 TEST 3: encodeIPShort() - Hash ngắn gọn\n');
testIPs.forEach(ip => {
  const short = IpMasker.encodeIPShort(ip);
  console.log(`  ${ip} => ${short}`);
});

console.log('\n📝 TEST 4: Decode invalid hash\n');
const invalidHashes = [
  'INVALID_HASH',
  'U2FsdGVkX1-WRONG',
  '',
  null
];
invalidHashes.forEach(hash => {
  const decoded = IpMasker.decodeIP(hash);
  console.log(`  "${hash}" => ${decoded}`);
});

console.log('\n📝 TEST 5: Other masking methods\n');
const sampleIP = '192.168.1.100';
console.log(`Sample IP: ${sampleIP}`);
console.log(`  maskPartial:     ${IpMasker.maskPartial(sampleIP)}`);
console.log(`  maskAsDeviceId:  ${IpMasker.maskAsDeviceId(sampleIP, 5)}`);
console.log(`  maskLastOctet:   ${IpMasker.maskLastOctet(sampleIP)}`);
console.log(`  maskAsCode:      ${IpMasker.maskAsCode(sampleIP, 'Referee 1')}`);

console.log('\n📝 TEST 6: mask() - Wrapper with multiple methods\n');
['hash', 'partial', 'deviceId', 'lastOctet', 'code'].forEach(method => {
  const result = IpMasker.mask(sampleIP, method, 5, 'Referee 1');
  console.log(`  Method: ${method.padEnd(10)} => ${result.display.padEnd(15)} (${result.tooltip})`);
});

console.log('\n✅ All tests completed!\n');

