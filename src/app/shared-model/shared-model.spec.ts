import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModel } from './shared-model';

describe('SharedModel', () => {
  let component: SharedModel;
  let fixture: ComponentFixture<SharedModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModel]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SharedModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
