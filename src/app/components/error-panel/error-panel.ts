import { Component, effect, Input, signal, SimpleChanges } from '@angular/core';
import { ErrorData } from '@lib/models';
import { v4 as uuid } from "uuid";

interface _ErrorWrapper extends ErrorData {
  id: string;
}

@Component({
  selector: 'app-error-panel',
  imports: [],
  templateUrl: './error-panel.html',
  styleUrl: './error-panel.less'
})
export class ErrorPanel {
  @Input() errors: ErrorData[] = [];
  @Input() duration: number = 5000;

  protected errors$ = signal<_ErrorWrapper[]>([]);

  constructor() {
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes["errors"]) {
      const newValue: ErrorData[] = changes["erorrs"].currentValue;
      newValue.forEach(err => {
        this.errors$.update(val => {
          const error: _ErrorWrapper = {
            ...err,
            id: uuid()
          }
          console.log("Displaying changes");
          val.push(error)
          setTimeout(() => this.errors$.update(e => e.filter(v => v.id != error.id)), this.duration);
          return val;
        })
      })
      
    }
  }
}
