import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadMap } from './road-map';

describe('RoadMap', () => {
  let component: RoadMap;
  let fixture: ComponentFixture<RoadMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadMap],
    }).compileComponents();

    fixture = TestBed.createComponent(RoadMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
