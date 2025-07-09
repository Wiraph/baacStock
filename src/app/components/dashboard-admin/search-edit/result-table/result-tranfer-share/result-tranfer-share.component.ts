import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'result-tranfer-share', // ✅ ใช้ชื่อนี้
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-tranfer-share.component.html',
  styleUrls: ['./result-tranfer-share.component.css']
})
export class ResultTranferShareComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 20;
  @Input() totalItems: number = 0;
  @Input() mode: string = '';

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();
  @Output() modeNotify = new EventEmitter<string>();

  onEditClick(item: any) {
    console.log("ค่าที่จะส่ง",item);
    this.edit.emit(item);
    this.modeNotify.emit(this.mode);
  }
}
