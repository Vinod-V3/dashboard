import { Component } from '@angular/core';
import { mapData } from '../../assets/sampleData';
import * as L from 'leaflet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animated-map',
  templateUrl: './animated-map.component.html',
  styleUrl: './animated-map.component.scss'
})
export class AnimatedMapComponent {
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
  // private activePartnerLinks: L.Polyline[] = [];
  private activePartnerLinks: { [key: string]: L.Polyline[] } = {};

  markerConfigList:any = {
    momentum : { hqIcon: "./assets/marker-icons/hq-circle.svg", icon: "./assets/marker-icons/circle.svg", color: "#572E91", priority: 1000 },
    strategic : { hqIcon: "./assets/marker-icons/hq-square.svg", icon: "./assets/marker-icons/square.svg", color: "orange", priority: 2000 },
    collaborator : { hqIcon: "./assets/marker-icons/hq-triangle.svg", icon: "./assets/marker-icons/triangle.svg", color: "red", priority: 4000 },
    anchor : { hqIcon: "./assets/marker-icons/hq-diamond.svg", icon: "./assets/marker-icons/diamond.svg", color: "pink", priority: 3000 }
  }

  currentImage:any = ""
  currentIndex = -1;
  isAnimating = false;
  isExiting = false;
  showImage = false
  selectedPartners:any = []
  animationComplete = false;
  selectedType = ""
  idsList:any = []

  mapZoom:any = localStorage.getItem('zoom') || 5
  mapData:any = {}

  constructor(private router: Router) {
    let data = localStorage.getItem("mapData")
    this.mapData = data ? JSON.parse(data) : mapData

    if(!this.mapData && !this.mapData.partners){
      return
    }
    this.optionsList = [...new Set(this.mapData.partners.map((p:any) => p.type))]

    this.optionsList = this.optionsList.map((data: any) => {
      return { label: this.optionLabels[data], type: data }
    })
  }
  

  ngOnInit(): void {
    // setInterval(() => {
    //   this.currentIndex = (this.currentIndex + 1) % mapData.partners.length; // Loop through images
    //   this.currentImage = mapData.partners[this.currentIndex].logo;
    //   this.addMarkers()
    // }, 10000);
    // return
    this.initMap();
  }

  nextImage() {
    let type = this.selectedType
    if (this.isExiting) return; // Prevent multiple clicks
    if (!this.isAnimating || this.currentIndex >= this.selectedPartners.length - 1) {
      this.isAnimating = false;
      this.animationComplete = true;
      this.showImage = false
      this.currentImage = ""
      return;
    }

    this.isExiting = true;  // Start exit animation
    this.currentIndex++;
    // this.showImage = false;

    // Wait for exit animation to complete before changing the image
    setTimeout(() => {
      // this.currentIndex = (this.currentIndex + 1) % mapData.partners.length;
      this.currentImage = this.selectedPartners[this.currentIndex].logo;

      this.isAnimating = false; // Reset animation
      this.isExiting = false;
      this.showImage = false
      // this.showMarkersForType("momentum")

      setTimeout(() => {
        // this.showImage = false
        this.isAnimating = true; // Restart animation for the new image
        this.showImage = true
        this.showMarkersForType(type,this.selectedPartners[this.currentIndex])
        // this.showPartnerLinks();
      }, 100); // Small delay to restart animation
    }, 2000); // Matches the exit animation duration
  }

