import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporttransfer } from './reporttransfer/reporttransfer';
import { ReportNewstock } from './report-newstock/report-newstock';
import { ReportDailyTransferByType } from './report-daily-transfer-by-type/report-daily-transfer-by-type';
import { ReportDividendRate } from './report-dividend-rate/report-dividend-rate';
import { ReportShareholderRatio } from './report-shareholder-ratio/report-shareholder-ratio';
import { ReportShareholderRanking } from './report-shareholder-ranking/report-shareholder-ranking';
import { ReportBalanceByType } from './report-balance-by-type/report-balance-by-type';
import { ReportShareholderRegister } from './report-shareholder-register/report-shareholder-register';
import { ReportShareholderDetail } from './report-shareholder-detail/report-shareholder-detail';
import { ReportBalanceConfirmLetter } from './report-balance-confirm-letter/report-balance-confirm-letter';
import { ReportConfirmLetterPreparation } from './report-confirm-letter-preparation/report-confirm-letter-preparation';

interface ReportItem {
  id: string;
  title: string;
  icon: string;
  category: 'normal' | 'special';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, 
    Reporttransfer, 
    ReportNewstock, 
    ReportDailyTransferByType, 
    ReportDividendRate, 
    ReportShareholderRatio, 
    ReportShareholderRanking,
    ReportBalanceByType,
    ReportShareholderRegister,
    ReportShareholderDetail,
    ReportBalanceConfirmLetter,
    ReportConfirmLetterPreparation
  ],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  main: boolean = true;
  report: boolean = false;
  actView: string = '';
  headerReport: string = '';

  reports: ReportItem[] = [
    { id: 'report_transfer', title: 'รายงานการขายหุ้น/โอนเปลี่ยนมือ', icon: '🌸', category: 'normal' },
    { id: 'report_newstock', title: 'รายงานการอนุมัติออกใบหุ้นใหม่', icon: '🌸', category: 'normal' },
    { id: 'report_daily_transfer_by_type', title: 'รายงานสรุปผลการโอนหุ้นประจำวันแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_dividend_rate', title: 'รายงานข้อมูลอัตราเงินปันผล', icon: '🌸', category: 'normal' },
    { id: 'report_shareholder_ratio', title: 'รายงานสัดส่วนผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_shareholder_ranking', title: 'รายงานการจัดลำดับผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_balance_by_type', title: 'รายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_shareholder_register', title: 'รายงานทะเบียนผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_shareholder_detail', title: 'รายงานรายละเอียดผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_balance_confirm_letter', title: 'หนังสือยืนยันยอดหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_confirm_letter_preparation', title: 'รายงานการจัดทำหนังสือยืนยันยอดหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_transfer_common_by_type', title: 'รายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น', icon: '❌', category: 'normal' },
    { id: 'report_certificate_history', title: 'ประวัติใบหุ้น', icon: '❌', category: 'normal' },
    { id: 'report_certificate_delivery_letter', title: 'หนังสือส่งมอบใบหุ้น', icon: '❌', category: 'normal' },
    { id: 'report_certificate_delivery_envelope', title: 'หน้าซองนำส่งใบหุ้น', icon: '❌', category: 'normal' },
    { id: 'report_shareholder_sticker', title: 'สติ๊กเกอร์รายชื่อผู้ถือหุ้น', icon: '❌', category: 'normal' },
    { id: 'report_daily_sales_pre_approve', title: 'รายงานขายประจำวัน (ก่อนอนุมัติ)', icon: '❌', category: 'normal' },
    { id: 'report_daily_sales_post_approve', title: 'รายงานขายประจำวัน (หลังอนุมัติ)', icon: '❌', category: 'normal' },
    { id: 'report_sales_new_only', title: 'รายงานการขายหุ้นสามัญ (เฉพาะรายใหม่)', icon: '❌', category: 'normal' },
    { id: 'report_dividend_unpaid_notice', title: 'หนังสือแจ้งเงินปันผลค้างจ่าย', icon: '❌', category: 'normal' },
    { id: 'report_dividend_annual_summary', title: 'สรุปการจ่ายเงินปันผลหุ้นสามัญประจำปี', icon: '❌', category: 'normal' },
    { id: 'report_dividend_payment', title: 'รายงานการจ่ายเงินปันผล', icon: '❌', category: 'normal' },
    { id: 'report_dividend_daily', title: 'รายงานการจ่ายเงินปันผลประจำวัน', icon: '❌', category: 'normal' },
    { id: 'report_dividend_monthly', title: 'รายงานการจ่ายเงินปันผลประจำเดือน', icon: '❌', category: 'normal' },
    { id: 'report_dividend_unpaid', title: 'รายงานเงินปันผลค้างจ่าย', icon: '❌', category: 'normal' },
    { id: 'report_pnd2_attachment', title: 'ใบแนบ ภ.ง.ด. 2', icon: '❌', category: 'normal' },
    { id: 'report_pnd2k_attachment', title: 'ใบแนบ ภ.ง.ด. 2ก', icon: '❌', category: 'normal' },
    { id: 'report_payment_voucher', title: 'ใบสำคัญจ่าย', icon: '❌', category: 'normal' },
    { id: 'report_dividend_payment_notice', title: 'หนังสือแจ้งการจ่ายปันผลหุ้นสามัญ', icon: '❌', category: 'normal' },
    { id: 'report_dividend_notice_tax_cert', title: 'หนังสือแจ้งการจ่ายปันผลหุ้นสามัญ / หนังสือรับรองการหักภาษี', icon: '❌', category: 'normal' },
    { id: 'report_wht_cert_old', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (ฟอร์มเดิม)', icon: '❌', category: 'normal' },
    { id: 'report_wht_cert_by_name', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (เรียงตามชื่อ)', icon: '❌', category: 'normal' },
    { id: 'report_wht_cert', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย', icon: '❌', category: 'normal' },
    { id: 'report_movement', title: 'รายงานการเคลื่อนไหว', icon: '❌', category: 'normal' },
    { id: 'report_movement_updated', title: 'รายงานการเคลื่อนไหว (ปรับปรุง)', icon: '❌', category: 'normal' },
    { id: 'report_average_shares_by_fiscal_year', title: 'รายละเอียดจำนวนหุ้นสามัญและหุ้นบุริมสิทธิถัวเฉลี่ย ประจำปีบัญชี', icon: '❌', category: 'normal' }
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

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }


  get normalReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'normal');
  }

  get specialReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'special');
  }
} 