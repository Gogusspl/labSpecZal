import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Backend } from './backend';

describe('Backend', () => {
  let component: Backend;
  let fixture: ComponentFixture<Backend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Backend],
    }).compileComponents();

    fixture = TestBed.createComponent(Backend);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
