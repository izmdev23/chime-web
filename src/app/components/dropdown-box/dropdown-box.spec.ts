import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownBox } from './dropdown-box';

describe('DropdownBox', () => {
  let component: DropdownBox;
  let fixture: ComponentFixture<DropdownBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
