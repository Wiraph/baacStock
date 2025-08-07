import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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


@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
export class EditCustomerComponent implements OnInit {
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

  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly customerService: CustomerService,
    private readonly metadataService: MetadataService,
    private readonly cd: ChangeDetectorRef,
    private readonly addressService: AddressService,
    private readonly dividend: Divident,
    private readonly fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('1');
    console.log(this.dataTransfer.getPageStatus());
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
        stkACCno: [''],
        stkACCname: [''],
        stkACCtype: ['']
      })
    })
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
    console.log("=== Starting forkJoin with requestPayload ===", requestPayload);

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
          console.log("Address service response:", addressData);
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
    })
      .pipe(
        switchMap((res) => {
          // เก็บข้อมูล
          console.log("API Response received - customer:", !!res.customer, "address:", !!res.address);
          console.log("Full API Response:", res);
          console.log("Load customer ", res.customer);

          // จัดการข้อมูลลูกค้า - เก็บข้อมูลจาก API response
          console.log("=== Processing customer data ===");
          console.log("res.customer from API:", res.customer);
          console.log("res.customer.customer from API:", (res.customer as any)?.customer);
          console.log("res.customer.unit from API:", (res.customer as any)?.unit);

          // เก็บข้อมูลตามโครงสร้าง API response (nested structure)
          this.customer = (res.customer as any)?.customer || {};  // ข้อมูลลูกค้าจาก nested customer object
          this.unit = (res.customer as any)?.unit || 0;           // เก็บ unit จาก res.customer.unit

          console.log("this.customer after assign:", this.customer);
          console.log("this.unit after assign:", this.unit);

          // Check if address data exists and has proper structure
          if (res.address && (res.address.homeAddress || res.address.currentAddress)) {
            this.homeAddress = res.address.homeAddress;
            this.currentAddress = res.address.currentAddress;
          } else {
            console.warn("No address data in response");
            this.homeAddress = this.addressService.getDefaultAddress();
            this.currentAddress = this.addressService.getDefaultAddress();
          }

          console.log("Address assigned - home:", !!this.homeAddress, "current:", !!this.currentAddress);
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
    console.log("=== populateCustomerForm called ===");
    console.log("this.customer exists?", !!this.customer);
    console.log("this.customer value:", this.customer);

    if (this.customer) {
      console.log("Populating customer form with data:", this.customer);
      console.log("Customer cusiD value:", this.customer.cusiD);
      console.log("Customer titleCode value:", this.customer.titleCode);
      console.log("Customer cusFName value:", this.customer.cusFName);
      console.log("Customer cusLName value:", this.customer.cusLName);
      console.log("Unit value:", this.unit);

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
        unit: this.unit || '',  // ใช้ this.unit ที่เก็บแยกไว้
        titleCode: this.customer.titleCode || '',
        email: this.customer.email || '',
        phonE_MOBILE: this.customer.phonE_MOBILE || ''
      };

      console.log("customerFormData before patchValue:", customerFormData);

      this.customerForm.patchValue({
        customer: customerFormData,
        dividend: {
          stkPayType: this.dividendData?.stkPayType || '',
          stkACCno: this.dividendData?.stkACCno || '',
          stkACCname: this.dividendData?.stkACCname || '',
          stkACCtype: this.dividendData?.stkACCtype || ''
        }
      });
      console.log("Form after populate:", this.customerForm.value);
      console.log("Form customer part:", this.customerForm.get('customer')?.value);
      this.cd.detectChanges();
    } else {
      console.log("No customer data available to populate");

      // Test with dummy data to check if form can accept data
      console.log("=== Testing with dummy data ===");
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
      console.log("Form after dummy data:", this.customerForm.get('customer')?.value);
    }
  }

  populateAddressForm() {
    console.log("Populating address form with data:");
    console.log("homeAddress:", this.homeAddress);
    console.log("currentAddress:", this.currentAddress);

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

    console.log("Home address data to populate:", homeAddressData);
    console.log("Current address data to populate:", currentAddressData);

    this.customerForm.patchValue({
      homeAddress: homeAddressData,
      currentAddress: currentAddressData
    });

    console.log("Form values after populate:", this.customerForm.value);

    // อัปเดต zipcode variables ด้วยข้อมูลจาก API
    this.zipCodeHome = this.homeAddress?.zipcode || '';
    this.zipCodeCurrent = this.currentAddress?.zipcode || '';
    console.log("Updated zipcode variables:", { zipCodeHome: this.zipCodeHome, zipCodeCurrent: this.zipCodeCurrent });

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
      error: (err) => {
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
    const action = submitter.value;
    console.log("=== onSubmit called with action:", action);
    console.log("Form valid:", this.customerForm.valid);
    console.log("Form value:", this.customerForm.value);

    // ตรวจสอบความถูกต้องของฟอร์ม
    if (!this.customerForm.valid) {
      console.warn("Form is not valid!");
      return;
    }

    // ดึงข้อมูลจากฟอร์ม
    const customerData = this.customerForm.get('customer')?.value;
    const homeAddressData = this.customerForm.get('homeAddress')?.value;
    const currentAddressData = this.customerForm.get('currentAddress')?.value;
    const dividendData = this.customerForm.get('dividend')?.value;

    console.log("Customer data from form:", customerData);
    console.log("Home address data:", homeAddressData);
    console.log("Current address data:", currentAddressData);
    console.log("Dividend data:", dividendData);
    console.log("Unit from component:", this.unit);

    const phone = currentAddressData?.phone?.trim();

    if (phone && phone !== "" && phone !== "-") {
      const isValidLength = phone.length === 10;
      const isNumeric = /^\d+$/.test(phone);

      if (!isValidLength) {
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'เบอร์มือถือจะต้องมีความยาว 10 ตัวอักษรเท่านั้น',
        });
        return
      } else if (!isNumeric) {
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'เบอร์มือถือจะต้องเป็นตัวเลขเท่านั้น',
        });
        return
      }
    }

    // สร้าง payload ตาม API structure
    const requestPayload = {
      CUSidO: this.cusId || '', // รหัสลูกค้าเดิม (สำหรับการ update)
      CUSid: customerData?.cusiD || '', // รหัสลูกค้าใหม่
      CUStax: customerData?.cusTAXid || '', // เลขประจำตัวผู้เสียภาษี
      CUSTt: customerData?.titleCode || '', // คำนำหน้า
      CUSfn: customerData?.cusFName || '', // ชื่อ
      CUSln: customerData?.cusLName || '', // นามสกุล
      CUSTy: customerData?.cusCODE || '', // ประเภทลูกค้า (Customer Type)
      CUSTg: customerData?.cusCODEg || '', // กลุ่มลูกค้า
      docTY: customerData?.docTYPE || '', // ประเภทเอกสาร
      STC: '', // Stock Code (ถ้ามี)
      BRC: customerData?.brCode || '', // รหัสสาขา
      CUSphone: customerData?.phonE_MOBILE || '', // เบอร์โทร
      CUSemail: customerData?.email || '', // อีเมล (ถ้ามีในฟอร์ม)

      // ที่อยู่ปัจจุบัน (Current Address - CA)
      AddCA0: currentAddressData?.housEno || '', // บ้านเลขที่
      AddCA1: currentAddressData?.troG_SOI || '', // ซอย 
      AddCA2: currentAddressData?.road || '', // ถนน
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
      stkPayType: dividendData?.stkPayType || '', // ประเภทการจ่ายเงินปันผล
      stkACCno: dividendData?.stkACCno || '', // เลขบัญชี
      stkACCname: dividendData?.stkACCname || '', // ชื่อบัญชี
      stkACCtype: dividendData?.stkACCtype || '', // ประเภทบัญชี (ถ้ามีในฟอร์ม)

      // ข้อมูลหุ้น
      unit: this.unit || customerData?.unit || 0, // จำนวนหุ้น

      // ข้อมูลระบบ
      USR: '', // User ID (ต้องใส่จาก session/auth)
      IP: '', // IP Address (ต้องใส่จาก browser/server)
      HOST: '', // Host name (ต้องใส่จาก browser/server)
      ACT: action // Action type
    };

    console.log("=== Final Payload ===");
    console.log("Payload:", requestPayload);

    // แสดง loading
    this.loading = true;

    this.customerService.postUpdateCustomer(requestPayload).subscribe({
      next: (response) => {
        console.log("Update successful:", response);
        this.loading = false;

        // โหลดข้อมูลใหม่ทันที
        this.reloadCustomerData();

        // แสดง SweetAlert บันทึกสำเร็จ
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false
        });
      },
      error: (error) => {
        console.error("Update failed:", error);
        this.loading = false;

        // กำหนดข้อความ error ตามประเภทของ error
        const errorMessage =
          error?.error?.message ??
          error?.message ??
          (error.status === 0 && 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต') ??
          (error.status >= 500 && 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ในภายหลัง') ??
          (error.status === 401 && 'ไม่มีสิทธิ์ในการเข้าถึง กรุณาเข้าสู่ระบบใหม่') ??
          (error.status === 403 && 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้') ??
          'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง';

        // แสดง SweetAlert เมื่อเกิดข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: errorMessage,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#dc3545',
          allowOutsideClick: false
        });
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

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }
}
