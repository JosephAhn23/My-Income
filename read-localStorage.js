// Utility script to read and display localStorage positions
// Run this in the browser console to see current positions

console.log('=== Current Box Positions in localStorage ===\n');

for (let i = 1; i <= 5; i++) {
    const key = `box-${i}-position`;
    const value = localStorage.getItem(key);
    if (value) {
        console.log(`${key}:`, JSON.parse(value));
    } else {
        console.log(`${key}:`, 'Not set (using default position)');
    }
}

console.log('\n=== Export Format (JSON) ===');
const positions = {};
for (let i = 1; i <= 5; i++) {
    const key = `box-${i}-position`;
    const value = localStorage.getItem(key);
    if (value) {
        positions[`box-${i}`] = JSON.parse(value);
    }
}
console.log(JSON.stringify(positions, null, 2));

