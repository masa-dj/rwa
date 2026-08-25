import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteadyPathLiveViewComponent } from './steady-path-live-view.component';

describe('SteadyPathLiveViewComponent', () => {
  let component: SteadyPathLiveViewComponent;
  let fixture: ComponentFixture<SteadyPathLiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteadyPathLiveViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SteadyPathLiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
