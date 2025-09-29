### ApproveIssueComponent

- **Path**: `src/app/components/dashboard-admin/approve-issue/approve-issue.ts`
- **Template**: `src/app/components/dashboard-admin/approve-issue/approve-issue.html`
- **Styles**: `src/app/components/dashboard-admin/approve-issue/approve-issue.css`
- **Service**: `src/app/services/approve.ts`

### การทำงาน

หน้าจอสำหรับ "รออนุมัติออกใบหุ้น" (Issue Approve)

- แสดงรายการออกใบหุ้นที่รออนุมัติแบบแบ่งหน้า
- เปิด `PopupDetail` เพื่อดูรายละเอียด/ยืนยันผลการดำเนินการ

### การใช้งาน

```html
<app-approve-issue></app-approve-issue>
```

### State หลัก

- `activeView = 'table'`
- `issueList: any[]` — รายการที่แสดงบนตาราง
- `loading: boolean` — แสดง overlay ระหว่างโหลด
- Paging: `pageNumber = 1`, `pageSize = 20`
- `brName` — ชื่อสาขาจาก cookie `BrName`

### ฟลว์การทำงาน

1) `ngOnInit()`
   - อ่าน `BrName` จาก cookie
   - `loading = true` แล้วเรียก `onsearch(1, 20)`
2) `onsearch(pg, size)`
   - สร้าง payload `{ ACT: 'iSSUE', PGNum: pg, PGSize: size }`
   - เรียก `ApproveService.getStockApprove()`
   - ตั้งค่า `issueList` เป็นผลลัพธ์ (หรือ `[]` ถ้า response ไม่ใช่ array)
   - ปิด `loading` ใน `complete` และ `detectChanges()` เสมอ
3) `nextPage()` / `prevPage()`
   - ปรับ `pageNumber` แล้ว `onsearch()` ใหม่
4) `showPopup(stkNote, stkStatus)`
   - `openPopup(stkNote, stkStatus, 'iSSUE')` เพื่อเปิด `PopupDetail`
5) `openPopup(...)`
   - เมื่อ `afterClosed()` ส่งค่า `PASS` → รีเฟรชตารางด้วย `onsearch(1, 20)`

### กติกาแสดงผล (Template)

- ถ้า `issueList` ว่าง → แสดง `ng-template #nodata`
- มี paginator ปุ่ม "หน้าก่อน/หน้าถัดไป"
- ปุ่มแอคชัน 📝 เปิด Popup รายการนั้น

### การเชื่อมต่อ API

ไฟล์บริการ: `src/app/services/approve.ts` (base: `${environment.dotnetApiUrl}/api/approve`)

- POST `/stktransai` — ดึงรายการรออนุมัติออกใบหุ้น

  ```ts
  // ใช้ใน onsearch()
  { ACT: 'iSSUE', PGNum: number, PGSize: number }
  ```

  - response: array ของรายการ (เช่น `roWi, cusiD, titleABBR, cusFName, cusLName, stKbrName, stkNOTE, stkUNiT, stkVALUE, stCODE`)
- POST `/confirm` — ยืนยันผลการอนุมัติ (เรียกจาก `PopupDetail`)

  ```ts
  // payload ตัวอย่าง (คอนเซ็ปต์ ขึ้นกับ PopupDetail/Backend)
  { action: 'iSSUE', stkNote: string, stkStatus: string }
  ```

### ข้อควรระวัง/แนวทาง

- ปิด `loading` และ `detectChanges()` ใน `complete` ของ subscribe ทุกครั้ง
- ป้องกัน response ที่ไม่ใช่ array: ตั้งค่า `issueList = []` เพื่อให้ `#nodata` แสดงได้ถูกต้อง

### ไฟล์ที่เกี่ยวข้อง

- คอมโพเนนต์: `approve-issue.ts / .html / .css`
- Dialog: `src/app/components/popup-detail/popup-detail` (เปิดจากหน้านี้และเรียก `/confirm`)
- บริการ: `src/app/services/approve.ts`
- คอนฟิก: `src/environments/environment.ts` (`dotnetApiUrl`)
