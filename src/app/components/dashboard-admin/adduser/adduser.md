### AdduserComponent

- **Path**: `src/app/components/dashboard-admin/adduser/adduser.ts`
- **Template**: `src/app/components/dashboard-admin/adduser/adduser.html`
- **Styles**: `src/app/components/dashboard-admin/adduser/adduser.css`
- **Services**: `src/app/services/user.ts`, `src/app/services/metadata`

### การทำงาน

คอมโพเนนต์สำหรับ "เพิ่มผู้ใช้งานใหม่" โฟลว์คือโหลดข้อมูลตัวเลือก (สาขา/ระดับสิทธิ์) → ผู้ใช้กรอกแบบฟอร์ม → กดยืนยัน → เรียก API เพิ่มผู้ใช้ → แจ้งผล และส่งสัญญาณให้หน้าพ่อกลับไปหน้าเดิม

### การนำไปใช้ (Parent Component)

```html
<app-adduser (back)="onBack()"></app-adduser>
```

```ts
onBack() {
  // ตัวอย่าง: กลับไปหน้ารายการผู้ใช้ หรือสลับ view
  this.activeView = 'list';
  // หรือใช้ Router นำทาง
  // this.router.navigate(['/dashboard-admin/users']);
}
```

### สัญญา Event

- `back: EventEmitter<void>` — คอมโพเนนต์จะ emit เมื่อ
  - เพิ่มผู้ใช้สำเร็จ แล้วผู้ใช้กด "ตกลง" บน dialog
  - ผู้ใช้กดปุ่ม "กลับ" ในหน้าเพิ่มผู้ใช้

### โครงแบบฟอร์ม (HTML)

- สาขา: `selectedBranchCode`
- ระดับสิทธิ์: `selectedLevelCode`
- รหัสผู้ใช้: `userId`
- ชื่อ–นามสกุล: `fullName`
- ปุ่ม "ตกลง" (ยืนยันก่อนส่งคำขอ)

### ฟลว์การทำงาน (Component)

1) `ngOnInit()`
   - เรียก `metadataService.getLevel()` และ `metadataService.getBranch()` เพื่อเติม dropdown
2) `onSubmit(form)`
   - ถ้า `form.valid` แสดง SweetAlert ยืนยัน → กดตกลงเรียก `addUser()`
3) `addUser()`
   - สร้าง payload แล้วเรียก `UserService.addUser(payload)`
   - สำเร็จ: แสดงผลลัพธ์ และ emit `back()`
   - ล้มเหลว: กรณี `409` แสดงข้อความจาก backend, อื่นๆ แสดง error dialog
4) `clearForm()` — ล้างค่าทั้งหมด
5) `onBackClick()` — emit `back()`

### การตรวจสอบค่าก่อนส่ง (Validation)

- ควรกำหนด `required` ในช่อง: สาขา, ระดับสิทธิ์, รหัสผู้ใช้, ชื่อ–นามสกุล
- ใช้ template-driven validation (`form.valid`) เพื่อกันค่าส่งไม่ครบ

### API ที่เรียกใช้งาน

ไฟล์บริการ: `src/app/services/user.ts` ใช้ `${environment.dotnetApiUrl}/api/user`

- `POST /adduser` (ผ่าน `UserService.addUser(payload)`) — เพิ่มผู้ใช้ใหม่
  - payload (ใน `addUser()`):
    ```ts
    {
      usrBrc: selectedBranchCode,
      usrID: userId,
      usrDESC: fullName,
      usrLVL: selectedLevelCode
    }
    ```
- อื่นๆ ที่เกี่ยวข้องในโดเมนผู้ใช้ (อาจใช้หน้าอื่น)
  - `GET /getallusers` — รายชื่อผู้ใช้ทั้งหมด
  - `POST /getuserbyid` — ค้นหารายบุคคล
  - `POST /controlleraction` — จัดการผู้ใช้ (reset/delete ฯลฯ)

ไฟล์บริการ: `src/app/services/metadata`

- `getLevel()` — รายการระดับสิทธิ์
- `getBranch()` — รายการสาขา

### UX/ข้อควรระวัง

- แสดงสถานะ error ที่เข้าใจง่ายเมื่อโหลด level/branch ไม่สำเร็จ
- ยืนยันก่อนบันทึกเสมอ
- หลังบันทึกสำเร็จ ให้ปล่อยการนำทางให้ parent จัดการผ่าน event `back`

### ไฟล์ที่เกี่ยวข้อง

- คอมโพเนนต์: `adduser.ts / adduser.html / adduser.css`
- บริการ: `services/user.ts`, `services/metadata`
- คอนฟิก: `environments/environment.ts` (`dotnetApiUrl`)
