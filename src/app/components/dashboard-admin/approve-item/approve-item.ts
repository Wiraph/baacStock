import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule],
  templateUrl: './approve-item.html',
  styleUrl: './approve-item.css'
})
export class ApproveItemComponent {
  searchText = '';
  filterType = '';
  requestList: any[] = [];

  onSearch() {
    // เรียก API หรือ filter local array
    console.log('ค้นหา: ', this.searchText, 'ประเภท: ', this.filterType);
  }

  approve(item: any) {
    // เรียก API เพื่ออนุมัติรายการ
    console.log('อนุมัติรายการ: ', item);
  }

  reject(item: any) {
    // เรียก API เพื่อไม่อนุมัติรายการ
    console.log('ไม่อนุมัติรายการ: ', item);
  }

}
