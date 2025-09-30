## ภาพรวม Components (BAAC Stock Frontend)

เอกสารนี้สรุปหน้าที่และการทำงานของ components ทั้งหมดที่สำคัญในโฟลเดอร์ `src/app/components/` รวมถึงแนวทางการเขียนโค้ด รูปแบบการจัดการสถานะ การเชื่อมต่อ API และมาตรฐาน UX ที่ระบบนี้ใช้ร่วมกัน เพื่อให้สะดวกต่อการดูแล/ปรับปรุงโค้ดในอนาคต

### แนวทาง/มาตรฐานที่ใช้ร่วมกัน

- **โหลด/ปิดโหลดเสมอ**: ใช้สถานะ `loading` หรือ `isLoading` ควบคู่กับ `finalize` ใน RxJS และเรียก `ChangeDetectorRef.detectChanges()` หรือ `markForCheck()` หลังอัปเดตสถานะ UI
- **แจ้งเตือน**: ใช้ SweetAlert2 (`Swal.fire`) สำหรับ success/warning/error แทน `console.log`
- **ความปลอดภัยของข้อมูล**: ป้องกัน response ที่ไม่ใช่ array ด้วย `Array.isArray(res) ? res : []`
- **เอกสารในโค้ด**: ใส่ TSDoc บนคลาสและเมธอดสาธารณะในไฟล์ `.ts`
- **ห้าม log**: ลบ `console.log`/`console.error` ออกจาก components แล้วใช้ Alert ตามมาตรฐาน
- **ตรวจสิทธิ์/เมนู**: ใช้ `PermissionService` กรองเมนูตามระดับผู้ใช้ และ Guard/Service อื่น ๆ สำหรับการตรวจสิทธิ์
- **วันที่ไทย**: มี helper/เมธอดแปลงวันที่เป็นรูปแบบไทย (พ.ศ./ชื่อเดือนย่อ)
- **ฟอร์ม**: ใช้ `FormsModule/ReactiveFormsModule` และจัดการฟอร์มด้วย `FormGroup`, `FormArray`, validation ตามแต่ละหน้า
- **ดาวน์โหลดไฟล์**: สำหรับ Excel/PDF/Blob ให้สร้าง `ObjectURL` แล้ว trigger `<a>.click()` จากนั้น `revokeObjectURL`

---

## Components

