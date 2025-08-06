import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTransfer {
  private stkNote: string = '';
  private status: string = '';
  private pageStatus: string = '1';
  // pageStatus = 1 -> เมนูค้นหา/แก้ไข
  // pageStauts = 2 -> ขายหุ้นสามัญ
  // pageStauts = 3 -> ออกใบหุ้นใหม่แทนใบหุ้นชำรุด/สูญหาย
  // pageStauts = 4 -> โอนเปลี่ยนมือ
  // pageStauts = 5 -> เงินปันผล
  // pageStatus = 6 -> บล็อคใบหุ้น

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

  setPageStatus(status: string) {
    this.pageStatus = status;
  }

  getPageStatus(): string {
    return this.pageStatus;
  }
}
