import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDev } from './game-dev';

describe('GameDev', () => {
  let component: GameDev;
  let fixture: ComponentFixture<GameDev>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDev],
    }).compileComponents();

    fixture = TestBed.createComponent(GameDev);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
