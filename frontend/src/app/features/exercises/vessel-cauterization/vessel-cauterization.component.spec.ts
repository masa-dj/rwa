import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselCauterizationComponent } from './vessel-cauterization.component';

describe('VesselCauterizationComponent', () => {
  let component: VesselCauterizationComponent;
  let fixture: ComponentFixture<VesselCauterizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VesselCauterizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VesselCauterizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
