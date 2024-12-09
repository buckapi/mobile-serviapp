import { CommonModule } from '@angular/common';
import { Component,OnInit , ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { BreakpointObserver,  } from '@angular/cdk/layout';
import { DeviceService } from '@app/services/device.service';
import { RealtimeProfessionalsService } from '@app/services/realtime-professional.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCalendarHeader } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Injectable } from '@angular/core';
import { NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1; // Lunes como primer día de la semana
  }
}
registerLocaleData(localeEs);

@Component({
  selector: 'app-clinicdetail',
  standalone: true,
  imports: [CommonModule,MatDatepickerModule,MatNativeDateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  template: `
    <mat-calendar
      [dateClass]="dateClass"
      [startAt]="startDate"
      [minDate]="minDate"
      [maxDate]="maxDate"
      (selectedChange)="onDateSelected($event)"
    >
    </mat-calendar>
  `,
  styles: [
    `
      ::ng-deep .mat-calendar-body-cell.highlight-enabled-day {
        border: 1px solid rgba(59, 165, 168, 0.2) !important;
        background-color: rgba(59, 165, 168, 0.2) !important;
        color: #000 !important;
        border-radius: 50%;
      }
      ::ng-deep .mat-calendar-body-selected {
        background-color: #3b82f6 !important;
        border-radius: 50%;
        color: white !important;
        font-weight: bold;
      }
    `,
  ],
  templateUrl: './clinicdetail.component.html',
  styleUrl: './clinicdetail.component.css',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ]
})
export class ClinicdetailComponent implements OnInit {

