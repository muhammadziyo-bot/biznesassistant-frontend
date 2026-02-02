// Simple test to check if translations are loading
import('../src/locales/en.json').then(module => {
  console.log('English module loaded:', module);
  console.log('Subscription keys:', module.default.subscription);
  console.log('Tax ID translation:', module.default.subscription?.taxId);
}).catch(err => {
  console.error('Error loading translations:', err);
});
