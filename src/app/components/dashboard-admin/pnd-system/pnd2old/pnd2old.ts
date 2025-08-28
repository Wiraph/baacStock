import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd2old',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd2old.html',
  styleUrls: ['./pnd2old.css']
})
export class Pnd2old implements OnInit {
  pndType: string = '';
  title: string = '';

  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND2OLD";
    this.title = "ภ.ง.ด. 2 เก่า";
  }
}