| Component                                                           | Route/ตำแหน่ง                                   | หน้าที่หลัก                                                          | บริการที่ใช้หลัก                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `dashboard-admin/AdminDashboardComponent`                         | `/dashboard-admin/*`                                 | แผงควบคุมผู้ดูแล, แสดงเมนูตามสิทธิ์            | `UserService`, `PermissionService`, `PasswordStatusService`                          |
| `dashbord-system/DashboardSystemComponent`                        | `/dashboard-system/*`                                | บอร์ดควบคุมระบบ (System)                                         | `UserService`, `PermissionService`                                                     |
| `login/LoginComponent`                                            | `/login`                                             | เข้าสู่ระบบ, ตั้งค่า session                                  | `Login`, `UserService`                                                                 |
| `search-edit/SearchEditComponent`                                 | รวมในหลายหน้า                             | ค้นหาลูกค้า/ใบหุ้น, ส่ง event ไปหน้าถัดไป        | `CustomerService`, `UserService`                                                       |
| `stocks/StocksComponent`                                          | ฝังในหน้าแสดงใบหุ้น                 | แสดงใบหุ้นทั้งหมดของลูกค้า                            | `CustomerService`, `StockService`                                                      |
| `stock-table-detail/StockTableDetailComponent`                    | ฝังในรายละเอียด                         | โหลด/แสดงข้อมูลลูกค้าตาม `cusId`                       | `CustomerService`                                                                        |
| `transfer-share/TransferShareComponent`                           | `/dashboard-admin/transfer-share`                    | โอนเปลี่ยนมือหุ้น, ผู้รับหลายคน                    | `CustomerService`, `StockService`, `Divident`, `SystemMetadata`, `StockMetadata` |
| `manage-from/ManageFormComponent`                                 | ฝังในหลาย Flow                                | จัดการฟอร์มข้อมูลลูกค้า/ที่อยู่/ปันผล/ขาย | บริการ metadata หลายตัว,`CustomerService`, `Divident`                     |
| `dividend/DividendComponent`                                      | `/dashboard-admin/dividend`                          | จ่ายเงินปันผล, สรุป/แท็บรายการบล็อค             | `CustomerService`, `Divident`                                                          |
| `block-certificates/BlockCertificatesComponent`                   | `/dashboard-admin/block-certificates`                | แสดง/บล็อค/ยกเลิกบล็อคใบหุ้น                          | `StockBlockService`                                                                      |
| `annualdividendcalculator/AnnualdividendcalculatorComponent`      | `/dashboard-admin/AnnualDividendCalculatorComponent` | คำนวณเงินปันผลประจำปี                                      | บริการที่เกี่ยวข้องกับรายงาน/ไฟล์                          |
| `approve-item/ApproveItemComponent`                               | `/dashboard-admin/approve-item`                      | อนุมัติรายการของแต่ละคน                                  | `ApproveService`                                                                         |
| `approve-issue/ApproveIssue`                                      | `/dashboard-admin/approve-issue`                     | อนุมัติการออกใบหุ้น                                          | `ApproveService`                                                                         |
| `create-spin-files/CreateSpinFilesComponent`                      | `/dashboard-admin/create-spin-files`                 | สร้างไฟล์ SPIN ส่ง CBS                                              | `SpinFileService`                                                                        |
| `spin-files/SpinFilesComponent`                                   | `/dashboard-admin/spin-files`                        | รับผล SPIN FILE จาก CBS                                                 | `SpinFileService`                                                                        |
| `print-share-purchase-request/PrintSharePurchaseRequestComponent` | `/dashboard-admin/print-share-purchase-request`      | พิมพ์คำขอซื้อหุ้น                                              | บริการ PDF/รายงาน                                                              |
| `forms-procedures/FormsProceduresComponent`                       | `/dashboard-admin/documents/forms-procedures`        | แสดง/ดาวน์โหลดแบบพิมพ์                                     | `DocumentService`                                                                        |
| `upload-document/UploadComponent`                                 | `/dashboard-admin/documents/upload`                  | อัปโหลด/ลบ/ดาวน์โหลดเอกสาร                              | `FileService`                                                                            |
| `users/UsersComponent` + `adduser/AdduserComponent`             | `/dashboard-admin/users`                             | จัดการผู้ใช้/เพิ่มผู้ใช้                                 | `UserService`                                                                            |
| `change-password/ChangePasswordComponent`                         | `/dashboard-admin/change-password`                   | เปลี่ยนรหัสผ่าน                                                  | `PasswordStatusService`, `UserService`                                                 |
| `contact/ContactComponent`                                        | `/dashboard-admin/contact`                           | ข้อมูลการติดต่อ                                                  | -                                                                                          |
| `edit-customer/EditCustomerComponent`                             | `/dashboard-admin/editcustomer`                      | แก้ไขข้อมูลลูกค้า                                              | `CustomerService`                                                                        |
| `sap-interface/SapInterface`                                      | `/dashboard-admin/sap-interface`                     | ส่งออก/ดาวน์โหลดไฟล์อินทิเกรต SAP                   | บริการรายงาน/ไฟล์                                                          |
| `popup-detail/PopupDetail`                                        | ใช้เป็น Dialog                                  | ป๊อปอัปรายละเอียด/ยืนยันอนุมัติ                   | `ApproveService`, `StockService`                                                       |
| `pnd/PndComponent`                                                | ในหน้ารายงาน PND                           | โหลด/ตรวจไฟล์/สร้าง/ดาวน์โหลด PND                     | `Pnd`                                                                                    |
| `thai-calendar-component/ThaiCalendarComponent`                   | ฝังคอมโพเนนต์                             | ปฏิทินไทย                                                              | -                                                                                          |

