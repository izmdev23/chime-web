import { Component, Input, signal, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-error-box',
  imports: [],
  templateUrl: './error-box.html',
  styleUrl: './error-box.less'
})
export class ErrorBox {
  protected _visible = signal(false);
  
  
  @Input()
  set visible(value: boolean) {
    console.log("value", value);
    this._visible.set(value)
  }
  get visible() {
    return this._visible();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("value ", changes["visible"].currentValue);
    if (!changes["visible"]) return;
    this.visible = changes["visible"].currentValue;
  }

  protected hide() {
    this.visible = false;
  }
}
