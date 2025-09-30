import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-dashboard-system',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashbord-system.html',
  styleUrls: ['./dashbord-system.css']
})
/** แผงควบคุมระบบ (System Dashboard): แสดงเมนูระบบตามสิทธิ์ และนำทางไปยังหน้าต่างๆ */
export class DashboardSystemComponent implements OnInit {

  currentUser: any;
  filteredMenus: any[] = [];
  sidebarCollapsed = false;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService
  ) { }

  /** โหลดผู้ใช้ปัจจุบันและเมนูระบบเมื่อเริ่มต้น */
  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadMenus();
  }

  /** อ่านข้อมูลผู้ใช้จาก session */
  loadCurrentUser(): void {
    this.currentUser = this.userService.getCurrentUser();
  }

  /** กำหนดและกรองเมนูสำหรับ System Control Dashboard ตามสิทธิ์ผู้ใช้ */
  loadMenus(): void {
    // กำหนดเมนูสำหรับ System Control Dashboard
    const systemMenus = [
      {
        key: 'home',
        label: 'แผงควบคุม',
        icon: '📑',
        open: false,
        children: [
          { key: 'system-home', icon: '🏠', label: 'Home', route: '/dashboard-system/' },
          { key: 'system-contact', icon: '📞', label: 'ติดต่อ', route: '/dashboard-system/contact' }
        ]
      },
      {
        key: 'system-conditions',
        label: 'กำหนดเงื่อนไขระบบ',
        icon: '⚙️',
        open: false,
        children: [
          { key: 'set-conditions-system', icon: '⚙️', label: 'กำหนดเงื่อนไขระบบ', route: '/dashboard-system/set-conditions-system' }
        ]
      },
      {
        key: 'reference-files',
        label: 'แฟ้มอ้างอิง',
        icon: '📁',
        open: false,
        children: [
          { key: 'signature', icon: '✍️', label: 'ลายมือชื่อ', route: '/dashboard-system/signature' },
          { key: 'stock-type', icon: '📊', label: 'ประเภทหุ้น', route: '/dashboard-system/stock-type' },
          { key: 'shareholder-group', icon: '👥', label: 'กลุ่มผู้ถือหุ้น', route: '/dashboard-system/shareholder-group' },
          { key: 'shareholder-type', icon: '🏢', label: 'ประเภทผู้ถือหุ้น', route: '/dashboard-system/shareholder-type' },
          { key: 'dividend-type', icon: '💰', label: 'ประเภทการจ่ายเงินปันผล', route: '/dashboard-system/dividend-type' },
          { key: 'title', icon: '👑', label: 'คำนำหน้าชื่อ', route: '/dashboard-system/title' },
          { key: 'title-test', icon: '🧪', label: 'ทดสอบคำนำหน้าชื่อ', route: '/dashboard-system/title-test' },
          { key: 'province', icon: '🗺️', label: 'จังหวัด', route: '/dashboard-system/province' }
        ]
      }
    ];

    // กรองเมนูตามสิทธิ์ของผู้ใช้
    if (this.currentUser?.level) {
      this.filteredMenus = this.permissionService.filterSystemMenusByPermission(systemMenus, this.currentUser.level);
    } else {
      this.filteredMenus = systemMenus;
    }
  }

  /** เปิด/ปิดเมนูย่อยของหมวดที่ระบุ */
  openMenu(menuKey: string): void {
    const menu = this.filteredMenus.find(m => m.key === menuKey);
    if (menu) {
      menu.open = !menu.open;
    }
  }

  /** ตรวจสอบสิทธิ์การแสดงเมนูย่อย/หน้าเมนู */
  canView(key: string): boolean {
    if (!this.currentUser?.level) return true;
    return this.permissionService.hasActionPermission(key, this.currentUser.level);
  }

  /** คืนอักษรย่อจากชื่อเต็ม (2 ตัวอักษร) */
  getUserInitials(fullname: string): string {
    if (!fullname) return 'U';
    return fullname.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  /** กลับไปยังแดชบอร์ดหลักของผู้ดูแล */
  goBackToMain(): void {
    // กลับไปยังเมนูหลัก (dashboard-admin)
    this.router.navigate(['/dashboard-admin']);
  }
}