> หมายเหตุ: รายการด้านบนครอบคลุม components หลักที่ใช้งานในระบบปัจจุบัน

---

## รายละเอียดรายคอมโพเนนต์ (สรุป + การเชื่อมต่อ API)

### `dashboard-admin/AdminDashboardComponent`

- **หน้าที่**: แผงควบคุมหลัก แสดงเมนูตามสิทธิ์ผู้ใช้, ตรวจสอบสถานะรหัสผ่าน (หมดอายุ/ต้องเปลี่ยน/รหัสเริ่มต้น)
- **สถานะ**: `sidebarCollapsed`, `currentUser`, `filteredMenus`, flags สถานะรหัสผ่าน
- **เมธอดเด่น**: `openMenu()`, `filterMenusByPermission()`, `checkPasswordStatus()`, `showLimitedMenus()`
- **API/Service**:
  - `UserService.getCurrentUser()` อ่าน session ปัจจุบัน
  - `PermissionService.filterMenusByPermission(menus, level)` กรองเมนูตามสิทธิ์
  - `PasswordStatusService.checkPasswordStatus(user)` คำนวณสถานะรหัสผ่าน

### `dashbord-system/DashboardSystemComponent`

- **หน้าที่**: เมนูสำหรับงาน System (กำหนดเงื่อนไข, แฟ้มอ้างอิง ฯลฯ) กรองเมนูตามสิทธิ์
- **สถานะ**: `currentUser`, `filteredMenus`
- **เมธอดเด่น**: `loadCurrentUser()`, `loadMenus()`, `openMenu()`, `canView()`
- **API/Service**:
  - `UserService.getCurrentUser()`
  - `PermissionService.filterSystemMenusByPermission(systemMenus, level)`

### `login/LoginComponent`

- **หน้าที่**: เข้าสู่ระบบ, อัปเดต session ผ่าน `UserService`
- **สถานะ**: `username`, `password`, `loading`
- **เมธอดเด่น**: `onSubmit()`
- **API/Service**:
  - `Login.login(username, password)` → Auth API (ตั้ง session)
  - `UserService.updateSessionFromAuthResponse(res)`

### `search-edit/SearchEditComponent`

- **หน้าที่**: ค้นหาผู้ถือหุ้น/ใบหุ้น, แบ่งหน้า, ส่งต่อไปหน้าที่เลือก (`editcus`, `stksale`, `dividend`, `block` ฯลฯ)
- **สถานะ**: `criteria`, `customerStocks`, `pageNumber`, `loading`, `activeView`
- **เมธอดเด่น**: `onSearch()`, `setView()`, `onHandle()`
- **API/Service**:
  - `CustomerService.searchCustomerStk({ GetDTL: 'byCUS' | 'bySTK@byCUS', ... })` → `/api/Customer/search`
  - `UserService.getCurrentUser()`
  - **ส่งจากฟังก์ชัน**: `onSearch(pgNum, PGSize)`
    - **Payload**:
      - `GetDTL`: `'byCUS'`
      - `STKno`: `criteria.stockId`
      - `CUSid`: `criteria.cusId`
      - `CUSfn`: `criteria.fname`
      - `CUSln`: `criteria.lname`
      - `StkA`: `''`
      - `PGNum`: `pgNum`
      - `PGSize`: `PGSize`

### `stocks/StocksComponent`

