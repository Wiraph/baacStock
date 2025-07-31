import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';
import { AccTypeService } from '../../../services/acc-type';
import { StockService } from '../../../services/stock';
import { CustomerService } from '../../../services/customer';
import { StockRequestService } from '../../../services/stock-request';
import thaiBaht from 'thai-baht-text'
import { combineLatest, debounceTime, distinctUntilChanged, from } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-common-shares',
  imports: [
    CommonModule,
    FormsModule,
    SearchEditComponent,
    ReactiveFormsModule
  ],
  templateUrl: './common-shares.html',
  styleUrl: './common-shares.css'
})
export class CommonSharesComponent implements OnInit {
  @Input() commonShare!: string;
  @Input() mode!: string;
  @Input() cusId!: string;
  commonShares = "common-shares";

  constructor(
    private acctypeService: AccTypeService,
    private stockService: StockService,
    private customerService: CustomerService,
    private stockRequestService: StockRequestService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
  ) { }

  private formCache: { [key: string]: any } = {};
  private isFormInitialized = false;

  customerForm!: FormGroup;
  customerData: any = null;
  activeView: string = 'search';
  editingItem: any = null;
  homeAddress: any = null;
  currentAddress: any = null;
  stockDividend: any = null;
  acctypeList: any[] = [];
  custypeList: any[] = [];
  doctypeList: any[] = [];
  stockList: any[] = [];
  titleList: any[] = [];
  prvList: any[] = [];
  ampList: any[] = [];
  tbList: any[] = [];
  accList: any[] = [];
  loading = false;
  titleOptions = '';

  setView(view: string) {
    this.activeView = view;
  }

