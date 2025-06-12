import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 ต้องใช้สำหรับ [(ngModel)]
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user';
import { Router } from '@angular/router';
import { error } from 'console';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './users.html',
  imports: [CommonModule, FormsModule, NgxPaginationModule],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  page = 1;
  itemsPerPage = 10;
  searchTerm = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private userService: UserService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
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

  deleteUser() {

  }

  logout() {
    sessionStorage.removeItem('token'); // ✅ ลบ JWT ออกจาก storage
    this.router.navigate(['']); // ✅ กลับไปหน้า login
  }
}
