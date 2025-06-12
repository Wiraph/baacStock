import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger, transition, style, animate
} from '@angular/animations';


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
  constructor(private router: Router) { }


  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // dropdownMenu
  isHomeOpen = false; // เปิด/ปิด Dropdown
  generalMenu = [
    { icon: '🏠', label: 'Home', route: '/dashboard-admin/' },
    { icon: '📞', label: 'ติดต่อ', route: '/dashboard-admin/contact' }
  ];

  isSalesOpen = false; // เปิด/ปิด Dropdown
  saleMenu = [
    { icon: '🛒', label: 'การขาย', route: '/dashboard-admin/sales' },
    { icon: '📄', label: 'การออกใบหุ้นใหม่ โอนเปลี่ยนมือ', route: '/dashboard-admin/issue-transfer' },
    { icon: '✅', label: 'อนุมัติรายการ', route: '/dashboard-admin/approve-transactions' },
    { icon: '📝', label: 'อนุมัติออกใบหุ้น', route: '/dashboard-admin/approve-issue' },
    { icon: '🖨️', label: 'พิมพ์ใบหุ้น', route: '/dashboard-admin/print-certificates' },
    { icon: '🔒', label: 'บล็อค/ยกเลิกบล็อค ใบหุ้น', route: '/dashboard-admin/block-certificates' }
  ]

  isFinancialOpen = false; // เปิด/ปิด Dropdown
  financialMenu = [
    { icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividends' },
    { icon: '📄', label: 'ภ.ง.ด.', route: '/dashboard-admin/pnd' }
  ];

  isFileOpen = false; // เปิด/ปิด Dropdown
  fileMenu = [
    { icon: '⚡', label: 'CBS SPIN FILE', route: '/dashboard-admin/spin-files' },
    { icon: '🔌', label: 'SAP Interface', route: '/dashboard-admin/sap-interface' }
  ];

  isReportOpen = false; // เปิด/ปิด Dropdown
  reportMenu = [
    { icon: '📊', label: 'รายงาน', route: '/dashboard-admin/reports' }
  ];

  isSystemOpen = false; // เปิด/ปิด Dropdown
  systemMenu = [
    { icon: '🛠️', label: 'ควบคุมระบบ', route: '/dashboard-admin/system' },
    { 
      icon: '👤', label: 'ผู้ใช้งานระบบ', 
      children: 
        [ 
          { label: 'รายชื่อผู้ใช้งาน', route: '/dashboard-admin/users' },
          { label: 'เปลี่ยนรหัสผ่าน', route: '/dashboard-admin/change-password' }
        ] 
    },
    { icon: '📘', label: 'คู่มือ / เอกสาร', route: '/dashboard-admin/documents' },
    { icon: '💻', label: 'DEVELOPER', route: '/dashboard-admin/developer' }
  ];

  openMenu(section: string) {
    this.isHomeOpen = section === 'home' ? !this.isHomeOpen : false;
    this.isSalesOpen = section === 'sales' ? !this.isSalesOpen : false;
    this.isFinancialOpen = section === 'financial' ? !this.isFinancialOpen : false;
    this.isFileOpen = section === 'file' ? !this.isFileOpen : false;
    this.isReportOpen = section === 'report' ? !this.isReportOpen : false;
    this.isSystemOpen = section === 'system' ? !this.isSystemOpen : false;
  }


  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
      }
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}