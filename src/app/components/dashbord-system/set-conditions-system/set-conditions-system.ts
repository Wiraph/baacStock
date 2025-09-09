import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SystemMetadata } from '../../../services/Metadata/system-metadata';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import { ThaiCalendarComponent } from '../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../thaidateadapter/thaidateadapter';
import Swal from 'sweetalert2';
import { SyscfgService } from '../../../services/syscfg';

export const THAI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

interface SystemConfig {
  USRLen: number;
  USROpr: number;
  USRAth: number;
  USRAdm: number;
  PWDLen: number;
  PWDExp: number;
  stkCAP: number;           // ทุนจดทะเบียน (จำนวนเงิน)
  stkPAR: number;           // ราคาพาร์ (PAR)
  stkBV: number;            // มูลค่าหุ้นตามบัญชี
  stkAll: number;           // หุ้นทั้งหมด
  stkUniTyear: number;      // จำนวนหุ้นที่จำหน่ายได้ต่อปี
  stkUNiTminP: number;      // จำนวนหุ้นต่ำสุดที่จำหน่ายประเภทรายบุคคล
  stkUNiTminB: number;      // จำนวนหุ้นต่ำสุดที่จำหน่ายประเภทนิติบุคคล
  stkDatePauseSALESTA: string;  // วันเริ่มต้นปิดพักบัญชีหุ้น (ห้ามขาย)
  stkDatePauseSALESTP: string;  // วันสิ้นสุดปิดพักบัญชีหุ้น (ห้ามขาย)
  stkDatePauseTRANSTA: string;  // วันเริ่มต้นปิดพักบัญชีหุ้น (ห้ามโอน)
  stkDatePauseTRANSTP: string;  // วันสิ้นสุดปิดพักบัญชีหุ้น (ห้ามโอน)
  post_License: string;     // เลขที่ใบอนุญาตไปรษณีย์
  post_Office: string;      // ที่ทำการไปรษณีย์
}

@Component({
  selector: 'app-set-conditions-system',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ],
  templateUrl: './set-conditions-system.html',
  styleUrl: './set-conditions-system.css'
})
export class SetConditionsSystemComponent implements OnInit {

  systemConfig: SystemConfig = {
    USRLen: 0,
    USROpr: 0,
    USRAth: 0,
    USRAdm: 0,
    PWDLen: 0,
    PWDExp: 0,
    stkCAP: 0,
    stkPAR: 0,
    stkBV: 0,
    stkAll: 0,
    stkUniTyear: 0,
    stkUNiTminP: 0,
    stkUNiTminB: 0,
    stkDatePauseSALESTA: '',
    stkDatePauseSALESTP: '',
    stkDatePauseTRANSTA: '',
    stkDatePauseTRANSTP: '',
    post_License: '',
    post_Office: ''
  };

  isLoading = false;
  isEditing = false;
  currentUser: any;
  originalSystemConfig: SystemConfig = { ...this.systemConfig };

  // ตัวแปรควบคุมการแสดง calendar
  showCalendarSALESTA = false;
  showCalendarSALESTP = false;
  showCalendarTRANSTA = false;
  showCalendarTRANSTP = false;

  // วันที่ที่เลือก
  selectedDateSALESTA: Date = new Date();
  selectedDateSALESTP: Date = new Date();
  selectedDateTRANSTA: Date = new Date();
  selectedDateTRANSTP: Date = new Date();

  constructor(
    private readonly systemMetadata: SystemMetadata,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly cd: ChangeDetectorRef,
    private readonly syscfgService: SyscfgService
  ) { }

  ngOnInit(): void {
    this.checkUserPermission();
  }

