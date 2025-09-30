import { Injectable } from '@angular/core';

export interface ReportPermissionEntry {
  id: string;
  levels: string[];
}

// กำหนดสิทธิ์ต่อรายงาน โดยอิงกับ id ของรายงานใน ReportsComponent
export const REPORT_PERMISSIONS: Record<string, string[]> = {
  'report_transfer': ['00','05','09','80','85','89','99'],
  'report_newstock': ['80','85','89','99'],
  'report_daily_transfer_by_type': ['00','05','09','80','85','89','99'],
  'report_dividend_rate': ['00','05','09','80','85','89','99'],
  'report_shareholder_ratio': ['05','09','80','85','89','99'],
  'report_shareholder_ranking': ['80','85','89','99'],
  'report_balance_by_type': ['80','85','89','99'],
  'report_shareholder_register': ['00','05','09','80','85','89','99'],
  'report_shareholder_detail': ['00','05','09','80','85','89','99'],
  'report_balance_confirm_letter': ['05','09','80','85','89','99'],
  'report_confirm_letter_preparation': ['80','85','89','99'],
  'report_transfer_common_by_type': ['80','85','89','99'],
  'report_certificate_history': ['00','05','09','80','85','89','99'],
  'report_certificate_delivery_letter': ['80','85','89','99'],
  'report_certificate_delivery_envelope': ['80','85','89','99'],
  'report_shareholder_sticker': ['80','85','89','99'],
  'report_daily_sales_pre_approve': ['99'],
  'report_daily_sales_post_approve': ['99'],
  'report_sales_new_only': ['99'],
  'report_dividend_unpaid_notice': ['80','85','89','99'],
  'report_dividend_annual_summary': ['00','05','09','80','85','89','99'],
  'report_dividend_payment': ['00','05','09','80','85','89','99'],
  'report_dividend_daily': ['99'],
  'report_dividend_monthly': ['99'],
  'report_dividend_unpaid': ['80','85','89','99'],
  'report_pnd2': ['00','05','09','80','85','89','99'],
  'report_pnd2a': ['00','05','09','80','85','89','99'],
  'report_payment_voucher': ['00','05','09','99'],
  'report_dividend_payment_notice': ['80','85','89','99'],
  'report_dividend_notice_tax_cert': ['80','85','89','99'],
  'report_wht_cert_old': ['99'],
  'report_wht_cert_by_name': ['80','85','89','99'],
  'report_wht_cert': ['00','05','09','80','85','89','99'],
  'report_movement': ['80','85','89','99'],
  'report_movement_updated': ['80','85','89','99'],
  'report_average_shares_by_fiscal_year': ['80','85','89','99']
};

export function canViewReport(reportId: string, userLevel: string): boolean {
  const allowed = REPORT_PERMISSIONS[reportId];
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(userLevel);
}

@Injectable({ providedIn: 'root' })
export class PermissionReport {
  /** ตรวจสอบสิทธิ์ดูรายงานตาม reportId */
  canView(reportId: string, userLevel: string): boolean {
    return canViewReport(reportId, userLevel);
  }
  /** ดึงรายการ level ที่อนุญาตของรายงาน */
  getAllowed(reportId: string): string[] {
    return REPORT_PERMISSIONS[reportId] ?? [];
  }
  /** กรองรายการรายงานตามสิทธิ์ของผู้ใช้ */
  filterReportsByPermission<T extends { id: string }>(reports: T[], userLevel: string): T[] {
    if (!reports || reports.length === 0) return [];
    return reports.filter(r => this.canView(r.id, userLevel));
  }
  /** เพิ่ม/ปรับปรุงสิทธิ์รายงานแบบ runtime (เช่นจาก config ภายนอก) */
  mergePermissions(entries: ReportPermissionEntry[]): void {
    if (!Array.isArray(entries)) return;
    entries.forEach(e => {
      if (e?.id && Array.isArray(e.levels)) {
        REPORT_PERMISSIONS[e.id] = [...e.levels];
      }
    });
  }
}


