import { ChangeDetectorRef, Component } from '@angular/core';
import { canViewReport } from '../../../services/permission-report';
import { UserService } from '../../../services/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Report1Transfer } from './report-1-transfer/report-1-transfer';
import { Report2Newstock } from './report-2-newstock/report-newstock';
import { Report3DailyTransferByType } from './report-3-daily-transfer-by-type/report-daily-transfer-by-type';
import { Report4DividendRate } from './report-4-dividend-rate/report-dividend-rate';
import { Report5ShareholderRatio } from './report-5-shareholder-ratio/report-shareholder-ratio';
import { Report6ShareholderRanking } from './report-6-shareholder-ranking/report-shareholder-ranking';
import { Report7BalanceByType } from './report-7-balance-by-type/report-balance-by-type';
import { Report8ShareholderRegister } from './report-8-shareholder-register/report-shareholder-register';
import { Report9ShareholderDetail } from './report-9-shareholder-detail/report-shareholder-detail';
import { Report10BalanceConfirmLetter } from './report-10-balance-confirm-letter/report-balance-confirm-letter';
import { Report11ConfirmLetterPreparation } from './report-11-confirm-letter-preparation/report-confirm-letter-preparation';
import { Report12TransferCommonByType } from './report-12-transfer-common-by-type/report-transfer-common-by-type';
import { Report13CertificateHistory } from './report-13-certificate-history/report-certificate-history';
import { Report14CertificateDeliveryLetter } from './report-14-certificate-delivery-letter/report-certificate-delivery-letter';
import { Report15CertificateDeliveryEnvelope } from './report-15-certificate-delivery-envelope/report-15-certificate-delivery-envelope';
import { Report16ShareholderSticker } from './report-16-shareholder-sticker/report-16-shareholder-sticker';
import { Report17DailySalesPreApprove } from './report-17-daily-sales-pre-approve/report-17-daily-sales-pre-approve';
import { Report18DailySalesPostApprove } from './report-18-daily-sales-post-approve/report-18-daily-sales-post-approve';
import { Report19SalesNewOnly } from './report-19-sales-new-only/report-19-sales-new-only';
import { Report20DividendUnpaidNotice } from './report-20-dividend-unpaid-notice/report-20-dividend-unpaid-notice';
import { Report21DividendAnnualSummary } from './report-21-dividend-annual-summary/report-21-dividend-annual-summary';
import { Report22DividendPayment } from './report-22-dividend-payment/report-22-dividend-payment';
import { Report23DividendDaily } from './report-23-dividend-daily/report-23-dividend-daily';
import { Report24DividendMonthly } from './report-24-dividend-monthly/report-24-dividend-monthly'; 
import { Report25DividendUnpaid } from './report-25-dividend-unpaid/report-25-dividend-unpaid';
import { Report26Pnd2 } from './report-26-pnd2/report-26-pnd2';
import { Report27Pnd2a } from './report-27-pnd2a/report-27-pnd2a';
import { Report28PaymentVoucher } from './report-28-payment-voucher/report-28-payment-voucher';
import { Report29DividendPaymentNotice } from './report-29-dividend-payment-notice/report-29-dividend-payment-notice';
import { Report30DividendNoticeTaxCert } from './report-30-dividend-notice-tax-cert/report-30-dividend-notice-tax-cert';
import { Report31WhtCertOld } from './report-31-wht-cert-old/report-31-wht-cert-old';
import { Report32WhtCertByName } from './report-32-wht-cert-by-name/report-32-wht-cert-by-name';
import { Report33WhtCert } from './report-33-wht-cert/report-33-wht-cert';
import { Report34Movement } from './report-34-movement/report-34-movement';
import { Report35MovementUpdated } from './report-35-movement-updated/report-35-movement-updated';
import { Report36AverageSharesByFiscalYear } from './report-36-average-shares-by-fiscal-year/report-36-average-shares-by-fiscal-year';

