import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementsProductsComponent } from './movements-products.component';

describe('MovementsProductsComponent', () => {
  let component: MovementsProductsComponent;
  let fixture: ComponentFixture<MovementsProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementsProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
