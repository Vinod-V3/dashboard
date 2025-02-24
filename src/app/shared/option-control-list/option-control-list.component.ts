import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-option-control-list',
  templateUrl: './option-control-list.component.html',
  styleUrl: './option-control-list.component.scss'
})
export class OptionControlListComponent {
  @Output() onOptionChange:any = new EventEmitter<any>();
  @Input() optionsList:any

  ngOnInit(){}

  optionChange($event:any, option:any){
    let data = {
      isChecked: $event.checked,
      selectedOption: option.type
    }
    this.onOptionChange.emit(data)
  }
}
