import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModel } from '../shared-model/shared-model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, SharedModel],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
}
