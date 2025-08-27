import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Spin } from '../../../services/spin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {MatTooltipModule} from '@angular/material/tooltip';

interface FileData {
  fileName: string;
  time: string;
  name: string;
}

@Component({
  selector: 'app-create-spin-files',
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './create-spin-files.html',
  styleUrl: './create-spin-files.css'
})
export class CreateSpinFilesComponent implements OnInit {
  files: FileData[] = [];
  loading: boolean = false;
  constructor(
    private readonly spinService: Spin,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSpinfile();
  }

  loadSpinfile() {
    const payload = {
      Action: "dat"
    };
    this.spinService.getSpinFiles(payload).subscribe({
      next: (data: any) => {
        const fileList: string[] = data?.files || [];
        this.files = fileList.map(file => {
          const [datePart, nameWithExt] = file.split("_");
          const name = nameWithExt.split(".")[0];
          const time = datePart;

          return {
            fileName: file,
            name: name,
            time: time
          };
        });
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
  }

  createSpinFile() {
    this.loading = true;
    this.cd.detectChanges();
    this.spinService.createSpinFile().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.cd.detectChanges();
        Swal.fire({
          icon: 'success',
          title: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        })
        this.ngOnInit();
      }, error: (err) => {
        console.error('Error creating spin file:', err);
      }
    })
  }

  download(fileName: string) {
    const payload = {
      FileName: fileName
    }
    this.spinService.downloadSpinFile(payload).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }
}
