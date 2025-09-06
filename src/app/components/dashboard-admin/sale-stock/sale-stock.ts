import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ManageFormComponent } from '../../manage-from/manage-from';
import { CustomerService } from '../../../services/customer';
import { StockService } from '../../../services/stock';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-sale-stock',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, ManageFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-stock.html',
  styleUrl: './sale-stock.css'
})
export class SaleStockComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';
  docType: string | null = null;
  titleCode: string | null = null;
  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly stockService: StockService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('2');
  }

  handleData(event: { view: string; cusId: string }) {
    this.cusId = event.cusId;
    if (isNaN(Number(this.cusId)) || this.cusId.length != 13) {
      this.docType = '1000';
      this.titleCode = 'JUR';
    } else {
      this.docType = '0001';
      this.titleCode = '003';
    }
    this.activeView = event.view;
    this.cd.detectChanges();
  }

  check(cusId: string): Promise<boolean> {
    const payload = { cusId };
    return new Promise((resolve, reject) => {
      this.customerService.getCustomer(payload).subscribe({
        next: (res: any) => {
          let allow = true;
          if (res.cusCODE === "0100") {
            const rawUserLVL = this.getCookie("UserLVL");
            const userLVL = rawUserLVL ? parseFloat(decodeURIComponent(rawUserLVL)) : 0;
            console.log("UserLVL", userLVL);
            allow = userLVL >= 80;
          }
          console.log("Allow access:", allow);
          resolve(allow);
        },
        error: (err) => reject(new Error(err?.message || JSON.stringify(err)))
      });
    });
  }

  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  async submit(event: any) {
    try {
      const allow = await this.check(this.cusId);
      console.log(event);
      console.log("Allow", allow);
      if (!allow) {
        alert("สิทธิ์ไม่เพียงพอ");
        return;
      } else {
        this.loading = true;
        const formData = event[0];
        const action = event[1];

        const customer = formData.customer;
        const homeAddress = formData.homeAddress;
        const currentAddress = formData.currentAddress;
        const dividend = formData.dividend;
        const detailSale = formData.detailSale;
        console.log("Customer", customer);
        console.log("HomeAddrss", homeAddress);
        console.log("CurrentAddress", currentAddress);
        console.log("Dividend", dividend);
        console.log("DetailSale", detailSale);
        const cusPayload = {
          CUSidO: this.cusId, // เลขบัตรประชาชน (เดิม)
          CUSid: customer.cusiDnew, // เลขบัตรประชาชน (ใหม่)
          CUStax: customer.cusTAXid, // รหัสประจำตัวผู้เสียภาษี
          CUSTt: customer.titleCode, // คำนำหน้า (3 ตัวแรก)
          CUSfn: customer.cusFName, // ชื่อ
          CUSln: customer.cusLName, // นามสกุล
          CUSTy: customer.cusCODE, // ประเภทลูกค้า
          CUSTg: customer.cusCODEg,  // กลุ่มลูกค้า
          docTY: customer.docTYPE, // ประเภทเอกสาร
          STC: "C000", // รหัสคงที่
          BRC: "", // รหัสสาขา
          CUSphone: customer.phonE_MOBILE, // เบอร์โทรศัพท์มือถือ
          CUSemail: customer.email, // อีเมล
          AddCA0: currentAddress.housEno, // บ้านเลขที่
          AddCA1: currentAddress.troG_SOI, // หมู่ที่
          AddCA2: currentAddress.road, // ซอย / ถนน
          AddCA3: currentAddress.zipcodeCurrent, // รหัสไปรษณีย์
          AddCA4: currentAddress.phone, // ชื่อหมู่บ้าน / คอนโด
          AddCA00: currentAddress.prvCODE, // รหัสจังหวัด
          AddCA01: currentAddress.ampCODE, // รหัสอำเภอ
          AddCA02: currentAddress.tmbCODE, // รหัสตำบล
          AddCADD1: currentAddress.addR1, // ข้อมูลเพิ่มเติม 1
          AddCADD2: currentAddress.addR1, // ข้อมูลเพิ่มเติม 2

          AddHA0: homeAddress.housEno, // บ้านเลขที่
          AddHA1: homeAddress.troG_SOI, // หมู่ที่
          AddHA2: homeAddress.road, // ซอย / ถนน
          AddHA3: homeAddress.zipcodeHome, // รหัสไปรษณีย์
          AddHA4: homeAddress.phone, // ชื่อหมู่บ้าน / คอนโด
          AddHA00: homeAddress.prvCODE, // รหัสจังหวัด
          AddHA01: homeAddress.ampCODE, // รหัสอำเภอ
          AddHA02: homeAddress.tmbCODE, // รหัสตำบล
          stkPayType: dividend.dividendStkPayType, // วิธีการชำระเงิน
          stkACCno: dividend.stkACCno, // หมายเลขบัญชี
          stkACCname: dividend.stkACCname, // ชื่อบัญชี
          stkACCtype: dividend.stkACCtype, // ประเภทบัญชี
          ACT: action // สถานะ
        }
        if (dividend.stkACCno == '') {
          dividend.stkACCtype = "000";
        }
        const stkPayload = {
          stkOWNiD: customer.cusiDnew,
          stkTYPE: detailSale.stkTYPE,
          stkPayType: dividend.stkPayType,
          stkACCno: dividend.stkACCno,
          stkACCname: dividend.stkACCname,
          stkACCtype: dividend.stkACCtype,
          stkUNiT: Number(detailSale.stkUNiT),
          stkValue: Number(detailSale.stkUNiT),
          stkTRCode: detailSale.stkPayTypeDetail,
          stkTRType: 'STK',
          stkReqNo: detailSale.stkReqNo,
          stkSaleByTRACCno: detailSale.stkSaleByTRACCno,
          stkSaleByTRACCname: detailSale.stkSaleByTRACCname,
          stkSaleByCHQno: detailSale.stkSaleByCHQno,
          stkSaleByCHQdat: this.thaiDateStringToNumber(detailSale.stkSaleByCHQdat),
          stkSaleByCHQbnk: detailSale.stkSaleByCHQbnk,
          stkSaleByCHQbrn: detailSale.stkSaleByCHQbrn
        }

        console.log("StkPayload", stkPayload);

        this.customerService.manageCustomer(cusPayload).subscribe({
          next: (res: any) => {
            console.log(res);
            if (res.msg[0].RST == "COMPLETE" && action == 'REG') {
              this.stockService.stockManage(stkPayload).subscribe({
                next: (res: any) => {
                  this.loading = false;
                  console.log(res);
                  // ตรวจสอบว่ามี FAIL อยู่ไหม
                  const hasFail = res.some((r: any) => r.rst.toUpperCase() === "FAIL");
                  if (hasFail) {
                    // กรณีมี FAIL
                    const failMessages = res
                      .filter((r: any) => r.rst.toUpperCase() === "FAIL")
                      .map((r: any) => `${r.msg}`);

                    Swal.fire({
                      icon: 'warning',
                      text: `${failMessages.join("\n")}`
                    })
                  } else {
                    // ✅ กรณีผ่านทั้งหมด
                    const successMessages = res.map((r: any) => `${r.msg}`);
                    Swal.fire({
                      icon: 'success',
                      text: `${successMessages.join("\n")}`
                    }).then((result) => {
                      if (result.isConfirmed) {
                        this.onBack();
                      }
                    })
                  }
                }, error: (err) => {
                  this.loading = false;
                  console.log("Err", err);
                  this.cd.detectChanges();
                }
              })
            }  else {
              Swal.fire({
                icon: 'success',
                text: `${res.msg[0].MSG}`
              })
            }
          }, error: (err: any) => {
            console.log("Error", err);
            this.loading = false;
            this.cd.detectChanges();
          }
        })
      }
    } catch (err) {
      console.error("Error", err);
    }
  }

  thaiDateStringToNumber(dateStr: string): string {
    if (!dateStr) return '';

    // แยกวัน เดือน ปี
    const parts = dateStr.trim().split(' '); // ["06", "กันยายน", "2568"]
    if (parts.length !== 3) return '';

    const [dayStr, monthStr, yearStr] = parts;

    // แปลงเดือนไทยเป็นตัวเลข
    const thaiMonths: Record<string, string> = {
      'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
      'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
      'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    const month = thaiMonths[monthStr];
    if (!month) return ''; // เดือนไม่ถูกต้อง

    // เติม 0 หน้าวันถ้ายังไม่ครบ 2 หลัก
    const day = dayStr.padStart(2, '0');

    // ปีเป็นตัวเลข
    const year = yearStr;

    return `${year}${month}${day}`; // 25680906
  }

}
