import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname);
const tsConfigPath = path.join(projectRoot, 'tsconfig.json');

function fixMissingModules() {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
  const baseUrl = tsConfig.compilerOptions.baseUrl || '.';
  const paths = tsConfig.compilerOptions.paths || {};

  const missingModules = [
    '@/components/ui/button',
    '@/components/ui/card',
    '@/components/ui/input',
    '@/components/ui/label',
    '@/components/ui/alert',
    '@/components/ui/badge',
    '@/components/ui/scroll-area',
    '@/components/ui/tabs',
    '@/components/ui/checkbox',
    '@/components/ui/slider',
    '@/components/ui/progress',
    '@/components/ui/separator',
    '@/components/ui/skeleton',
    '@/components/ui/sheet',
    '@/components/ui/toast',
    '@/components/ui/toggle',
    '@/components/ui/tooltip',
    '@/components/ui/calendar',
    '@/components/ui/carousel',
    '@/components/ui/chart',
    '@/components/ui/context-menu',
    '@/components/ui/dialog',
    '@/components/ui/drawer',
    '@/components/ui/dropdown-menu',
    '@/components/ui/form',
    '@/components/ui/hover-card',
    '@/components/ui/navigation-menu',
    '@/components/ui/pagination',
    '@/components/ui/radio-group',
    '@/components/ui/resizable',
    '@/components/ui/select',
    '@/components/ui/sidebar',
    '@/components/ui/textarea',
    '@/components/ui/use-toast',
    '@/components/ui/accordion',
    '@/components/ui/breadcrumb',
    '@/components/ui/sonner',
    '@/components/ui/input-otp',
    '@/components/ui/EnhancedProfileCarousel',
    '@/components/ui/InfiniteScrollGrid',
    '@/components/ui/GamifiedContentHub',
    '@/components/ui/AdvertiserCard',
    '@/components/ui/advertiser-profile',
    '@/components/ui/image-gallery',
    '@/components/ui/service-card',
    '@/components/ui/review-list',
    '@/components/ui/vip-content',
    '@/components/ui/favorite-button',
    '@/components/ui/debug-info',
    '@/components/ui/media-ticker',
    '@/components/ui/advertiser-carousel',
    '@/components/ui/TipFrenzy',
    '@/components/ui/MasonryGrid',
    '@/components/ui/EnhancedCarousel',
    '@/components/ui/EnhancedNavbar',
    '@/components/ui/EnhancedTinderView',
    '@/components/ui/EnhancedProfileCarousel',
    '@/components/ui/InfiniteScrollGrid',
    '@/components/ui/GamifiedContentHub',
    '@/components/ui/AdvertiserCard',
    '@/components/ui/advertiser-profile',
    '@/components/ui/image-gallery',
    '@/components/ui/service-card',
    '@/components/ui/review-list',
    '@/components/ui/vip-content',
    '@/components/ui/favorite-button',
    '@/components/ui/debug-info',
    '@/components/ui/media-ticker',
    '@/components/ui/advertiser-carousel',
    '@/components/ui/TipFrenzy',
    '@/components/ui/MasonryGrid',
    '@/components/ui/EnhancedCarousel',
    '@/components/ui/EnhancedNavbar',
    '@/components/ui/EnhancedTinderView',
  ];

  missingModules.forEach(module => {
    if (!paths[module]) {
      paths[module] = [`${baseUrl}/${module.replace('@/components', 'src/components')}`];
    }
  });

  tsConfig.compilerOptions.paths = paths;
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

  console.log('Missing modules fixed in tsconfig.json');
}

fixMissingModules();
