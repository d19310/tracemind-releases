/**
 * Confirmation Flow - Manages entity confirmation workflow
 * Low-maturity entities (L0/L1) need user confirmation.
 * High-maturity entities (L2+) are silently updated.
 */

import { CardType } from './context-card';

const TYPE_PRIORITY: Record<CardType, number> = {
  person: 0,
  object: 1,
  theme: 2,
};

export interface PendingEntity {
  name: string;
  type: CardType;
  isNew: boolean;
  maturity: string;
  clarificationQuestions?: string[];
  priorityScore?: number;
}

export interface ConfirmationInput {
  attributes: Record<string, unknown>;
  aliases?: string[];
  relations?: string[];
}

export interface ConfirmationResult {
  status: 'confirmed' | 'skipped' | 'stopped';
  entityName: string;
  input?: ConfirmationInput;
}

export type FlowStatus = 'active' | 'completed' | 'stopped';

interface ConfirmedRecord {
  entity: PendingEntity;
  input: ConfirmationInput;
}

interface SkippedRecord {
  entity: PendingEntity;
}

export class ConfirmationFlow {
  private pending: PendingEntity[];
  private _confirmed: ConfirmedRecord[] = [];
  private _skipped: SkippedRecord[] = [];
  private _status: FlowStatus = 'active';
  private currentIndex = 0;

  private constructor(entities: PendingEntity[]) {
    // Sort: new entities first, then by type priority
    this.pending = [...entities].sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return (TYPE_PRIORITY[a.type] ?? 0) - (TYPE_PRIORITY[b.type] ?? 0);
    });
  }

  /**
   * Create a new confirmation flow for pending entities
   */
  static create(entities: PendingEntity[]): ConfirmationFlow {
    return new ConfirmationFlow(entities);
  }

  /**
   * Get the current entity pending confirmation
   */
  get currentEntity(): PendingEntity | undefined {
    if (this._status !== 'active') return undefined;
    return this.pending[this.currentIndex];
  }

  /**
   * Status of the flow
   */
  get status(): FlowStatus {
    return this._status;
  }

  /**
   * Number of entities still pending confirmation
   */
  get pendingCount(): number {
    return this.pending.length - this.currentIndex;
  }

  /**
   * Number of confirmed entities
   */
  get confirmedCount(): number {
    return this._confirmed.length;
  }

  /**
   * List of confirmed entities
   */
  get confirmed(): PendingEntity[] {
    return this._confirmed.map(r => r.entity);
  }

  /**
   * Summary of the flow
   */
  get summary(): string {
    const parts: string[] = [];

    if (this._confirmed.length > 0) {
      const names = this._confirmed.map(r => r.entity.name).join('、');
      parts.push(`确认 ${this._confirmed.length} 个实体：${names}`);
    }

    if (this._skipped.length > 0) {
      parts.push(`跳过 ${this._skipped.length} 个实体`);
    }

    if (this._status === 'stopped') {
      parts.push('用户中断');
    }

    return parts.join('，');
  }

  /**
   * Confirm the current entity with user-provided attributes
   * Moves to the next entity
   */
  confirm(input: ConfirmationInput): ConfirmationResult {
    const entity = this.currentEntity;
    if (!entity || this._status !== 'active') {
      return { status: 'stopped', entityName: '' };
    }

    this._confirmed.push({ entity, input });
    this.currentIndex++;

    if (this.currentIndex >= this.pending.length) {
      this._status = 'completed';
    }

    return { status: 'confirmed', entityName: entity.name, input };
  }

  /**
   * Skip the current entity
   * Moves to the next entity
   */
  skip(): ConfirmationResult {
    const entity = this.currentEntity;
    if (!entity || this._status !== 'active') {
      return { status: 'stopped', entityName: '' };
    }

    this._skipped.push({ entity });
    this.currentIndex++;

    if (this.currentIndex >= this.pending.length) {
      this._status = 'completed';
    }

    return { status: 'skipped', entityName: entity.name };
  }

  /**
   * Stop the entire flow
   */
  stop(): void {
    this._status = 'stopped';
    this.currentIndex = this.pending.length;
  }

  /**
   * Check if there are more entities to process
   */
  get hasMore(): boolean {
    return this.currentIndex < this.pending.length && this._status === 'active';
  }
}
