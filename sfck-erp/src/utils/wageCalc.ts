import { PF_RATE, ESI_RATE } from '../data/constants';

export const calculateWage = (grossWage: number, advance: number = 0) => {
  const pfDeduction = grossWage * PF_RATE;
  const esiDeduction = grossWage * ESI_RATE;
  const advanceDeduction = Math.min(advance, grossWage * 0.2);
  const netWage = grossWage - pfDeduction - esiDeduction - advanceDeduction;

  return { pfDeduction, esiDeduction, advanceDeduction, netWage };
};
