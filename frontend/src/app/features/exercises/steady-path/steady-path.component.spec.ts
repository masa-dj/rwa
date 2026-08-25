import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteadyPathComponent } from './steady-path.component';

describe('SteadyPathComponent', () => {
  let component: SteadyPathComponent;
  let fixture: ComponentFixture<SteadyPathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteadyPathComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SteadyPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
