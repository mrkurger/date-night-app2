import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'advertiser-browsing',
    loadChildren: () =>
      import('./features/advertiser-browsing/advertiser-browsing.module').then(
        m => m.AdvertiserBrowsingModule,
      ),
  },
  {
    path: '',
    redirectTo: 'advertiser-browsing',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