- **หน้าที่**: แสดงใบหุ้นทั้งหมดของลูกค้าตาม `cusId`, โหลดข้อมูลผู้ถือหุ้นสรุป
- **สถานะ**: `stockList`, `customerInfo`, `isLoading`
- **เมธอดเด่น**: `loadCustomerStock()`, `loadCustomerInfo()`, `formatThaiDateTime()`
- **API/Service**:
  - `CustomerService.searchCustomerStk({ GetDTL: 'bySTK@byCUS', ... })` → `/api/Customer/search`
  - `CustomerService.getCustomerDetail({ CUSid })` → `/api/Customer/detailcus`
  - **ส่งจากฟังก์ชัน**: `loadCustomerStock(cusId)`
    - **Payload**:
      - `GetDTL`: `'bySTK@byCUS'`
      - `STKno`: `''`
      - `CUSid`: `cusId`
      - `CUSfn`: `''`
      - `CUSln`: `''`
      - `StkA`: `''`
      - `PGNum`: `1`
      - `PGSize`: `9999999`
  - **ส่งจากฟังก์ชัน**: `loadCustomerInfo(cusId)`
    - **Payload**: `{ cusId }`

### `stock-table-detail/StockTableDetailComponent`

- **หน้าที่**: โหลดข้อมูลลูกค้าด้วย `cusId` เพื่อแสดงรายละเอียดประกอบใบหุ้น
- **สถานะ**: `customerData`, `selectedCustomer`, `isLoading`
- **เมธอดเด่น**: `loadCustomer()`, `formatThaiDateTime()`
- **API/Service**:
  - `CustomerService.getCustomer({ cusId })` → `/api/Customer/customer`
  - **ส่งจากฟังก์ชัน**: `loadCustomer(cusId)`
    - **Payload**: `{ cusId }`

### `transfer-share/TransferShareComponent`

- **หน้าที่**: โอนเปลี่ยนมือหุ้น (รองรับหลายผู้รับ), ตรวจเงื่อนไขจำนวนหุ้น, รวม payload และบันทึก
- **สถานะ**: `stkTransList`, `selectedcustomer`, `transferForm`, `remcodeList`, `accList`, `loading`
- **เมธอดเด่น**: `onLoadTransferList()`, `getStockDetail()`, `searchReceiver()`, `checkTransferableShares()`, `submitAll()`
- **API/Service**:
  - `CustomerService.searchCustomerStk({ GetDTL: 'bySTK@bySTK-TRF', ... })` → `/api/Customer/search`
  - `CustomerService.getCustomerDetail({ cusId })` → `/api/Customer/detailcus`
  - `StockService.getStockDetail({ stkNote })` → Stock detail endpoint
  - `Divident.getDividend({ cusId })` → `/api/Dividend/dividend`
  - `SystemMetadata.remCode()` → รายการรหัสเหตุผล
  - `StockMetadata.accTypes()` → ประเภทบัญชีรับโอน
  - `StockService.stockTransfer(payload)` → บันทึกโอนหุ้น
  - **ส่งจากฟังก์ชัน/Payload**:
    - `onLoadTransferList(cusId)` → `/api/Customer/search`
      - `GetDTL`: `'bySTK@bySTK-TRF'`, `STKno`: `''`, `CUSid`: `cusId`, `CUSfn`: `''`, `CUSln`: `''`, `stkA`: `'1'`, `PGNum`: `1`, `PGSize`: `9999999`
      - โหลดผู้ถือหุ้น: `getCustomerDetail({ cusId })`
    - `getStockDetail(stkNote)` → `StockService.getStockDetail({ stkNote })`
    - `searchReceiver()` → `forkJoin({ customer: getCustomerTr({ cusId }), dividend: getDividend({ cusId }) })`
      - Payload: `{ cusId: searchForm.value.stkOWNiD }`
    - `submitAll()` → `StockService.stockTransfer(payload)`
      - `TRF_CUSid`, `TRF_stkNOTE`, `TRF_stkSTA`, `TRF_stkSTP`, `TRF_stkUNiTALL`
      - `TR2_RemCode`
      - `TR2_LST_CUSid` (join `|`), `TR2_LST_CUSun` (join `|`), `TR2_LST_accTY` (join `|`), `TR2_LST_accNO` (join `|`), `TR2_LST_accNA` (join `|`), `TR2_LST_payTY` (join `|`)
      - `ACT`: `'UPDATE'`

### `manage-from/ManageFormComponent`

