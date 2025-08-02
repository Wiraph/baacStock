import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApproveService } from '../../../services/approve';
import { JwtDecoder } from '../../../services/jwt-decoder';
import Swal from 'sweetalert2';

@Component({
    standalone: true,
    selector: 'app-approve-issue',
    imports: [CommonModule],
    templateUrl: './approve-issue.html',
    styleUrl: './approve-issue.css'
})
export class ApproveIssue implements OnInit {

    constructor(
        private readonly cd: ChangeDetectorRef,
        private readonly approveService: ApproveService,
        private readonly jwtCoder: JwtDecoder
    ) { }

    activeView: string = "table";
    issueList: any[] = [];
    issuadata: any;
    loading = false;
    brName = "";
    pageNumber = 1;
    pageSize = 10;


    setView(view: string) {
        this.activeView = view;
    }

    loadList() {
        const token = sessionStorage.getItem('token');
        const decoder = this.jwtCoder.decodeToken(String(token));
        const brName = decoder.BrCode;
        if (this.issueList.length < this.pageSize) {
            this.loading = true;
            this.approveService.getApproveList('iSSUE', brName, this.pageNumber, this.pageSize).subscribe(data => {
                this.issueList = data;
                this.loading = false;
                this.cd.detectChanges();
            });
        } else {
            return
        }
    }

    nextPage() {
        if (this.issueList.length == this.pageSize) {
            this.pageNumber++;

        } else {
            this.loadList();
        }
    }

    prevPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.loadList();
        } else {
            return
        }
    }

    onsearch() {
        const token = sessionStorage.getItem('token');
        const decoder = this.jwtCoder.decodeToken(String(token));
        const brName = decoder.BrCode;
        this.loading = true;
        this.approveService.getApproveList('iSSUE', brName, this.pageNumber, this.pageSize).subscribe({
            next: (data) => {
                this.issueList = data;
                this.loading = false;
                this.cd.detectChanges();
            },
            error: () => {
                this.loading = false;
                alert("ไม่สามารถโหลดข้อมูลรอรายการอนุมัติออกใบหุ้นได้ กรุณาติดต่อผู้พัฒนา");
            }
        })
    }

    detailIssue(stkNOTE: string) {
        this.loading = true;
        const payload = {
            stkNote:stkNOTE
        };
        this.approveService.getDetail(payload).subscribe({
            next: (data) => {
                this.issuadata = data.stock;
                console.log(data);
                this.setView('detail')
                this.loading = false;
                this.cd.detectChanges();
            }, error: (err) => {
                this.loading = false;
                console.log("Loading data fail...", err);
            }
        })
    }

    approveSelectedIssue(): void {
        if (!this.issuadata?.stkNote) {
            Swal.fire('ไม่พบหมายเลขหุ้น', '', 'error');
            return
        }

        const payload = {
            stkNOTEis: this.issuadata?.stkNote,
            AiSQL: "iSSUE",
            stkCONFiRM: "YES",
            brCode: "",
            DATETIMEUP: "",
            USERID: "",
            IPADDRESS: "",
            HOSTNAME: ""
        };
        Swal.fire({
            icon: 'question',
            html: `
                <div style="font-family: 'Prompt', sefit; text-align: center;">
                <p>ท่านต้องการ อนุมัติออกใบหุ้น ${this.issuadata.status}</p>
                <div style="display: flex; justify-content: center; gap: 40px; margin-top: 10px;">
                    <div style="text-align: right;">
                    <p>หมายเลขใบหุ้น</p>
                    <p>ชื่อผู้ถือหุ้น</p>
                    <p>จำนวนหุ้น</p>
                    <p>จำนวนเงิน</p>
                    </div>
                    <div style="text-align: left;">
                    <p>: ${this.issuadata.stkNote}</p>
                    <p>: ${this.issuadata.fullname}</p>
                    <p>: ${this.issuadata.unit}</p>
                    <p>: ${Number(this.issuadata.unitValue).toLocaleString()} บาท</p>
                    </div>
                </div>
                </div>
            `,
            confirmButtonText: 'อนุมัติ',
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'กำลังอนุมัติ...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.approveService.sentConfirm(payload).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            html: `<p>อนุมัติสำเร็จ</p>`,
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            this.issueList = [];
                            this.setView('table');
                            this.onsearch();
                            this.cd.detectChanges();
                        });
                    },
                    error: (err) => {
                        console.error("Unable to save", err);
                        Swal.fire({
                            icon: 'error',
                            html: `<p>เกิดข้อผิดพลาดในการอนุมัติ</p>`,
                        }).then(() => {
                            this.issueList = [];
                            this.setView('table');
                            this.onsearch();
                            this.cd.detectChanges();
                        });
                    }
                });
            }
        });
    }

    notApproveSelectedIssue(): void {
        if (!this.issuadata?.stkNote) {
            Swal.fire('ไม่พบหมายเลขหุ้น', '', 'error');
            return
        }

        const payload = {
            stkNOTEis: this.issuadata?.stkNote,
            AiSQL: "iSSUE",
            stkCONFiRM: "NO",
            brCode: "",
            DATETIMEUP: "",
            USERID: "",
            IPADDRESS: "",
            HOSTNAME: ""
        };
        Swal.fire({
            icon: 'question',
            html: `
                <div style="font-family: 'Prompt', sefit; text-align: center;">
                <p>ท่านต้องการ ยกเลิกออกใบหุ้น ${this.issuadata.status}</p>
                <div style="display: flex; justify-content: center; gap: 40px; margin-top: 10px;">
                    <div style="text-align: right;">
                    <p>หมายเลขใบหุ้น</p>
                    <p>ชื่อผู้ถือหุ้น</p>
                    <p>จำนวนหุ้น</p>
                    <p>จำนวนเงิน</p>
                    </div>
                    <div style="text-align: left;">
                    <p>: ${this.issuadata.stkNote}</p>
                    <p>: ${this.issuadata.fullname}</p>
                    <p>: ${this.issuadata.unit}</p>
                    <p>: ${Number(this.issuadata.unitValue).toLocaleString()} บาท</p>
                    </div>
                </div>
                </div>
            `,
            confirmButtonText: 'ไม่อนุมัติ',
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'กำลังยกเลิกรายการ...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.approveService.sentConfirm(payload).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            html: `<p>ยกเลิกสำเร็จ</p>`,
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            this.issueList = [];
                            this.setView('table');
                            this.onsearch();
                            this.cd.detectChanges();
                        });
                    },
                    error: (err) => {
                        console.error("Unable to save", err);
                        Swal.fire({
                            icon: 'error',
                            html: `<p>เกิดข้อผิดพลาดโปรดติดต่อผู้พัฒนา</p>`,
                        }).then(() => {
                            this.issueList = [];
                            this.setView('table');
                            this.onsearch();
                            this.cd.detectChanges();
                        });
                    }
                });
            }
        });
    }

    ngOnInit(): void {
        const token = sessionStorage.getItem('token');
        const decoder = this.jwtCoder.decodeToken(String(token));
        this.brName = decoder.BrName;
        this.cd.markForCheck();
        this.onsearch();
    }

    closeWindows(): void {
        this.issuadata = null;
        this.setView('table');
        this.cd.detectChanges();
    }

    formatDate(datetimeup: string): string {
        if (!datetimeup || !/^\d{8}-\d{6}$/.test(datetimeup)) return '';
        const [dataPart, timePart] = datetimeup.split('-');
        const datetimeYear = parseInt(dataPart.substring(0, 4), 10);
        const datetimeMonth = parseInt(dataPart.substring(4, 6), 10);
        const datetimeDay = parseInt(dataPart.substring(6, 8), 10);
        const datetimeHour = parseInt(timePart.substring(0, 2), 10);
        const datetimeMinute = parseInt(timePart.substring(2, 4), 10);
        const datetimeSecond = parseInt(timePart.substring(4, 6), 10);

        const monthNames = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        const h = datetimeHour.toString().padStart(2, '0');
        const m = datetimeMinute.toString().padStart(2, '0');
        const s = datetimeSecond.toString().padStart(2, '0');

        const thaiMonth = monthNames[datetimeMonth] || 'เดือนผิด';
        return `${datetimeDay} ${thaiMonth} ${datetimeYear} เวลา ${h}:${m}:${s} น.`;
    }

}
