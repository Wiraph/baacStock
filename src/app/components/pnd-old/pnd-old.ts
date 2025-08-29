import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pnd-old',
  imports: [],
  templateUrl: './pnd-old.html',
  styleUrl: './pnd-old.css'
})
export class PndOld implements OnInit {
  @Input() pndType: string = '';
  @Input() title: string = '';

  constructor() { }
  ngOnInit(): void {

  }
}
