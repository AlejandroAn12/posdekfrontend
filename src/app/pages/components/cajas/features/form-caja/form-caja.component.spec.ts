import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCajaComponent } from './form-caja.component';

describe('FormCajaComponent', () => {
  let component: FormCajaComponent;
  let fixture: ComponentFixture<FormCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
