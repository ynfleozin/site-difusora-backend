import { updateCoffeeQuotesData } from '../services/coffeeService';

export async function runCoffeeQuotesUpdateJob() {
  console.log('☕ Job: Disparando a atualização das cotações de café...');
  
  await updateCoffeeQuotesData();
}