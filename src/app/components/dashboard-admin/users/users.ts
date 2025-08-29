import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 ต้องใช้สำหรับ [(ngModel)]
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user';
import { Router } from '@angular/router';
import { AdduserComponent } from '../adduser/adduser';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './users.html',
  imports: [CommonModule, FormsModule, NgxPaginationModule, AdduserComponent],
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

  resetPassword(usrId: string): void {
    const confirmed = confirm(`คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้ ${usrId} ใช่หรือไม่`);
    if (!confirmed) return;

    this.userService.resetPassword(usrId).subscribe({
      next: (res) => {
        alert('✅ รีเซ็ตรหัสผ่านสำเร็จ')
      },
      error: (err) => {
        console.error(err);
        alert('❌ เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน')
      }
    })
  }

  resetUserAndPassword(usrId: string): void {
    const confirmed = confirm(`คุณต้องการรีเซ็ตผู้ใช้และรหัสผ่านของ ${usrId} ใช่หรือไม่`);
    if (!confirmed) return;

    this.userService.resetUserAndPassword(usrId).subscribe({
      next: (res) => {
        alert('✅ รีเซ็ตผู้ใช้และรหัสผ่านสำเร็จ');
        this.loadUsers(); // โหลดข้อมูลใหม่
      },
      error: (err) => {
        console.error(err);
        alert('❌ เกิดข้อผิดพลาดในการรีเซ็ตผู้ใช้และรหัสผ่าน');
      }
    });
  }

  deleteUser(usrId: string): void {
    const confirmed = confirm(`คุณต้องการลบผู้ใช้ ${usrId} ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`);
    if (!confirmed) return;

    this.userService.deleteUser(usrId).subscribe({
      next: (res) => {
        alert('✅ ลบผู้ใช้สำเร็จ');
        this.loadUsers(); // โหลดข้อมูลใหม่
      },
      error: (err) => {
        console.error(err);
        alert('❌ เกิดข้อผิดพลาดในการลบผู้ใช้');
      }
    });
  }

  adduser() {
    this.setView('adduser');
    this.cdr.detectChanges();
  }

  logout() {
    sessionStorage.removeItem('token'); // ✅ ลบ JWT ออกจาก storage
    this.router.navigate(['']); // ✅ กลับไปหน้า login
  }
}
