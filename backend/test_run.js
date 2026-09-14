import TransactionRepository from './models/Transaction.js';
import prisma from './config/prismaClient.js';
import fs from 'fs';

async function run() {
  let log = "";
  try {
    log += "Starting test...\n";
    
    log += "Testing getSummary:\n";
    const summary = await TransactionRepository.getSummary();
    log += JSON.stringify(summary, null, 2) + "\n\n";
    
    log += "Testing findAll:\n";
    const all = await TransactionRepository.findAll({ limit: 5 });
    log += `Found ${all.length} transactions\n\n`;
    
  } catch (err) {
    log += `ERROR: ${err.message}\n${err.stack}\n`;
  } finally {
    await prisma.$disconnect();
    fs.writeFileSync('./test_output.log', log);
    console.log("Finished, output written to test_output.log");
    process.exit(0);
  }
}

run();
