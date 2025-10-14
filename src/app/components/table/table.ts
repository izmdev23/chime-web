import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.less'
})
export class Table {
  @Input() columns: number = 1;
  @Input() rows: number = 1;
  @Input() columnSize: number[] = [];
  @Input() rowSize: number[] = [];

  

}
