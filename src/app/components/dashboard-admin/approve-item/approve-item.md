### ApproveItemComponent

- **Path**: `src/app/components/dashboard-admin/approve-item/approve-item.ts`
- **Template**: `src/app/components/dashboard-admin/approve-item/approve-item.html`
- **Styles**: `src/app/components/dashboard-admin/approve-item/approve-item.css`
- **Service**: `src/app/services/approve.ts`

### การทำงาน

หน้าจอ "อนุมัติรายการ" (APPROVE) แสดงคำขอที่ต้องอนุมัติแบบแบ่งหน้า พร้อมเปิดป๊อปอัพเพื่อดูรายละเอียดและยืนยันผล

### การใช้งาน

```html
<app-approve-item></app-approve-item>
```

### State หลัก

- `activeView = 'table'`
- `requestList: any[]` — รายการที่แสดงบนตาราง
- `loading: boolean` — overlay ระหว่างโหลด
- Paging: `pageNumber = 1`, `pageSize = 20`
- `brName` — จาก cookie `BrName`

### ฟลว์การทำงาน

1) `ngOnInit()`
   - อ่าน `BrName` จาก cookie
   - `loading = true` → `onSearch(pageNumber, pageSize)`
2) `onSearch(pg, size)`
   - payload `{ ACT: 'APPROVE', PGNum: pg, PGSize: size }`
   - เรียก `ApproveService.getStockApprove()`
   - ตั้งค่า `requestList = res (array) หรือ []` เพื่อรองรับ response ว่าง
   - ปิด `loading` ใน `complete` และ `detectChanges()` เสมอ
3) `nextPage()` / `prevPage()` → เปลี่ยน `pageNumber` แล้ว `onSearch()` ใหม่
4) `approveDetail(stkNote, stkStatus)` → `openPopup(stkNote, stkStatus)`
5) `openPopup(...)`
   - เปิด `PopupDetail` ด้วย `{ stkNote, stkStatus, action: 'APPROVE' }`
   - `afterClosed()` ถ้าได้ `PASS` → `onSearch(1, 20)`

### การเชื่อมต่อ API

ไฟล์บริการ: `src/app/services/approve.ts` (base: `${environment.dotnetApiUrl}/api/approve`)

- POST `/stktransai` — ดึงรายการอนุมัติ

  ```ts
  { ACT: 'APPROVE', PGNum: number, PGSize: number }
  ```

  - response: array ของรายการ (ฟิลด์สำคัญ: `roWi, cusiD, titleABBR, cusFName, cusLName, stKbrName, stkNOTE, stkUNiT, stkVALUE, stCODE, remList`)
- POST `/confirm` — ยืนยันผล (เรียกจาก `PopupDetail`)

  ```ts
  { action: 'APPROVE', stkNote: string, stkStatus: string }
  ```

### กติกาแสดงผล (Template)

- ถ้า `requestList` ว่าง → ใช้ `ng-template #nodata` แสดงข้อความ "ไม่พบรายการขออนุมัติ"
- มี paginator ปุ่ม "หน้าก่อน/หน้าถัดไป"
- ปุ่ม 📝 เปิด Popup รายการนั้นพร้อม tooltip จาก `setTitleDetail(item)`

### ไฟล์ที่เกี่ยวข้อง

- คอมโพเนนต์: `approve-item.ts / .html / .css`
- Dialog: `src/app/components/popup-detail/popup-detail` (เป็นผู้เรียก `/confirm`)
- บริการ: `src/app/services/approve.ts`
- คอนฟิก: `src/environments/environment.ts` (`dotnetApiUrl`)