- **หน้าที่**: ฟอร์มข้อมูลลูกค้า/ที่อยู่/ปันผล/รายละเอียดขาย พร้อม metadata และการควบคุม enable/disable ตามโหมด
- **สถานะ**: `customerForm`, `customer`, `homeAddress/currentAddress`, `dividendData`, `sysCfg`, metadata lists
- **เมธอดเด่น**: `handleData()`, `populateCustomerForm()`, `populateAddressForm()`, `updateFieldEditability()`, `onSubmit()`
- **API/Service**:
  - `CustomerService.getCustomer({ cusId })` → `/api/Customer/customer`
  - `AddressService.getAddress({ cusId })` → Endpoint ที่คืน `homeAddress/currentAddress`
  - `Divident.getDividend({ cusId })` → `/api/Dividend/dividend`
  - Metadata: `AddressMetadata.getProvince()`, `getAumphor(prv)`, `getTumbon(prv,amp)`; `CustomerMetadata.titles()`, `cusTypes()`, `docTypes()`; `StockMetadata.accTypes()`, `stkTyps()`; `SystemMetadata.sysCfg()`
  - **ส่งจากฟังก์ชัน/Payload**:
    - `handleData({ view, cusId })`
      - `requestPayload`: `{ cusId: this.cusId }` สำหรับ `CustomerService.getCustomer` และ `AddressService.getAddress`
    - การบันทึก: `onSubmit(act)` → emit `[FormGroup.getRawValue(), act]` ออกไปให้ parent จัดการ API ต่อ

### `dividend/DividendComponent`

- **หน้าที่**: หน้าจ่ายปันผล แสดงรายละเอียด/บล็อค, รวมยอด, ยืนยันการจ่ายตามเมนู, รวมข้อมูลใบหุ้นจากหลายแหล่ง
- **แนวทางเด่น**: ใช้ `finalize` ปิดโหลดทุกกรณี, กรองใบหุ้นบล็อค, รวมข้อมูลด้วย `stkNOTE`, สร้าง helpers เพื่อลดซ้ำซ้อน
- **API/Service**:
  - `Divident.getDividend({ cusId, ... })` → `/api/Dividend/dividend`
  - `CustomerService.searchCustomerStk({ GetDTL: 'byCUS' | 'bySTK@byCUS', ... })` → `/api/Customer/search` (โหลดใบหุ้นทั้งหมด/รายการบล็อค)
  - บันทึกการจ่ายปันผล: endpoint ผ่าน `Divident` (เช่น `/api/Dividend/2pay` ตามระบบเดิม)
  - **ส่งจากฟังก์ชัน/Payload (ตัวอย่างหลัก)**:
    - โหลดปันผล: `onLoadDivident()` → `{ cusId, ...filters }`
    - โหลดใบหุ้นบล็อคทั้งหมด: `loadBlockedStocks(cusId)` → `searchCustomerStk({ GetDTL: 'byCUS', CUSid: cusId, ... })`
    - จ่ายปันผล: `onPay(method)` → ส่ง payload ไปยัง `Divident/2pay` ตามเมนูที่เลือก (ใช้ label เมนู)

### `block-certificates/BlockCertificatesComponent`

- **หน้าที่**: แสดงรายการใบหุ้นสถานะปกติ/บล็อค, ตีความสถานะจาก `stCODE`/`stCODEs`
- **แนวทางเด่น**: `getStatus()` helper, บังคับผลลัพธ์ให้เป็น array, ใช้ `trackBy`
- **API/Service**:
  - `CustomerService.searchCustomerStk({ GetDTL, ... })` → `/api/Customer/search`
  - `StockBlockService.blockStock(payload)` → บล็อค/ยกเลิกบล็อคใบหุ้น
  - **ส่งจากฟังก์ชัน/Payload**:
    - `onLoadBlockList()` → `searchCustomerStk` (บังคับผลลัพธ์เป็น array)
    - บล็อค/ยกเลิกบล็อค: `executeBlockCertificate(row, action)` → `blockStock({ stkNOTE, action, ... })`

