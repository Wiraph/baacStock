import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger, transition, style, animate
} from '@angular/animations';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  open: boolean;
  children: { icon: string; label: string; route: string }[];
}

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css'],
  imports: [CommonModule, RouterOutlet, RouterModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
})
export class AdminDashboardComponent implements OnInit {
  sidebarCollapsed = false;

  menus: MenuItem[] = [
    {
      key: 'home',
      label: 'แผงควบคุม',
      icon: '📑',
      open: false,
      children: [
        { icon: '🏠', label: 'Home', route: '/dashboard-admin/' },
        { icon: '📞', label: 'ติดต่อ', route: '/dashboard-admin/contact' },
        { icon: '🔎', label: 'ค้นหา/แก้ไข', route: '/dashboard-admin/search-edit' }
      ]
    },
    {
      key: 'sales',
      label: 'การขายและใบหุ้น',
      icon: '📊',
      open: false,
      children: [
        { icon: '🛒', label: 'พิมพ์คำขอซื้อหุ้น', route: '/dashboard-admin/print-share-purchase-request' },
        { icon: '😶‍🌫️', label: 'ขายหุ้นสามัญ', route: '/dashboard-admin/common-shares' },
        { icon: '📄', label: 'การออกใบหุ้นใหม่ แทนใบหุ้นที่ชำรุด/สูญหาย', route: '/dashboard-admin/cratenewsharecertificate' },
        { icon: '♾️', label: 'โอนเปลี่ยนมือ', route: '/dashboard-admin/transfer-share' },
        { icon: '✅', label: 'อนุมัติรายการ', route: '/dashboard-admin/approve-item' },
        { icon: '📝', label: 'อนุมัติออกใบหุ้น', route: '/dashboard-admin/approve-issue' },
        { icon: '🖨️', label: 'พิมพ์ใบหุ้น', route: '/dashboard-admin/print-certificates' },
        { icon: '🔒', label: 'บล็อค/ยกเลิกบล็อค ใบหุ้น', route: '/dashboard-admin/block-certificates' }
      ]
    },
    {
      key: 'financial',
      label: 'การเงิน',
      icon: '💰',
      open: false,
      children: [
        { icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividends' },
        { icon: '📄', label: 'ภ.ง.ด.', route: '/dashboard-admin/pnd' }
      ]
    },
    {
      key: 'spin-file',
      label: 'SCB SPIN FILE',
      icon: '⚡',
      open: false,
      children: [
        { icon: '⚡', label: 'สร้าง SPIN FILE ส่ง SCB', route: '/dashboard-admin/create-spin-files' },
        { icon: '🔌', label: 'รับผล SPIN FILE จาก SCB', route: '/dashboard-admin/sap-interface' }
      ]
    },
    {
      key: 'report',
      label: 'รายงาน',
      icon: '📊',
      open: false,
      children: [
        { icon: '📊', label: 'รายงาน', route: '/dashboard-admin/reports' }
      ]
    },
    {
      key: 'user',
      label: 'ผู้ใช้งาน',
      icon: '👪',
      open: false,
      children: [
        { icon: '👤', label: 'รายชื่อผู้ใช้งาน', route: '/dashboard-admin/users' },
        { icon: '🔑', label: 'เปลี่ยนรหัสผ่าน', route: '/dashboard-admin/change-password' }
      ]
    },
    {
      key: 'system',
      label: 'ระบบ',
      icon: '🛠️',
      open: false,
      children: [
        { icon: '🛠️', label: 'ควบคุมระบบ', route: '/dashboard-admin/system' },
        { icon: '📘', label: 'คู่มือ / เอกสาร', route: '/dashboard-admin/documents' },
        { icon: '💻', label: 'DEVELOPER', route: '/dashboard-admin/developer' }
      ]
    }
  ];

  constructor(private router: Router) { }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  openMenu(key: string) {
    this.menus = this.menus.map(menu => {
      const isTarget = menu.key === key;
      if (isTarget) {
        // console.log(`เปิดเมนู: ${menu.label}`);
      }
      return {
        ...menu,
        open: isTarget ? !menu.open : false
      };
    });
  }


  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('fullname');
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
      }
    }
  }
}
