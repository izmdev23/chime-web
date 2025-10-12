import { Injectable } from '@angular/core';
import { CartItem, Product, ProductVariant } from '@lib/models';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  getTotalPrice(variant: ProductVariant | undefined, cartItem: CartItem): number {
    if (variant === undefined) return -1;
    return variant.price * cartItem.quantity;
  }
  
  toCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) return "Unavailable";
    if (value < 0) return "Unavailable"
      return `₱${value.toLocaleString()}`;
  }
}
