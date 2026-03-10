import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnWithAi } from './learn-with-ai';

describe('LearnWithAi', () => {
  let component: LearnWithAi;
  let fixture: ComponentFixture<LearnWithAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearnWithAi],
    }).compileComponents();

    fixture = TestBed.createComponent(LearnWithAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
