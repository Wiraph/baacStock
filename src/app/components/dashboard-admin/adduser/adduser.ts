import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../../services/user';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MetadataService } from '../../../services/metadata';

@Component({
  selector: 'app-adduser',
  imports: [FormsModule, CommonModule],
  templateUrl: './adduser.html',
  styleUrl: './adduser.css'
})

/**
 * หน้าสำหรับเพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ (Admin Only)
 *
 * ความสามารถหลัก
 * - โหลดรายการระดับสิทธิ์และสาขาจาก `MetadataService`
 * - รับข้อมูลผู้ใช้จากฟอร์ม และส่งคำขอเพิ่มผู้ใช้ผ่าน `UserService.addUser`
 * - ยืนยันก่อนบันทึกและแจ้งผลสำเร็จ/ล้มเหลว
 * - เมื่อสร้างสำเร็จ จะ emit อีเวนต์ `back` เพื่อให้หน้าก่อนหน้าจัดการนำทางต่อ
 */
export class AdduserComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  constructor(
    private readonly userService: UserService,
    private readonly jwtDecoder: JwtDecoder,
    private readonly cd: ChangeDetectorRef,
    private readonly metadataService: MetadataService
  ) { }

  levelList: any[] = [];
  branchList: any[] = [];
  decodedToken: any;
  token = '';
  selectedBranchCode: string = '';
  selectedLevelCode: string = '';
  userId: string = '';
  fullName: string = '';

  ngOnInit(): void {
    this.metadataService.getLevel().subscribe({
      next: (data) => {
        this.levelList = data;
        this.cd.detectChanges();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'โหลดข้อมูลระดับผู้ใช้ไม่สำเร็จ',
          text: (error?.error ?? error?.message ?? 'กรุณาลองใหม่อีกครั้ง'),
          confirmButtonText: 'ตกลง'
        });
      }
    });

    this.metadataService.getBranch().subscribe({
      next: (data) => {
        this.branchList = data;
        this.cd.detectChanges();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'โหลดข้อมูลสาขาไม่สำเร็จ',
          text: (error?.error ?? error?.message ?? 'กรุณาลองใหม่อีกครั้ง'),
          confirmButtonText: 'ตกลง'
        });
      }
    });

    this.cd.detectChanges();
  }

  onSubmit(form: any) {
    if (form.valid) {
      Swal.fire({
        title: 'ยืนยันการเพิ่มผู้ใช้ใหม่',
        text: `สาขา: ${this.selectedBranchCode}, รหัสผู้ใช้: ${this.userId}, ชื่อเต็ม: ${this.fullName}, ระดับ: ${this.selectedLevelCode}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.addUser();
        }
      })
    }
  }

  /**
   * เรียกบริการเพิ่มผู้ใช้ด้วยข้อมูลจากฟอร์ม
   * - เมื่อสำเร็จจะส่ง `back` เพื่อให้ผู้ใช้ย้อนกลับหน้าเดิม
   */
  addUser() {
    const payload = {
      usrBrc: this.selectedBranchCode,
      usrID: this.userId,
      usrDESC: this.fullName,
      usrLVL: this.selectedLevelCode
    };
    this.userService.addUser(payload).subscribe({
      next: (msg: string) => {
        Swal.fire({
          icon: 'success',
          text: `${msg}`,
          confirmButtonText: 'OK',
          confirmButtonColor: "#50C878"
        }).then((result) => {
          if(result.isConfirmed) {
            this.onBackClick();
          }
        });
        this.cd.detectChanges();
      }, error: (err: any) => {
        if (err.status === 409) {
          Swal.fire({
            icon: 'warning',
            text: `${err.error}`,
            confirmButtonText: 'OK',
            confirmButtonColor: "#50C878"
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เพิ่มผู้ใช้ไม่สำเร็จ',
            text: (err?.error ?? err?.message ?? 'กรุณาลองใหม่อีกครั้ง'),
            confirmButtonText: 'ตกลง'
          });
        }
      }
    })
  }

  /** เคลียร์ค่าฟอร์มทั้งหมดเป็นค่าเริ่มต้น */
  clearForm() {
    this.selectedBranchCode = '';
    this.selectedLevelCode = '';
    this.userId = '';
    this.fullName = '';
  }

  /** emit อีเวนต์ย้อนกลับไปหน้าก่อนหน้า */
  onBackClick() {
    this.back.emit();
  }
}
