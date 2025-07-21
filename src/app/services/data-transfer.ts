import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTransfer {
  private stkNote: string = '';

  setStkNote(note: string) {
    this.stkNote =note;
  }
  
  getStkNote(): string{
    return this.stkNote;
  }
}
