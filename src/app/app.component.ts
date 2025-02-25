import { Component } from '@angular/core';
import { mapData } from '../assets/sampleData';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private map!: L.Map;
  optionsList:any = []
  mainMarkerData:any = {}
  private activeMarkers: { [key: string]: L.Marker[] } = {};
  private activeLines: { [key: string]: L.Polyline[] } = {};
  activePartnerNames: any = [];
  activeList:any = []
  optionLabels:any = {
    momentum : "Momentum Partners",
    strategic: "Strategic Partners",
    collaborator: "Collaborators",
    anchor: "Anchor Partners"
  }
  private activePartnerLinks: L.Polyline[] = [];

  markerConfigList:any = {
    momentum : { hqIcon: "./assets/marker-icons/hq-circle.svg", icon: "./assets/marker-icons/circle.svg", color: "#572E91" },
    strategic : { hqIcon: "./assets/marker-icons/hq-square.svg", icon: "./assets/marker-icons/square.svg", color: "orange" },
    collaborator : { hqIcon: "./assets/marker-icons/hq-triangle.svg", icon: "./assets/marker-icons/triangle.svg", color: "red" },
    anchor : { hqIcon: "./assets/marker-icons/hq-diamond.svg", icon: "./assets/marker-icons/diamond.svg", color: "pink" }
  }


  constructor() {
    this.optionsList = [...new Set(mapData.partners.map(p => p.type))]

    this.optionsList = this.optionsList.map((data: any) => {
      return { label: this.optionLabels[data], type: data }
    })
  }
  

  ngOnInit(): void {
    this.initMap();
  }


  private async initMap() {
    this.map = L.map('map', {
      center: [22.5937, 78.9629],
      zoom: 5,
    });
  
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        opacity:1
      }
    ).addTo(this.map);
    
    await this.loadIndiaStates();
  }



  private async loadIndiaStates() {
    const geoJsonUrl = "assets/india.json"
  
    fetch(geoJsonUrl)
      .then(res => res.json())
      .then(data => {
        L.geoJSON(data, {
          style: feature => ({
            color: '#99459A',
            weight: 0.5,
            fillColor:"#C0C0C0",
            fillOpacity: 1,
          })
        }).addTo(this.map);
      });
  }

  optionToggle($event:any){
    let type = $event.selectedOption
    if ($event.isChecked) {
      this.showMarkersForType(type);
      if(!this.activeList.includes(type)){
        this.activeList.push(type)
      }
      this.updateActiveNames(type, true);
    } else {
      this.removeMarkersForType(type);
      this.activeList = this.activeList.filter((data: any) => data != type)
      this.updateActiveNames(type, false);
    }
    this.showPartnerLinks();
  }

  private showMarkersForType(type: string): void {
    const selectedPartners = mapData.partners.filter((p:any) => p.type === type);
    this.activeMarkers[type] = [];
    this.activeLines[type] = [];
  
    selectedPartners.forEach((partner: any) => {
      let markerConfig = this.markerConfigList[partner.type]
      const hqMarker = L.marker([partner.hq_location.lat, partner.hq_location.lon], {
        icon: L.icon({
          iconUrl: markerConfig.icon,
          iconSize: [30, 45],
          className: "marker"
        })
      }).bindPopup(this.generatePopupContents(partner),{closeButton:false});
  
      hqMarker.addTo(this.map);
      this.activeMarkers[type].push(hqMarker);
  
      partner.other_locations.forEach((loc:any) => {
        const marker = L.marker([loc.lat, loc.lon], {
          icon: L.icon({
            iconUrl: markerConfig.icon,
            iconSize: [30, 45],
            className: "marker"
          })
        });
  
        marker.addTo(this.map);
        this.activeMarkers[type].push(marker);
  
        // const dottedLine = L.polyline(
        //   [[partner.hq_location.lat, partner.hq_location.lon], [loc.lat, loc.lon]], 
        //   { color: markerConfig.color, weight: 1, dashArray: "5", opacity: 0.8 , className: "connecting-lines"}
        // ).addTo(this.map);
  
        // this.activeLines[type].push(dottedLine);
      });
    });
  }

  private removeMarkersForType(type: string): void {
    if (this.activeMarkers[type]) {
      this.activeMarkers[type].forEach(marker => this.map.removeLayer(marker));
      delete this.activeMarkers[type];
    }
    if (this.activeLines[type]) {
      this.activeLines[type].forEach(line => this.map.removeLayer(line));
      delete this.activeLines[type];
    }
  }

  private updateActiveNames(type: string, isAdding: boolean) {
    const selectedPartners = mapData.partners.filter(p => p.type === type);
    selectedPartners.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  
    if (isAdding) {
      // this.activePartnerNames.push(...selectedPartners);
      this.activePartnerNames = selectedPartners;
    } else {
      this.activePartnerNames = this.activePartnerNames.filter((name:any) => !selectedPartners.includes(name));
    }
  }
  
  private showPartnerLinks(): void {
    this.removePartnerLinks()
    mapData.partner_links.forEach(link => {
      const fromPartner:any = mapData.partners.find(p => p.id === link.from_id);
      const toPartner:any = mapData.partners.find(p => p.id === link.to_id);
      const toPartnerLocation = toPartner.other_locations[link.to_location_id]
      if (!this.activeList.includes(fromPartner.type) || !this.activeList.includes(toPartner.type)) {
        return;
      }
  
      if (fromPartner && toPartner && toPartnerLocation) {
        const fromHQ:any = [fromPartner.hq_location.lat, fromPartner.hq_location.lon];
        // const toHQ:any = [toPartner.hq_location.lat, toPartner.hq_location.lon];
        const toHQ:any = [toPartnerLocation.lat, toPartnerLocation.lon];
  
        const curvedLine = L.polyline([fromHQ, toHQ], {
          color: "#ED2388",
          weight: 2,
          dashArray: "5",
          opacity: 0.8,
          smoothFactor: 1,
          className: "connecting-lines"
        }).addTo(this.map);
  
        this.activePartnerLinks.push(curvedLine);
      }
    });
  }
  
  private removePartnerLinks(): void {
    this.activePartnerLinks.forEach(line => this.map.removeLayer(line));
    this.activePartnerLinks = [];
  }

  redirect(option:any){
    window.open(option.website, '_blank');
  }

  generatePopupContents(data:any){
    let htmlContent = `<div class="marker-popup">
      <div class="name-image">
        <h1>${data.name}</h1>
        <img src="./assets/${data.logo}" alt="logo" />
      </div>
      <a href="${data.website}" target="_blank">Website</a><br/>
      <p>${data.description}</p>
    </div>`

    return htmlContent
  }
}