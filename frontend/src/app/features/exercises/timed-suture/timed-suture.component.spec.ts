import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimedSutureComponent } from './timed-suture.component';

describe('TimedSutureComponent', () => {
    let component: TimedSutureComponent;
    let fixture: ComponentFixture<TimedSutureComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TimedSutureComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimedSutureComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
