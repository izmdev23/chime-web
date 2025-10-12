import { Component } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ErrorBox } from "@components/error-box/error-box";


@Component({
  selector: 'app-upload-product-page',
  imports: [NavbarLayout, FormsModule, ReactiveFormsModule],
  templateUrl: './upload-product-page.html',
  styleUrl: './upload-product-page.less'
})
export class UploadProductPage {
  
  
}
