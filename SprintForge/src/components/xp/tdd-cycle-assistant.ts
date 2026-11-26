import type { TddExecutionStatus, TddTestCase } from '../../types';

export interface TddCycleGuidance {
  title: string;
  objective: string;
  nextAction: string;
  executionFeedback: string;
}

type TddCycleStatus = TddTestCase['status'];

const cycleGuidance: Record<
  TddCycleStatus,
  Pick<TddCycleGuidance, 'title' | 'objective' | 'nextAction'>
> = {
  RED: {
    title: 'Etapa RED',
    objective: 'Descrever o comportamento esperado por meio de um teste que inicialmente falhe.',
    nextAction: 'Escreva o teste, execute-o e verifique se a falha corresponde ao comportamento ainda não implementado.',
  },
  GREEN: {
    title: 'Etapa GREEN',
    objective: 'Implementar a solução mínima necessária para satisfazer o teste.',
    nextAction: 'Implemente o comportamento esperado e execute o teste novamente.',
  },
  REFACTORED: {
    title: 'Etapa REFACTOR',
    objective: 'Melhorar a estrutura do código sem alterar seu comportamento.',
    nextAction: 'Refatore em pequenas etapas e execute os testes após cada alteração.',
  },
};

const executionFeedback: Record<TddExecutionStatus, string> = {
  NOT_RUN: 'Este teste ainda não possui uma execução registrada. Execute-o para obter evidências do comportamento atual.',
  RUNNING: 'A execução está em andamento. Aguarde o resultado antes de avaliar o próximo passo.',
  PASS: 'A última execução registrada foi aprovada. Confirme se o resultado corresponde à versão atual do código.',
  FAIL: 'A última execução registrou uma falha. Verifique se ela corresponde ao comportamento esperado nesta etapa.',
  ERROR: 'A execução encontrou um erro. Investigue a causa antes de interpretar o resultado como uma falha de teste.',
  TIMEOUT: 'A execução excedeu o tempo limite. Investigue possíveis travamentos ou operações demoradas.',
};

export function getTddCycleGuidance(
  status: TddCycleStatus,
  executionStatus: TddExecutionStatus
): TddCycleGuidance {
  return {
    ...cycleGuidance[status],
    executionFeedback: executionFeedback[executionStatus],
  };
}
