import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleMapComponent } from './simple-map/simple-map.component';
import { AnimatedMapComponent } from './animated-map/animated-map.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  {
    path: "",
    component: AnimatedMapComponent
  },
  {
    path: "no-animation",
    component: SimpleMapComponent
  },
  {
    path: "admin",
    component: AdminComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
