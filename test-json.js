// Test file to check JSON structure
const fs = require('fs');

try {
  const jsonContent = fs.readFileSync('src/locales/en.json', 'utf8');
  console.log('Raw JSON content length:', jsonContent.length);
  
  const parsed = JSON.parse(jsonContent);
  console.log('Parsed successfully');
  console.log('Top-level keys:', Object.keys(parsed));
  console.log('Subscription section exists:', 'subscription' in parsed);
  console.log('Subscription section:', parsed.subscription);
  console.log('Tax ID translation:', parsed.subscription?.taxId);
} catch (error) {
  console.error('JSON parsing error:', error);
}
