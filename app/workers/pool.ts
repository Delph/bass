import { bound } from '~/utility';

export const maxWorkers = globalThis.navigator?.hardwareConcurrency ?? 2;

export function boundWorkers(workers: number) {
  return bound(workers, 1, maxWorkers);
}
