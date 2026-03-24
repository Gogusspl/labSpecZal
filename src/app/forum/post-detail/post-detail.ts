import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Optional,
  signal,
  effect
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import csharp from 'highlight.js/lib/languages/csharp';

import { AuthService } from '../../AuthService';
import { SharedModel } from '../../shared-model/shared-model';
import { WebSocketService } from '../../websocket.service';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('csharp', csharp);

interface Post {
  id: number;
  title: string;
  text: string;
  code?: string;
  codeLanguage?: string;
  author?: string;
  createdAt?: string;
  replies?: number;
  views?: number;
  tags?: string[];
}

interface Comment {
  id?: number;
  postId: number;
  author: string;
  text?: string;
  code?: string;
  codeLanguage?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostDetailComponent implements OnInit, OnDestroy {

  @ViewChild('codeElement') codeElement!: ElementRef;
  @ViewChildren('commentCode') commentCodes!: QueryList<ElementRef>;

  post = signal<Post | undefined>(undefined);
  formattedDate = signal<string>('');
  comments = signal<Comment[]>([]);
  showCodeInput = signal(false);

  newComment = signal<Comment>({
    postId: 0,
    author: '',
    text: '',
    code: '',
    codeLanguage: ''
  });

  username: string | null = null;

  private readonly API = 'http://localhost:8080/api/posts';
  private readonly COMMENTS_API = 'http://localhost:8080/api/comments';

  private userSub?: Subscription;
  private postId!: number;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private wsService: WebSocketService,
    @Optional() private sharedModel?: SharedModel
  ) {

    // 🔥 highlight POST
    effect(() => {
      const currentPost = this.post();

      if (currentPost?.code) {
        setTimeout(() => {
          if (this.codeElement) {
            hljs.highlightElement(this.codeElement.nativeElement);
          }
        });
      }
    });

    // 🔥 highlight COMMENTS
    effect(() => {
      this.comments();

      setTimeout(() => {
        this.commentCodes?.forEach(el => {
          hljs.highlightElement(el.nativeElement);
        });
      });
    });

    // 🔥 USER
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.username = user;
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.postId = +id;

    // 🔹 LOAD POST
    this.loadPost();

    // 🔹 LOAD COMMENTS
    this.loadComments();

    // 🔥 WEBSOCKET
    this.wsService.subscribeToComments(this.postId, (newComment: Comment) => {

      const exists = this.comments().some(c => c.id === newComment.id);
      if (exists) return;

      this.comments.set([
        newComment,
        ...this.comments()
      ]);
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();

    // 🔥 bardzo ważne
    this.wsService.unsubscribeAll();
  }

  // 🔥 LOAD POST
  loadPost() {
    this.http.get<Post>(`${this.API}/${this.postId}`).subscribe({
      next: p => {
        this.post.set(p);

        if (p.createdAt) {
          this.formattedDate.set(this.timeAgo(p.createdAt));
        }

        this.newComment.update(c => ({
          ...c,
          postId: p.id
        }));
      },
      error: err => console.error(err)
    });
  }

  // 🔥 LOAD COMMENTS
  loadComments() {
    this.http.get<Comment[]>(`${this.COMMENTS_API}/${this.postId}`)
      .subscribe({
        next: data => this.comments.set(data),
        error: err => console.error(err)
      });
  }

  // 🔹 SETTERY
  setCommentText(value: string) {
    this.newComment.update(c => ({ ...c, text: value }));
  }

  setCommentCodeLanguage(value: string) {
    this.newComment.update(c => ({ ...c, codeLanguage: value }));
  }

  setCommentCode(value: string) {
    this.newComment.update(c => ({ ...c, code: value }));
  }

  toggleCodeInput() {
    this.showCodeInput.update(v => !v);
  }

  // 🔥 ADD COMMENT
  addComment() {
    if (!this.username) {
      this.sharedModel?.openLogin();
      return;
    }

    const comment = this.newComment();

    if (!comment.text?.trim() && !comment.code?.trim()) return;

    const payload = {
      postId: this.post()?.id,
      text: comment.text,
      code: comment.code,
      codeLanguage: comment.codeLanguage
    };

    this.http.post<Comment>(this.COMMENTS_API, payload)
      .subscribe({
        next: saved => {

          this.newComment.set({
            postId: this.post()?.id ?? 0,
            author: '',
            text: '',
            code: '',
            codeLanguage: ''
          });

          this.showCodeInput.set(false);
        },
        error: err => console.error(err)
      });
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  timeAgo(dateStr?: string): string {
    if (!dateStr) return '';

    const then = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return `${Math.floor(diff / 86400)}d`;
  }
}