  ngOnInit() {
    this.titleOptions = sessionStorage.getItem('brName') ?? '';
    this.initForm();
    this.setupFormListeners();
    // this.loadCustomerData();

    this.customerForm.get('stkUnit')?.valueChanges
      .pipe(
        debounceTime(800),          // ✅ หน่วง 400ms หลังจากพิมพ์
        distinctUntilChanged()      // ✅ ค่าเปลี่ยนจริงเท่านั้นถึงจะทำ
      )
      .subscribe(() => {
        this.calculateStockAmount();
      });

    this.customerForm.get('stkPrice')?.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.calculateStockAmount();
      });
  }

  onCommondSelected(stock: any) {
    console.log("ข้อมูลที่ถูกส่งมาหน้าขาย", stock);
    this.cusId = stock.cusId;
    this.loadCustomerData();
    this.activeView = 'sale-stock-common';
    this.cd.detectChanges();
  }

  calculateStockAmount(): void {
    const unit = Number(this.customerForm.get('stkUnit')?.value || 0);
    const price = Number(this.customerForm.get('stkPrice')?.value || 0);

    if (!unit || unit < 1) {
      this.customerForm.get('stkAmount')?.setValue('', { emitEvent: false });
      this.customerForm.get('txtUnit')?.setValue('', { emitEvent: false });
      this.customerForm.get('txtValue')?.setValue('', { emitEvent: false });
      alert('ไม่สามารถซื้อต่ำกว่า 1 หุ้นได้');
      return;
    }

    const amount = unit * price;

    // แปลงจำนวนหุ้นเป็นข้อความภาษาไทย
    const unitText = thaiBaht(unit).replace('บาทถ้วน', 'หุ้น');
    const amountText = thaiBaht(amount);

    this.customerForm.get('stkAmount')?.setValue(amount.toFixed(2), { emitEvent: false });
    this.customerForm.get('txtUnit')?.setValue(unitText, { emitEvent: false });
    this.customerForm.get('txtValue')?.setValue(amountText, { emitEvent: false });
    this.cd.detectChanges();
  }

  setupFormListeners() {
    this.customerForm.get('addressCa.prvCode')?.valueChanges.subscribe((prvCode) => {
      // reset ข้อมูลที่เกี่ยวข้อง
      this.customerForm.get('addressCa.ampCode')?.setValue('');
      this.customerForm.get('addressCa.tmbCode')?.setValue('');
      this.customerForm.get('addressCa.zipcode')?.setValue('');

      if (prvCode) {
        this.loadAmphorAsync(prvCode);
      }
    });

    this.customerForm.get('addressCa.ampCode')?.valueChanges.subscribe((ampCode) => {
      const prvCode = this.customerForm.get('addressCa.prvCode')?.value;

      // reset ตำบล + zipcode
      this.customerForm.get('addressCa.tmbCode')?.setValue('');
      this.customerForm.get('addressCa.zipcode')?.setValue('');

      if (ampCode && prvCode) {
        this.loadTbAsync(prvCode, ampCode);
      }
    });

    this.customerForm.get('addressCa.tmbCode')?.valueChanges.subscribe((tmbCode) => {
      if (!tmbCode) return;

      const selectedTb = this.tbList.find(tb => tb.tmbCode === tmbCode);
      if (selectedTb?.zipCode) {
        this.customerForm.get('addressCa.zipcode')?.setValue(selectedTb.zipCode);
      }
    });

    this.customerForm.get('stkUnit')?.valueChanges.subscribe((unit) => {
      const price = this.customerForm.get('stkPrice')?.value || 0;
      const value = Number(unit || 0) * Number(price);

      this.customerForm.patchValue({
        stkAmount: value.toFixed(2),
        stkValue: value
      }, { emitEvent: false });
    });

  }

  initForm() {
    this.customerForm = this.fb.group({
      cusId: ['', Validators.required],
      title: [{ value: '', disabled: true }, Validators.required],
      fname: [{ value: '', disable: true }, Validators.required],
      lname: ['', Validators.required],
      brCode: [''],
      custype: [{ value: '', disabled: true }, Validators.required],
      doctype: [{ value: '', disabled: true }],
      taxId: [''],
      totalStock: [''],
      email: [''],
      cusCodeg: [''],
      stktype: [{ value: 'A', disabled: true }, Validators.required],
      accType: [['001']],
      stkReqNo: ['', Validators.required],
      stkUnit: [0, [Validators.required, Validators.min(1)]],
      stkValue: [null, Validators.required],
      stkPrice: [100],
      stkPayType: ['', Validators.required],
      stkAmount: [{ value: '', disabled: true }],
      txtUnit: [''],
      txtValue: [''],

      addressCa: this.fb.group({
        houseno: [''],
        road: [''],
        trogSoi: [''],
        prvCode: [''],
        ampCode: [''],
        tmbCode: [''],
        zipcode: [''],
        phone: [''],
        addr1: [''],
        addr2: ['']
      }),
      addressHa: this.fb.group({
        houseno: [''],
        road: [''],
        trogSoi: [''],
        prvCode: [{ value: '', disabled: true }],
        ampCode: [{ value: '', disabled: true }],
        tmbCode: [{ value: '', disabled: true }],
        zipcode: [''],
        phone: ['']
      }),
      stockDividend: this.fb.group({
        stkNote: [''],
        stkPayType: [''],
        stkPayDesc: [''],
        stkAcctype: [{ value: '', disabled: true }],
        stkAccno: [''],
        stkAccname: [''],
        hostname: [''],
        stkNOTEo: [''],
        stkNOStart: [''],
        stkNOStop: [''],
        stkUnit: [''],
        stkValue: [''],
        stkDvnBF: [''],
        stkDvnCUR: [''],
        stkTaxBF: [''],
        stkTaxCUR: [''],
        stkDateInput: [''],
        stkDateEffect: [''],
        stkDateIssue: [''],
        stkDatePrint: [''],
        stkOwnID: [''],
        stkType: [''],
        stkPayStat: [''],
        stkReqNo: [''],
        stkSaleBy: ['', Validators.required],
        stkSaleByTRACCno: [''],
        stkSaleByTRACCname: [''],
        stkSaleByCHQno: [''],
        stkSaleByCHQdat: [''],
        stkSaleByCHQbnk: [''],
        stkSaleCHQbrn: [''],
        stkStatus: [''],
        stkRemCode: [''],
        brCode: [''],
        datetimeup: [''],
        userid: [''],
        ipaddress: [''],
      })
    });
  }

  loadCustomerData() {
    this.loading = true;

    combineLatest([
      this.customerService.getCustomerById(this.cusId),
      this.customerService.getAllTitle(),
      this.customerService.getAllCustype(),
      this.customerService.getAllDoctype(),
      this.customerService.getAllProvince(),
      this.customerService.getAllAcctypes(),
      this.stockService.getStockType(),
      this.acctypeService.getAllAccTypes(),
    ]).subscribe({
      next: async ([customer, titleList, custypeList, doctypeList, prvList, accList, stockList, acctypeList]) => {
        this.customerData = customer;
        this.titleList = titleList;
        this.custypeList = custypeList;
        this.doctypeList = doctypeList;
        this.prvList = prvList;
        this.accList = accList;
        this.stockList = stockList;
        this.acctypeList = acctypeList;
        console.log("StockList DATA:", stockList);

        // Set ข้อมูลหลักก่อน
        this.customerForm.patchValue({
          cusId: customer.cusId,
          title: customer.title,
          fname: customer.fname,
          lname: customer.lname,
          custype: customer.cusType,
          doctype: customer.docType,
          taxId: customer.taxId,
          totalStock: customer.totalStockUnit,
          email: customer.email,
          brCode: customer.brCode,
          cusCodeg: customer.cusCodeg
        });

        this.customerForm.get('stockDividend')?.patchValue({
          stkNote: customer.stockDividend?.stkNote || '',
          stkPayType: customer.stockDividend?.stkPayType || '',
          stkPayDesc: customer.stockDividend?.stkPayDesc || '',
          stkAcctype: customer.stockDividend?.stkAcctype || '',
          stkAccno: customer.stockDividend?.stkAccno || '',
          stkAccname: customer.stockDividend?.stkAccname || '',
          hostname: customer.stockDividend?.hostname || '',
          stkNOTEo: customer.stockDividend?.stkNOTEo || '',
          stkNOStart: customer.stockDividend?.stkNOStart || '',
          stkNOStop: customer.stockDividend?.stkNOStop || '',
          stkUnit: customer.stockDividend?.stkUnit || null,
          stkValue: customer.stockDividend?.stkValue || null,
          stkDvnBF: customer.stockDividend?.stkDvnBF || null,
          stkDvnCUR: customer.stockDividend?.stkDvnCUR || null,
          stkTaxBF: customer.stockDividend?.stkTaxBF || null,
          stkTaxCUR: customer.stockDividend?.stkTaxCUR || null,
          stkDateInput: customer.stockDividend?.stkDateInput || '',
          stkDateEffect: customer.stockDividend?.stkDateEffect || '',
          stkDateIssue: customer.stockDividend?.stkDateIssue || '',
          stkDatePrint: customer.stockDividend?.stkDatePrint || '',
          stkOwnID: customer.stockDividend?.stkOwnID || '',
          stkType: customer.stockDividend?.stkType || '',
          stkPayStat: customer.stockDividend?.stkPayStat || '',
          stkReqNo: customer.stockDividend?.stkReqNo || '',
          stkSaleBy: customer.stockDividend?.stkSaleBy || '',
          stkSaleByTRACCno: customer.stockDividend?.stkSaleByTRACCno || '',
          stkSaleByTRACCname: customer.stockDividend?.stkSaleByTRACCname || '',
          stkSaleByCHQno: customer.stockDividend?.stkSaleByCHQno || '',
          stkSaleByCHQdat: customer.stockDividend?.stkSaleByCHQdat || '',
          stkSaleByCHQbnk: customer.stockDividend?.stkSaleByCHQbnk || '',
          stkSaleCHQbrn: customer.stockDividend?.stkSaleCHQbrn || '',
          stkStatus: customer.stockDividend?.stkStatus || '',
          stkRemCode: customer.stockDividend?.stkRemCode || '',
          brCode: customer.stockDividend?.brCode || '',
          datetimeup: customer.stockDividend?.datetimeup || '',
          userid: customer.stockDividend?.userid || '',
          ipaddress: customer.stockDividend?.ipaddress || ''
        });



        this.isFormInitialized = true;
        console.log(this.customerForm.value);



        const addressCa = customer.address?.find((a: any) => a.addCode.toUpperCase() === 'CA');
        const addressHa = customer.address?.find((a: any) => a.addCode.toUpperCase() === 'HA');

        if (addressCa && addressCa.prvCode) {
          // โหลดอำเภอก่อน รอให้เสร็จ
          await this.loadAmphorAsync(addressCa.prvCode);

          // ถ้ามี ampCode ให้โหลดตำบล
          if (addressCa.ampCode) {
            await this.loadTbAsync(addressCa.prvCode, addressCa.ampCode);
          }

          // หลังจากโหลดข้อมูลครบแล้ว ค่อย set ค่า
          this.customerForm.get('addressCa')?.patchValue({
            houseno: addressCa.houseno,
            road: addressCa.road,
            trogSoi: addressCa.trogSoi,
            prvCode: addressCa.prvCode,
            ampCode: addressCa.ampCode,
            tmbCode: addressCa.tmbCode,
            zipcode: addressCa.zipcode,
            phone: addressCa.phone,
            addr1: addressCa.addr1,
            addr2: addressCa.addr2
          });

        }

        if (addressHa) {
          this.customerForm.get('addressHa')?.patchValue(addressHa);
        }

        this.formCache = {
          'edit': this.customerForm.value,
          'dividend': this.customerForm.value
        };


        this.isFormInitialized = true;
        this.formCache = this.customerForm.value;

        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        alert('❌ ไม่สามารถโหลดข้อมูลลูกค้าได้');
        this.loading = false;
      }
    });
  }

  loadAmphorAsync(prvCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!prvCode) {
        resolve();
        return;
      }
      this.customerService.getAumphor(prvCode).subscribe({
        next: (amphorList) => {
          this.ampList = amphorList;
          resolve();
        },
        error: (error) => {
          console.error('โหลดอำเภอไม่สำเร็จ', error);
          resolve(); // ไม่ reject เพื่อไม่ให้หยุดการทำงาน
        }
      });
    });
  }

  loadTbAsync(prvCode: string, ampCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!prvCode || !ampCode) {
        resolve();
        return;
      }
      this.customerService.getTumbons(prvCode, ampCode).subscribe({
        next: (tbsList) => {
          this.tbList = tbsList;
          resolve();
        },
        error: (error) => {
          console.error('ไม่สามารถโหลดข้อมูลตำบลได้', error);
          resolve(); // ไม่ reject เพื่อไม่ให้หยุดการทำงาน
        }
      });
    });
  }

  loadStockTypes(): void {
    this.stockService.getStockType().subscribe({
      next: (types) => {
        this.stockList = types;
      },
      error: (err) => {
        console.error('โหลดประเภทหุ้นไม่สำเร็จ', err);
      }
    });
  }

  loadAccTypes(): void {
    this.acctypeService.getAllAccTypes().subscribe({
      next: (accTypes) => {
        this.acctypeList = accTypes;
      },
      error: (err) => {
        console.error('โหดลประเภทบัญชีไม่สำเร็จ', err);
      }
    })
  }


  onEditCustomer(data: {
    editingItem: any;
    homeAddress: any;
    currentAddress: any;
    stockDividend: any;
  }) {
    this.editingItem = data.editingItem;
    this.homeAddress = data.homeAddress;
    this.currentAddress = data.currentAddress;
    this.stockDividend = data.stockDividend;
    this.activeView = 'commonStock';
  }

  submitSaleStock() {
    const stockSection = this.customerForm.get('stockDividend');
    const stkUnitValue = Number(this.customerForm.get('stkUnit')?.value);

    // ตรวจสอบว่า valid ไหม
    if (!stockSection || stockSection.invalid || !this.customerForm.get('stktype')?.value || !this.customerForm.get('stkReqNo')?.value) {
      alert('❗ กรุณากรอกข้อมูลในส่วนการซื้อหุ้นให้ครบถ้วน');
      stockSection?.markAllAsTouched();
      this.customerForm.get('stktype')?.markAsTouched();
      this.loading = false;
      return;
    }


    if (isNaN(stkUnitValue) || stkUnitValue < 1) {
      alert('❗ ไม่สามารถขายต่ำกว่า 1 หุ้นได้');
      this.loading = false;
      this.cd.detectChanges();
      return;
    }

    const form = this.customerForm.value;
    const stkSaleBys = form.stockDividend?.stkSaleBy;

    if (stkSaleBys == "TRD") {
      if (form.stockDividend?.stkSaleByTRACCno == "" || form.stockDividend?.stkSaleByTRACCname == "") {
        alert('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน');
        return
      }
    } else if (stkSaleBys == "CLD") {
      if (
        form.stockDividend?.stkSaleByCHQno == "" ||
        form.stockDividend?.stkSaleByCHQdat == "" ||
        form.stockDividend?.stkSaleByCHQbnk == "" ||
        form.stockDividend?.stkSaleCHQbrn == ""
      ) {
        alert('กรุณากรอกข้อมูลเช็คให้ครบถ้วน‼️');
        return
      }
    }


    const date = form.stockDividend?.stkSaleByCHQdat
    const dateStkSale = this.convertToThaiDateFormat(date);

    const payload = {
      stkOwnId: form.stockDividend?.stkOwnID || '',
      stkType: form.stktype || 'A',
      stkPayType: form.stockDividend?.stkPayType || '',
      stkAccNo: form.stockDividend?.stkAccno || '',
      stkAccName: form.stockDividend?.stkAccname || '',
      stkAccType: this.customerForm.get('stockDividend.stkAcctype')?.value || '',
      stkUnit: form.stkUnit || 0,
      stkValue: form.stkValue || 0,
      stkTrCode: 'CSD',
      stkTrType: 'STK',
      stkReqNo: form.stkReqNo || '',
      stkSaleByTrAccNo: form.stockDividend?.stkSaleByTRACCno || '',
      stkSaleByTrAccName: form.stockDividend?.stkSaleByTRACCname || '',
      stkSaleByChqNo: form.stockDividend?.stkSaleByCHQno || '',
      stkSaleByChqDat: form.stockDividend?.stkSaleByCHQdat || '',
      stkSaleByChqBnk: form.stockDividend?.stkSaleByCHQbnk || '',
      stkSaleChqBrn: form.stockDividend?.stkSaleCHQbrn || ''
    }

    this.stockService.saleStock(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          html: `<h2 style="font-family: 'Prompt', sans-serif;">บันทึกข้อมูลสำเร็จ</h2>`,
          confirmButtonText: 'ตกลง'
        })
      }, error: (err) => {
        console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err.error?.message || err.message || err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.error?.message || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonText: 'ตกลง'
        });
        this.loading = false;
        this.cd.detectChanges();
        return;
      }
    })
  }

  goBack(): void {

  }

  convertToThaiDateFormat(dateStr: string): string {
    const date = new Date(dateStr);
    const yearBE = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // เดือน 2 หลัก
    const day = date.getDate().toString().padStart(2, '0'); // วัน 2 หลัก

    return `${yearBE}${month}${day}`;
  }
}
