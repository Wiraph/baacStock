import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule],
  templateUrl: './approve-item.html',
  styleUrl: './approve-item.css'
})
export class ApproveItemComponent implements OnInit {
  searchText = '';
  filterType = '';
  requestList: any[] = [];

  constructor(
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) { }

  stockList: string[] = [];

  onSearch() {
    this.stockService.getStockApprove().subscribe({
      next: (data) => {
        this.requestList = data;
        console.log("โหลดข้อมูล request สำเร็จ:", this.requestList);
        this.cdr.detectChanges(); // ✅ บังคับอัปเดต View
      },
      error: () => {
        alert("ไม่สามารถโหลดข้อมูลรายการอนุมัติได้");
      }
    });
  }


  approve(item: any) {
    // เรียก API เพื่ออนุมัติรายการ
    console.log('อนุมัติรายการ: ', item);
  }

  reject(item: any) {
    // เรียก API เพื่อไม่อนุมัติรายการ
    console.log('ไม่อนุมัติรายการ: ', item);
  }

  detail(item: any) {

  }

  ngOnInit(): void {
    this.onSearch();
    this.cdr.detectChanges();
  }

}
