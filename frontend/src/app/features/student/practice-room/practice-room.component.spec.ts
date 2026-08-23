import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeRoomComponent } from './practice-room.component';

describe('PracticeRoomComponent', () => {
  let component: PracticeRoomComponent;
  let fixture: ComponentFixture<PracticeRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
