import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdBrowserComponent } from './features/ad-browser/ad-browser.component';
import { AdDetailsComponent } from './features/ad-details/ad-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/ad-browser', pathMatch: 'full' },
  { path: 'ad-browser', component: AdBrowserComponent },
  { path: 'ad-details/:adId', component: AdDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