### `annualdividendcalculator/AnnualdividendcalculatorComponent`

- **หน้าที่**: คำนวณปันผลประจำปี (ฝั่ง frontend คงเหลือเฉพาะ `printPDF`/`exportPDF`/`showDetail` ตามที่ผู้ใช้ระบุ), ทำเอกสารผ่าน backend
- **API/Service**:
  - พิมพ์/ส่งออก PDF ผ่าน service รายงาน (เช่น `print()`, `getVoucher()`) ภายใต้ `Divident` (ขึ้นกับ flow ที่ใช้งานจริง)
  - **ส่งจากฟังก์ชัน**: `printPDF()`, `exportPDF()`, `showDetail()`

### `approve-item/ApproveItemComponent` และ `approve-issue/ApproveIssue`

- **หน้าที่**: อนุมัติรายการ/ออกใบหุ้น, โหลด/แบ่งหน้า, แสดงผลรายการ
- **แนวทางเด่น**: ใช้ `finalize` ปิดโหลด, TSDoc, ลบ console, แจ้งเตือนผ่าน SweetAlert
- **API/Service**:
  - `ApproveService.*` สำหรับโหลด/ยืนยันรายการอนุมัติ
  - `StockService.detailApprove({ stkNote })` โหลดรายละเอียดเพื่อแสดงในป๊อปอัป
  - **ส่งจากฟังก์ชัน/Payload**:
    - ค้นหารายการ: `onSearch()`/`onsearch()` → payload ตาม filters หน้าอนุมัติ (เช่น วันที่/สถานะ/หน้า)
    - ยืนยัน: `approveDetail()`/`showPopup()/openPopup()` → ใช้ `PopupDetail.approve()` ดำเนินการยืนยันต่อไป

### `create-spin-files/CreateSpinFilesComponent` และ `spin-files/SpinFilesComponent`

- **หน้าที่**: สร้าง/รับไฟล์ SPIN
- **แนวทางเด่น**: แยกโหลด/ดาวน์โหลดไฟล์, ป้องกัน error ของ Blob
- **API/Service**:
  - `SpinFileService.create(...)` สร้างไฟล์ส่ง CBS
  - `SpinFileService.list()/download(...)` รับผล/ดาวน์โหลดไฟล์จาก CBS
  - **ส่งจากฟังก์ชัน/Payload**: `createSpinFile()`/`loadSpinfile()`/`download(name)` → ตามพารามิเตอร์วันที่/ไฟล์ที่เลือก

### `print-share-purchase-request/PrintSharePurchaseRequestComponent`

- **หน้าที่**: พิมพ์คำขอซื้อหุ้น, ตรวจค่ากรอก, โหลด PDF พร้อม timeout
- **API/Service**:
  - Service รายงาน/ไฟล์สำหรับโหลด PDF (Blob) และ timeout 30s
  - **ส่งจากฟังก์ชัน/Payload**: `loadPdf()`/`printPdf()` → payload ฟิลเตอร์ (ช่วงวันที่/วิธีชำระ/จำนวนหุ้น ฯลฯ)

### `forms-procedures/FormsProceduresComponent`

- **หน้าที่**: แสดงเอกสารแบบฟอร์ม/วิธีปฏิบัติ และดาวน์โหลด
- **แนวทางเด่น**: แทน ternary ซ้อนด้วย if/else ลดความซับซ้อน
- **API/Service**:
  - `DocumentService.list()/download(name)` โหลดรายการ/ดาวน์โหลดเอกสาร
  - **ส่งจากฟังก์ชัน**: `loadDocuments()`/`downloadDocument(name)` → ไม่มี payload สำหรับ list, มี `{ name }` สำหรับ download

### `upload-document/UploadComponent`

