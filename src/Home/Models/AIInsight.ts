import { makeAutoObservable } from 'mobx';

export class AIInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  actionLabel?: string;

  constructor(data: { id: string; title: string; message: string; type: 'warning' | 'success' | 'info'; actionLabel?: string }) {
    this.id = data.id; this.title = data.title; this.message = data.message;
    this.type = data.type; this.actionLabel = data.actionLabel;
    makeAutoObservable(this);
  }
}
