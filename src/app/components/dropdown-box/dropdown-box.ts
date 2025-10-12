import { Component, EventEmitter, Input, Output, signal, SimpleChanges, WritableSignal } from '@angular/core';



@Component({
  selector: 'app-dropdown-box',
  imports: [],
  templateUrl: './dropdown-box.html',
  styleUrl: './dropdown-box.less'
})
export class DropdownBox {
  protected isOpened = signal(true);
  protected displayText = signal("");
  protected classList = "";
  protected itemList = signal<string[]>([]);

  @Input() title: string = "";
  @Input() multiple: boolean = false;
  @Input() list: string[] = [];
  @Output() onItemSelected = new EventEmitter<string>();

  isShown = signal(false);
  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes["list"]) {
      let updatedList = <string[]>changes["list"].currentValue;
      this.itemList.set(updatedList);
    }
    if (changes["title"]) {
      this.displayText.set(this.title);
    }

  }
  
  onClick() {
    if (this.isOpened()) this.classList = "";
    else this.classList = "--flat-button";
    this.isOpened.set(!this.isOpened());
  }

  _onItemSelected(item: string) {
    this.onItemSelected.emit(item);
  }

}
