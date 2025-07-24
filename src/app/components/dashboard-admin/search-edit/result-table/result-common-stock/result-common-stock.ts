import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'result-common-stock',
  imports: [CommonModule],
  templateUrl: './result-common-stock.html'
})
export class ResultCommonStockComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 20;
  @Input() totalItems: number = 0;
  @Input() mode: string = '';

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();
  @Output() modeNotify  = new EventEmitter<string>();


  onEditClick(item: any) {
    console.log("ค่าที่จะส่ง",item);
    this.edit.emit(item);
    this.modeNotify .emit(this.mode);
  }
}
