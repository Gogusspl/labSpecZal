import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModel } from '../shared-model/shared-model';

@Component({
  selector: 'app-learn-with-ai',
  standalone: true,
  imports: [FormsModule, SharedModel],
  templateUrl: './learn-with-ai.html',
  styleUrl: './learn-with-ai.css',
})
export class LearnWithAi {

  message = '';
  response = '';

  constructor(private http: HttpClient) {}

  send() {
    this.http.post<any>('http://localhost:8080/api/chat', {
      message: this.message
    }).subscribe(res => {
      this.response = res.response;
    });
  }
}