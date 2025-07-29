import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { StockService, StockItem } from '../../../services/stock';
import { StockBlockService } from '../../../services/stockblock';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-block-certificates',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './block-certificates.component.html',
})
export class BlockCertificatesComponent implements OnInit {

  @Input() InputblockCertificates!: string;

  // View Management
  internalViewName = 'blockCertificates';
  activeView = 'search';  // 'search' | 'certificate-list' | 'block-form' | 'result'

  // Data Properties
  stockData: any;
  cusId = '';
  fullName = '';
  statusDesc = '';
  stockNotes: string[] = [];
  viewMode = '';
  selectedStock: string[] = [];

  // Block Related
  selectedcustomer: any = null;
  selectedCertificate: any = null;
  certificateList: any[] = [];

  // UI State
  loading = false;

  constructor(
    private stockService: StockService,
    private stockBlockService: StockBlockService,
    private customerService: CustomerService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // โหลดข้อมูลเริ่มต้น (ถ้ามี)
  }

  // View Management
  setView(view: string) {
    this.activeView = view;
  }

  goBack() {
    this.activeView = 'search';
  }

  // Search Integration
  onViewStock(data: any) {
    this.setView('certificate-list');
  }

  onBlockCertificateSelected(stock: any) {
    // จัดการเมื่อเลือกใบหุ้นจาก search
    this.selectedcustomer = stock;
    
    // ดึงข้อมูลใบหุ้นของลูกค้า
    if (stock.cusId) {
      this.loading = true;
      this.stockService.getStocksByCusId(stock.cusId).subscribe({
        next: (stockData: any) => {
          this.selectedcustomer = {
            ...stock,
            stock: stockData.stockList || []
          };
          this.setView('certificate-list');
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: (error: any) => {
          console.error('Error fetching stock data:', error);
          this.loading = false;
          // ใช้ข้อมูลเดิมถ้าดึงไม่ได้
          this.setView('certificate-list');
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.setView('certificate-list');
      this.cdRef.detectChanges();
    }
  }

  // Block Actions
  onBlockCertificate(certificate: string) {
    Swal.fire({
      icon: 'warning',
      title: "ต้องการ",
      text: `บล็อคใบหุ้นเลขที่ ${certificate} ใช่หรือไม่`,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(`🔒 กำลังบล็อคใบหุ้นเลขที่: ${certificate}`);
        this.executeBlockCertificate(certificate);
      }
    })
  }

  onUnblockCertificate(certificate: any) {
    Swal.fire({
      icon: 'warning',
      title: "ต้องการ",
      text: `ยกเลิกบล็อคใบหุ้นเลขที่ ${certificate.stkNote} ใช่หรือไม่`,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeUnblockCertificate(certificate);
      }
    })
  }

  // Execute Block/Unblock Actions
  executeBlockCertificate(stkNote: string) {
    // เรียก API เพื่อเปลี่ยนสถานะใบหุ้น (Backend จะตรวจสอบสถานะปัจจุบันและเปลี่ยนให้อัตโนมัติ)
    this.stockBlockService.blockStock(stkNote).subscribe({
      next: () => {
        console.log(`✅ เปลี่ยนสถานะใบหุ้นเลขที่ ${stkNote} สำเร็จ`);
        
        // แสดง alert สำเร็จ (ใช้ข้อความจาก backend)
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: `เปลี่ยนสถานะใบหุ้นเลขที่ ${stkNote} เรียบร้อย`,
          confirmButtonText: 'ตกลง'
        });
        
        // รีเฟรชข้อมูล
        this.refreshStockData();
      },
      error: (error) => {
        console.error(`❌ เปลี่ยนสถานะใบหุ้นเลขที่ ${stkNote} ไม่สำเร็จ:`, error);
        
        // จัดการ error message
        let errorMessage = `ไม่สามารถเปลี่ยนสถานะใบหุ้นเลขที่ ${stkNote} ได้`;
        
        if (error.status === 404) {
          errorMessage = 'ไม่พบ API endpoint หรือหมายเลขหุ้นไม่ถูกต้อง';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || error.error || 'ข้อมูลไม่ถูกต้อง';
        } else if (error.status === 500) {
          errorMessage = error.error?.details || error.error?.message || 'เกิดข้อผิดพลาดในระบบ';
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        // แสดง alert ข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  private executeUnblockCertificate(certificate: any) {
    console.log(`🔓 กำลังเปลี่ยนสถานะใบหุ้นเลขที่: ${certificate.stkNote}`);
    // เรียก API เพื่อเปลี่ยนสถานะใบหุ้น (Backend จะตรวจสอบสถานะปัจจุบันและเปลี่ยนให้อัตโนมัติ)
    this.stockBlockService.blockStock(certificate.stkNote).subscribe({
      next: (response: any) => {
        console.log(`✅ เปลี่ยนสถานะใบหุ้นเลขที่ ${certificate.stkNote} สำเร็จ`);
        
        // แสดง alert สำเร็จ (ใช้ข้อความจาก backend)
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: response.message || `เปลี่ยนสถานะใบหุ้นเลขที่ ${certificate.stkNote} เรียบร้อย`,
          confirmButtonText: 'ตกลง'
        });
        
        // รีเฟรชข้อมูล
        this.refreshStockData();
      },
      error: (error: any) => {
        console.error(`❌ เปลี่ยนสถานะใบหุ้นเลขที่ ${certificate.stkNote} ไม่สำเร็จ:`, error);
        
        // จัดการ error message
        let errorMessage = `ไม่สามารถเปลี่ยนสถานะใบหุ้นเลขที่ ${certificate.stkNote} ได้`;
        
        if (error.status === 404) {
          errorMessage = 'ไม่พบ API endpoint หรือหมายเลขหุ้นไม่ถูกต้อง';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || error.error || 'ข้อมูลไม่ถูกต้อง';
        } else if (error.status === 500) {
          errorMessage = error.error?.details || error.error?.message || 'เกิดข้อผิดพลาดในระบบ';
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        // แสดง alert ข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  // Refresh stock data after action
  private refreshStockData() {
    if (this.selectedcustomer?.cusId) {
      this.loading = true;
      this.stockService.getStocksByCusId(this.selectedcustomer.cusId).subscribe({
        next: (stockData: any) => {
          this.selectedcustomer = {
            ...this.selectedcustomer,
            stock: stockData.stockList || []
          };
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: (error: any) => {
          console.error('Error refreshing stock data:', error);
          this.loading = false;
          this.cdRef.detectChanges();
        }
      });
    }
  }

  // Utility Methods
  formatThaiDateTime(dateTimeStr: string): string {
    if (!dateTimeStr || dateTimeStr.length !== 15 || !dateTimeStr.includes('-')) return '-';

    const datePart = dateTimeStr.substring(0, 8); // 20250704
    const timePart = dateTimeStr.substring(9);   // 152035

    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10);
    const day = parseInt(datePart.substring(6, 8), 10);

    const hour = timePart.substring(0, 2);
    const minute = timePart.substring(2, 4);
    const second = timePart.substring(4, 6);

    const thaiMonths = [
      '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const buddhistYear = year;

    return `${day} ${thaiMonths[month]} ${buddhistYear} เวลา ${hour}:${minute}:${second} น.`;
  }

  getStatusBadge(status: string): { text: string; class: string } {
    switch (status) {
      case 'S008':
        return { text: '🔒 บล็อค', class: 'bg-red-100 text-red-800' };
      case 'S000':
        return { text: '✅ ปกติ', class: 'bg-green-100 text-green-800' };
      case 'A003':
        return { text: '🔄 โอนแล้ว', class: 'bg-blue-100 text-blue-800' };
      default:
        return { text: '❓ ไม่ทราบ', class: 'bg-gray-100 text-gray-800' };
    }
  }

  // กรองใบหุ้นให้แสดงเฉพาะ S000 และ S008
  getFilteredStocks(): any[] {
    if (!this.selectedcustomer?.stock) {
      return [];
    }
    
    const filteredStocks = this.selectedcustomer.stock.filter((stock: any) => {
      return stock.stkStatus === 'S000' || stock.stkStatus === 'S008';
    });
    
    return filteredStocks;
  }
} 