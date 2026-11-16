/**
 * Implements: Milestone 11 §"In-app notifications may only be
 * implemented as live, derived indicators... not as a persisted
 * notification inbox." Formalizes the exact pattern the Moderation Badge
 * already used (Milestone 3: `apps/web/lib/moderation.ts`) as a reusable
 * concept — any future "count of X the Administrator should look at" can
 * implement this same interface without inventing a new pattern or a
 * database table.
 */

export interface LiveIndicatorProvider {
  /** A short, stable name for this indicator (e.g. "moderation_open_count") — used for logging/debugging, not persisted anywhere. */
  readonly name: string;

  /** Computes the current value fresh, on every call — never cached in this platform's own database. */
  getCount(): Promise<number>;
}

/**
 * A generic provider that wraps any "count matching rows" query the
 * caller supplies — this package has no direct database dependency of its
 * own (it doesn't know what `moderation_report` or `@ahr/cms-core` are),
 * so the actual query function is injected.
 */
export class DerivedCountIndicator implements LiveIndicatorProvider {
  constructor(
    readonly name: string,
    private readonly countFn: () => Promise<number>,
  ) {}

  async getCount(): Promise<number> {
    return this.countFn();
  }
}
