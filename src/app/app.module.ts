import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { SharedModule } from './shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { SimpleMapComponent } from './simple-map/simple-map.component';
import { AnimatedMapComponent } from './animated-map/animated-map.component';
import { AdminComponent } from './admin/admin.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    AppComponent,
    SimpleMapComponent,
    AnimatedMapComponent,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    SharedModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatInputModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
