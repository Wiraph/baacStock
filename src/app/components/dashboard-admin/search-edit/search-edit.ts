import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService, CustomerSearchDto } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import { finalize, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit {
  criteria: CustomerSearchDto = {
    cusId: '',
    fname: '',
    lname: '',
    stockId: ''
  };

  results: any[] = [];
  searched = false;
  loading = false;

  constructor(
    private customerService: CustomerService,
    private cd: ChangeDetectorRef
  ) { }

  onSearch() {
    if (!this.criteria.cusId && !this.criteria.stockId && !this.criteria.fname && !this.criteria.lname) {
      alert('กรุณากรอกอย่างน้อยหนึ่งช่องก่อนค้นหา');
      return;
    }

    this.loading = true;
    this.customerService.searchCustomer(this.criteria)
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: data => {
          if (!environment.production) {
            console.log('📦 ข้อมูลที่ได้จาก API:', data);
          }
          this.results = data;
          this.searched = true;
        },
        error: err => {
          console.error('❌ เกิดข้อผิดพลาดจาก API:', err);
          this.searched = true;
        }
      });
  }

  onReset() {
    this.criteria = {
      cusId: '',
      stockId: '',
      fname: '',
      lname: ''
    };
    this.results = [];
    this.searched = false;
  }

  activeTab = 'edit'; // ค่าเริ่มต้นให้เปิดแท็บแก้ไขข้อมูล
  homeAddress: any = {};
  currentAddress: any = {};
  provinceList: any[] = [];
  homeAumphors: any[] = [];
  homeTumbons: any[] = [];
  currentAumphors: any[] = [];
  currentTumbons: any[] = [];
  titleList: any[] = [];
  custypeList: any[] = [];
  doctypeList: any[] = [];

  editingItem: any = null;
  showModal = false;
  stockDividend: any = null;
  selectedMethod: string = '';     // account | cash | donate
  accNo: string = '';
  accName: string = '';
  selectedAccType: string = '';    // '1', '2', etc.
  selectedPayType: string = '';
  accTypeList: any[] = [];         // โหลดจาก API



  ngOnInit(): void {
    this.customerService.getAllProvince().subscribe({
      next: (data) => this.provinceList = data,
      error: (err) => console.error('❌ ดึงรายชื่อจังหวัดไม่สำเร็จ:', err)
    });

    this.customerService.getAllCustype().subscribe({
      next: (data) => this.custypeList = data,
      error: (err) => console.error('❌ ดึงประเภทลูกค้าไม่สำเร็จ:', err)
    });

    this.customerService.getAllDoctype().subscribe({
      next: (data) => this.doctypeList = data,
      error: (err) => console.error('❌ ไม่สามาดึงมูลไม่สำเร็จ:', err)
    });

    this.customerService.getAllTitle().subscribe({
      next: (data) => this.titleList = data,
      error: (err) => console.error('❌ ไม่สามารถดึงคำนำหน้าลูกค้าได้', err)
    });

    this.customerService.getAllAcctypes().subscribe({
      next: (data) => this.accTypeList = data,
      error: (err) => console.error('❌ ดึงประเภทบัญชีไม่สำเร็จ:', err)
    });

  }

  async onEdit(item: any) {
    this.editingItem = JSON.parse(JSON.stringify(item));
    const addresses = item.address || [];

    console.log("✅ addresses จาก item:", addresses);
    console.log("AccType: ", this.accTypeList);

    // 🏠 แยกที่อยู่ตามประเภท
    this.homeAddress = addresses.find((a: any) => a.addCode === 'HA') || {};
    this.currentAddress = addresses.find((a: any) => a.addCode === 'CA') || {};

    console.log("🏠 Home Address:", this.homeAddress);
    console.log("📬 Current Address:", this.currentAddress);

    // 🎯 ดึงข้อมูลปันผลล่าสุด
    this.stockDividend = item.stockDividend || null;
    if (this.stockDividend) {
      const payType = this.stockDividend.stkPayType;
      if (payType === '001') this.selectedMethod = 'account';
      else if (payType === '002') this.selectedMethod = 'cash';
      else if (payType === '003') this.selectedMethod = 'donate';
      else this.selectedMethod = ''; // fallback

      this.accNo = this.stockDividend.stkAccno || '';
      this.accName = this.stockDividend.stkAccname || '';
      this.selectedAccType = this.stockDividend?.stkAcctype || '';
      this.selectedPayType = this.stockDividend?.stkPayType || '';
    } else {
      this.selectedMethod = '';
      this.accNo = '';
      this.accName = '';
      this.selectedAccType = '';
      this.selectedPayType = '';
    }

    // 🌐 โหลดอำเภอ/ตำบล
    try {
      if (this.homeAddress.prvCode) {
        this.homeAumphors = await firstValueFrom(this.customerService.getAumphor(this.homeAddress.prvCode)) ?? [];
        if (this.homeAddress.ampCode) {
          this.homeTumbons = await firstValueFrom(this.customerService.getTumbons(this.homeAddress.prvCode, this.homeAddress.ampCode)) ?? [];
        }
      }

      if (this.currentAddress.prvCode) {
        this.currentAumphors = await firstValueFrom(this.customerService.getAumphor(this.currentAddress.prvCode)) ?? [];
        if (this.currentAddress.ampCode) {
          this.currentTumbons = await firstValueFrom(this.customerService.getTumbons(this.currentAddress.prvCode, this.currentAddress.ampCode)) ?? [];
        }
      }
    } catch (error) {
      console.error('❌ Error loading amphur/tumbon:', error);
    }

    this.showModal = true;
    this.cd.detectChanges();
  }


  loadHomeAumphor(prvCode: string) {
    this.customerService.getAumphor(prvCode).subscribe({
      next: (data) => this.homeAumphors = data
    });
  }

  loadHomeTumbon(prvCode: string, ampCode: string) {
    this.customerService.getTumbons(prvCode, ampCode).subscribe({
      next: (data) => {
        this.homeTumbons = data;
        const tmb = data.find(t => t.tmbCode === this.homeAddress.tmbCode);
        if (tmb) this.homeAddress.zipcode = tmb.zipCode;
      }
    });
  }

  updateHomeZipcode() {
    const tmb = this.homeTumbons.find(t => t.tmbCode === this.homeAddress.tmbCode);
    if (tmb) this.homeAddress.zipcode = tmb.zipCode;
  }

  loadCurrentAumphor(prvCode: string) {
    this.customerService.getAumphor(prvCode).subscribe({
      next: (data) => this.currentAumphors = data
    });
  }

  loadCurrentTumbon(prvCode: string, ampCode: string) {
    this.customerService.getTumbons(prvCode, ampCode).subscribe({
      next: (data) => {
        this.currentTumbons = data;
        const tmb = data.find(t => t.tmbCode === this.currentAddress.tmbCode);
        if (tmb) this.currentAddress.zipcode = tmb.zipCode;
      }
    });
  }

  updateCurrentZipcode() {
    const tmb = this.currentTumbons.find(t => t.tmbCode === this.currentAddress.tmbCode);
    if (tmb) this.currentAddress.zipcode = tmb.zipCode;
  }

  onCloseModal() {
    this.showModal = false;
    this.editingItem = null;
  }

  onSaveEdit() {
    if (!this.editingItem || !this.editingItem.cusiD) {
      alert("ไม่พบข้อมูลลูกค้า");
      return;
    }

    const payload = {
      customer: {
        ...this.editingItem
      },
      homeAddress: {
        ...this.homeAddress
      },
      currentAddress: {
        ...this.currentAddress
      }
    };

    this.customerService.updateCustomer(payload).subscribe({
      next: () => {
        alert("✅ บันทึกข้อมูลลูกค้าสำเร็จ");

        this.showModal = false;
        this.editingItem = null;

        // 🔁 refresh ข้อมูลใหม่หลังจาก alert
        setTimeout(() => {
          this.onSearch();
        }, 0);
      },
      error: (error) => {
        console.error("❌ บันทึกข้อมูลไม่สำเร็จ", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล\n" + (error?.error?.message || 'ไม่ทราบสาเหตุ'));
      }
    });
  }



}