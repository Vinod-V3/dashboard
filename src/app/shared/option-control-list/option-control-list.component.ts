import { Component, EventEmitter, Input, Output } from '@angular/core';
import { mapData } from '../../../assets/sampleData';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-option-control-list',
  templateUrl: './option-control-list.component.html',
  styleUrl: './option-control-list.component.scss',
  animations: [
    trigger('animationTrigger', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void => *', [
        style({ height: '0px', opacity: 0 }),
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class OptionControlListComponent {
  @Output() onOptionChange:any = new EventEmitter<any>();
  @Input() optionsList:any
  dataList:any = []
  mapData:any

  ngOnInit(){
    let data = localStorage.getItem("mapData")
    this.mapData = data ? JSON.parse(data) : mapData
    this.formatData()
  }

  optionChange($event:any, option:any){
    let data = {
      isChecked: $event.checked,
      selectedOption: option.type
    }
    this.onOptionChange.emit(data)
  }

  formatData(){
    this.dataList = this.optionsList.map((data:any) => ({
      ...data, isShown: false,
      data: this.mapData.partners.filter((mapItem: any) => mapItem.type == data.type).map((dataOne: any) => dataOne)
      .sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    }))
  }

  onOptionToggle(option: any){
    option.isShown = !option.isShown
    let data = {
      isChecked: option.isShown,
      selectedOption: option.type
    }
    this.onOptionChange.emit(data)
  }

  redirect(option:any){
    window.open(option.website, '_blank');
  }
}