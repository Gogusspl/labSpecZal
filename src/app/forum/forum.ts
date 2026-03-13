import { Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedModel } from '../shared-model/shared-model';
import { AuthService } from '../AuthService';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';

interface Post {
  id?: number;
  title: string;
  text: string;
  code?: string;
  codeLanguage?: string;
  language?: string;
  author?: string;
  createdAt?: string;
  replies?: number;
  views?: number;
  tags?: string[];
}

interface PostPage {
  content: Post[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModel,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './forum.html',
  styleUrls: ['./forum.css']
})
export class Forum implements OnDestroy {
  private readonly API = 'http://localhost:8080/api/posts';

  posts = signal<Post[]>([]);
  trending = signal<Post[]>([]);

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  showNewPost = false;
  username: string | null = null;
  private userSub?: Subscription;

  @ViewChild(SharedModel) sharedModel!: SharedModel;

  newPost: Post = {
    title: '',
    text: '',
    codeLanguage: '',
    code: '',
    language: '',
    tags: []
  };

  tagInput = '';
  availableTags = ['Java', 'JavaScript', 'Python', 'Angular', 'CSS', 'HTML', 'SQL', 'TypeScript', 'RxJS'];
  tagSuggestions: string[] = [];

  languageFlags: { [key: string]: string } = {
    PL: 'PL',
    DE: 'DE',
    UK: 'UK',
    US: 'US',
    FR: 'FR',
    ES: 'ES',
    IT: 'IT'
  };

  constructor(
    private http: HttpClient,
    private el: ElementRef,
    private authService: AuthService,
    public route: ActivatedRoute,
    private router: Router
  ) {
    this.loadPosts();
    this.userSub = this.authService.currentUser$.subscribe((user: string | null) => {
      this.username = user;
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  loadPosts(page: number = 0) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', this.pageSize);

    this.http.get<PostPage>(this.API, { params }).subscribe({
      next: pageData => {
        this.posts.set(pageData.content);
        this.currentPage = pageData.number;
        this.totalPages = pageData.totalPages;

        const trend = [...pageData.content]
          .sort((a, b) => (b.replies ?? 0) - (a.replies ?? 0))
          .slice(0, 5);
        this.trending.set(trend);
      },
      error: err => console.error('Błąd pobierania postów', err)
    });
  }

  goBack() {
    this.router.navigate(['/forum']);
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.loadPosts(page);
    }
  }

  getVisiblePages(): (number | 'dots')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 6) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | 'dots')[] = [];
    pages.push(0);
    let start = Math.max(1, current - 2);
    let end = Math.min(total - 2, current + 2);
    if (current <= 3) { start = 1; end = 4; }
    else if (current >= total - 4) { start = total - 5; end = total - 2; }
    if (start > 1) pages.push('dots');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 2) pages.push('dots');
    pages.push(total - 1);
    return pages;
  }

  openNewPost() {
    if (!this.username) {
      this.sharedModel.openLogin();
      return;
    }
    this.showNewPost = true;
  }

  closeNewPost() {
    this.showNewPost = false;
  }

  submitPost() {
    if (!this.username) return;
    if (!this.newPost.title?.trim() || !this.newPost.text?.trim() || !this.newPost.language) return;
    if (this.newPost.code?.trim() && !this.newPost.codeLanguage) {
      alert('Please select a code language before adding code.');
      return;
    }
    this.newPost.author = this.username;
    this.http.post<Post>(this.API, this.newPost).subscribe({
      next: () => {
        this.resetNewPost();
        this.closeNewPost();
        this.loadPosts(0);
      },
      error: err => console.error('Błąd zapisu posta', err)
    });
  }

  resetNewPost() {
    this.newPost = { title: '', text: '', codeLanguage: '', code: '', language: '', tags: [] };
    this.tagInput = '';
    this.tagSuggestions = [];
  }

  onTagInputChange() {
    const q = this.tagInput.trim().toLowerCase();
    this.tagSuggestions = q
      ? this.availableTags.filter(t => t.toLowerCase().startsWith(q) && !(this.newPost.tags || []).includes(t)).slice(0, 6)
      : [];
  }

  addTagFromInput(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key !== 'Enter') return;
    const raw = this.tagInput.trim();
    if (!raw) return;
    const match = this.availableTags.find(t => t.toLowerCase() === raw.toLowerCase());
    this.addTag(match ?? raw);
    keyboardEvent.preventDefault();
  }

  addTag(tag: string) {
    if (!tag) return;
    this.newPost.tags = this.newPost.tags || [];
    if (!this.newPost.tags.includes(tag)) {
      this.newPost.tags.push(tag);
    }
    this.tagInput = '';
    this.tagSuggestions = [];
  }

  selectSuggestion(s: string) {
    this.addTag(s);
  }

  removeTag(tag: string) {
    this.newPost.tags = (this.newPost.tags || []).filter(t => t !== tag);
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
