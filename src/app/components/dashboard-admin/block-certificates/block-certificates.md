### BlockCertificatesComponent

- **Path**: `src/app/components/dashboard-admin/block-certificates/block-certificates.component.ts`
- **Template**: `src/app/components/dashboard-admin/block-certificates/block-certificates.component.html`
- **Services**: `src/app/services/customer.ts`, `src/app/services/stock.ts`

### การใช้งาน

จัดการ "บล็อค/ปลดบล็อค" ใบหุ้นของลูกค้า

- รับผลการค้นหาจาก `SearchEditComponent`
- โหลดข้อมูลลูกค้า + รายการใบหุ้นของลูกค้า
- แสดงสถานะใบหุ้น และเปิดยืนยันเพื่อบล็อค/ปลดบล็อค

### การใช้งาน

```html
<app-block-certificates></app-block-certificates>
```

### State หลัก

- `activeView: 'search' | 'block'`
- `cusId: string`, `customerData: any`
- `stkBlockList: any[]` — รายการใบหุ้นทั้งหมด (บล็อค/ปกติ)
- `loading: boolean`

### ฟลว์การทำงาน

1) จาก `SearchEditComponent` ส่งอีเวนต์มาที่ `onHandle(event)`
   - เซ็ต `activeView = event.view`, เก็บ `cusId`, เปิด `loading`
   - เรียก `onLoadBlockList(cusId)`
2) `onLoadBlockList(cusId)`
   - เรียก `CustomerService.searchCustomerStk({ GetDTL: 'bySTK@bySTK-BLK', CUSid: cusId, ... })` เพื่อดึงรายการใบหุ้น
   - เรียก `CustomerService.getCustomerDetail({ cusId })` เพื่อดึงข้อมูลลูกค้า
   - ปิด `loading` ใน `complete` และ `detectChanges()` เสมอ
3) บล็อค/ปลดบล็อค (`onBlock(stkNote, stCode)`) → เปิด SweetAlert ยืนยัน → ถ้าตกลงเรียก `onLoadBlock(stkNote)`
4) `onLoadBlock(stkNote)`
   - เรียก `StockService.blockStock({ stkNote })`
   - สำเร็จ: แจ้งผล และ `onLoadBlockList(cusId)` เพื่อรีเฟรช

### การเชื่อมต่อ API

- `CustomerService.searchCustomerStk(payload)` → POST `${environment.dotnetApiUrl}/api/Customer/search`
  ```ts
  {
    GetDTL: 'bySTK@bySTK-BLK',
    STKno: '',
    CUSid: cusId,
    CUSfn: '', CUSln: '',
    stkA: '1', PGNum: 1, PGSize: 9999999
  }
  ```
- `CustomerService.getCustomerDetail({ cusId })` → POST `${environment.dotnetApiUrl}/api/Customer/detailcus`
- `StockService.blockStock({ stkNote })` → ดูใน `src/app/services/stock.ts` (POST ไปยัง endpoint สำหรับบล็อค/ปลดบล็อคใบหุ้นของ backend)

### กติกาแสดงผล (Template)

- ถ้า `stkBlockList.length <= 0` → แสดงข้อความ "ไม่พบข้อมูลใบหุ้นที่ Active"
- ตารางแสดงคอลัมน์: สาขา, หมายเลขใบหุ้น, หมายเลขหุ้น, จำนวน/มูลค่า, สถานะ, วันเวลา, ปุ่มบล็อค/ปลดบล็อค
- ปุ่มจะแสดงตามรหัสสถานะ: `S000` (ปกติ) → ปุ่ม "บล็อค", `S008` (บล็อค) → ปุ่ม "ปลดบล็อค"

### ไฟล์ที่เกี่ยวข้อง

- คอมโพเนนต์: `block-certificates.component.ts / .html`
- ค้นหา: `SearchEditComponent`
- บริการ: `services/customer.ts` (customer/search/detail), `services/stock.ts` (block/unblock)
- คอนฟิก: `environments/environment.ts`
