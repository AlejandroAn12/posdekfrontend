import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryInventoryComponent } from './history-inventory.component';

describe('HistoryInventoryComponent', () => {
  let component: HistoryInventoryComponent;
  let fixture: ComponentFixture<HistoryInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
