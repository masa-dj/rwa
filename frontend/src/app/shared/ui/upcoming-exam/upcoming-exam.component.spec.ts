import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingExamComponent } from './upcoming-exam.component';

describe('UpcomingExamComponent', () => {
  let component: UpcomingExamComponent;
  let fixture: ComponentFixture<UpcomingExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
