import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionControlListComponent } from './option-control-list/option-control-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  


@NgModule({
    declarations: [
    OptionControlListComponent,
  ],
    imports: [CommonModule, MatSlideToggleModule, MatButtonModule, MatCardModule, BrowserAnimationsModule],
    exports: [OptionControlListComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