  checkUserPermission(): void {
    this.currentUser = this.userService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const hasPermission = this.permissionService.hasActionPermission('set-conditions-system', this.currentUser.level);

    // ตรวจสอบสิทธิ์การเข้าถึงเมนู "กำหนดเงื่อนไขระบบ"
    if (!hasPermission) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
      }).then(() => {
        this.router.navigate(['/dashboard-system']);
      });
      return;
    }
    this.loadSystemConfig();
  }

  loadSystemConfig(): void {
    this.systemMetadata.sysCfg().subscribe({
      next: (data) => {
        // อัปเดตข้อมูลจาก API ทันที
        this.systemConfig = {
          USRLen: data.usrlen,
          USROpr: data.usropr,
          USRAth: data.usrath,
          USRAdm: data.usradm,
          PWDLen: data.pwdlen,
          PWDExp: data.pwdexp,
          stkCAP: data.stkCap || 0,
          stkPAR: data.stkPar || 0,
          stkBV: data.stkBv || 0,
          stkAll: data.stkAll || 0,
          stkUniTyear: data.stkUniTyear || 0,
          stkUNiTminP: data.stkUniTminP || 0,
          stkUNiTminB: data.stkUniTminB || 0,
          stkDatePauseSALESTA: data.stkDatePauseSalesta || '',
          stkDatePauseSALESTP: data.stkDatePauseSalestp || '',
          stkDatePauseTRANSTA: data.stkDatePauseTransta || '',
          stkDatePauseTRANSTP: data.stkDatePauseTranstp || '',
          post_License: data.postLicense || '',
          post_Office: data.postOffice || ''
        };

        // ตั้งค่าวันที่สำหรับ calendar
        this.selectedDateSALESTA = this.parseDateString(data.stkDatePauseSalesta || '');
        this.selectedDateSALESTP = this.parseDateString(data.stkDatePauseSalestp || '');
        this.selectedDateTRANSTA = this.parseDateString(data.stkDatePauseTransta || '');
        this.selectedDateTRANSTP = this.parseDateString(data.stkDatePauseTranstp || '');

        this.originalSystemConfig = { ...this.systemConfig };
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading system config:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลการตั้งค่าระบบได้'
        });
      }
    });
  }

  editConfig(): void {
    this.isEditing = true;
    this.originalSystemConfig = { ...this.systemConfig }; // Save current state for potential rollback
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.cancelEdit();
    } else {
      this.editConfig();
    }
  }

  saveConfig(): void {
    this.isLoading = true;
    if (Number(this.systemConfig.stkDatePauseSALESTA) >= Number(this.systemConfig.stkDatePauseSALESTP)) {
      Swal.fire({
        icon: 'warning',
        text: 'ไม่สามารถตั้งวันที่เริ่มต้นมากกว่าวันที่สิ้นสุดได้'
      })
      this.isLoading = false;
      this.cd.detectChanges();
      return
    }
    if (Number(this.systemConfig.stkDatePauseTRANSTA) >= Number(this.systemConfig.stkDatePauseTRANSTP)) {
      Swal.fire({
        icon: 'warning',
        text: 'ไม่สามารถตั้งวันที่เริ่มต้นมากกว่าวันที่สิ้นสุดได้'
      })
      this.isLoading = false;
      this.cd.detectChanges();
      return
    }
    const payload = {
      USRLen: this.systemConfig.USRLen,
      USROpr: this.systemConfig.USROpr,
      USRAth: this.systemConfig.USRAth,
      USRAdm: this.systemConfig.USRAdm,

      PWDLen: this.systemConfig.PWDLen,
      PWDExp: this.systemConfig.PWDExp,

      stkCAP: this.systemConfig.stkCAP,
      stkPAR: this.systemConfig.stkPAR,
      stkBV: this.systemConfig.stkBV,
      stkALL: this.systemConfig.stkAll,
      stkUNiTyear: this.systemConfig.stkUniTyear,
      stkUNiTminP: this.systemConfig.stkUNiTminP,
      stkUNiTminB: this.systemConfig.stkUNiTminB,

      stkDatePauseSALESTA: this.systemConfig.stkDatePauseSALESTA,
      stkDatePauseSALESTP: this.systemConfig.stkDatePauseSALESTP,
      stkDatePauseTRANSTA: this.systemConfig.stkDatePauseTRANSTA,
      stkDatePauseTRANSTP: this.systemConfig.stkDatePauseTRANSTP,

      post_License: this.systemConfig.post_License,
      post_Office: this.systemConfig.post_Office
    };

    console.log("Payload", payload);

    // Note: Save API call will be implemented when backend is ready
    this.syscfgService.updateSyscfg(payload).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          text: `${response.message}`,
          timer: 2000,
          timerProgressBar: true
        });
        this.isEditing = false;
        this.isLoading = false;
        this.loadSystemConfig();
      },
      error: (error) => {
        console.error('Error saving system config:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกการตั้งค่าระบบได้'
        });
        this.isLoading = false;
      }
    });

    // Mock save for now
    setTimeout(() => {
      this.isEditing = false;
      this.isLoading = false;
      this.originalSystemConfig = { ...this.systemConfig };
    }, 1000);
  }

  cancelEdit(): void {
    this.systemConfig = { ...this.originalSystemConfig };
    this.isEditing = false;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('th-TH');
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) {
      return '';
    }

    // Convert from YYYYMMDD format to Thai date
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const monthIndex = parseInt(month) - 1;
    if (monthIndex < 0 || monthIndex > 11) {
      return '';
    }

    return `${day} ${thaiMonths[monthIndex]} ${year}`;
  }


  // ฟังก์ชันแปลงวันที่จาก string เป็น Date object
  parseDateString(dateString: string): Date {
    if (!dateString || dateString.length !== 8) {
      return new Date();
    }

    const year = parseInt(dateString.substring(0, 4)) - 543; // แปลงจาก พ.ศ. เป็น ค.ศ.
    const month = parseInt(dateString.substring(4, 6)) - 1; // month index เริ่มจาก 0
    const day = parseInt(dateString.substring(6, 8));

    return new Date(year, month, day);
  }

  // ฟังก์ชันแปลง Date เป็น YYYYMMDD format
  formatDateToString(date: Date): string {
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // ฟังก์ชันเรียกเมื่อเลือกวันที่ใหม่
  onDateSALESTASelected(date: Date) {
    this.selectedDateSALESTA = date;
    this.systemConfig.stkDatePauseSALESTA = this.formatDateToString(date);
    this.showCalendarSALESTA = false;
  }

  onDateSALESTPSelected(date: Date) {
    this.selectedDateSALESTP = date;
    this.systemConfig.stkDatePauseSALESTP = this.formatDateToString(date);
    this.showCalendarSALESTP = false;
  }

  onDateTRANSTASelected(date: Date) {
    this.selectedDateTRANSTA = date;
    this.systemConfig.stkDatePauseTRANSTA = this.formatDateToString(date);
    this.showCalendarTRANSTA = false;
  }

  onDateTRANSTPSelected(date: Date) {
    this.selectedDateTRANSTP = date;
    this.systemConfig.stkDatePauseTRANSTP = this.formatDateToString(date);
    this.showCalendarTRANSTP = false;
  }

  calculateTotalShares(): number {
    return this.systemConfig.stkAll || 0;
  }

  calculateSharesPerYear(): number {
    return this.systemConfig.stkUniTyear || 0;
  }

}