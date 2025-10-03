import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { ApiService } from '@services/api';
import { EmptyGuid, LoginResponseDto, ProductCategoryDto, ProductUploadDto } from '@services/models';
import { Subscription } from 'rxjs';
import { FormsModule } from "@angular/forms";
import { CookieService } from 'ngx-cookie-service';

interface ImageWrapper {
  id: number;
  file: File | null;
  image: string | ArrayBuffer | null;
}

@Component({
  selector: 'app-upload-product-page',
  imports: [NavbarLayout, FormsModule],
  templateUrl: './upload-product-page.html',
  styleUrl: './upload-product-page.less'
})
export class UploadProductPage {
  protected selectedImages = signal<ImageWrapper[]>([]);
  protected previewPhoto = signal<ImageWrapper | null>(null);
  protected categories = signal<ProductCategoryDto[]>([]);

  protected productName = signal("");
  protected description = signal("");
  protected productCategory = signal(-1);
  protected price = signal(0);
  
  private currentImageId = 0;
  private subs: Subscription[] = [];

  constructor(
    protected api: ApiService,
    protected cookie: CookieService
  ) {}

  ngOnInit() {
    let sub = this.api.getProductCategories()
    .subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (response: HttpErrorResponse) => {
        console.error("Error: Failed to fetch product categories");
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
  
  onImageSelected(event: Event) {
    let element = event.target as HTMLInputElement;
    // console.log(element.files);
    let files = element.files;
    if (files === null) return;
    this.selectedImages.update(val => {

      for(let i = 0; i < files.length; i++) {
        this.currentImageId++;
        let file = files.item(i);
        if (file === null) continue;

        let img: ImageWrapper = {
          id: this.currentImageId,
          file: file,
          image: null
        };

        const reader = new FileReader();
        reader.onload = () => {
          img.image = reader.result;
          this.selectedImages.update(v => {
            v.push(img);
            return v;
          });
        }
        reader.readAsDataURL(file);
      }
      
      // this.currentImageId = currCount;
      return val;
    })
  }

  onPreviewImage(image: ImageWrapper) {
    this.previewPhoto.set(image);
  }

  deletePhoto(image: ImageWrapper | null) {
    if (image === null) return;
    
    this.selectedImages.update(v => v.filter(e => e.id != image.id));
    
    this.previewPhoto.set(null);
  }

  deleteAllImages() {
    this.selectedImages.set([]);
  }

  setCategory(event: Event) {
    let ev = event.target as HTMLSelectElement;
    this.productCategory.set(this.categories().find(e => e.name === ev.value)!.id);
  }

  upload() {
    let user = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
    let images: File[] = [];
    for(let i = 0; i < this.selectedImages().length; i++) {
      let imgWrapper = this.selectedImages().at(i);
      if (imgWrapper === undefined) continue;
      if (imgWrapper.file === null) continue;
      images.push(imgWrapper.file);
    }
    let formData = new FormData();
    for(let i = 0; i < images.length; i++) {
      formData.append(`Images`, images[i], images[i].name);
    }
    
    let dto: ProductUploadDto = {
      Name: this.productName(),
      Description: this.description(),
      Price: this.price(),
      ProductTypeId: this.productCategory(),
      UploaderId: user.userId,
      StoreId: EmptyGuid,
      SalePrice: this.price(),
      Images: images
    }
    console.log(`Uploading product`, dto);
    let res = this.api.uploadProduct(dto);
    if (res === undefined) {
      console.error("Error: Failed to upload product. User not logged in");
      return;
    }
    let sub = res.subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error("Error: Failed to upload.", response.error);
      },
      complete: () => {
        console.log("Upload complete");
      }
    })
  }
}
