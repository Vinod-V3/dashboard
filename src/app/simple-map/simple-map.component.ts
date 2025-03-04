import { Component } from '@angular/core';
import { mapData } from '../../assets/sampleData';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-simple-map',
  templateUrl: './simple-map.component.html',
  styleUrl: './simple-map.component.scss'
})
export class SimpleMapComponent { 
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
    momentum : { hqIcon: "./assets/marker-icons/hq-circle.svg", icon: "./assets/marker-icons/circle.svg", color: "#572E91", priority: 1000 },
    strategic : { hqIcon: "./assets/marker-icons/hq-square.svg", icon: "./assets/marker-icons/square.svg", color: "orange", priority: 2000 },
    collaborator : { hqIcon: "./assets/marker-icons/hq-triangle.svg", icon: "./assets/marker-icons/triangle.svg", color: "red", priority: 4000 },
    anchor : { hqIcon: "./assets/marker-icons/hq-diamond.svg", icon: "./assets/marker-icons/diamond.svg", color: "pink", priority: 3000 }
  }

  mapZoom:any = localStorage.getItem('zoom') || 5
  mapData:any = {}


  constructor(private router: Router, private location: Location) {
    let data = localStorage.getItem("mapData")
    this.mapData = data ? JSON.parse(data) : mapData

    if(!this.mapData && !this.mapData.partners){
      return
    }
    this.optionsList = [...new Set(this.mapData?.partners.map((p:any) => p.type))]

    this.optionsList = this.optionsList.map((data: any) => {
      return { label: this.optionLabels[data], type: data }
    })
  }
  

  ngOnInit(): void {
    this.initMap();
  }


  private async initMap() {
    this.map = L.map('mapTwo', {
      center: [22.5937, 78.9629],
      zoom: 5,
      maxBounds: [
        [5.5, 88.0],
        [38.5, 97.5]
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: false
    });
  
    L.tileLayer('',
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: this.mapZoom,
        opacity: 1,
        minZoom: this.mapZoom
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
            fillColor:"#FFCC99",
            fillOpacity: 1
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
    const selectedPartners = this.mapData.partners.filter((p:any) => p.type === type);
    this.activeMarkers[type] = [];
    this.activeLines[type] = [];
  
    selectedPartners.forEach((partner: any) => {
      let markerConfig = this.markerConfigList[partner.type]
      const zIndexOffset = markerConfig.priority || 0;
      const hqMarker = L.marker([partner.hq_location.lat, partner.hq_location.lon], {
        icon: L.divIcon({
          html: `<div class='marker'><img src='${markerConfig.icon}'/></div>`,
          // iconUrl: markerConfig.icon,
          iconSize: [30, 45],
          className: "marker-div"
        })
      }).setZIndexOffset(zIndexOffset).bindPopup(this.generatePopupContents(partner),{closeButton:false});
  
      hqMarker.addTo(this.map);
      this.activeMarkers[type].push(hqMarker);
  
      partner.other_locations.forEach((loc:any) => {
        const marker = L.marker([loc.lat, loc.lon], {
          icon: L.divIcon({
            html: `<div class='marker'><img src='${markerConfig.icon}'/></div>`,
            // iconUrl: markerConfig.icon,
            iconSize: [30, 45],
            className: "marker-div"
          })
        }).setZIndexOffset(zIndexOffset).bindPopup(this.generatePopupContents(partner),{closeButton:false});
  
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
    const selectedPartners = this.mapData.partners.filter((p:any) => p.type === type);
    selectedPartners.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  
    if (isAdding) {
      this.activePartnerNames = selectedPartners;
    } else {
      this.activePartnerNames = this.activePartnerNames.filter((name:any) => !selectedPartners.includes(name));
    }
  }
  
  private showPartnerLinks(): void {
    this.removePartnerLinks()
    this.mapData.partner_links.forEach((link:any) => {
      const fromPartner:any = this.mapData.partners.find((p:any) => p.id === link.from_id);
      const toPartner:any = this.mapData.partners.find((p:any) => p.id === link.to_id);
      const toPartnerLocation = toPartner.other_locations[link.to_location_id]
      if (!this.activeList.includes(fromPartner.type) || !this.activeList.includes(toPartner.type)) {
        return;
      }
  
      if (fromPartner && toPartner && toPartnerLocation) {
        const fromHQ:any = [fromPartner.hq_location.lat, fromPartner.hq_location.lon];
        // const toHQ:any = [toPartner.hq_location.lat, toPartner.hq_location.lon];
        const toHQ:any = [toPartnerLocation.lat, toPartnerLocation.lon];

        const midpoint = this.getBezierCurvePoints(fromPartner.hq_location, toPartnerLocation, 0.3, 30);

        const svgDefs = `
          <svg width="0" height="0">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="orange"/>
                <stop offset="100%" stop-color="green"/>
              </linearGradient>
            </defs>
          </svg>
        `;

        document.body.insertAdjacentHTML("beforeend", svgDefs);
        

        const curvedLine = (L as any).polyline(midpoint, {
        // const curvedLine = L.polyline([fromHQ, toHQ], {
          color: "url(#gradient)",
          weight: 10,
          dashArray: "1",
          opacity: 1,
          smoothFactor: 1,
          className: "connecting-lines"
        }).addTo(this.map);
        this.activePartnerLinks.push(curvedLine);
      }
    });
  }

  getBezierCurvePoints(latlng1:any, latlng2:any, curvature = 0.3, numPoints = 20) {
    const lat1 = latlng1.lat, lng1 = latlng1.lon;
    const lat2 = latlng2.lat, lng2 = latlng2.lon;
  
    const latMid = (lat1 + lat2) / 2;
    const lngMid = (lng1 + lng2) / 2;
  
    const dx = lat2 - lat1;
    const dy = lng2 - lng1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
  
    const controlLat = latMid + curvature * dist * Math.sin(angle);
    const controlLng = lngMid + curvature * dist * Math.cos(angle);
    const controlPoint = [controlLat, controlLng];
  
    const curvePoints = [];
    for (let t = 0; t <= 1; t += 1 / numPoints) {
      const lat =
        (1 - t) * (1 - t) * lat1 +
        2 * (1 - t) * t * controlPoint[0] +
        t * t * lat2;
  
      const lng =
        (1 - t) * (1 - t) * lng1 +
        2 * (1 - t) * t * controlPoint[1] +
        t * t * lng2;
  
      curvePoints.push([lat, lng]);
    }
  
    return curvePoints;
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
        <div class="image-div">
          <img src="./assets/${data.logo}" alt="logo" />
        </div>
      </div>
      <a href="${data.website}" target="_blank">Website</a><br/>
      <p>${data.description}</p>
    </div>`

    return htmlContent
  }

  goBack(){
    this.location.back()
  }

  navigateToAdmin(){
    this.router.navigate(['admin'])
  }
}
