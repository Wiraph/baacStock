import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'result-default',
  templateUrl: './result-default.component.html',
//   styleUrls: ['./result-default.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ResultDefaultComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
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
