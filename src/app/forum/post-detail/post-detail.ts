import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import csharp from 'highlight.js/lib/languages/csharp';

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

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css'],
  encapsulation: ViewEncapsulation.None
})
export class PostDetailComponent implements OnInit {
  @ViewChild('codeElement') codeElement!: ElementRef;

  post = signal<Post | undefined>(undefined);
  formattedDate = signal<string>('');

  private readonly API = 'http://localhost:8080/api/posts';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Effect reaguje na zmiany sygnału post()
    effect(() => {
      const currentPost = this.post();
      if (currentPost?.code) {
        // setTimeout pozwala na renderowanie DOM zanim wywołamy highlight
        setTimeout(() => {
          if (this.codeElement) {
            hljs.highlightElement(this.codeElement.nativeElement);
            // W trybie zoneless musimy powiadomić Angulara o zmianach wprowadzonych przez bibliotekę zewnętrzną
            this.cdr.detectChanges();
          }
        }, 0);
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Post>(`${this.API}/${id}`).subscribe({
        next: p => {
          this.post.set(p);
          if (p.createdAt) {
            this.formattedDate.set(this.timeAgo(p.createdAt));
          }
        },
        error: err => console.error('Błąd pobierania posta', err)
      });
    }
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
