import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervQuestion } from './interv-question';

describe('IntervQuestion', () => {
  let component: IntervQuestion;
  let fixture: ComponentFixture<IntervQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntervQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(IntervQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
