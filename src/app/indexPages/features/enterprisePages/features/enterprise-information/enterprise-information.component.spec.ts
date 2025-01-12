import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseInformationComponent } from './enterprise-information.component';

describe('EnterpriseInformationComponent', () => {
  let component: EnterpriseInformationComponent;
  let fixture: ComponentFixture<EnterpriseInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterpriseInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
