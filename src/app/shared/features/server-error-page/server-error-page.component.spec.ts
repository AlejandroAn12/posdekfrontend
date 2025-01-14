import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerErrorPageComponent } from './server-error-page.component';

describe('ServerErrorPageComponent', () => {
  let component: ServerErrorPageComponent;
  let fixture: ComponentFixture<ServerErrorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerErrorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerErrorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
