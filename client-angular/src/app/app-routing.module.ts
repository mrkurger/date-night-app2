import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { routes } from './app.routes';

/**
 * @deprecated This module is being phased out in favor of the standalone component approach.
 * See app.config.ts and app.routes.ts for the new routing configuration.
 * 
 * This module is kept for backward compatibility during the transition period.
 * New routes should be added to app.routes.ts.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: SelectivePreloadingStrategy,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    initialNavigation: 'enabledBlocking' // for SSR
  })],
  exports: [RouterModule],
  providers: [SelectivePreloadingStrategy]
})
export class AppRoutingModule { }
