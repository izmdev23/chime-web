import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@services/api';
import { Product } from '@services/models';
import { CookieService } from 'ngx-cookie-service';
import { UploadButton } from "@components/button/upload-button/upload-button";

@Component({
  selector: 'app-my-products-panel',
  imports: [UploadButton],
  templateUrl: './my-products-panel.html',
  styleUrl: './my-products-panel.less'
})
export class MyProductsPanel {
  protected products = signal<Product[]>([]);

  
}
