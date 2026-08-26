import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimedSutureLiveViewComponent } from './timed-suture-live-view.component';

describe('TimedSutureLiveViewComponent', () => {
  let component: TimedSutureLiveViewComponent;
  let fixture: ComponentFixture<TimedSutureLiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimedSutureLiveViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimedSutureLiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
