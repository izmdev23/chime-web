import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProductsPanel } from './my-products-panel';

describe('MyProductsPanel', () => {
  let component: MyProductsPanel;
  let fixture: ComponentFixture<MyProductsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProductsPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProductsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
