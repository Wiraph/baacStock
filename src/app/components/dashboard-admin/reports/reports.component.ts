import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportItem {
  id: string;
  title: string;
  icon: string;
  category: 'normal' | 'special';
  color: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {

  reports: ReportItem[] = [
    // รายงานตัวอย่าง
    { id: 'report_1', title: 'รายงานการขายหุ้นใใหม่เป็นเงิน', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_2', title: 'รายงานการขายหุ้นออกใหม่ใหม่', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_3', title: 'รายงานรูปแบบการโอนหุ้นประจำวันแยกตามประเภทหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_4', title: 'รายงานข้อมูลอัตราเงินปันผล', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_5', title: 'รายงานสิทธิหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_6', title: 'รายงานการจัดสำคัญหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_7', title: 'รายงานรูปแบบตอบแล้วเพื่อแยกตามประเภทหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_8', title: 'รายงานทะเบียนหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_9', title: 'รายงานราคาเฉลี่ยหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_10', title: 'หนังสือชี้นันชี้ยอยหุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_11', title: 'รายงานการจัดทำหนังสือชี้นันชี้ยอยหุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_12', title: 'รายงานรูปแบบรายงาน/โอนหุ้นสามัญแยกตามประเภทหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_13', title: 'ประวัติใหม่หุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_14', title: 'หนังสือส่งยอนใหม่หุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_15', title: 'หน้าข้อมูลกำลังใหม่หุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_16', title: 'สถิติเกอร์รายข้อมูลหุ้นอื่น', icon: '🌸', category: 'normal', color: 'pink' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onReportClick(report: ReportItem): void {
  }

  get normalReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'normal');
  }

  get specialReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'special');
  }
} 