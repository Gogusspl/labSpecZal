import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private client!: Client;
  private connected = false;
  private subscriptions: StompSubscription[] = [];
  private pendingSubscriptions: (() => void)[] = [];

  private ensureConnection() {
    if (this.client) return;

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('✅ WebSocket connected');

      this.pendingSubscriptions.forEach(fn => fn());
      this.pendingSubscriptions = [];
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('❌ WebSocket disconnected');
    };

    this.client.activate();
  }

  // 🔥 TU ZMIANA
  subscribeToPostUpdates(postId: number, onUpdate: (type: string) => void) {
    this.ensureConnection();

    const subscribeFn = () => {
      const sub = this.client.subscribe(`/topic/posts/${postId}`, msg => {
        onUpdate(msg.body); // 🔥 teraz OK
      });

      this.subscriptions.push(sub);
    };

    if (this.connected) {
      subscribeFn();
    } else {
      this.pendingSubscriptions.push(subscribeFn);
    }
  }

  subscribeToComments(postId: number, onMessage: (msg: any) => void) {
    this.ensureConnection();

    const subscribeFn = () => {
      const sub = this.client.subscribe(`/topic/comments/${postId}`, msg => {
        onMessage(JSON.parse(msg.body));
      });

      this.subscriptions.push(sub);
    };

    if (this.connected) {
      subscribeFn();
    } else {
      this.pendingSubscriptions.push(subscribeFn);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}
