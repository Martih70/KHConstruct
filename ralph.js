#!/usr/bin/env node

const iterations = process.argv[2] || 10;
const delay = 1000; // 1 second between iterations

console.log(`Starting Ralph loop for ${iterations} iterations...\n`);

for (let i = 0; i < iterations; i++) {
  setTimeout(() => {
    console.log(`I'm in danger! (iteration ${i + 1})`);
    
    // When the last iteration completes, show the final message
    if (i === iterations - 1) {
      setTimeout(() => {
        console.log('\nDanger averted!');
      }, delay);
    }
  }, i * delay);
}
