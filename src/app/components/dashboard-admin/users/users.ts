import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user';
import { Router } from '@angular/router';
import { AdduserComponent } from '../adduser/adduser';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './users.html',
  imports: [CommonModule, FormsModule, NgxPaginationModule, AdduserComponent, MatTooltipModule],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  page = 1;
  itemsPerPage = 10;
  searchTerm = '';
  private readonly platformId = inject(PLATFORM_ID);
  loading = false;
  activeView = 'users'; // ✅ สถานะการแสดงผลปัจจุบัน

  setView(view: string) {
    this.activeView = view; // ✅ เปลี่ยนสถานะการแสดงผล
    this.cdr.detectChanges(); // ✅ แจ้งให้ Angular ทราบว่าต้องตรวจสอบการเปลี่ยนแปลง
  }

  constructor(private readonly userService: UserService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true; // ✅ เริ่มโหลดข้อมูล
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false; // ✅ โหลดข้อมูลเสร็จสิ้น
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ ล้มเหลว:', err),
    });
  }

  get filteredUsers() {
    if (!this.searchTerm.trim()) return this.users;
    return this.users.filter(user =>
      user.usrId?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

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
    console.log(payload);
    Swal.fire({
      icon: 'question',
      text: `ท่านต้องการ${msg} ${user.usrId} (${user.usrDesc}) ของ ${user.brDesc} (${user.usrBrc}) ${msgs} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.manageUser(payload).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire(`${msg} สำเร็จ`);
            this.loadUsers();
            this.cdr.detectChanges();
          }, error: (err) => {
            this.loading = false;
            Swal.fire(`${msg} ไม่สำเร็จ`);
            console.log("Error", err);
            this.cdr.detectChanges();
          }
        })
      }
    })
  }

  adduser() {
    this.setView('adduser');
    this.cdr.detectChanges();
  }

  onBackFromAddUser() {
    this.setView('users');
    this.cdr.detectChanges();
  }
}
