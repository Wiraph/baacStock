import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporttransfer } from './reporttransfer/reporttransfer';

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
  imports: [CommonModule, Reporttransfer],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  main: boolean = true;
  report: boolean = false;
  actView: string = '';
  headerReport: string = '';

  reports: ReportItem[] = [
    // รายงานตัวอย่าง
    { id: 'report_transfer', title: 'รายงานการขายหุ้น/โอนเปลี่ยนมือ', icon: '🌸', category: 'normal', color: 'pink' },
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

  constructor(
    private readonly cd: ChangeDetectorRef
  ) { }

  onReportClick(report: ReportItem): void {
    this.main = false;
    this.report = true;
    console.log("Report", report);
    this.setActive(report.id);
    console.log("Act", this.actView);
  }

  setActive(act: string) {
    this.actView = act;
    this.cd.detectChanges();
  }

  getHeader(name: any) {
    this.headerReport = name;
    console.log(name);
    this.cd.detectChanges();
  }


  get normalReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'normal');
  }

  get specialReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'special');
  }
} 