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
  mode: string = '';

  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND2";
    this.title = "ภ.ง.ด. 2";
    this.mode = "PND2";
  }
}
