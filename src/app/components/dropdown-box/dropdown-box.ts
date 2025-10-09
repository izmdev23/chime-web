import { Component, EventEmitter, Input, Output, signal, SimpleChanges, WritableSignal } from '@angular/core';



@Component({
  selector: 'app-dropdown-box',
  imports: [],
  templateUrl: './dropdown-box.html',
  styleUrl: './dropdown-box.less'
})
export class DropdownBox {
  protected selectedItem = signal<Map<string, boolean>>(new Map());
  protected isOpened = signal(false);
  protected displayText = signal("");

  @Input() title: string = "";
  @Input() multiple: boolean = false;
  @Input() list: string[] = [];
  @Output() onItemSelected = new EventEmitter<string[]>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes["list"]) {
      this.displayText.set(this.title);
      console.log("updated ", changes["list"].currentValue);
      let updatedList = <string[]>changes["list"].currentValue;
      this.selectedItem.update(val => {
        updatedList.forEach(e => {
          val.set(e, false);
          console.log("update");
        })
        return val;
      });
    }

  }
  
  onClick() {
    this.isOpened.set(!this.isOpened());
  }

  hasItemSelected() {
    let selected = 0;
    for(const e of this.selectedItem()) {
      if (e[1]) selected++;
    }
    return selected > 0;
  }

  _onItemSelected(item: string) {
    let selected: string[] = [];
    this.selectedItem.update(e => {
      e.set(item, !(e.get(item)!));
      for(const data of e) {
        if (data[1]) selected.push(data[0]);
      }
      this.onItemSelected.emit(selected);
      return e;
    })
  }

  removeSelected() {
    this.selectedItem.update(val => {
      for(const e of this.list) {
        val.set(e, false)
      }
      this.onItemSelected.emit([]);
      return val;
    })
    this.isOpened.set(false);
  }

}
