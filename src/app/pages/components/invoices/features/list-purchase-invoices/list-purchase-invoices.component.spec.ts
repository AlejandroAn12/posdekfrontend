import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPurchaseInvoicesComponent } from './list-purchase-invoices.component';

describe('ListPurchaseInvoicesComponent', () => {
  let component: ListPurchaseInvoicesComponent;
  let fixture: ComponentFixture<ListPurchaseInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPurchaseInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPurchaseInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
