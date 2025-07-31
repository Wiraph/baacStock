import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'result-dividend',
  templateUrl: './result-dividend.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ResultDividendComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();

  onEditClick(item: any) {
    const dataToEdit = {
      cusId: item.cusId
    };
    console.log('Data to edit (dividend):', dataToEdit);
    this.edit.emit(dataToEdit);
  }

  onViewStockClick(item: any) {
    const dataToViewStock = {
      stockNotes: item.stockNotes,
      cusiD: item.cusId || item.cusId,
      fullname: item.fullName,
      stockList: item.stockList,
      statusDesc: item.statusDesc,
      viewMode: 'dividend'
    }
    console.log("Emit viewStock (dividend): ", dataToViewStock);
    this.viewStock.emit(dataToViewStock);
  }
}