interface ReportItem {
  id: string;
  title: string;
  icon: string;
  category: 'normal' | 'special';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, 
    Report1Transfer, 
    Report2Newstock, 
    Report3DailyTransferByType, 
    Report4DividendRate, 
    Report5ShareholderRatio, 
    Report6ShareholderRanking,
    Report7BalanceByType,
    Report8ShareholderRegister,
    Report9ShareholderDetail,
    Report10BalanceConfirmLetter,
    Report11ConfirmLetterPreparation,
    Report12TransferCommonByType,
    Report13CertificateHistory,
    Report14CertificateDeliveryLetter,
    Report15CertificateDeliveryEnvelope,
    Report16ShareholderSticker,
    Report17DailySalesPreApprove,
    Report18DailySalesPostApprove,
    Report19SalesNewOnly,
    Report20DividendUnpaidNotice,
    Report21DividendAnnualSummary,
    Report22DividendPayment,
    Report23DividendDaily,
    Report24DividendMonthly,
    Report25DividendUnpaid,
    Report26Pnd2,
    Report27Pnd2a,
    Report28PaymentVoucher,
    Report29DividendPaymentNotice,
    Report30DividendNoticeTaxCert,
    Report31WhtCertOld,
    Report32WhtCertByName,
    Report33WhtCert,
    Report34Movement,
    Report35MovementUpdated,
    Report36AverageSharesByFiscalYear,
  ],
  templateUrl: './reports.component.html'
})
/**
 * รายการรายงานทั้งหมดและการนำทางไปยังรายงานย่อย
 * - แสดงรายการรายงานพร้อมตัวกรองและค้นหา
 * - จัดการมุมมองหลัก/ย่อย และหัวข้อรายงานที่กำลังเปิด
 */
export class ReportsComponent {
  main: boolean = true;
  report: boolean = false;
  actView: string = '';
  headerReport: string = '';
  
