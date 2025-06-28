const { execSync } = require('child_process');

try {
  console.log('🌱 Starting database seeding...');
  const output = execSync('npx ts-node src/scripts/seedData.ts', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(output);
} catch (error) {
  console.error('❌ Seeding failed:');
  console.error('STDOUT:', error.stdout);
  console.error('STDERR:', error.stderr);
  console.error('Error:', error.message);
}
