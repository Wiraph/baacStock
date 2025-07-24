import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTransfer {
  private stkNote: string = '';
  private status: string = '';

  setStkNote(note: string) {
    this.stkNote =note;
  }
  
  getStkNote(): string{
    return this.stkNote;
  }

  setStatus(status: string) {
    this.status = status;
  }

  getStatus(): string {
    return this.status;
  }
}