  startDate = new Date(); // Fecha inicial
  minDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() - 3, 1); // 3 meses antes
  maxDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 3, 0); // 3 meses después




  cartQuantity: number = 0;

  isMobile: boolean = false;
 
  selectedService: any = null;
  
  workDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  selectedDates: Date | null = null;
  selectedDateText: string = '';

  dateClass = (date: Date): string => {
    return this.isDaySelectable(date) ? 'highlight-enabled-day' : '';
  };

  customHeader = CustomHeader;

  constructor(
    public device:DeviceService,
    public breakpointObserver: BreakpointObserver,
    public global:GlobalService,
    public auth:AuthPocketbaseService,
    public realtimeProfessionals:RealtimeProfessionalsService,
    private router: Router
  ){}
  // dateClass = (date: Date): string => {
  //   if (this.isDaySelectable(date)) {
  //     return 'highlight-enabled-day';
  //   }
  //   return '';
  // };

  // Verificar si el día es seleccionable según los días laborables
  getCartFromLocalStorage(): boolean {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return false;
    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) && parsedCart.length > 0;
  }
  private formatDate(date: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
  
    return `${mes} ${dia} de ${anio}`;
  }
  isDaySelectable = (date: Date | null): boolean => {
    if (!date || !this.global.clinicSelected?.days) return false;

    const daysMapping: Record<'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D', number> = {
      L: 1, // Lunes
      M: 2, // Martes
      X: 3, // Miércoles
      J: 4, // Jueves
      V: 5, // Viernes
      S: 6, // Sábado
      D: 0, // Domingo
    };

    const clinicDays = this.global.clinicSelected.days
    .split(',')
    .map((day) => {
      const key = day.trim().toUpperCase() as keyof typeof daysMapping;
      return daysMapping[key];
    })
    .filter((day) => day !== undefined);

    const dayOfWeek = date.getDay();
    return clinicDays.includes(dayOfWeek);
  };

  // onDateSelected(selectedDate: Date | null): void {
  //   if (selectedDate) {
  //     console.log('Fecha seleccionada:', selectedDate);
  //     this.selectedDates = selectedDate;
  //   } else {
  //     console.log('No se seleccionó ninguna fecha.');
  //   }
  // }
  onDateSelected(selectedDate: Date | null): void {
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);
      console.log('Fecha seleccionada:', formattedDate);
      this.selectedDateText = formattedDate; // Guardar el texto formateado
      this.selectedDates = selectedDate;
    } else {
      console.log('No se seleccionó ninguna fecha.');
    }
  }
  
  getQuantityInCart(serviceId:string) {
    const serviceInCart = this.global.cart.find(item => item.id === serviceId);
    return serviceInCart ? serviceInCart.quantity : 0;
  }
  goToOrden() {
    // Lógica para redirigir a la página de la orden pendiente
    console.log('Redirigir a la orden pendiente...');
  }
  addToCart(service: any) {
    if (!this.global.cart) {
      this.global.cart = [];
    }
  
    const clinicInCart = this.global.cart.length > 0 ? this.global.cart[0].clinicId : null;
    const currentClinicId = this.global.clinicSelected.id;
  
    if (clinicInCart && clinicInCart !== currentClinicId) {
      // Mostrar alerta si la clínica es diferente
      Swal.fire({
        title: 'Orden pendiente',
        html: 'Para crear una nueva orden, usted debe <a style="text-decoration: underline;" id="goToOrderLink" (click)="global.setRoute(\'shopping\')">completar la orden</a> que tiene pendiente.',
       
        // html: 'Para crear una nueva orden, usted debe completar la orden que tiene pendiente.',
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
      });
      return;
    }
  
    // Agregar servicio al carrito
    const existingService = this.global.cart.find(item => item.id === service.id);
    if (existingService) {
      existingService.quantity += 1;
    } else {
      this.global.cart.push({ ...service, quantity: 1, clinicId: currentClinicId });
    }
  
    // Guardar en localStorage
    this.saveCartToLocalStorage();
  }
  saveCartToLocalStorage() {
    this.global.updateCartQuantity(); 
    localStorage.setItem('cart', JSON.stringify(this.global.cart));
    this.global.cartStatus$.next(this.global.cart.length > 0);
  }  
  
  selectService(service: any) {
    // Verifica si el carrito tiene servicios de otra clínica
    const clinicInCart = this.global.cart.length > 0 ? this.global.cart[0].clinicId : null;
    const currentClinicId = this.global.clinicSelected.id;
  
    if (clinicInCart && clinicInCart !== currentClinicId) {
      // Mostrar alerta de advertencia con SweetAlert2
      Swal.fire({
        title: 'Orden pendiente',
        html: 'Para crear una nueva orden, usted debe <a href="javascript:void(0)" style="text-decoration: underline;" id="goToOrderLink">completar la orden</a> que tiene pendiente.',
        icon: 'warning',
        showConfirmButton: false
      });
      return; // Evita que seleccione el servicio
    } 
  
    // Selecciona el servicio si pertenece a la misma clínica o el carrito está vacío
    this.selectedService = service;
  }
  
  
  isServiceSelected(service: any): boolean {
    return this.selectedService === service;
  }
  ngOnInit() {
    this.global.cartQuantity$.subscribe(quantity => {
      this.global.cartQuantity = quantity;
    this.global.updateCartQuantity(); 

    });
    this.device.isMobile().subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  
    // Cargar el carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.global.cart = JSON.parse(savedCart);
    }
    
  }
  shouldShowStepper(service: any): boolean {
    const serviceInCart = this.global.cart.find(item => item.id === service.id);
    const quantityInCart = serviceInCart ? serviceInCart.quantity : 0;
    
    // Mostrar si el servicio está seleccionado o si su cantidad en el carrito es mayor a 0
    return this.isServiceSelected(service) || quantityInCart > 0;
  }
  isSameClinic(service: any): boolean {
    // Verifica si el carrito está vacío o si el primer servicio en el carrito es de la misma clínica
    if (!this.global.cart || this.global.cart.length === 0) {
      return true;
    }
  
    // Compara el `clinicId` del primer servicio en el carrito con el `global.clinicSelected.id`
    const clinicInCart = this.global.cart[0].clinicId;
    return clinicInCart === this.global.clinicSelected.id;
  }
  
  removeFromCart(service: any) {
    if (!this.global.cart) {
      this.global.cart = [];
    }
  
    const existingService = this.global.cart.find(item => item.id === service.id);
    if (existingService) {
      if (existingService.quantity > 1) {
        existingService.quantity -= 1;
      } else {
        this.global.cart = this.global.cart.filter(item => item.id !== service.id);
      }
    }
  
    // Guardar en localStorage
    this.saveCartToLocalStorage();
  }

  isDayInClinicDays(day: string): boolean {
    const validDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const daysString = this.global.clinicSelected?.days || '';
    const workDays = daysString 
    .split(',')
    .map(d => d.trim().toUpperCase())
    .filter(d => validDays.includes(d)); // Filtrar días válidos
    const normalizedDay = day.trim().toUpperCase();
    return workDays.includes(normalizedDay);
  }
  
    
  
  
  goToCalendar(): void {
    // Add your navigation logic here
    // For example, using Router:

    this.global.activeRoute = 'shopping';
  }
  }

@Component({
  selector: 'custom-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  styles: [`.mat-calendar-header .mat-calendar-controls .mat-calendar-period-button {
    font-size: 14px;
  }`],
  template: `
    <div class="mat-calendar-header">
      <div class="mat-calendar-controls">
        <!-- <button mat-button type="button" class="mat-calendar-period-button"
                (click)="currentPeriodClicked()">
          {{periodButtonText}}
        </button> -->
        <div class="mat-calendar-spacer"></div>
        <button mat-icon-button type="button" class="mat-calendar-previous-button"
                [disabled]="!previousEnabled()" (click)="previousClicked()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-icon-button type="button" class="mat-calendar-next-button"
                [disabled]="!nextEnabled()" (click)="nextClicked()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomHeader<D> extends MatCalendarHeader<D> {
}