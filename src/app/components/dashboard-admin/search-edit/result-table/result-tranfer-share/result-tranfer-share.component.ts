import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'result-tranfer-share', // ✅ ใช้ชื่อนี้
  imports: [CommonModule],
  templateUrl: './result-tranfer-share.component.html',
  styleUrls: ['./result-tranfer-share.component.css']
})
export class ResultTranferShareComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 20;
  @Input() totalItems: number = 0;

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();

  onEditClick(item: any) {
    this.edit.emit(item);
  }

  onViewStockClick(item: any) {
    this.viewStock.emit(item);
  }
}
