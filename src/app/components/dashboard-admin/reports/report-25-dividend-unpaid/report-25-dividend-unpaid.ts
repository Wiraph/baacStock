import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-report-25-dividend-unpaid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-25-dividend-unpaid.html',
  styleUrl: './report-25-dividend-unpaid.css'
})
export class Report25DividendUnpaid implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  currentDate: string = '';
  pdfSrc: string | null = null;

  ngOnInit(): void {
    this.sendHead();
    this.setCurrentDate();
  }

  setCurrentDate(): void {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear() + 543; // แปลงเป็น พ.ศ.
    
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    this.currentDate = `${day} ${monthNames[month - 1]} ${year}`;
  }

  sendHead(): void {
    this.headerChange.emit("รายงานเงินปันผลค้างจ่าย");
  }

  goBack(): void {
    this.back.emit();
  }

  loadFile(typeExport: string): void {
    console.log('Generating', typeExport, 'report for date:', this.currentDate);
    alert(`กำลังสร้างรายงาน ${typeExport}...`);
  }

}
