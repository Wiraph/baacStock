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
    // รายงานการขายหุ้น/โอนเปลี่ยนมือ
    { id: 'report_1', title: 'รายงานการขายหุ้น/โอนเปลี่ยนมือ', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_2', title: 'รายงานการอนุมัติออกใบหุ้นใหม่', icon: '🌸', category: 'normal', color: 'green' },
    { id: 'report_3', title: 'รายงานสรุปผลการโอนหุ้นประจำวันแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'purple' },
    { id: 'report_4', title: 'รายงานข้อมูลอัตราเงินปันผล', icon: '🌸', category: 'normal', color: 'yellow' },
    { id: 'report_5', title: 'รายงานสัดส่วนผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_6', title: 'รายงานการจัดลำดับผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'green' },
    { id: 'report_7', title: 'รายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'purple' },
    { id: 'report_8', title: 'รายงานทะเบียนผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'indigo' },
    { id: 'report_9', title: 'รายงานรายละเอียดผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'pink' },
    { id: 'report_10', title: 'หนังสือยืนยันยอดหุ้น', icon: '🌸', category: 'normal', color: 'gray' },
    { id: 'report_11', title: 'รายงานการจัดทำหนังสือยืนยันยอดหุ้น', icon: '🌸', category: 'normal', color: 'orange' },
    { id: 'report_12', title: 'รายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_13', title: 'ประวัติใบหุ้น', icon: '🌸', category: 'normal', color: 'brown' },
    { id: 'report_14', title: 'หนังสือส่งมอบใบหุ้น', icon: '🌸', category: 'normal', color: 'teal' },
    { id: 'report_15', title: 'หน้าซองนำส่งใบหุ้น', icon: '🌸', category: 'normal', color: 'cyan' },
    { id: 'report_16', title: 'สติ๊กเกอร์รายชื่อผู้ถือหุ้น', icon: '🌸', category: 'normal', color: 'lime' },
    { id: 'report_17', title: 'รายงานขายประจำวัน (ก่อนอนุมัติ)', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_18', title: 'รายงานขายประจำวัน (หลังอนุมัติ)', icon: '🌸', category: 'normal', color: 'green' },
    { id: 'report_19', title: 'รายงานการขายหุ้นสามัญ (เฉพาะรายใหม่)', icon: '🌸', category: 'normal', color: 'purple' },
    { id: 'report_20', title: 'หนังสือแจ้งเงินปันผลค้างจ่าย', icon: '🌸', category: 'normal', color: 'orange' },
    { id: 'report_21', title: 'สรุปการจ่ายเงินปันผลหุ้นสามัญประจำปี', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_22', title: 'รายงานการจ่ายเงินปันผล', icon: '🌸', category: 'normal', color: 'yellow' },
    { id: 'report_23', title: 'รายงานการจ่ายเงินปันผลประจำวัน', icon: '🌸', category: 'normal', color: 'green' },
    { id: 'report_24', title: 'รายงานการจ่ายเงินปันผลประจำเดือน', icon: '🌸', category: 'normal', color: 'purple' },
    { id: 'report_25', title: 'รายงานเงินปันผลค้างจ่าย', icon: '🌸', category: 'normal', color: 'red' },
    { id: 'report_26', title: 'ใบแนบ ภ.ง.ด. 2', icon: '🌸', category: 'normal', color: 'gray' },
    { id: 'report_27', title: 'ใบแนบ ภ.ง.ด. 2ก', icon: '🌸', category: 'normal', color: 'gray' },
    { id: 'report_28', title: 'ใบสำคัญจ่าย', icon: '🌸', category: 'normal', color: 'brown' },
    { id: 'report_29', title: 'หนังสือแจ้งการจ่ายปันผลหุ้นสามัญ', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_30', title: 'หนังสือแจ้งการจ่ายปันผลหุ้นสามัญ/หนังสือรับรองการหักภาษี', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_31', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (ฟอร์มเดิม)', icon: '🌸', category: 'normal', color: 'brown' },
    { id: 'report_32', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (เรียงตามชื่อ)', icon: '🌸', category: 'normal', color: 'orange' },
    { id: 'report_33', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย', icon: '🌸', category: 'normal', color: 'blue' },
    { id: 'report_34', title: 'รายงานการเคลื่อนไหว', icon: '🌸', category: 'normal', color: 'purple' },
    { id: 'report_35', title: 'รายงานการเคลื่อนไหว (ปรับปรุง)', icon: '🌸', category: 'normal', color: 'teal' },
    { id: 'report_36', title: 'รายละเอียดจำนวนหุ้นสามัญและหุ้นบุริมสิทธิถัวเฉลี่ย ประจำปีบัญชี', icon: '🌸', category: 'normal', color: 'indigo' },
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