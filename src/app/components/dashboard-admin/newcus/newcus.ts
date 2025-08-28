import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTransfer } from '../../../services/data-transfer';
import { CustomerService } from '../../../services/customer';
import { MatTabsModule } from '@angular/material/tabs';
import { MetadataService } from '../../../services/metadata';
import { AddressService, AddressDto } from '../../../services/address';
import { of, forkJoin } from 'rxjs';
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { Divident } from '../../../services/divident';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import { Thaidateadapter } from '../../thaidateadapter/thaidateadapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import ThaiBahtText from 'thai-baht-text';
import { StockService } from '../../../services/stock';
import { JwtDecoder } from '../../../services/jwt-decoder';

export const THAI_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-newcus',
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newcus.html',
  styleUrl: './newcus.css',
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ]
})
export class NewCusComponent implements OnInit, AfterViewInit {
  @Input() mode: string = '';
  @Input() idCard: string = '';
  @Output() back = new EventEmitter<string>();
  readonly startDate = new Date();
  selectedDate?: Date;
  activeView = 'search';
  loading = false;
  cusId = '';
  customer: any = {};
  unit: number = 0;
  homeAddress!: AddressDto;
  currentAddress!: AddressDto;
  zipCodeHome: string = '';
  zipCodeCurrent: string = '';
  dividendData: any = { payDESC: '', stkPayType: '', stkACCno: '', stkACCname: '' };
  pricePerUnit: any;
  unitText: string = "";
  valueText: string = "";
  prvData: any[] = [];
  ampData: any[] = [];
  tumbonData: any[] = [];
  titleList: any[] = [];
  custypeList: any[] = [];
  doctypeList: any[] = [];
  ampDataHome: any[] = [];
  ampDataCurrent: any[] = [];
  tumbonDataHome: any[] = [];
  tumbonDataCurrent: any[] = [];
  actypeList: any[] = [];
  stkTypeList: any[] = [];
  res: any[] = [];
  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly customerService: CustomerService,
    private readonly metadataService: MetadataService,
    private readonly cd: ChangeDetectorRef,
    private readonly addressService: AddressService,
    private readonly dividend: Divident,
    private readonly fb: FormBuilder,
    private readonly stockService: StockService,
    private readonly jwtDecoder: JwtDecoder
  ) { }

  ngOnInit(): void {
    console.log("ค่าที่ได้รับจาก parent", this.idCard);
    console.log("Mode:", this.mode);

    // ตั้งค่าเริ่มต้นสำหรับ pricePerUnit และ address
    this.pricePerUnit = { stkBv: 0 };
    this.homeAddress = this.addressService.getDefaultAddress();
    this.currentAddress = this.addressService.getDefaultAddress();

    this.customerForm = this.fb.group({
      customer: this.fb.group({
        cusCODE: [''],
        cusDESC: [''],
        cusCODEg: [''],
        cusDESCgABBR: [''],
        docTYPE: [''],
        cusiD: [''],
        brCode: [''],
        cusTAXid: [''],
        cusFName: [''],
        cusLName: [''],
        unit: [''],
        titleCode: [''],
        phonE_MOBILE: [''],
        email: ['']
      }),
      homeAddress: this.fb.group({
        housEno: [''],
        troG_SOI: [''],
        road: [''],
        prvCODE: [''],
        ampCODE: [''],
        tmbCODE: [''],
        phone: [''],
        zipcodeHome: ['']
      }),
      currentAddress: this.fb.group({
        housEno: [''],
        troG_SOI: [''],
        road: [''],
        prvCODE: [''],
        ampCODE: [''],
        tmbCODE: [''],
        phone: [''],
        zipcodeCurrent: [''],
        addR1: [''],
        addR2: ['']
      }),
      dividend: this.fb.group({
        stkPayType: [''],
        dividendStkPayType: [''],
        stkACCno: [''],
        stkACCname: [''],
        stkACCtype: ['']
      }),
      detailSale: this.fb.group({
        stkTYPE: ['A'],
        stkPayTypeDetail: [''],
        sktACCno: [''],
        stkACCname: [''],
        stkACCtype: ['001'],
        stkUNiT: [''],
        stkValue: [''],
        stkTRCode: [''],
        stkTRType: [''],
        stkReqNo: [''],
        stkSaleByTRACCno: [''],
        stkSaleByTRACCname: [''],
        stkSaleByCHQno: [''],
        stkSaleByCHQdat: [''],
        stkSaleByCHQbnk: [''],
        stkSaleByCHQbrn: [''],
      })
    });

    console.log('🔍 customerForm created:', this.customerForm);
    console.log('🔍 cusiD control exists:', !!this.customerForm.get('customer.cusiD'));
    console.log('🔍 cusiD initial value:', this.customerForm.get('customer.cusiD')?.value);

    // ตรวจสอบและตั้งค่าสำหรับ new-shareholder mode
    if (this.mode === 'new-shareholder' && this.idCard) {
      console.log('🎯 Setting up new shareholder form with ID:', this.idCard);
      this.activeView = 'sale';

      // ตั้งค่าเลขบัตรในฟอร์ม
      this.customerForm.patchValue({
        customer: {
          cusiD: this.idCard
        }
      });

      // โหลด metadata และ initialize form หลังจาก metadata โหลดเสร็จ
      this.loadInitialMetadata();
    } else {
      this.loadInitialMetadata();
    }

    this.metadataService.getSyscfg().subscribe({
      next: (res: any) => {
        this.pricePerUnit = res || { stkBv: 0 };
        this.cd.detectChanges();
      },
      error: (err) => {
        this.pricePerUnit = { stkBv: 0 };
        this.cd.detectChanges();
      }
    });

    // Initialize form control states
    this.updateFormControlStates();

    // Subscribe to form value changes to update control states
    this.customerForm.get('detailSale.stkPayTypeDetail')?.valueChanges.subscribe(() => {
      this.updateFormControlStates();
    });

    this.customerForm.get('dividend.dividendStkPayType')?.valueChanges.subscribe(() => {
      this.updateFormControlStates();
    });

    // Subscribe to form value changes to reset validation state
    this.setupFormValidationReset();
  }

  loadInitialMetadata() {
    const metadataCalls = [
      { service: this.metadataService.getProvince(), setter: (res: any) => this.prvData = res },
      { service: this.metadataService.getTitle(), setter: (res: any) => this.titleList = res },
      { service: this.metadataService.getCustype(), setter: (res: any) => this.custypeList = res },
      { service: this.metadataService.getDoctype(), setter: (res: any) => this.doctypeList = res },
      { service: this.metadataService.getAcctypes(), setter: (res: any) => this.actypeList = res },
      { service: this.metadataService.getStaTypes(), setter: (res: any) => this.stkTypeList = res }
    ];

    // ใช้ forkJoin เพื่อรอให้ metadata ทั้งหมดโหลดเสร็จ
    forkJoin(metadataCalls.map(({ service }) => service)).subscribe({
      next: (results) => {
        console.log('📊 Metadata loaded successfully');
        // ตั้งค่าข้อมูล metadata
        results.forEach((res, index) => {
          metadataCalls[index].setter(res);
        });

        // ถ้าเป็น new-shareholder mode ให้ initialize form หลังจาก metadata โหลดเสร็จ
        if (this.mode === 'new-shareholder' && this.idCard) {
          console.log('🎯 Metadata loaded, now initializing new shareholder form');
          this.initializeNewShareholderForm();
        }

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌ Load metadata failed:', err);
        this.cd.detectChanges();
      }
    });
  }

  initializeNewShareholderForm() {
    console.log('🔧 Initializing new shareholder form...');
    console.log('🔧 custypeList length:', this.custypeList.length);
    console.log('🔧 idCard:', this.idCard);

    if (this.customerForm && this.idCard) {
      // หาข้อมูลประเภทลูกค้าเริ่มต้น (001)
      const defaultCustype = this.custypeList.find(item => item.cusCode === '001');
      console.log('🔧 defaultCustype:', defaultCustype);

      const formData = {
        customer: {
          cusCODE: '001',
          cusCODEg: defaultCustype?.cusCodeg || '',
          cusDESCgABBR: defaultCustype?.cusDesc || '',
          cusiD: this.idCard, // ตั้งค่าเลขบัตรที่ได้รับจาก parent
          brCode: 'NEW',
          unit: '0'
        },
        dividend: {
          stkACCtype: '001'
        }
      };

      console.log('🔧 Setting form data:', formData);
      this.customerForm.patchValue(formData);

      // Disable fields that should not be editable for new shareholders
      this.customerForm.get('customer.cusiD')?.disable();
      this.customerForm.get('customer.brCode')?.disable();
      this.customerForm.get('customer.unit')?.disable();
      this.customerForm.get('detailSale.stkTYPE')?.disable();
      this.customerForm.get('detailSale.stkACCtype')?.disable();
      this.customerForm.get('dividend.stkACCtype')?.disable();

      // Initialize form control states
      this.updateFormControlStates();

      console.log('🔧 Form initialized successfully');
      this.cd.detectChanges();
    } else {
      console.error('❌ Cannot initialize form: customerForm or idCard is missing');
      console.log('customerForm exists:', !!this.customerForm);
      console.log('idCard:', this.idCard);
    }
  }



  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงประเภทลูกค้า (เฉพาะโหมด new-shareholder)
  onCustypeChange(event: any) {
    if (this.mode === 'new-shareholder') {
      const selectedCusCode = event.target.value;
      const selectedCustype = this.custypeList.find(item => item.cusCode === selectedCusCode);

      if (selectedCustype) {
        // อัปเดตประเภทผู้ถือหุ้นตามประเภทลูกค้าที่เลือก
        this.customerForm.patchValue({
          customer: {
            cusCODEg: selectedCustype.cusCodeg || '',
            cusDESCgABBR: selectedCustype.cusDesc || ''
          }
        });
        this.cd.detectChanges();
      }
    }
  }

  // ฟังก์ชันสำหรับตรวจสอบวิธีการชำระเงิน
  getPaymentMethod(): string {
    return this.customerForm?.get('detailSale.stkPayTypeDetail')?.value || '';
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรเป็นสีเทาหรือไม่
  shouldBeGrayedOut(fieldType: string): boolean {
    const paymentMethod = this.getPaymentMethod();

    if (fieldType === 'bankTransfer' && paymentMethod !== '001') {
      return true; // ช่องโอนจากบัญชีควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    if (fieldType === 'cheque' && paymentMethod !== '004') {
      return true; // ช่องเช็คควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    return false;
  }

  // ฟังก์ชันสำหรับตรวจสอบวิธีการรับเงินปันผล
  getDividendPaymentMethod(): string {
    return this.customerForm?.get('dividend.dividendStkPayType')?.value || '';
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรเป็นสีเทาหรือไม่สำหรับรับเงินปันผล
  shouldBeGrayedOutDividend(fieldType: string): boolean {
    const dividendMethod = this.getDividendPaymentMethod();

    if (fieldType === 'bankAccount' && dividendMethod !== '001') {
      return true; // ช่องบัญชีเงินฝากควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    return false;
  }

  // ฟังก์ชันสำหรับจัดการ disabled state ของ form controls
  updateFormControlStates() {
    const paymentMethod = this.getPaymentMethod();
    const dividendMethod = this.getDividendPaymentMethod();

    // Payment method controls
    if (paymentMethod === '001') {
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.enable();
    } else {
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.disable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.disable();
    }

    if (paymentMethod === '004') {
      this.customerForm.get('detailSale.stkSaleByCHQno')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.enable();
    } else {
      this.customerForm.get('detailSale.stkSaleByCHQno')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.disable();
    }

    // Dividend method controls
    if (dividendMethod === '001') {
      this.customerForm.get('dividend.stkACCno')?.enable();
      this.customerForm.get('dividend.stkACCname')?.enable();
    } else {
      this.customerForm.get('dividend.stkACCno')?.disable();
      this.customerForm.get('dividend.stkACCname')?.disable();
    }

    // For new shareholders, always disable the account type field
    if (this.mode === 'new-shareholder') {
      this.customerForm.get('dividend.stkACCtype')?.disable();
    }
  }

  ngAfterViewInit(): void {
    function toThaiYear(date: Date): Date {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + 543);
      return d;
    }

    flatpickr("#thaiDateInput", {
      locale: Thai,
      dateFormat: "d F Y",
      altInput: true,
      altFormat: "d F Y",
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
          const thaiDate = toThaiYear(selectedDates[0]);
          instance.input.value = thaiDate.getDate() + " " + Thai.months.longhand[thaiDate.getMonth()] + " " + thaiDate.getFullYear();
        }
      },
      formatDate: function (date, format, locale) {
        const thaiYearDate = toThaiYear(date);
        return `${thaiYearDate.getDate()} ${locale.months.longhand[thaiYearDate.getMonth()]} ${thaiYearDate.getFullYear()}`;
      }
    });
  }

  handleData(event: { view: string; cusId: string }) {
    this.homeAddress = this.addressService.getDefaultAddress();
    this.currentAddress = this.addressService.getDefaultAddress();
    this.zipCodeHome = '';
    this.zipCodeCurrent = '';
    this.activeView = event.view;
    this.loading = true;
    this.cusId = event.cusId;

    if (!this.cusId) return;

    const requestPayload = { cusId: this.cusId };

    forkJoin({
      customer: this.customerService.getCustomer(requestPayload).pipe(
        catchError(err => {
          console.error("Customer service error:", err);
          return of(null);
        })
      ),
      address: this.addressService.getAddress(requestPayload).pipe(
        catchError(err => {
          console.error("Address service error:", err);
          return of({ homeAddress: null, currentAddress: null });
        })
      ),
      dividend: this.dividend.getDividend(requestPayload),
      provinces: this.metadataService.getProvince(),
      titles: this.metadataService.getTitle(),
      custypes: this.metadataService.getCustype(),
      doctypes: this.metadataService.getDoctype(),
      acctypes: this.metadataService.getAcctypes(),
      stktypes: this.metadataService.getStaTypes(),
    })
      .pipe(
        switchMap((res) => {
          this.customer = (res.customer as any)?.customer || {};
          this.unit = (res.customer as any)?.unit || 0;

          if (res.address && (res.address.homeAddress || res.address.currentAddress)) {
            this.homeAddress = res.address.homeAddress;
            this.currentAddress = res.address.currentAddress;
          }

          this.dividendData = res.dividend || {
            payDESC: '', stkPayType: '', stkACCno: '', stkACCname: '', stkACCtype: ''
          };

          this.prvData = res.provinces;
          this.titleList = res.titles;
          this.custypeList = res.custypes;
          this.doctypeList = res.doctypes;
          this.actypeList = res.acctypes;
          this.stkTypeList = res.stktypes;

          this.populateCustomerForm();
          this.populateAddressForm();
          this.cd.detectChanges();

          return this.loadInitialAddressDataObservable();
        }),
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => { },
        error: (err) => {
          console.error("โหลดข้อมูลผิดพลาด", err);
          this.loading = false;
        }
      });
  }

  populateCustomerForm() {
    if (this.customer) {
      const customerFormData = {
        cusCODE: this.customer.cusCODE || '',
        cusDESC: this.customer.cusDESCg || '',
        cusCODEg: this.customer.cusCODEg || '',
        cusDESCgABBR: this.customer.cusDESCgABBR || '',
        docTYPE: this.customer.docTYPE || '',
        cusiD: this.customer.cusiD || '',
        brCode: this.customer.brCode || '',
        cusTAXid: this.customer.cusTAXid || '',
        cusFName: this.customer.cusFName || '',
        cusLName: this.customer.cusLName || '',
        unit: this.unit || '0',
        titleCode: this.customer.titleCode || '',
        email: this.customer.email || '',
        phonE_MOBILE: this.customer.phonE_MOBILE || ''
      };

      this.customerForm.patchValue({
        customer: customerFormData,
        dividend: {
          stkPayType: this.dividendData?.stkPayType || '',
          dividendStkPayType: this.dividendData?.stkPayType || '',
          stkACCno: this.dividendData?.stkACCno || '',
          stkACCname: this.dividendData?.stkACCname || '',
          stkACCtype: this.dividendData?.stkACCtype || ''
        }
      });
      this.cd.detectChanges();
    }
  }

  populateAddressForm() {
    if (!this.homeAddress && !this.currentAddress) return;
    const homeAddressData = {
      housEno: this.homeAddress?.housEno || '',
      troG_SOI: this.homeAddress?.troG_SOI || '',
      road: this.homeAddress?.road || '',
      prvCODE: this.homeAddress?.prvCODE || '',
      ampCODE: this.homeAddress?.ampCODE || '',
      tmbCODE: this.homeAddress?.tmbCODE || '',
      phone: this.homeAddress?.phone || '',
      zipcodeHome: this.homeAddress?.zipcode || ''
    };

    const currentAddressData = {
      housEno: this.currentAddress?.housEno || '',
      troG_SOI: this.currentAddress?.troG_SOI || '',
      road: this.currentAddress?.road || '',
      prvCODE: this.currentAddress?.prvCODE || '',
      ampCODE: this.currentAddress?.ampCODE || '',
      tmbCODE: this.currentAddress?.tmbCODE || '',
      phone: this.currentAddress?.phone || '',
      zipcodeCurrent: this.currentAddress?.zipcode || '',
      addR1: this.currentAddress?.addR1 || '',
      addR2: this.currentAddress?.addR2 || ''
    };

    this.customerForm.patchValue({
      homeAddress: homeAddressData,
      currentAddress: currentAddressData
    });

    this.zipCodeHome = this.homeAddress?.zipcode || '';
    this.zipCodeCurrent = this.currentAddress?.zipcode || '';

    if (this.homeAddress?.prvCODE && this.homeAddress?.ampCODE && this.homeAddress?.tmbCODE) {
      this.updateHomeZipcode();
    }
    if (this.currentAddress?.prvCODE && this.currentAddress?.ampCODE && this.currentAddress?.tmbCODE) {
      this.updateCurrentZipcode();
    }

    this.cd.detectChanges();
  }

  updateHomeZipcode() {
    if (this.homeAddress?.zipcode) {
      this.zipCodeHome = this.homeAddress.zipcode;
    } else if (this.homeAddress && this.tumbonDataHome?.length > 0) {
      const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
      this.zipCodeHome = zip;
    }
  }

  updateCurrentZipcode() {
    if (this.currentAddress?.zipcode) {
      this.zipCodeCurrent = this.currentAddress.zipcode;
    } else if (this.currentAddress && this.tumbonDataCurrent?.length > 0) {
      const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
      this.zipCodeCurrent = zip;
    }
  }

  onProvinceChangeHome(prvCode: string, isFormMode = false) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        this.ampDataHome = res;
        this.tumbonDataHome = [];
        if (!isFormMode) {
          this.homeAddress.ampCODE = '';
          this.homeAddress.tmbCODE = '';
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onProvinceChangeHomeForm = (prvCode: string) => this.onProvinceChangeHome(prvCode, true);

  onZipcodeChangeHome(prvCode: string, ampCode: string, tmbCode: string): string {
    const zip = this.tumbonDataHome.find(z =>
      z.prvCode == prvCode && z.ampCode == ampCode && z.tmbCode == tmbCode
    )?.zipCode || '';

    this.zipCodeHome = zip;
    this.customerForm.patchValue({ homeAddress: { zipcodeHome: zip } });
    this.cd.detectChanges();
    return zip;
  }

  onAumphorChangeHome(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => { this.tumbonDataHome = res; this.cd.detectChanges(); },
      error: (err) => { this.tumbonDataHome = []; this.cd.detectChanges(); }
    });
  }

  onAumphorChangeHomeForm = (prvCode: string, ampCode: string) => this.onAumphorChangeHome(prvCode, ampCode);

  onProvinceChangeCurrent(prvCode: string, isFormMode = false) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        this.ampDataCurrent = res;
        this.tumbonDataCurrent = [];
        if (!isFormMode) {
          this.currentAddress.ampCODE = '';
          this.currentAddress.tmbCODE = '';
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onProvinceChangeCurrentForm = (prvCode: string) => this.onProvinceChangeCurrent(prvCode, true);

  onAumphorChangeCurrent(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => { this.tumbonDataCurrent = res; this.cd.detectChanges(); },
      error: (err) => { this.tumbonDataCurrent = []; this.cd.detectChanges(); }
    });
  }

  onAumphorChangeCurrentForm = (prvCode: string, ampCode: string) => this.onAumphorChangeCurrent(prvCode, ampCode);

  onZipcodeChangeCurrent(prvCode: string, ampCode: string, tmbCode: string) {
    const zip = this.tumbonDataCurrent.find(z =>
      z.prvCode == prvCode && z.ampCode == ampCode && z.tmbCode == tmbCode
    )?.zipCode || '';

    this.zipCodeCurrent = zip;
    this.customerForm.patchValue({ currentAddress: { zipcodeCurrent: zip } });
    this.cd.detectChanges();
    return zip;
  }

  onZipcodeChangeHomeForm = (prvCode: string, ampCode: string, tmbCode: string): string =>
    this.onZipcodeChangeHome(prvCode, ampCode, tmbCode);

  onZipcodeChangeCurrentForm = (prvCode: string, ampCode: string, tmbCode: string): string =>
    this.onZipcodeChangeCurrent(prvCode, ampCode, tmbCode);

  loadInitialAddressDataObservable() {
    const tasks = [];

    if (this.homeAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.homeAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            this.ampDataHome = ampRes;
            this.cd.detectChanges();

            if (this.homeAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.homeAddress.prvCODE, this.homeAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  this.tumbonDataHome = tumbonRes;
                  const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
                  if (zip) {
                    this.customerForm.get('homeAddress.zipcodeHome')?.patchValue(zip);
                  }
                  this.cd.detectChanges();
                  return of(true);
                })
              );
            }
            return of(true);
          })
        )
      );
    }

    if (this.currentAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.currentAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            this.ampDataCurrent = ampRes;
            this.cd.detectChanges();

            if (this.currentAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.currentAddress.prvCODE, this.currentAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  this.tumbonDataCurrent = tumbonRes;
                  const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
                  if (zip) {
                    this.customerForm.get('currentAddress.zipcodeCurrent')?.patchValue(zip);
                  }
                  this.cd.detectChanges();
                  return of(true);
                })
              );
            }
            return of(true);
          })
        )
      );
    }

    return forkJoin(tasks.length ? tasks : [of(true)]);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
    if (!submitter) return;

    // ตั้งค่า formSubmitted เป็น true เพื่อแสดง red border
    this.formSubmitted = true;

    // ตรวจสอบข้อมูลที่จำเป็น
    const validation = this.validateRequiredFields();

    if (!validation.isValid) {
      // แสดง alert ข้อมูลไม่ครบ
      this.showIncompleteDataAlert(validation.emptyFields);
      this.cd.detectChanges(); // อัปเดต UI เพื่อแสดง red border
      return;
    }

    if (this.mode === 'new-shareholder') {
      this.submitNewShareholder(submitter.value);
    } else {
      this.submitExistingCustomer();
    }
  }

  submitNewShareholder(action: string) {
    const formData = this.customerForm.getRawValue();
    const customerData = formData.customer;
    const homeAddressData = formData.homeAddress;
    const currentAddressData = formData.currentAddress;
    const dividendData = formData.dividend;
    const detailSale = formData.detailSale;
    const decoder = this.jwtDecoder.decodeToken(String(sessionStorage.getItem('token')));

    const customerPayload = {
      CUSidO: null,
      CUSid: customerData.cusiD,
      CUStax: customerData.cusTAXid,
      CUSTt: customerData.titleCode,
      CUSfn: customerData.cusFName,
      CUSln: customerData.cusLName,
      CUSTy: customerData.cusCODE,
      CUSTg: customerData.cusCODEg,
      docTY: customerData.docTYPE,
      STC: 'C000',
      BRC: decoder.BrCode,
      CUSphone: customerData.phonE_MOBILE || '',
      CUSemail: customerData.email || '',

      // ที่อยู่ปัจจุบัน (Current Address - CA)
      AddCA0: currentAddressData.housEno || '',
      AddCA1: currentAddressData?.troG_SOI || '', AddCA2: currentAddressData?.road || '', // ถนน
      AddCA3: currentAddressData?.zipcodeCurrent || '', // รหัสไปรษณีย์
      AddCA4: currentAddressData?.phone || '', // เบอร์โทรศัพท์
      AddCA00: currentAddressData?.prvCODE || '', // รหัสจังหวัด
      AddCA01: currentAddressData?.ampCODE || '', // รหัสอำเภอ
      AddCA02: currentAddressData?.tmbCODE || '', // รหัสตำบล

      // ที่อยู่ตามทะเบียนบ้าน (Home Address - HA)
      AddHA0: homeAddressData?.housEno || '', // บ้านเลขที่
      AddHA1: homeAddressData?.troG_SOI || '', // ซอย
      AddHA2: homeAddressData?.road || '', // ถนน
      AddHA3: homeAddressData?.zipcodeHome || '', // รหัสไปรษณีย์
      AddHA4: homeAddressData?.phone || '', // เบอร์โทรศัพท์
      AddHA00: homeAddressData?.prvCODE || '', // รหัสจังหวัด
      AddHA01: homeAddressData?.ampCODE || '', // รหัสอำเภอ
      AddHA02: homeAddressData?.tmbCODE || '', // รหัสตำบล

      // ข้อมูลเงินปันผล
      stkPayType: dividendData?.dividendStkPayType || '', // ประเภทการจ่ายเงินปันผล
      stkACCno: dividendData?.stkACCno || '', // เลขบัญชี
      stkACCname: dividendData?.stkACCname || '', // ชื่อบัญชี
      stkACCtype: dividendData?.stkACCtype || '', // ประเภทบัญชี 

      unit: this.unit || customerData?.unit || 0, // จำนวนหุ้น

      // ข้อมูลระบบ
      USR: '', // User ID (ต้องใส่จาก session/auth)
      IP: '', // IP Address (ต้องใส่จาก browser/server)
      HOST: '', // Host name (ต้องใส่จาก browser/server)
      ACT: action // Action type
    };
    let stkTRCode = '';
    switch (detailSale?.stkPayTypeDetail) {
      case '001':
        stkTRCode = 'CSD';
        break;
      case '002':
        stkTRCode = 'TRD';
        break;
      case '004':
        stkTRCode = 'CLD';
        break;
    }
    const formattedDate = this.convertDateToBuddhistFormat(detailSale?.stkSaleByCHQdat);


    console.log("ข้อมูลที่เตรียมจะส่งของ Customer", customerPayload);
    this.loading = true;

    this.customerService.postUpdateCustomer(customerPayload).subscribe({
      next: (response: any) => {
        this.loading = false;
        const messageCustomer = response;
        console.log("Response from createNewShareholder:", messageCustomer);
        if (action === 'REG') {
          const stkPayload = {
            stkOWNiD: customerData.cusiD,
            stkTYPE: "A",
            stkPayType: dividendData?.dividendStkPayType || '',
            stkACCno: dividendData?.stkACCno || '',
            stkACCname: dividendData?.stkACCname || '',
            stkACCtype: dividendData?.stkACCtype || '',
            stkUNiT: Number(detailSale?.stkUNiT) || 0,
            stkValue: detailSale?.stkValue ? Number(detailSale.stkValue.replace(/,/g, '')) : 0,
            stkTRCode: stkTRCode,
            stkTRType: 'STK',
            stkReqNo: detailSale?.stkReqNo || '',
            stkSaleByTRACCno: detailSale?.stkSaleByTRACCno || '',
            stkSaleByTRACCname: detailSale?.stkSaleByTRACCname || '',
            stkSaleByCHQno: detailSale?.stkSaleByCHQno || '',
            stkSaleByCHQdat: formattedDate || '',
            stkSaleByCHQbnk: detailSale?.stkSaleByCHQbnk || '',
            stkSaleByCHQbrn: detailSale?.stkSaleByCHQbrn || '',
          }
          console.log("ข้อมูลที่เตรียมจะส่งของ Stock", stkPayload);
          this.stockService.stockManage(stkPayload).subscribe({
            next: (response: any) => {
              this.res = response;
              this.loading = false;
              // โหลดข้อมูลใหม่ทันที
              // this.reloadCustomerData();
              // แสดง SweetAlert บันทึกสำเร็จ
              if (this.res[0].RST === "PASS") {
                Swal.fire({
                  icon: 'success',
                  title: 'สำเร็จ!',
                  html: `
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[1].RST} : ${this.res[1].errLine}${this.res[1].errNumber}${this.res[1].errSeverity}${this.res[1].errState} : ${this.res[1].MSG}</p>
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
                  `,
                  confirmButtonText: 'ตกลง',
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.loading = false;
                    this.goBack();
                    this.cd.detectChanges();
                  }
                });
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'ไม่สำเร็จ!',
                  html: `
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
                  `,
                  confirmButtonText: 'ตกลง',
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.loading = false;
                    this.cd.detectChanges();
                  }
                });
              }
              this.activeView = 'search';
              this.cd.detectChanges();
            },
            error: (error) => {
              console.error("Update failed:", error);
              this.loading = false;
              // แสดง SweetAlert เมื่อเกิดข้อผิดพลาด
              Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: "ไม่สามารถอัปเดตข้อมูลได้",
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#dc3545',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  this.loading = false;
                  this.cd.detectChanges();
                }
              })
            }
          })
        }
      },
      error: (error: any) => {
        console.error('Create new shareholder failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: error.error?.message || 'ไม่สามารถสร้างผู้ถือหุ้นใหม่ได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            this.loading = false;
            this.cd.detectChanges();
          }
        })
      }
    });
  }

  submitExistingCustomer() {
    const dividendData = this.customerForm.get('dividend')?.value;
    const detailSale = this.customerForm.get('detailSale')?.value;
    const formattedDate = this.convertDateToBuddhistFormat(detailSale?.stkSaleByCHQdat);

    const requestPayload = {
      stkOWNiD: this.cusId,
      stkTYPE: "A",
      stkPayType: detailSale?.stkPayTypeDetail || '',
      sktACCno: dividendData?.stkACCno || '',
      stkACCname: dividendData?.stkACCname || '',
      stkACCtype: dividendData?.stkACCtype || '',
      stkUNiT: detailSale?.stkUNiT || 0,
      stkValue: detailSale?.stkValue || 0,
      stkTRCode: "CSD",
      stkTRType: "STK",
      stkReqNo: detailSale?.stkReqNo || '',
      stkSaleByTRACCno: detailSale?.stkSaleByTRACCno || '',
      stkSaleByTRACCname: detailSale?.stkSaleByTRACCname || '',
      stkSaleByCHQno: detailSale?.stkSaleByCHQno || '',
      stkSaleByCHQdat: formattedDate || '',
      stkSaleByCHQbnk: detailSale?.stkSaleByCHQbnk || '',
      stkSaleByCHQbrn: detailSale?.stkSaleByCHQbrn || '',
    };

    requestPayload.stkValue = detailSale?.stkValue.replace(/,/g, '');
    requestPayload.stkUNiT = Number(requestPayload.stkUNiT);
    requestPayload.stkValue = Number(requestPayload.stkValue);

    this.loading = true;

    this.stockService.stockManage(requestPayload).subscribe({
      next: (response: any) => {
        this.res = response;
        this.loading = false;
        // โหลดข้อมูลใหม่ทันที
        // this.reloadCustomerData();
        // แสดง SweetAlert บันทึกสำเร็จ
        if (this.res[0].RST === "PASS") {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            html: `
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[1].RST} : ${this.res[1].errLine}${this.res[1].errNumber}${this.res[1].errSeverity}${this.res[1].errState} : ${this.res[1].MSG}</p>
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
                  `,
            confirmButtonText: 'ตกลง',
          }).then((result) => {
            if (result.isConfirmed) {
              this.loading = false;
              this.goBack();
              this.cd.detectChanges();
            }
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'ไม่สำเร็จ!',
            html: `
                  <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
                  `,
            confirmButtonText: 'ตกลง',
          }).then((result) => {
            if (result.isConfirmed) {
              this.loading = false;
              this.cd.detectChanges();
            }
          });
        }
        this.activeView = 'search';
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error("Update failed:", error);
        this.loading = false;
        // แสดง SweetAlert เมื่อเกิดข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: "ไม่สามารถอัปเดตข้อมูลได้",
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#dc3545',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.loading = false;
            this.cd.detectChanges();
          }
        })
      }
    });
  }

  convertDateToBuddhistFormat(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear() + 543;
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}${month}${day}`;
  }

  onUnitInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numericString = input.value.replace(/\D/g, '');
    const numericValue = numericString ? Number(numericString) : 0;

    if (!numericValue) {
      this.unitText = '';
      this.valueText = '';
      this.customerForm.patchValue({
        detailSale: { stkValue: '' }
      }, { emitEvent: false });
      return;
    }

    input.value = numericValue.toLocaleString('en-US');

    // ตรวจสอบว่า pricePerUnit มีค่าหรือไม่
    if (!this.pricePerUnit?.stkBv) return;

    const stkValue = numericValue * this.pricePerUnit.stkBv;

    this.customerForm.patchValue({
      detailSale: { stkValue: stkValue.toLocaleString('en-US') }
    }, { emitEvent: false });

    this.valueText = ThaiBahtText(stkValue.toString());
    this.unitText = ThaiBahtText(numericValue.toString()).replace('บาทถ้วน', 'หุ้น');
    this.cd.detectChanges();
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าฟิลด์ว่างเปล่าหรือไม่
  isFieldEmpty(fieldPath: string): boolean {
    const value = this.customerForm.get(fieldPath)?.value;
    return !value || value.toString().trim() === '';
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรแสดง border สีแดงหรือไม่
  noData(fieldPath: string): boolean {
    return this.isFieldEmpty(fieldPath) && this.formSubmitted;
  }

  // ฟังก์ชันสำหรับตรวจสอบข้อมูลที่จำเป็น
  validateRequiredFields(): { isValid: boolean; emptyFields: string[] } {
    const requiredFields = this.getRequiredFields();
    const emptyFields: string[] = [];

    requiredFields.forEach(field => {
      if (this.isFieldEmpty(field.path)) {
        emptyFields.push(field.label);
      }
    });

    return {
      isValid: emptyFields.length === 0,
      emptyFields: emptyFields
    };
  }

  // ฟังก์ชันสำหรับกำหนดฟิลด์ที่จำเป็นตาม mode
  getRequiredFields(): Array<{ path: string; label: string }> {
    const baseFields = [
      { path: 'customer.cusFName', label: 'ชื่อ' },
      { path: 'customer.cusLName', label: 'นามสกุล' },
      { path: 'customer.cusiD', label: 'เลขที่บัตรแสดงตน' }
    ];

    if (this.mode === 'new-shareholder') {
      return [
        ...baseFields,
        { path: 'customer.docTYPE', label: 'บัตรแสดงตน' },
        { path: 'customer.titleCode', label: 'คำนำหน้าชื่อ' },
        { path: 'customer.cusTAXid', label: 'ผู้เสียภาษี' },
        { path: 'homeAddress.housEno', label: 'เลขที่ (ที่อยู่ตามทะเบียนบ้าน)' },
        { path: 'homeAddress.prvCODE', label: 'จังหวัด (ที่อยู่ตามทะเบียนบ้าน)' },
        { path: 'homeAddress.ampCODE', label: 'เขต/อำเภอ (ที่อยู่ตามทะเบียนบ้าน)' },
        { path: 'homeAddress.tmbCODE', label: 'แขวง/ตำบล (ที่อยู่ตามทะเบียนบ้าน)' },
        { path: 'detailSale.stkUNiT', label: 'จำนวนหุ้น' }
      ];
    } else if (this.mode === 'sell-stock') {
      return [
        ...baseFields,
        { path: 'detailSale.stkUNiT', label: 'จำนวนหุ้น' },
        { path: 'detailSale.stkPayTypeDetail', label: 'วิธีการชำระเงิน' }
      ];
    }

    return baseFields;
  }

  // ฟังก์ชันสำหรับแสดง alert ข้อมูลไม่ครบ
  showIncompleteDataAlert(emptyFields: string[]): void {
    const fieldList = emptyFields.map(field => `• ${field}`).join('\n');

    Swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      html: `
        <div class="text-left">
          <p class="mb-3">กรุณากรอกข้อมูลในฟิลด์ต่อไปนี้:</p>
          <div class="text-red-600 text-sm">
            ${fieldList.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6'
    });
  }

  // เพิ่ม property สำหรับติดตามการ submit
  formSubmitted = false;

  // ฟังก์ชันสำหรับตั้งค่า form validation reset
  setupFormValidationReset() {
    const requiredFields = this.getRequiredFields();

    requiredFields.forEach(field => {
      this.customerForm.get(field.path)?.valueChanges.subscribe(() => {
        // รีเซ็ต formSubmitted เมื่อผู้ใช้เริ่มกรอกข้อมูล
        if (this.formSubmitted) {
          this.formSubmitted = false;
          this.cd.detectChanges();
        }
      });
    });
  }

  goBack() {
    this.back.emit('search');
  }
}

