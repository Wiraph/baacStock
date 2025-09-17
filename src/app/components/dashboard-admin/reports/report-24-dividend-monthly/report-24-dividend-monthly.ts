import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-report-24-dividend-monthly',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-24-dividend-monthly.html',
  styleUrl: './report-24-dividend-monthly.css'
})
export class Report24DividendMonthly implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // PDF preview
  pdfSrc: SafeResourceUrl | null = null;

  // Form fields
  dataType: string = 'dividend_details';
  customerCondition: string = 'customer_type';
  customerTypeDetail: string = 'all';
  customerName: string = '';
  customerIdCard: string = '';
  timeCondition: string = 'year';
  selectedYear: string = '2568';
  stockType: string = 'common';
  paymentMethod: string = 'all';
  taxBase: string = 'all';
  dividendStatus: string = 'all';
  branchCondition: string = 'national';
  branchCode: string = '';
  selectedBranch: string = '';

  // Date selection fields
  selectedFromDay: string = '';
  selectedFromMonth: string = '';
  selectedFromYear: string = '';
  selectedToDay: string = '';
  selectedToMonth: string = '';
  selectedToYear: string = '';
  selectedSpecificDay: string = '';
  selectedSpecificMonth: string = '';
  selectedSpecificYear: string = '';

  // Data type options
  dataTypeOptions = [
    { value: 'dividend_details', label: 'รายละเอียดการจ่ายปันผลหุ้น' },
    { value: 'dividend_paid', label: 'รายละเอียดการจ่ายปันผลหุ้นที่จ่ายแล้ว' }
  ];

  // Customer type options
  customerTypeOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: '0100', label: 'รัฐบาล (กระทรวงการคลัง)' },
    { value: '0400', label: 'ธนาคารและสถาบันการเงินอื่นในประเทศ' },
    { value: '0600', label: 'บุคคลธรรมดา' },
    { value: '0601', label: 'บุคคลธรรมดาซึ่งไม่ประสงค์รับดอกเบี้ย' },
    { value: '0602', label: 'พนักงาน ธ.ก.ส.' },
    { value: '0603', label: 'เกษตรกร' },
    { value: '0700', label: 'สถาบันไม่หากำไรแต่ไม่รับการยกเว้นการเสียภาษี(ฌกส. ฌกฝ.)' },
    { value: '0701', label: 'กลุ่มไม่เป็นทางการ' },
    { value: '0703', label: 'ยกเลิก สหกรณ์นอกภาคการเกษตร (สหกรณ์นิคม)' },
    { value: '0704', label: 'สหกรณ์ร้านค้า' },
    { value: '0705', label: 'สหกรณ์บริการ' },
    { value: '0706', label: 'สหกรณ์เครดิตยูเนียน' },
    { value: '0707', label: 'สหกรณ์การเกษตร สหกรณ์ประมง สหกรณ์นิคม' },
    { value: '0708', label: 'สกต.' },
    { value: '0709', label: 'กลุ่มเกษตรกร' },
    { value: '0710', label: 'สหกรณ์ออมทรัพย์, ชุมนุมสหกรณ์' },
    { value: '0714', label: 'สถาบันการเงินชุมชน' }
  ];

  // Customer condition options
  customerConditionOptions = [
    { value: 'customer_type', label: 'ประเภทลูกค้า' },
    { value: 'name', label: 'ชื่อ(ไม่ต้องใส่คำนำหน้า)' },
    { value: 'id_card', label: 'เลขประชาชน/ผู้เสียภาษี' }
  ];

  // Customer type detail options (for when customer_type is selected)
  customerTypeDetailOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: '0100', label: 'รัฐบาล (กระทรวงการคลัง)' },
    { value: '0400', label: 'ธนาคารและสถาบันการเงินอื่นในประเทศ' },
    { value: '0600', label: 'บุคคลธรรมดา' },
    { value: '0601', label: 'บุคคลธรรมดาซึ่งไม่ประสงค์รับดอกเบี้ย' },
    { value: '0602', label: 'พนักงาน ธ.ก.ส.' },
    { value: '0603', label: 'เกษตรกร' },
    { value: '0700', label: 'สถาบันไม่หากำไรแต่ไม่รับการยกเว้นการเสียภาษี(ฌกส. ฌกฝ.)' },
    { value: '0701', label: 'กลุ่มไม่เป็นทางการ' },
    { value: '0703', label: 'ยกเลิก สหกรณ์นอกภาคการเกษตร (สหกรณ์นิคม)' },
    { value: '0704', label: 'สหกรณ์ร้านค้า' },
    { value: '0705', label: 'สหกรณ์บริการ' },
    { value: '0706', label: 'สหกรณ์เครดิตยูเนียน' },
    { value: '0707', label: 'สหกรณ์การเกษตร สหกรณ์ประมง สหกรณ์นิคม' },
    { value: '0708', label: 'สกต.' },
    { value: '0709', label: 'กลุ่มเกษตรกร' },
    { value: '0710', label: 'สหกรณ์ออมทรัพย์, ชุมนุมสหกรณ์' },
    { value: '0714', label: 'สถาบันการเงินชุมชน' }
  ];

  // Time condition options
  timeConditionOptions = [
    { value: 'year', label: 'ปี' },
    { value: 'date_range', label: 'ช่วงวันที่' },
    { value: 'date', label: 'วันที่' }
  ];

  // Year options
  years: string[] = [];

  // Days and months for date selection
  days: number[] = [];
  months = [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' }
  ];

  // Stock type options
  stockTypeOptions = [
    { value: 'common', label: 'หุ้นสามัญ' },
    { value: 'preferred', label: 'หุ้นบุริมสิทธิ' }
  ];

  // Payment method options
  paymentMethodOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'deposit', label: 'ง/ฝ' },
    { value: 'cash', label: 'ง/ส' },
    { value: 'donation', label: 'บริจาค' },
    { value: 'buy_shares', label: 'ซื้อหุ้น กค.' },
    { value: 'check', label: 'เช็ค' },
    { value: 'ktb_online', label: 'KT B Corporate Online' }
  ];

  // Tax base options
  taxBaseOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: '0.00', label: '0.00' },
    { value: '10.00', label: '10.00' }
  ];

  // Dividend status options
  dividendStatusOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'paid_transfer', label: 'จ่ายแล้ว (โอน)' },
    { value: 'awaiting_transfer', label: 'รอผลโอน' },
    { value: 'account_closed', label: 'ปิดบัญชี' },
    { value: 'awaiting_adjustment', label: 'รอผลปรับปรุงบัญชี' },
    { value: 'account_frozen', label: 'อายัดบัญชี' },
    { value: 'no_account', label: 'ไม่มีเลขที่บัญชี' },
    { value: 'paid_cash', label: 'จ่ายแล้ว (ง/ส)' },
    { value: 'paid_donation', label: 'จ่ายแล้ว (บริจาค)' },
    { value: 'paid_buy_shares', label: 'จ่ายแล้ว (ซื้อหุ้น กค.)' },
    { value: 'awaiting_payment', label: 'เงินปันผลรอจ่าย' }
  ];

  // Branch condition options
  branchConditionOptions = [
    { value: 'national', label: 'รวมประเทศ' },
    { value: 'head_office', label: 'สำนักงานใหญ่' },
    { value: 'region_1', label: 'รวมฝ่ายภาคที่ 1' },
    { value: 'region_2', label: 'รวมฝ่ายภาคที่ 2' },
    { value: 'region_3', label: 'รวมฝ่ายภาคที่ 3' },
    { value: 'region_4', label: 'รวมฝ่ายภาคที่ 4' },
    { value: 'region_5', label: 'รวมฝ่ายภาคที่ 5' },
    { value: 'region_6', label: 'รวมฝ่ายภาคที่ 6' },
    { value: 'region_7', label: 'รวมฝ่ายภาคที่ 7' },
    { value: 'region_8', label: 'รวมฝ่ายภาคที่ 8' },
    { value: 'region_9', label: 'รวมฝ่ายภาคที่ 9' }
  ];

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.generateYears();
    this.generateDays();
  }

  sendHead() {
    this.headerChange.emit("รายงานการจ่ายเงินปันผลประจำเดือน");
  }

  generateYears(): void {
    const currentYear = 2568;
    const startYear = 2554;
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year.toString());
    }
  }

  generateDays(): void {
    for (let day = 1; day <= 31; day++) {
      this.days.push(day);
    }
  }

  onTimeConditionChange(): void {
    // Reset date fields when time condition changes
    this.selectedFromDay = '';
    this.selectedFromMonth = '';
    this.selectedFromYear = '';
    this.selectedToDay = '';
    this.selectedToMonth = '';
    this.selectedToYear = '';
    this.selectedSpecificDay = '';
    this.selectedSpecificMonth = '';
    this.selectedSpecificYear = '';
  }

  onCustomerConditionChange(): void {
    // Reset customer fields when condition changes
    this.customerTypeDetail = 'all';
    this.customerName = '';
    this.customerIdCard = '';
  }

  onSearch(): void {
    console.log('Search with:', {
      dataType: this.dataType,
      customerCondition: this.customerCondition,
      customerTypeDetail: this.customerTypeDetail,
      customerName: this.customerName,
      customerIdCard: this.customerIdCard,
      timeCondition: this.timeCondition,
      selectedYear: this.selectedYear,
      stockType: this.stockType,
      paymentMethod: this.paymentMethod,
      taxBase: this.taxBase,
      dividendStatus: this.dividendStatus,
      branchCondition: this.branchCondition,
      branchCode: this.branchCode,
      selectedBranch: this.selectedBranch
    });
  }

  goBack(): void {
    this.back.emit();
  }
}