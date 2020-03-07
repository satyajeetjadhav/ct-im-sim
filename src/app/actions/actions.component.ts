import { Component, OnInit, Input } from '@angular/core';
import { CTAction } from '../models/ctAction';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent implements OnInit {

  @Input() action: CTAction;
  
  constructor() { }

  ngOnInit(): void {
  }

}
