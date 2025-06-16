import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService, CustomerSearchDto } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css'] // ✅ เปลี่ยนจาก styleUrl เป็น styleUrls
})
export class SearchEditComponent {
  criteria: CustomerSearchDto = {
    cusId: '',
    fname: '',
    lname: '',
    stockId: ''
  };

  results: any[] = [];
  searched = false;
  loading = false;

  constructor(
    private customerService: CustomerService,
    private cd: ChangeDetectorRef
  ) { } // ✅ inject service


  onSearch() {
    if (
      !this.criteria.cusId &&
      !this.criteria.stockId &&
      !this.criteria.fname &&
      !this.criteria.lname
    ) {
      alert('กรุณากรอกอย่างน้อยหนึ่งช่องก่อนค้นหา');
      return;
    }

    this.loading = true;
    this.customerService.searchCustomer(this.criteria)
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: data => {
          // Debug
          console.log('📦 ข้อมูลที่ได้จาก API:', data); // ✅ ดูว่ามีผลลัพธ์ไหม

          this.loading = false;
          this.results = data;
          this.searched = true;
          console.log(this.loading);
        },
        error: err => {
          // Debug
          console.error('❌ เกิดข้อผิดพลาดจาก API:', err); // ✅ ดู error

          console.error('Search error:', err);
          this.searched = true;
          this.loading = false;
        }
      });
  }

  onReset() {
    this.criteria = {
      cusId: '',
      stockId: '',
      fname: '',
      lname: ''
    };
    this.results = [];
    this.searched = false;
  }


  editingItem: any = null;
  showModal = false;

  onEdit(item: any) {
    this.editingItem = { ...item }; // ✅ copy ข้อมูล
    this.showModal = true;
  }

  onCloseModal() {
    this.showModal = false;
    this.editingItem = null;
  }

  onSaveEdit() {
    console.log('📦 บันทึกข้อมูลใหม่:', this.editingItem);
    this.onCloseModal();

    // TODO: ส่งข้อมูลไปยัง API เพื่อบันทึกจริง
  }


}
