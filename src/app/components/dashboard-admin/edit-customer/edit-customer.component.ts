import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatTabsModule } from '@angular/material/tabs';
import { ManageFormComponent } from '../../manage-from/manage-from';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';


@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule, ManageFormComponent],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
export class EditCustomerComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';
  act = '';

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('1');
  }

  handleData(event: { view: string; cusId: string }) {
    console.log('🔍 EditCustomerComponent handleData called with:', event);
    this.activeView = event.view;
    this.cusId = event.cusId;
    console.log('🔍 cusId set to:', this.cusId);
    this.cd.detectChanges();
  }

  onActionReceived(action: string){
    this.act = action;
    console.log('🔍 Action received in EditCustomerComponent:', this.act);
  }

  onSubmit([form, act]: [any, string]) {
    this.loading = true;
    console.log("From",form);
    const customer = form.customer;
    const homeAddress = form.homeAddress;
    const currentAddress = form.currentAddress;
    const dividend = form.dividend;

    const paylaod = {
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
      ACT: act // สถานะ
    }

    console.log("Payload", paylaod);

    this.customerService.manageCustomer(paylaod).subscribe({
      next: (res:any) => {
        this.loading = false;
        console.log(res);
        if (res.msg[0].RST == "COMPLETE") {
          Swal.fire({
            icon: 'success',
            text: `${res.msg[0].MSG}`
          })
        } else {
          Swal.fire({
            icon: 'warning',
            text: `${res.msg[0].MSG}`
          })
        }
        this.cd.detectChanges();
        const event = {
          'view': 'editcus',
          'cusId': paylaod.CUSid
        }
        this.handleData(event);
        
      }, error: (err:any) => {
        console.log("Errors", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  // Debug method เพื่อตรวจสอบค่า cusId
  debugCusId() {
    console.log('🔍 Debug cusId in EditCustomerComponent:', this.cusId);
    console.log('🔍 Debug activeView in EditCustomerComponent:', this.activeView);
  }
}
