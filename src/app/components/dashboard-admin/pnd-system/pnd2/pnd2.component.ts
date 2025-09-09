import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd2',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd2.component.html',
  styleUrls: ['./pnd2.component.css']
})
export class Pnd2Component implements OnInit {
  pndType: string = '';
  title: string = '';
  mode: string = '';

  ngOnInit(): void {
    this.pndType = "PND2";
    this.title = "ภ.ง.ด. 2";
    this.mode = "PND";
  }
  
}
