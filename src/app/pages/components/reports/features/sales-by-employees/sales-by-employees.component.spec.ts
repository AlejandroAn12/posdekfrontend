import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByEmployeesComponent } from './sales-by-employees.component';

describe('SalesByEmployeesComponent', () => {
  let component: SalesByEmployeesComponent;
  let fixture: ComponentFixture<SalesByEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
