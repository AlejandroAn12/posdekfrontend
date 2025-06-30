import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveInventoryComponent } from './save-inventory.component';

describe('SaveInventoryComponent', () => {
  let component: SaveInventoryComponent;
  let fixture: ComponentFixture<SaveInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