  // Search and filter properties
  searchTerm: string = '';
  selectedCategory: string = 'all';
  showFavorites: boolean = false;

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
    { id: 'report_balance_confirm_letter', title: 'หนังสือยืนยันยอดหุ้น', icon: '⚠️', category: 'normal' },
    { id: 'report_confirm_letter_preparation', title: 'รายงานการจัดทำหนังสือยืนยันยอดหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_transfer_common_by_type', title: 'รายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_certificate_history', title: 'ประวัติใบหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_certificate_delivery_letter', title: 'หนังสือส่งมอบใบหุ้น', icon: '⚠️', category: 'normal' },
    { id: 'report_certificate_delivery_envelope', title: 'หน้าซองนำส่งใบหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_shareholder_sticker', title: 'สติ๊กเกอร์รายชื่อผู้ถือหุ้น', icon: '🌸', category: 'normal' },
    { id: 'report_daily_sales_pre_approve', title: 'รายงานขายประจำวัน (ก่อนอนุมัติ)', icon: '❌', category: 'normal' },
    { id: 'report_daily_sales_post_approve', title: 'รายงานขายประจำวัน (หลังอนุมัติ)', icon: '❌', category: 'normal' },
    { id: 'report_sales_new_only', title: 'รายงานการขายหุ้นสามัญ (เฉพาะรายใหม่)', icon: '❌', category: 'normal' },
    { id: 'report_dividend_unpaid_notice', title: 'หนังสือแจ้งเงินปันผลค้างจ่าย', icon: '⚠️', category: 'normal' },
    { id: 'report_dividend_annual_summary', title: 'สรุปการจ่ายเงินปันผลหุ้นสามัญประจำปี', icon: '🌸', category: 'normal' },
    { id: 'report_dividend_payment', title: 'รายงานการจ่ายเงินปันผล', icon: '⚠️', category: 'normal' },
    { id: 'report_dividend_daily', title: 'รายงานการจ่ายเงินปันผลประจำวัน', icon: '❌', category: 'normal' },
    { id: 'report_dividend_monthly', title: 'รายงานการจ่ายเงินปันผลประจำเดือน', icon: '❌', category: 'normal' },
    { id: 'report_dividend_unpaid', title: 'รายงานเงินปันผลค้างจ่าย', icon: '⚠️', category: 'normal' },
    { id: 'report_pnd2', title: 'ใบแนบ ภ.ง.ด. 2', icon: '⚠️', category: 'normal' },
    { id: 'report_pnd2a', title: 'ใบแนบ ภ.ง.ด. 2ก', icon: '⚠️', category: 'normal' },
    { id: 'report_payment_voucher', title: 'ใบสำคัญจ่าย', icon: '⚠️', category: 'normal' },
    { id: 'report_dividend_payment_notice', title: 'รายงานแจ้งเตือนการจ่ายเงินปันผล', icon: '⚠️', category: 'normal' },
    { id: 'report_dividend_notice_tax_cert', title: 'หนังสือแจ้งการจ่ายปันผลหุ้นสามัญ / หนังสือรับรองการหักภาษี', icon: '⚠️', category: 'normal' },
    { id: 'report_wht_cert_old', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (ฟอร์มเดิม)', icon: '❌', category: 'normal' },
    { id: 'report_wht_cert_by_name', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (เรียงตามชื่อ)', icon: '⚠️', category: 'normal' },
    { id: 'report_wht_cert', title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย', icon: '⚠️', category: 'normal' },
    { id: 'report_movement', title: 'รายงานการเคลื่อนไหว', icon: '⚠️', category: 'normal' },
    { id: 'report_movement_updated', title: 'รายงานการเคลื่อนไหว (ปรับปรุง)', icon: '⚠️', category: 'normal' },
    { id: 'report_average_shares_by_fiscal_year', title: 'รายละเอียดจำนวนหุ้นสามัญและหุ้นบุริมสิทธิถัวเฉลี่ย ประจำปีบัญชี', icon: '⚠️', category: 'normal' }
  ];

  /*
  *🌸 ระบบเสร็จแล้ว
  *⚠️ ระบบยังไม่เสร็จ
  *❌ ระบบไม่มีตัวอย่างจากเว็บเดิม
  */

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly userService: UserService
  ) { }

  /** เมื่อผู้ใช้คลิกรายงาน: เปิดมุมมองรายงานและตั้งค่ารายงานที่เลือก */
  onReportClick(report: ReportItem): void {
    this.main = false;
    this.report = true;
    this.setActive(report.id);
    // เลื่อนหน้าขึ้นไปบนสุด
    this.scrollToTop();
  }

  /** ตั้งค่า action ของรายงานที่ต้องแสดง */
  setActive(act: string) {
    this.actView = act;
    this.cd.detectChanges();
  }

  /** รับข้อความหัวข้อจากรายงานย่อย */
  getHeader(name: any) {
    this.headerReport = name;
    this.cd.detectChanges();
  }

  /** เลื่อนหน้าไปด้านบนสุด */
  scrollToTop() {
    window.scrollTo({ top: 0 });
  }


  get normalReports(): ReportItem[] {
    return this.reports.filter(report => report.category === 'normal');
  }

  get filteredReports(): ReportItem[] {
    const userLevel = this.userService.getCurrentUser()?.level || '';
    let filtered = this.normalReports.filter(r => canViewReport(r.id, userLevel));

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(report => report.category === this.selectedCategory);
    }

    return filtered;
  }

  get categories() {
    return [
      { value: 'all', label: 'ทั้งหมด' },
      { value: 'normal', label: 'รายงานปกติ' },
      { value: 'special', label: 'รายงานพิเศษ' }
    ];
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  onSearchChange(): void {
    // Search is handled by the getter
  }

  getSelectedCategoryLabel(): string {
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : '';
  }

} 