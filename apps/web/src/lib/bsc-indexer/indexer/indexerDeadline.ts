export const VERCEL_MAX_DURATION_MS = 300_000
export const SAFE_EXECUTION_MARGIN_MS = 60_000
export const SAFE_EXECUTION_BUDGET_MS = VERCEL_MAX_DURATION_MS - SAFE_EXECUTION_MARGIN_MS
/** Vercel HTTP gateway returns 504 ~15s; bounded invocations must finish and persist before that. */
export const INDEXER_HTTP_GATEWAY_BUDGET_MS = 12_000
export const STOP_MARGIN_MS = 8_000

export interface StageTiming {
  stage: string
  elapsedMs: number
}

export class IndexerDeadline {
  readonly startMs: number
  readonly budgetMs: number
  private readonly stages: StageTiming[] = []
  private stageStart = Date.now()

  constructor(startMs = Date.now(), budgetMs = SAFE_EXECUTION_BUDGET_MS) {
    this.startMs = startMs
    this.budgetMs = budgetMs
  }

  get deadlineMs(): number {
    return this.startMs + this.budgetMs
  }

  elapsedMs(): number {
    return Date.now() - this.startMs
  }

  remainingMs(): number {
    return Math.max(0, this.deadlineMs - Date.now())
  }

  shouldStop(marginMs = STOP_MARGIN_MS): boolean {
    return this.remainingMs() <= marginMs
  }

  markStage(stage: string): void {
    const now = Date.now()
    this.stages.push({ stage, elapsedMs: now - this.stageStart })
    this.stageStart = now
  }

  flushStage(stage: string): StageTiming[] {
    this.markStage(stage)
    return [...this.stages]
  }

  snapshot() {
    return {
      elapsedMs: this.elapsedMs(),
      budgetMs: this.budgetMs,
      remainingMs: this.remainingMs(),
      stoppedBeforeDeadline: this.shouldStop(0),
      stages: [...this.stages],
    }
  }
}
