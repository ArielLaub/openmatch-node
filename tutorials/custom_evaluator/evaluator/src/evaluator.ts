import { startEvaluatorService } from 'openmatch-node/services/evaluator';
import evaluate from './evaluate';

const evaluatorPort = 50508;

async function main(): Promise<void> {
    startEvaluatorService(evaluatorPort, evaluate);
}

main().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
