import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdManagementComponent } from './features/ad-management/ad-management.component';
// ...import other migrated components...

const routes: Routes = [
  { path: '', redirectTo: '/browse', pathMatch: 'full' },
  { path: 'my-ads', component: AdManagementComponent },
  // ...other route configurations...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
