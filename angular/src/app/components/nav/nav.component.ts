import { Component, OnInit, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']

  
})
export class NavComponent implements OnInit {

  @Input() navTemplate: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

}
