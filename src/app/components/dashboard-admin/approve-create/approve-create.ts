// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { DataTransfer } from '../../../services/data-transfer';
// import { StockService } from '../../../services/stock';
// import { CommonModule } from '@angular/common';
// import Swal from 'sweetalert2';
// import { ApproveService } from '../../../services/approve';

// @Component({
//   standalone: true,
//   selector: 'app-approve-create',
//   imports: [CommonModule],
//   templateUrl: './approve-create.html',
//   styleUrl: './approve-create.css'
// })
// export class ApproveCreate implements OnInit {
//   loading = true;
//   dataconfirm: any;

//   constructor(
//     private dataTransfer: DataTransfer,
//     private stockService: StockService,
//     private cd: ChangeDetectorRef,
//     private approveService: ApproveService
//   ) { }

//   ngOnInit(): void {
//     const stkNote = this.dataTransfer.getStkNote();
//     this.stockService.getResultCreate(stkNote).subscribe({
//       next: (data) => {
//         this.dataconfirm = data;
//         console.log(this.dataconfirm);
//         this.loading = false;
//         this.cd.detectChanges();
//       }
//     })
//   }

//   onConfirm() {
//     Swal.fire({
//       html: `
//           <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ อนุมัติรายการออกใบหุ้นแทน ใบหุ้นที่ชำรุด/สูญหาย</p>
//           <p style="font-family: 'Prompt', sans-serif;">หมายเลขใบหุ้น : ${this.dataconfirm.sender.stkNote}</p>
//           <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.dataconfirm.sender.titleCus + this.dataconfirm.sender.cusFname + " " + this.dataconfirm.sender.cusLname}</p>
//           <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.dataconfirm.sender.unit} หุ้น</p>
//           <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.dataconfirm.sender.value.toLocaleString('en-US')} บาท</p>
//           `,
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonText: 'อนุมัติ',
//       cancelButtonText: 'ยกเลิก',
//       confirmButtonColor: '#16a34a',
//       cancelButtonColor: '#ef4444'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         return
//       }
//     })
//   }

//   onCancel(stkNote: string) {
//     Swal.fire({
//       html: `
//       <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ ยกเลิกรายการออกใบหุ้นแทน ใบหุ้นที่ชำรุด/สูญหาย</p>
//       <p style="font-family: 'Prompt', sans-serif;">หมายเลขใบหุ้น : ${this.dataconfirm.sender.stkNote}</p>
//       <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.dataconfirm.sender.titleCus + this.dataconfirm.sender.cusFname + " " + this.dataconfirm.sender.cusLname}</p>
//       <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.dataconfirm.sender.unit} หุ้น</p>
//       <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.dataconfirm.sender.value.toLocaleString('en-US')} บาท</p>
//       `,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'ไม่อนุมัติ',
//       cancelButtonText: 'ปิด',
//       confirmButtonColor: '#FFCC00',
//       cancelButtonColor: '#ef4444'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.loading = true;
//         this.approveService.refuseList(stkNote).subscribe({
//           next: () => {
//             this.loading = false;
//             Swal.fire({
//               icon: 'success',
//               title: 'ยกเลิกสำเร็จ',
//               showConfirmButton: false,
//               timer: 1500
//             });
//             window.location.reload();
//             this.cd.detectChanges();
//           }, error(err) {
//             console.log("Unable to send data", err);
//             alert("ไม่สามารถบันทึกข้อมูลได้โปรดติดต่อผู้พัฒนา");
//           }
//         })
//         this.loading = false;
//         return
//       } else {
//         this.loading = false;
//         this.cd.detectChanges();
//         return
//       }
//     })
//   }

//   onClose() {
//     window.location.reload();
//     this.cd.detectChanges();
//   }
// }
