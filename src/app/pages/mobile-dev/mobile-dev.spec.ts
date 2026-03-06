import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileDev } from './mobile-dev';

describe('MobileDev', () => {
  let component: MobileDev;
  let fixture: ComponentFixture<MobileDev>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileDev],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileDev);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