- **หน้าที่**: อัปโหลด/ลบ/ดาวน์โหลดไฟล์เอกสาร (อนุญาต `.pdf/.doc/.docx/.txt`, สูงสุด 10MB)
- **แนวทางเด่น**: แสดง progress ต่อไฟล์, ใช้ `finalize` กับโหลด/ลบ/ดาวน์โหลด, ป้องกันชนิดไฟล์ผิด
- **API/Service**:
  - `FileService.getFiles()` โหลดรายการไฟล์
  - `FileService.uploadFile(File)` อัปโหลด (HTTP progress)
  - `FileService.delete(name)` ลบไฟล์
  - `FileService.downloadFile(name)` ดาวน์โหลดไฟล์ (Blob)
  - **ส่งจากฟังก์ชัน/Payload**:
    - `loadUploadedFiles()` → ไม่มี payload
    - `uploadFiles()` → ส่ง `FormData` (ไฟล์จริง)
    - `deleteUploadedFile(file)` → `{ file }`
    - `downloadFile(fileName)` → `{ fileName }`

### `users/UsersComponent` และ `adduser/AdduserComponent`

- **หน้าที่**: รายการผู้ใช้/เพิ่มผู้ใช้, reset/delete ผู้ใช้
- **แนวทางเด่น**: ใช้ `finalize` ปิดโหลด, แจ้งเตือนผลลัพธ์, กรองรายชื่อด้วย `searchTerm`
- **API/Service**:
  - `UserService.getAllUsers()` โหลดผู้ใช้ทั้งหมด
  - `UserService.manageUser({ Act: 'RESET_PASSWORD' | 'RESET_USER' | 'DELETE_USER', ... })`
  - `AdduserComponent` ใช้ `UserService` สำหรับสร้างผู้ใช้ใหม่ (ตามสัญญา payload)
  - **ส่งจากฟังก์ชัน/Payload**:
    - `loadUsers()` → ไม่มี payload
    - `manageUser(user, act)` → `{ UserId: user.usrId, brc: user.usrBrc, Act: act }`

### `change-password/ChangePasswordComponent`

- หน้าที่: เปลี่ยนรหัสผ่าน, re-login/บังคับเปลี่ยนเมื่อหมดอายุ/รหัสเริ่มต้น
- API: `PasswordStatusService.*`, `UserService.*` ที่เกี่ยวข้องกับเปลี่ยนรหัสผ่าน
- **ส่งจากฟังก์ชัน/Payload**:
  - `loadUser()` → `UserService.getUserById(userId)`
    - Payload: `{ userId }`
  - `onChangePassword()` → `UserService.changePassword(payload)`
    - Payload: `{ userId, pwdO, newPwd, userDesc }`

### `contact/ContactComponent`: แสดงข้อมูลติดต่อ

### `edit-customer/EditCustomerComponent`

หน้าที่: แก้ไขข้อมูลลูกค้า, รวม payload ส่ง backend

API: `CustomerService.manageCustomer(payload)` → `/api/Customer/cusmanage`

**ส่งจากฟังก์ชัน/Payload**: `onSubmit()` → ส่ง payload รวมข้อมูลลูกค้าตามฟอร์มไปยัง `cusmanage`

- Payload หลัก (ย่อ):
  - ข้อมูลลูกค้า: `CUSidO` (เดิม), `CUSid` (ใหม่), `CUStax`, `CUSTt` (คำนำหน้า), `CUSfn`, `CUSln`, `CUSTy` (ประเภทลูกค้า), `CUSTg`, `docTY`, `STC: 'C000'`, `BRC: ''`, `CUSphone`, `CUSemail`
  - ที่อยู่ปัจจุบัน (CA): `AddCA0` (บ้านเลขที่), `AddCA1` (ซอย), `AddCA2` (ถนน), `AddCA3` (รหัสไปรษณีย์), `AddCA4` (โทรศัพท์), `AddCA00` (จังหวัด), `AddCA01` (อำเภอ), `AddCA02` (ตำบล), `AddCADD1`, `AddCADD2`
  - ที่อยู่อาศัย (HA): `AddHA0`, `AddHA1`, `AddHA2`, `AddHA3`, `AddHA4`, `AddHA00`, `AddHA01`, `AddHA02`
  - ช่องทางรับปันผล: `stkPayType`, `stkACCno`, `stkACCname`, `stkACCtype`
  - การทำรายการ: `ACT` (เช่น SAVE/UPDATE)

