import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamLiveViewComponent } from './exam-live-view.component';

describe('ExamLiveViewComponent', () => {
  let component: ExamLiveViewComponent;
  let fixture: ComponentFixture<ExamLiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamLiveViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamLiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
