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
  @Input() viewMode: string = '';

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();

  // onEditClick(r: any) {
  //   this.viewStock.emit(r);
  // }

  onViewStockClick(item: any) {
    const dataToViewStock = {
      stockNotes: item.stockNotes,
      cusiD: item.cusId || item.cusId,
      fullname: item.fullName,
      stockList: item.stockList,
      statusDesc: item.statusDesc,
      viewMode: 'transfer'
    }
    console.log("Emit viewStock: ", dataToViewStock);
    this.viewStock.emit(dataToViewStock);
  }
}
