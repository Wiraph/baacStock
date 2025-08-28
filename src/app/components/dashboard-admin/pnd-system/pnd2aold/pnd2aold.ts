import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd2aold',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd2aold.html',
  styleUrls: ['./pnd2aold.css']
})
export class Pnd2aold implements OnInit {
  pndType: string = '';
  title: string = '';

  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND2AOLD";
    this.title = "ภ.ง.ด. 2 ก เก่า";
  }
}
