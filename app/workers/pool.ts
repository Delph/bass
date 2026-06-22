export type WorkerPoolJob<TPayload> = {
  id: number;
  payload: TPayload;
};

export type WorkerPoolResult<TResult> =
  | {
      id: number;
      result: TResult;
    }
  | {
      id: number;
      error: string;
    };

type QueuedJob<TPayload, TResult> = {
  payload: TPayload;
  reject: (reason?: unknown) => void;
  resolve: (value: TResult) => void;
};

type PooledWorker<TPayload, TResult> = {
  active?: QueuedJob<TPayload, TResult> & { id: number };
  worker: Worker;
};

export function getWorkerPoolSize() {
  return Math.max(1, Math.min(4, (navigator.hardwareConcurrency ?? 2) - 1));
}

export function createWorkerPool<TPayload, TResult>(
  createWorker: () => Worker,
  size = getWorkerPoolSize(),
) {
  const queue: QueuedJob<TPayload, TResult>[] = [];
  const workers: PooledWorker<TPayload, TResult>[] = [];
  let nextId = 1;

  function drain() {
    for (const pooled of workers) {
      if (pooled.active)
        continue;

      const job = queue.shift();
      if (!job)
        return;

      pooled.active = {
        ...job,
        id: nextId++,
      };
      pooled.worker.postMessage({
        id: pooled.active.id,
        payload: pooled.active.payload,
      } satisfies WorkerPoolJob<TPayload>);
    }
  }

  function addWorker() {
    const pooled: PooledWorker<TPayload, TResult> = {
      worker: createWorker(),
    };

    pooled.worker.addEventListener('message', (event: MessageEvent<WorkerPoolResult<TResult>>) => {
      const active = pooled.active;

      if (!active || active.id !== event.data.id)
        return;

      pooled.active = undefined;

      if ('error' in event.data)
        active.reject(new Error(event.data.error));
      else
        active.resolve(event.data.result);

      drain();
    });

    pooled.worker.addEventListener('error', (event) => {
      pooled.active?.reject(event.error ?? new Error(event.message));
      pooled.active = undefined;
      drain();
    });

    workers.push(pooled);
  }

  for (let i = 0; i < size; ++i)
    addWorker();

  return {
    run(payload: TPayload) {
      return new Promise<TResult>((resolve, reject) => {
        queue.push({ payload, reject, resolve });
        drain();
      });
    },
    destroy() {
      for (const job of queue.splice(0))
        job.reject(new Error('Worker pool destroyed.'));

      for (const pooled of workers) {
        pooled.active?.reject(new Error('Worker pool destroyed.'));
        pooled.worker.terminate();
      }

      workers.length = 0;
    },
  };
}
