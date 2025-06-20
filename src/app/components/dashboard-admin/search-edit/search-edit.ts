import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService, CustomerSearchDto } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import { finalize, firstValueFrom } from 'rxjs';
import { StocksComponent } from '../stocks/stocks';

@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [FormsModule, CommonModule, StocksComponent],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit {

  activeView: string = 'search';

  selectedStockNotes: string[] = [];
  selectedCusId: string = '';
  selectedName: string = '';
  selectedStockList: string[] = [];
  selectedStatus: string = '';

  setView(view: string, stockNotes?: string[], cusId?: string, fullName?: string, stockList?: any[], statusDesc?: string) {
    this.activeView = view;

    this.selectedStockNotes = stockNotes ?? [];
    this.selectedCusId = cusId ?? '';
    this.selectedName = fullName ?? '';
    this.selectedStockList = stockList ?? [];
    this.selectedStatus = statusDesc ?? '';

    console.log("ttttt:",this.selectedStockNotes, this.selectedCusId, this.selectedName, this.selectedStockList, this.selectedStatus);
  }




  criteria: CustomerSearchDto = {
    cusId: '',
    fname: '',
    lname: '',
    stockId: ''
  };

  mapMethodToPayType(method: string): string {
    switch (method) {
      case 'account': return '001';
      case 'cash': return '002';
      case 'donate': return '003';
      default: return '';
    }
  }

  results: any[] = [];
  searched = false;
  loading = false;

  constructor(
    private customerService: CustomerService,
    private cd: ChangeDetectorRef
  ) { }

  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  onSearch(page: number = 1) {
    this.currentPage = page;

    this.loading = true;
    this.customerService.searchCustomer(this.criteria, page, this.pageSize)
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          console.log('🟢 Data loaded after save:', res.data);
          this.results = res.data;
          this.totalPages = res.totalPages;
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
    // 🛑 Force reset ก่อน เพื่อให้ Angular render ใหม่ แม้ object เดิม
    this.editingItem = null;
    this.showModal = false;

    setTimeout(async () => {
      this.resetForm();

      // หา item ใหม่ (ปลอดภัยกว่า)
      const freshItem = this.results.find(r => r.cusiD === item.cusiD);
      if (!freshItem) {
        alert('ไม่พบข้อมูลลูกค้าที่ต้องการแก้ไข');
        return;
      }

      // ✅ Clone ข้อมูล
      this.editingItem = {
        ...freshItem,
        address: JSON.parse(JSON.stringify(freshItem.address || [])),
        stockDividend: JSON.parse(JSON.stringify(freshItem.stockDividend || {}))
      };

      // ✅ Address
      const addresses = this.editingItem.address || [];
      this.homeAddress = addresses.find((a: any) => a.addCode === 'HA') || {};
      this.currentAddress = addresses.find((a: any) => a.addCode === 'CA') || {};

      // ✅ Dividend
      this.stockDividend = this.editingItem.stockDividend || null;
      if (this.stockDividend) {
        const payType = this.stockDividend.stkPayType;
        this.selectedMethod = payType === '001' ? 'account' :
          payType === '002' ? 'cash' :
            payType === '003' ? 'donate' : '';

        this.accNo = this.stockDividend.stkAccno || '';
        this.accName = this.stockDividend.stkAccname || '';
        this.selectedAccType = this.stockDividend.stkAcctype || '';
        this.selectedPayType = this.stockDividend.stkPayType || '';
      }

      // ✅ โหลดที่อยู่ (async)
      try {
        if (this.homeAddress.prvCode) {
          this.homeAumphors = await firstValueFrom(this.customerService.getAumphor(this.homeAddress.prvCode));
          if (this.homeAddress.ampCode) {
            this.homeTumbons = await firstValueFrom(this.customerService.getTumbons(this.homeAddress.prvCode, this.homeAddress.ampCode));
          }
        }

        if (this.currentAddress.prvCode) {
          this.currentAumphors = await firstValueFrom(this.customerService.getAumphor(this.currentAddress.prvCode));
          if (this.currentAddress.ampCode) {
            this.currentTumbons = await firstValueFrom(this.customerService.getTumbons(this.currentAddress.prvCode, this.currentAddress.ampCode));
          }
        }
      } catch (error) {
        console.error('❌ โหลดที่อยู่ล้มเหลว:', error);
      }

      // ✅ แสดง modal
      this.showModal = true;
      this.cd.detectChanges();

    }, 0); // 📌 สำคัญมาก ให้ Angular reset ก่อน
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

  saving = false;

  onSaveEdit() {

    if (this.saving) return;
    this.saving = true

    if (!this.editingItem || !this.editingItem.cusiD) {
      alert("ไม่พบข้อมูลลูกค้า");
      return;
    }

    // อัปเดตค่าที่มาจากแบบฟอร์มเงินปันผลเข้า stockDividend
    this.stockDividend = {
      ...this.stockDividend,
      stkAccno: this.accNo,
      stkAccname: this.accName,
      stkAcctype: this.selectedAccType,
      stkPayType: this.mapMethodToPayType(this.selectedMethod)
    };

    const payload = {
      customer: {
        ...this.editingItem
      },
      homeAddress: {
        ...this.homeAddress
      },
      currentAddress: {
        ...this.currentAddress
      },
      stockDividend: {
        ...this.stockDividend
      }
    };

    this.customerService.updateCustomer(payload).subscribe({
      next: () => {
        alert("✅ บันทึกข้อมูลลูกค้าสำเร็จ");

        this.showModal = false;
        this.editingItem = null;
        this.resetForm();
        this.saving = false;

        // 🔁 refresh ข้อมูลใหม่หลังจาก alert
        setTimeout(() => {
          this.onSearch();
        }, 0);
      },
      error: (error) => {
        console.error("❌ บันทึกข้อมูลไม่สำเร็จ", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล\n" + (error?.error?.message || 'ไม่ทราบสาเหตุ'));
        this.saving = false;
      }
    });
  }

  resetForm() {
    this.editingItem = null;
    this.homeAddress = {};
    this.currentAddress = {};
    this.stockDividend = null;
    this.selectedMethod = '';
    this.accNo = '';
    this.accName = '';
    this.selectedAccType = '';
    this.selectedPayType = '';
    this.homeAumphors = [];
    this.homeTumbons = [];
    this.currentAumphors = [];
    this.currentTumbons = [];
  }



}