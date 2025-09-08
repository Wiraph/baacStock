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
export class DashboardSystemComponent implements OnInit {

  currentUser: any;
  filteredMenus: any[] = [];
  sidebarCollapsed = false;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadMenus();
  }

  loadCurrentUser(): void {
    this.currentUser = this.userService.getCurrentUser();
    console.log('Current User in Dashboard System:', this.currentUser);
  }

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

    console.log('Filtered Menus for System Dashboard:', this.filteredMenus);
  }

  openMenu(menuKey: string): void {
    const menu = this.filteredMenus.find(m => m.key === menuKey);
    if (menu) {
      menu.open = !menu.open;
    }
  }

  canView(key: string): boolean {
    if (!this.currentUser?.level) return true;
    return this.permissionService.hasActionPermission(key, this.currentUser.level);
  }

  getUserInitials(fullname: string): string {
    if (!fullname) return 'U';
    return fullname.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  goBackToMain(): void {
    // กลับไปยังเมนูหลัก (dashboard-admin)
    this.router.navigate(['/dashboard-admin']);
  }
}