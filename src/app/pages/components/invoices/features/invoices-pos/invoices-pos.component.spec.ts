import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesPosComponent } from './invoices-pos.component';

describe('InvoicesPosComponent', () => {
  let component: InvoicesPosComponent;
  let fixture: ComponentFixture<InvoicesPosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesPosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
