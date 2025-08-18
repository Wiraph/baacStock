import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { CustomerService } from '../../../services/customer';
import { MatTabsModule } from '@angular/material/tabs';
import { MetadataService } from '../../../services/metadata';
import { AddressService, AddressDto } from '../../../services/address';
import { of, forkJoin } from 'rxjs';
import { finalize, switchMap, map, catchError } from 'rxjs/operators';
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

export const THAI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};
@Component({
  standalone: true,
  selector: 'app-sale-stock',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-stock.html',
  styleUrl: './sale-stock.css',
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ]
})
export class SaleStockComponent implements OnInit, AfterViewInit {
  readonly startDate = new Date();
  selectedDate?: Date;
  activeView = 'search';
  loading = false;
  cusId = '';
  customer: any = {};
  unit: number = 0;
  homeAddress!: AddressDto;
  currentAddress!: AddressDto;
  zipCodeHome: any = {};
  zipCodeCurrent: any = {};
  dividendData: any = {
    payDESC: '',
    stkPayType: '',
    stkACCno: '',
    stkACCname: ''
  };
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
    private readonly stockService: StockService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('2');
    this.metadataService.getSyscfg().subscribe({
      next: (res: any) => {
        this.pricePerUnit = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Loading fail...", err);
      }
    })
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
    })
  }

  ngAfterViewInit(): void {
    // ฟังก์ชันแปลงปี ค.ศ. เป็น พ.ศ.
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

    // โหลดข้อมูลหลักทั้งหมด
    forkJoin({
      customer: this.customerService.getCustomer(requestPayload).pipe(
        map(customerData => {
          console.log("Raw customer service response:", customerData);
          return customerData;
        }),
        catchError(err => {
          console.error("Customer service error:", err);
          return of(null);
        })
      ),
      address: this.addressService.getAddress(requestPayload).pipe(
        map(addressData => {
          return addressData;
        }),
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
          // เก็บข้อมูลตามโครงสร้าง API response (nested structure)
          this.customer = (res.customer as any)?.customer || {};  // ข้อมูลลูกค้าจาก nested customer object
          this.unit = (res.customer as any)?.unit || 0;           // เก็บ unit จาก res.customer.unit


          // Check if address data exists and has proper structure
          if (res.address && (res.address.homeAddress || res.address.currentAddress)) {
            this.homeAddress = res.address.homeAddress;
            this.currentAddress = res.address.currentAddress;
          } else {
            this.homeAddress = this.addressService.getDefaultAddress();
            this.currentAddress = this.addressService.getDefaultAddress();
          }

          this.dividendData = res.dividend || {
            payDESC: '',
            stkPayType: '',
            stkACCno: '',
            stkACCname: '',
            stkACCtype: '',
          };
          this.prvData = res.provinces;
          this.titleList = res.titles;
          this.custypeList = res.custypes;
          this.doctypeList = res.doctypes;
          this.actypeList = res.acctypes;
          this.stkTypeList = res.stktypes;

          // Populate ข้อมูลลูกค้าและที่อยู่ลงใน form
          this.populateCustomerForm();
          this.populateAddressForm();

          // Force immediate UI update
          setTimeout(() => {
            this.cd.detectChanges();
          }, 0);

          // โหลดอำเภอ/ตำบลของทั้งสองที่อยู่
          return this.loadInitialAddressDataObservable();
        }),
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          console.log("ข้อมูลทั้งหมดโหลดเรียบร้อย");
        },
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
        cusDESC: this.customer.cusDESCg || '', // ใช้ cusDESCg จาก API
        cusCODEg: this.customer.cusCODEg || '',
        cusDESCgABBR: this.customer.cusDESCgABBR || '',
        docTYPE: this.customer.docTYPE || '',
        cusiD: this.customer.cusiD || '',
        brCode: this.customer.brCode || '',
        cusTAXid: this.customer.cusTAXid || '',
        cusFName: this.customer.cusFName || '',
        cusLName: this.customer.cusLName || '',
        unit: this.unit || '0',  // ใช้ this.unit ที่เก็บแยกไว้
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
    } else {
      this.customerForm.patchValue({
        customer: {
          cusCODE: "TEST",
          cusDESC: "Test Description",
          cusCODEg: "1",
          cusDESCgABBR: "Test ABBR",
          docTYPE: "0001",
          cusiD: "TEST123",
          brCode: "0001",
          cusTAXid: "1234567890123",
          cusFName: "Test Name",
          cusLName: "Test Surname",
          unit: "5",
          titleCode: "001"
        }
      });
    }
  }

  populateAddressForm() {
    if (!this.homeAddress && !this.currentAddress) {
      console.warn("No address data available to populate");
      return;
    }

    const homeAddressData = {
      housEno: this.homeAddress?.housEno || '',
      troG_SOI: this.homeAddress?.troG_SOI || '',
      road: this.homeAddress?.road || '',
      prvCODE: this.homeAddress?.prvCODE || '',
      ampCODE: this.homeAddress?.ampCODE || '',
      tmbCODE: this.homeAddress?.tmbCODE || '',
      phone: this.homeAddress?.phone || '',
      zipcodeHome: this.homeAddress?.zipcode || ''  // ✅ ใช้ zipcode จาก API
    };

    const currentAddressData = {
      housEno: this.currentAddress?.housEno || '',
      troG_SOI: this.currentAddress?.troG_SOI || '',
      road: this.currentAddress?.road || '',
      prvCODE: this.currentAddress?.prvCODE || '',
      ampCODE: this.currentAddress?.ampCODE || '',
      tmbCODE: this.currentAddress?.tmbCODE || '',
      phone: this.currentAddress?.phone || '',
      zipcodeCurrent: this.currentAddress?.zipcode || '',  // ✅ ใช้ zipcode จาก API
      addR1: this.currentAddress?.addR1 || '',
      addR2: this.currentAddress?.addR2 || ''
    };

    this.customerForm.patchValue({
      homeAddress: homeAddressData,
      currentAddress: currentAddressData
    });

    // อัปเดต zipcode variables ด้วยข้อมูลจาก API
    this.zipCodeHome = this.homeAddress?.zipcode || '';
    this.zipCodeCurrent = this.currentAddress?.zipcode || '';

    // Update zipcode immediately if data is available (fallback)
    if (this.homeAddress?.prvCODE && this.homeAddress?.ampCODE && this.homeAddress?.tmbCODE) {
      this.updateHomeZipcode();
    }
    if (this.currentAddress?.prvCODE && this.currentAddress?.ampCODE && this.currentAddress?.tmbCODE) {
      this.updateCurrentZipcode();
    }

    this.cd.detectChanges();
  }

  updateHomeZipcode() {
    // ใช้ zipcode จาก API ก่อน ถ้าไม่มีค่อยคำนวณใหม่
    if (this.homeAddress?.zipcode) {
      this.zipCodeHome = this.homeAddress.zipcode;
    } else if (this.homeAddress && this.tumbonDataHome?.length > 0) {
      const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
      this.zipCodeHome = zip;
    }
  }

  updateCurrentZipcode() {
    // ใช้ zipcode จาก API ก่อน ถ้าไม่มีค่อยคำนวณใหม่
    if (this.currentAddress?.zipcode) {
      this.zipCodeCurrent = this.currentAddress.zipcode;
    } else if (this.currentAddress && this.tumbonDataCurrent?.length > 0) {
      const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
      this.zipCodeCurrent = zip;
    }
  }

  loadProvince() {
    this.metadataService.getProvince().subscribe({
      next: (res) => {
        this.prvData = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadAumphor(prvCode: string) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        this.ampData = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadTumbons(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => {
        this.tumbonData = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadTitle() {
    this.metadataService.getTitle().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.titleList = res;
          this.cd.detectChanges();
        }, 0);
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadCustype() {
    this.metadataService.getCustype().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.custypeList = res;
          this.cd.detectChanges();
        })
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadDoctype() {
    this.metadataService.getDoctype().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.doctypeList = res;
          this.cd.detectChanges();
        })
      }, error: (err) => {
        console.log("Load data fail...", err);
      }
    })
  }

  loadAcctype() {
    this.metadataService.getAcctypes().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.actypeList = res;
          this.cd.detectChanges();
        })
      }, error: (err) => {
        console.log("Load AccType fail...", err);
      }
    })
  }

  loadStkType() {
    this.metadataService.getStaTypes().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.stkTypeList = res;
          this.cd.detectChanges();
        })
      }, error: (err) => {
        console.log("Load StkType fail...", err);
      }
    })
  }



  loadAddress() {
    const requestPayload = {
      cusId: this.cusId
    };

    this.addressService.getAddress(requestPayload).subscribe({
      next: (data: any) => {
        const home = data.homeAddress || {};
        const current = data.currentAddress || {};

        this.customerForm.patchValue({
          homeAddress: {
            housEno: home.housEno || '',
            troG_SOI: home.troG_SOI || '',
            road: home.road || '',
            prvCODE: home.prvCODE || '',
            ampCODE: home.ampCODE || '',
            tmbCODE: home.tmbCODE || '',
            phone: home.phone || ''
          },
          currentAddress: {
            housEno: current.housEno || '',
            troG_SOI: current.troG_SOI || '',
            road: current.road || '',
            prvCODE: current.prvCODE || '',
            ampCODE: current.ampCODE || '',
            tmbCODE: current.tmbCODE || '',
            phone: current.phone || '',
            addR1: current.addR1 || '',
            addR2: current.addR2 || ''
          }
        });
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.log("Load Address Fail...", err);
      }
    });
  }


  onProvinceChangeHome(prvCode: string) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.ampDataHome = res;
          this.tumbonDataHome = [];
          this.homeAddress.ampCODE = '';
          this.homeAddress.tmbCODE = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });
  }

  onZipcodeChangeHome(prvCode: string, ampCode: string, tmbCode: string): string {
    const match = this.tumbonDataHome.find(z =>
      z.prvCode == prvCode &&
      z.ampCode == ampCode &&
      z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.zipCodeHome = zip;
    this.customerForm.patchValue({
      homeAddress: {
        zipcodeHome: zip
      }
    });
    return zip; // ✅ เพิ่ม return
  }


  onAumphorChangeHome(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.tumbonDataHome = res;
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });
  }

  onProvinceChangeCurrent(prvCode: string) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.ampDataCurrent = res;
          this.tumbonDataCurrent = [];
          this.currentAddress.ampCODE = '';
          this.currentAddress.tmbCODE = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });
  }

  onAumphorChangeCurrent(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.tumbonDataCurrent = res;
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });
  }

  onZipcodeChangeCurrent(prvCode: string, ampCode: string, tmbCode: string) {
    const match = this.tumbonDataCurrent.find(z =>
      z.prvCode == prvCode &&
      z.ampCode == ampCode &&
      z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.customerForm.patchValue({
      currentAddress: {
        zipcodeCurrent: zip
      }
    });

    return zip;
  }



  loadInitialAddressDataObservable() {
    const tasks = [];

    // สำหรับที่อยู่บ้าน
    if (this.homeAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.homeAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            // ใช้ setTimeout เพื่อหลีกเลี่ยง change detection error
            setTimeout(() => {
              this.ampDataHome = ampRes;
              this.cd.detectChanges();
            }, 0);

            if (this.homeAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.homeAddress.prvCODE, this.homeAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  setTimeout(() => {
                    this.tumbonDataHome = tumbonRes;

                    // 🔽 อัปเดต ZipCode จากฟังก์ชัน
                    const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);

                    // 🔽 ใส่ zip เข้า form
                    if (zip) {
                      this.customerForm.get('homeAddress.zipcodeHome')?.patchValue(zip);
                    }

                    this.cd.detectChanges();
                  }, 0);

                  return of(true);
                })
              );
            }

            return of(true);
          })
        )
      );
    }

    // สำหรับที่อยู่ปัจจุบัน
    if (this.currentAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.currentAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            // ใช้ setTimeout เพื่อหลีกเลี่ยง change detection error
            setTimeout(() => {
              this.ampDataCurrent = ampRes;
              this.cd.detectChanges();
            }, 0);

            if (this.currentAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.currentAddress.prvCODE, this.currentAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  setTimeout(() => {
                    this.tumbonDataCurrent = tumbonRes;

                    // 🔽 อัปเดต ZipCode จากฟังก์ชัน
                    const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);

                    // 🔽 ใส่ zip เข้า form
                    if (zip) {
                      this.customerForm.get('currentAddress.zipcodeCurrent')?.patchValue(zip);
                    }

                    this.cd.detectChanges();
                  }, 0);

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
    // ตรวจสอบความถูกต้องของฟอร์ม
    if (!this.customerForm.valid) {
      console.warn("Form is not valid!");
      return;
    }
    // ดึงข้อมูลจากฟอร์ม
    const dividendData = this.customerForm.get('dividend')?.value;
    const detailSale = this.customerForm.get('detailSale')?.value;
    const formattedDate = this.convertDateToBuddhistFormat(detailSale?.stkSaleByCHQdat);

    // สร้าง payload ตาม API structure
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

    // แสดง loading
    this.loading = true;

    this.stockService.stockManage(requestPayload).subscribe({
      next: (response) => {
        this.res = response;
        this.loading = false;
        // โหลดข้อมูลใหม่ทันที
        // this.reloadCustomerData();
        // แสดง SweetAlert บันทึกสำเร็จ
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
            this.activeView = 'search';
            this.cd.detectChanges();
          }
        })
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
          html: `
          <p style="font-family: 'Prompt', sans-serif;">${this.res[1].RST} : ${this.res[1].errLine}${this.res[1].errNumber}${this.res[1].errSeverity}${this.res[1].errState} : ${this.res[1].MSG}</p>
          <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
          `,
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

  reloadCustomerData() {
    console.log("=== Reloading customer data ===");

    if (!this.cusId) {
      console.warn("No customer ID available for reload");
      return;
    }

    // เรียกใช้ handleData เพื่อโหลดข้อมูลใหม่
    const eventData = {
      view: 'edit',
      cusId: this.cusId
    };

    this.handleData(eventData);
  }

  convertDateToBuddhistFormat(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear() + 543;
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}${month}${day}`; // เช่น 25680707
  }

  onUnitInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // ดึงเฉพาะตัวเลข
    const numericString = input.value.replace(/\D/g, '');
    const numericValue = numericString ? Number(numericString) : 0;
    if (!numericValue) {
      this.unitText = '';
      this.valueText = '';
      this.customerForm.patchValue({
        detailSale: { stkValue: '' } // ให้เป็นค่าว่างเวลาไม่มีข้อมูล
      }, { emitEvent: false });
      return;
    }
    // ใส่ comma ในช่องจำนวนหุ้น
    input.value = numericValue.toLocaleString('en-US');
    // คำนวณมูลค่า
    const stkValue = numericValue * this.pricePerUnit.stkBv;
    // อัปเดตฟอร์ม โดยแสดง comma ในช่องมูลค่า
    this.customerForm.patchValue({
      detailSale: { stkValue: stkValue.toLocaleString('en-US') }
    }, { emitEvent: false });
    // แปลงเป็นข้อความภาษาไทย
    this.valueText = ThaiBahtText(stkValue.toString());
    this.unitText = ThaiBahtText(numericValue.toString()).replace('บาทถ้วน', 'หุ้น');
    this.cd.detectChanges();
  }


  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }
}
