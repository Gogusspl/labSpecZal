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
  effect,
  ChangeDetectorRef
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
  language?: string;
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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    @Optional() private sharedModel?: SharedModel
  ) {

    // 🔥 highlight post code
    effect(() => {
      const currentPost = this.post();
      if (currentPost?.code) {
        setTimeout(() => {
          if (this.codeElement) {
            hljs.highlightElement(this.codeElement.nativeElement);
            this.cdr.detectChanges();
          }
        }, 0);
      }
    });

    // 🔥 highlight komentarzy
    effect(() => {
      this.comments();
      setTimeout(() => {
        this.commentCodes?.forEach(el => {
          hljs.highlightElement(el.nativeElement);
        });
        this.cdr.detectChanges();
      }, 0);
    });

    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.username = user;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const postId = +id;

      // 🔹 POST
      this.http.get<Post>(`${this.API}/${postId}`).subscribe({
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

      // 🔹 COMMENTS
      this.loadComments(postId);
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  // 🔥 LOAD COMMENTS Z BACKENDU
  loadComments(postId: number) {
    this.http.get<Comment[]>(`${this.COMMENTS_API}/${postId}`)
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

  // 🔥 ADD COMMENT -> BACKEND
  addComment() {
    if (!this.username) {
      this.sharedModel?.openLogin();
      return;
    }

    const comment = this.newComment();

    if (!comment.text?.trim() && !comment.code?.trim()) {
      return;
    }

    const payload = {
      postId: this.post()?.id,
      text: comment.text,
      code: comment.code,
      codeLanguage: comment.codeLanguage
    };

    this.http.post<Comment>(this.COMMENTS_API, payload)
      .subscribe({
        next: saved => {
          // 🔥 dodajemy na górę listy
          this.comments.set([saved, ...this.comments()]);

          // 🔥 reset formularza
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