  private async initMap() {
    this.map = L.map('mapOne', {
      center: [22.5937, 78.9629],
      zoom: 5,
      maxBounds: [
        [5.5, 88.0],  // Southwest India
        [38.5, 97.5]  // Northeast India
      ],
      maxBoundsViscosity: 1.0, // Prevents dragging outside bounds
      zoomControl: false
    });
  
    L.tileLayer('',
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abc',
        maxZoom: this.mapZoom,
        opacity:1,
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
            fillOpacity: 1,
          })
        }).addTo(this.map);
        this.map.fitBounds(L.geoJSON(data).getBounds());
      });
  }

  optionToggle($event:any){
    this.selectedType = $event.selectedOption
    let type = $event.selectedOption
    this.selectedPartners = this.mapData.partners.filter((p:any) => p.type === type).sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if ($event.isChecked) {
      this.currentIndex = -1;
      this.isAnimating = true;
      this.animationComplete = false;
      this.nextImage()
      // this.showMarkersForType(type);
      if(!this.activeList.includes(type)){
        this.activeList.push(type)
      }
      this.updateActiveNames(type, true);
    } else {
      this.animationComplete = true;
      this.selectedPartners = []
      this.currentImage = ""
      this.currentIndex = -1
      this.isAnimating = false
      this.showImage = false
      let currentOption = this.mapData.partners.filter((p:any) => p.type === type).map((data: any) => data.id);
      this.idsList = this.idsList.filter((id:any) => !currentOption.includes(id.id))
      this.removeMarkersForType(type);
      this.activeList = this.activeList.filter((data: any) => data != type)
      this.updateActiveNames(type, false);
    }
    // this.showPartnerLinks();
  }

  private showMarkersForType(type: string, data:any): void {
    const selectedPartners = this.mapData.partners.filter((p:any) => p.type === type)
    // this.activeMarkers[type] = [];
    // this.activeLines[type] = [];
    // this.activeMarkers[type].length ? this.activeMarkers[type] : []
    if(!this.activeMarkers[type]){
      this.activeMarkers[type] = []
    }
    let markerConfig = this.markerConfigList[type]
    const zIndexOffset = markerConfig.priority || 0;
    // const hqMarker = L.marker([data.hq_location.lat, data.hq_location.lon], {
    //   icon: L.icon({
    //     iconUrl: markerConfig.icon,
    //     iconSize: [30, 45],
    //     className: "marker"
    //   })
    // }).bindPopup(this.generatePopupContents(data),{closeButton:false});

    const hqMarker = L.marker([data.hq_location.lat, data.hq_location.lon], {
      icon: L.divIcon({
        html: `<div class='marker'><img src='${markerConfig.icon}'/></div>`,
        // iconUrl: markerConfig.icon,
        iconSize: [30, 45],
        className: "marker-div"
      })
    }).setZIndexOffset(zIndexOffset).bindPopup(this.generatePopupContents(data),{closeButton:false});

    hqMarker.addTo(this.map);
    this.idsList.push({id: data.id, connectionShown: false, ...data})
    this.activeMarkers[type].push(hqMarker);

    data.other_locations.forEach((loc:any) => {
      const marker = L.marker([loc.lat, loc.lon], {
        // icon: L.icon({
        //   iconUrl: markerConfig.icon,
        //   // iconUrl: this.getMarkerIcon("333399"),
        //   iconSize: [30, 45],
        //   className: "marker"
        // })
        icon: L.divIcon({
          html: `<div class='marker'><img src='${markerConfig.icon}'/></div>`,
          // iconUrl: this.getMarkerIcon("333399"),
          iconSize: [30, 45],
          className: "marker-div"
        })
      }).setZIndexOffset(zIndexOffset).bindPopup(this.generatePopupContents(data),{closeButton:false});

      marker.addTo(this.map);
      this.activeMarkers[type].push(marker);
    });

    this.showPartnerLinks()
    return
  
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
  return
      partner.other_locations.forEach((loc:any) => {
        // const marker = L.marker([loc.lat, loc.lon], {
        //   icon: L.icon({
        //     iconUrl: markerConfig.icon,
        //     iconSize: [30, 45],
        //     className: "marker"
        //   })
        // });
  
        // marker.addTo(this.map);
        // this.activeMarkers[type].push(marker);
  
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
    if (this.activePartnerLinks[type]) {
      this.activePartnerLinks[type].forEach(line => this.map.removeLayer(line));
      delete this.activePartnerLinks[type];
    }
  }

  private updateActiveNames(type: string, isAdding: boolean) {
    const selectedPartners = this.mapData.partners.filter((p:any) => p.type === type);
    selectedPartners.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  
    if (isAdding) {
      // this.activePartnerNames.push(...selectedPartners);
      this.activePartnerNames = selectedPartners;
    } else {
      this.activePartnerNames = this.activePartnerNames.filter((name:any) => !selectedPartners.includes(name));
    }
  }
  
  private showPartnerLinks(): void {
    // this.removePartnerLinks()
    this.mapData.partner_links.forEach((link: any) => {
      const fromPartner:any = this.mapData.partners.find((p:any) => p.id === link.from_id);
      const toPartner:any = this.mapData.partners.find((p:any) => p.id === link.to_id);
      const toPartnerLocation = toPartner.other_locations[link.to_location_id]

      let fromPartnerId = this.idsList.find((data:any) => data.id == fromPartner.id)
      let toPartnerId = this.idsList.find((data:any) => data.id == toPartner.id)
      if (!this.activeList.includes(fromPartner.type) || !this.activeList.includes(toPartner.type)) {
        return;
      }

      if(!fromPartnerId || !toPartnerId){
        return
      }

      if(fromPartnerId.connectionShown && toPartnerId.connectionShown && toPartnerLocation.connectionShown){
        return
      }

      // if(!this.idsList.includes(fromPartner.id) || !this.idsList.includes(toPartner.id)){
      //   return
      // }
  
      if (fromPartner && toPartner && toPartnerLocation) {
        // this.idsList = this.idsList.map((data:any) => {
        //   return ((data.id == fromPartner.id ) || (data.id == toPartner.id))? { ...data, connectionShown: true } : data
        // })

        this.idsList = this.idsList.map((data:any) => {
          return (data.id == fromPartner.id )? { ...data, connectionShown: true } : data
        })
        this.idsList = this.idsList.map((data:any) => {
          let otherLocationUpdate = data.other_locations
          if((data.id == toPartner.id) && otherLocationUpdate[link.to_location_id]){
            otherLocationUpdate[link.to_location_id].connectionShown = true
          }
          // otherLocationUpdate[link.to_location_id] = {...otherLocationUpdate[link.to_location_id], connectionShown: true}
          // otherLocationUpdate[link.to_location_id].connectionShown = true
          return (data.id == toPartner.id)? { ...data, connectionShown: true, other_locations: otherLocationUpdate } : data
        })
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

      // Append the gradient to the map container
      document.body.insertAdjacentHTML("beforeend", svgDefs);
  
        const curvedLine = (L as any).polyline(midpoint, {
        // const curvedLine = L.polyline([fromHQ, toHQ], {
          // color: "#ED2388",
          color: "url(#gradient)",
          weight: 10,
          dashArray: "1",
          opacity: 1,
          smoothFactor: 1,
          className: "connecting-lines"
        }).addTo(this.map);
  
        if(!this.activePartnerLinks[this.selectedType]){
          this.activePartnerLinks[this.selectedType] = []
        }
        this.activePartnerLinks[this.selectedType].push(curvedLine);
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
    // this.activePartnerLinks.forEach(line => this.map.removeLayer(line));
    // this.activePartnerLinks = [];
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

  getMarkerIcon(color: any){
    return `<svg 
      [attr.fill]="${color}" 
      [attr.stroke]="${color}" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="-9.78 -9.78 345.66 345.66">
    
      <g>
        <path d="M326.098,162.401c0-16.702-27.04-31.273-67.206-39.051c22.902-33.898,31.716-63.328,19.909-75.137 
          c-11.884-11.881-41.622-2.851-75.797,20.378C195.293,27.672,180.582,0,163.696,0c-17,0-31.788,28.04-39.455,69.397 
          C89.59,45.591,59.313,36.2,47.297,48.213C35.356,60.154,44.54,90.12,68.015,124.495C27.408,132.231,0,146.888,0,163.696 
          c0,16.699,27.042,31.271,67.207,39.048c-22.9,33.901-31.719,63.328-19.91,75.14c11.884,11.884,41.625,2.854,75.797-20.376 
          c7.71,40.918,22.419,68.59,39.307,68.59c17,0,31.789-28.04,39.453-69.397c34.651,23.809,64.934,33.197,76.946,21.184 
          c11.94-11.94,2.755-41.906-20.718-76.279C298.69,193.869,326.098,179.21,326.098,162.401z">
        </path>
      </g>
    </svg>`
  }

  nextPage(){
    this.router.navigate(["no-animation"])
  }

  navigateToAdmin(){
    this.router.navigate(['admin'])
  }
}