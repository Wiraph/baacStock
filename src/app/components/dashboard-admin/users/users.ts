import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user';
import { Router } from '@angular/router';
import { AdduserComponent } from '../adduser/adduser';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './users.html',
  imports: [CommonModule, FormsModule, NgxPaginationModule, AdduserComponent, MatTooltipModule],
})
/**
 * จัดการผู้ใช้งาน: แสดงรายการ, ค้นหา, และเรียกคำสั่งจัดการผู้ใช้ (reset/delete)
 */
export class UsersComponent implements OnInit {
  users: any[] = [];
  page = 1;
  itemsPerPage = 10;
  searchTerm = '';
  private readonly platformId = inject(PLATFORM_ID);
  loading = false;
  activeView = 'users'; // ✅ สถานะการแสดงผลปัจจุบัน

  /** เปลี่ยนมุมมอง UI ระหว่างรายชื่อผู้ใช้/หน้าเพิ่มผู้ใช้ */
  setView(view: string) {
    this.activeView = view; // ✅ เปลี่ยนสถานะการแสดงผล
    this.cdr.detectChanges(); // ✅ แจ้งให้ Angular ทราบว่าต้องตรวจสอบการเปลี่ยนแปลง
  }

  constructor(private readonly userService: UserService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) { }

  /** โหลดผู้ใช้เมื่อรันบน browser */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true; // ✅ เริ่มโหลดข้อมูล
      this.loadUsers();
    }
  }

  /** ดึงรายชื่อผู้ใช้ทั้งหมดและอัปเดตสถานะโหลด */
  loadUsers() {
    this.userService.getAllUsers()
      .pipe(finalize(() => {
        this.loading = false; // ✅ โหลดข้อมูลเสร็จสิ้น
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.users = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.users = [];
          Swal.fire({ icon: 'error', title: 'ดึงรายชื่อผู้ใช้ไม่สำเร็จ', text: 'โปรดลองใหม่' });
        },
      });
  }

  /** ตัวกรองรายชื่อผู้ใช้จาก usrId ตามคำค้นหา */
  get filteredUsers() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(user => (user.usrId ?? '').toLowerCase().includes(term));
  }

  /** เรียกคำสั่งจัดการผู้ใช้ (reset password/reset user/delete) พร้อมยืนยัน */
  manageUser(user: any, act: string) {
    let msg = "";
    let msgs = "";
    switch (act) {
      case "RESET_PASSWORD":
        msg = " Reset รหัสผ่าน";
        break;
      case "RESET_USER":
        msg = " Reset ผู้ใช้งาน";
        break;
      case "DELETE_USER":
        msg = "ลบผู้ใช้งาน";
        msgs = "ออกจากระบบ";
        break;
      default:
        break;
    }
    const payload = {
      UserId: user.usrId,
      brc: user.usrBrc,
      Act: act
    };

    Swal.fire({
      icon: 'question',
      text: `ท่านต้องการ${msg} ${user.usrId} (${user.usrDesc}) ของ ${user.brDesc} (${user.usrBrc}) ${msgs} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.cdr.detectChanges();
        this.userService.manageUser(payload)
          .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }))
          .subscribe({
            next: () => {
              Swal.fire(`${msg} สำเร็จ`);
              this.loadUsers();
            },
            error: () => {
              Swal.fire(`${msg} ไม่สำเร็จ`);
            }
          })
      }
    })
  }

  /** เปิดหน้าสร้างผู้ใช้ใหม่ */
  adduser() {
    this.setView('adduser');
    this.cdr.detectChanges();
  }

  /** กลับมาหน้ารายชื่อผู้ใช้ */
  onBackFromAddUser() {
    this.setView('users');
    this.cdr.detectChanges();
  }
}
