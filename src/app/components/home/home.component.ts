import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@app/services/config.service';
import { CategoriesComponent } from '../categories/categories.component';
import { ServicesComponent } from '../services/services.component';
import { GlobalService } from '@app/services/global.service';
import { ReelsComponent } from '../reels/reels.component';
import { BannerComponent } from '../sections/banner/banner.component';
import { DeviceService } from '@app/services/device.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { FilterSpecialistsPipe } from '@app/pipes/filter-specialists.pipe';
import { RealtimeCategoriesService } from 'src/app/services/realtime-catwgories.service'; // {{ edit_1 }}
import { FavoritesService } from '@app/services/favorites.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BannerComponent,
    CommonModule,
    FilterSpecialistsPipe,
    CategoriesComponent,
    ServicesComponent,
    ReelsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  specialists: any[] = [];
  categories: any[] = []; // {{ edit_2 }}

  activeRoute = 'home';isListView: boolean = false;  // Por defecto, vista lista

  constructor(
    public device:DeviceService,
    public auth:AuthPocketbaseService,
    public global: GlobalService,
    public configService: ConfigService,
    private realtimeCategoriesService: RealtimeCategoriesService, // {{ edit_1 }}
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.realtimeCategoriesService.categories$.subscribe(categories => {
      this.categories = categories; // {{ edit_3 }}
    });
  }

  toggleView(view: string): void {
    this.isListView = (view === 'list');
  }

  async mostrarFavorito(event: Event, specialistId: string) {
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(specialistId, specialistId);
  }

  isFavorite(specialistId: string): boolean {
    return this.favoritesService.isFavorite(specialistId);
  }
}
