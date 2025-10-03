import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProductPage } from './upload-product-page';

describe('UploadProductPage', () => {
  let component: UploadProductPage;
  let fixture: ComponentFixture<UploadProductPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadProductPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
