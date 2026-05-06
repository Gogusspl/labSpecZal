import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { SharedModel } from '../shared-model/shared-model';
import { NgFor, NgClass } from '@angular/common';

type ChatMessage = {
  text: string;
  sender: 'user' | 'bot';
};

@Component({
  selector: 'app-learn-with-ai',
  standalone: true,
  imports: [FormsModule, SharedModel, NgClass, NgFor],
  templateUrl: './learn-with-ai.html',
  styleUrl: './learn-with-ai.css',
})
export class LearnWithAi {

  message = '';
  messages: ChatMessage[] = [];

  constructor(private http: HttpClient) {
    this.loadMessages();
  }

  send() {
    if (!this.message.trim()) return;

    this.messages.push({
      text: this.message,
      sender: 'user'
    });

    const userMessage = this.message;
    this.message = '';

    this.saveMessages();

    this.http.post<any>('http://localhost:8080/api/chat', {
      message: userMessage
    }).subscribe(res => {

      this.messages.push({
        text: res.response,
        sender: 'bot'
      });

      this.saveMessages();
    });
  }

  saveMessages() {
    sessionStorage.setItem('chat', JSON.stringify(this.messages));
  }

  loadMessages() {
    const data = sessionStorage.getItem('chat');
    if (data) {
      this.messages = JSON.parse(data);
    }
  }
}