### `sap-interface/SapInterface`

- หน้าที่: ส่งออก/ดาวน์โหลดไฟล์สำหรับ SAP, จัดการ Blob error
- API: Endpoints ดาวน์โหลด/สร้างไฟล์ใน service (เช่น report/movement)
- **ส่งจากฟังก์ชัน/Payload**:
  - `loadTextFile()` → `Sap.getlist()` (ไม่มี payload)
  - `createTextFile()` → `Sap.generate()` (ไม่มี payload)
  - `dowloadTextFile(fileName)` → `Sap.download({ fileName: fileName + '.txt' })`
    - Payload: `{ fileName: '<ชื่อไฟล์>.txt' }`
  - `downloadStockMovement(fileName)` → `Sap.downloadExcel({ dateArg })`
    - Payload: `{ dateArg }` โดย `dateArg` แปลงจากเลข 8 หลักท้ายของ `fileName` เป็นปี ค.ศ. ตามสูตรที่คอมโพเนนต์ใช้งาน

### `popup-detail/PopupDetail`

- หน้าที่: ป๊อปอัพรายละเอียด (อนุมัติ/ยกเลิก)
- API: `StockService.detailApprove({ stkNote })`, `ApproveService.confirmStock(payload)`
- **ส่งจากฟังก์ชัน/Payload**:
  - `onloadDetail(stkNote)` → `{ stkNote: transformStkNote(stkNote) }`
  - `approve(status)` → `{ stkNOTEis: owner.stkNOTE, AiSQL: action, stkCONFiRM: status }`

### `pnd/PndComponent`

- หน้าที่: โหลดรายการ PND, ตรวจไฟล์, สร้าง/ดาวน์โหลด
- API: `Pnd.getPndDividendList(payload)`, `Pnd.checkFiles(files)`, `Pnd.generateReport(payload)`, `Pnd.download(payload)`, `Pnd.downloadExcel(payload)`
- **ส่งจากฟังก์ชัน/Payload**:
  - `loadPNDData(pndType)` → `{ ACT: 'datLiST', PNDtype: pndType, dateSTA: '', getPNDformat: '', dateSPL: '', MODE: mode }`
  - `generateFiles(item)` → `{ Action: 'getDATA', PndType: pndType, YearMonth: item.ym, FileName: item.txtFiLE, TaxForm: title }`
  - `downloadFile(file)` → `{ FileName: file.name, FilePath: 'PND' }`
  - `DowloadEcel(yyyymm, fileName, typefile)` → `{ Yyyymm, PndType: pndType, FileName, TypeFile: typefile }`

### `thai-calendar-component/ThaiCalendarComponent`: ปฏิทินไทย

---

## รูปแบบโค้ดและคุณภาพ

- ลบ `console.*` ออกจาก components แล้วแทนที่ด้วย SweetAlert
- ใส่ TSDoc ในไฟล์ `.ts` ของคอมโพเนนต์สำคัญ
- แก้ไขเตือน SonarLint เช่น `typescript:S1854` (กำจัดตัวแปรไม่ได้ใช้), `typescript:S3358` (เลี่ยง ternary ซ้อน) และ `css:S4659` (หลีกเลี่ยง `:ng-deep`)
- ใช้ helper/constant เพื่อลดโค้ดซ้ำและเพิ่มความเข้าใจ

## บริการหลัก (Services) ที่เกี่ยวข้อง

- `CustomerService`, `StockService`, `ApproveService`, `Divident`, `Pnd`, `FileService`
- Metadata: `SystemMetadata`, `StockMetadata`, `AddressMetadata`, `CustomerMetadata`
- ระบบสิทธิ์/ผู้ใช้: `UserService`, `PermissionService`, `PasswordStatusService`, `Login`
