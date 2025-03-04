import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  zoom:any = localStorage.getItem('zoom') || 5
  mapData:any = ""

  constructor(private location: Location){}

  onChange($event:any){
    this.zoom = $event.target.value
  }

  onMapDataChange($event:any){
    this.mapData = $event.target.value
  }

  save(){
    localStorage.setItem('zoom',this.zoom)
    localStorage.setItem("mapData",this.mapData)
    this.location.back()
  }
}
