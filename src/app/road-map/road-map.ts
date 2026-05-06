import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModel } from '../shared-model/shared-model';

type CardDef = {
  title: string;
  id: string;
  icon: string;
  iconType: 'fa' | 'mat';
  bg: string;
};

type Step = { id: string; title: string; subtitle?: string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModel],
  templateUrl: './road-map.html',
  styleUrls: ['./road-map.css']
})
export class RoadMap implements AfterViewInit, OnDestroy {
  @ViewChild('scroller', { static: false }) scroller?: ElementRef<HTMLDivElement>;

  cards: CardDef[] = [
    { id: 'backend',      title: 'Backend',            icon: 'dns',              iconType: 'mat', bg: 'backend' },
    { id: 'frontend',     title: 'Frontend',           icon: 'code',             iconType: 'mat', bg: 'frontend' },
    { id: 'database',     title: 'Database',           icon: 'storage',          iconType: 'mat', bg: 'database' },
    { id: 'mobile',       title: 'Mobile Development', icon: 'smartphone',       iconType: 'mat', bg: 'mobile' },
    { id: 'ai',           title: 'AI / Machine Learning', icon: 'psychology',    iconType: 'mat', bg: 'ai' },
    { id: 'game',         title: 'Game Development',   icon: 'sports_esports',   iconType: 'mat', bg: 'game' },
    { id: 'cybersecurity',title: 'Cybersecurity',      icon: 'security',         iconType: 'mat', bg: 'cybersecurity' },
    { id: 'graphic',      title: 'Graphic Design',     icon: 'palette',          iconType: 'mat', bg: 'graphic' },
  ];

  selectedPath?: CardDef | null = null;
  selectedLang?: string | null = null;
  languagesList: string[] = [];

  roadmapData: Record<string, Record<string, Step[]>> = {
    backend: {
      Java: [
        { id: '1', title: 'Core Java',     subtitle: 'OOP, Collections, Streams' },
        { id: '2', title: 'Build Tools',   subtitle: 'Maven/Gradle' },
        { id: '3', title: 'Web',           subtitle: 'Spring Boot, REST' },
        { id: '4', title: 'DB',            subtitle: 'SQL, JPA/Hibernate' },
        { id: '5', title: 'Testing',       subtitle: 'JUnit, Mocking' },
        { id: '6', title: 'Deploy',        subtitle: 'Docker, CI/CD' }
      ],
      'Node.js': [
        { id: '1', title: 'JavaScript/Node basics' },
        { id: '2', title: 'Express/Koa' },
        { id: '3', title: 'DB: Mongo / SQL' },
        { id: '4', title: 'Authentication' },
        { id: '5', title: 'Testing & Deploy' }
      ],
      'C++': [
        { id: '1', title: 'C++ Basics' },
        { id: '2', title: 'Pointers & Memory' },
        { id: '3', title: 'STL & Algorithms' },
        { id: '4', title: 'Network Programming' },
        { id: '5', title: 'Concurrency' }
      ],
      'C#': [
        { id: '1', title: 'C# Fundamentals' },
        { id: '2', title: 'ASP.NET Core' },
        { id: '3', title: 'Entity Framework' },
        { id: '4', title: 'Microservices' },
        { id: '5', title: 'Azure/AWS' }
      ],
      C: [
        { id: '1', title: 'C Fundamentals' },
        { id: '2', title: 'Pointers & Memory' },
        { id: '3', title: 'Data Structures' },
        { id: '4', title: 'System Programming' }
      ],
      Assembler: [
        { id: '1', title: 'CPU Architecture' },
        { id: '2', title: 'Basic Instructions' },
        { id: '3', title: 'Memory Addressing' },
        { id: '4', title: 'System Calls' }
      ],
      Python: [
        { id: '1', title: 'Python Basics' },
        { id: '2', title: 'Frameworks: Django/Flask' },
        { id: '3', title: 'Databases & ORM' },
        { id: '4', title: 'APIs & REST' },
        { id: '5', title: 'Deployment' }
      ],
      Ruby: [
        { id: '1', title: 'Ruby Basics' },
        { id: '2', title: 'Rails Framework' },
        { id: '3', title: 'RESTful APIs' },
        { id: '4', title: 'Testing' }
      ]
    },

    frontend: {
      React: [
        { id: '1', title: 'HTML & CSS Basics',  subtitle: 'Semantic HTML, Flexbox, Grid' },
        { id: '2', title: 'JavaScript ES6+',    subtitle: 'Arrow functions, Promises, Modules' },
        { id: '3', title: 'React Fundamentals', subtitle: 'Components, Props, State, Hooks' },
        { id: '4', title: 'State Management',   subtitle: 'Redux / Zustand / Context API' },
        { id: '5', title: 'Routing',            subtitle: 'React Router' },
        { id: '6', title: 'Testing & Build',    subtitle: 'Jest, Vite, CI/CD' }
      ],
      Angular: [
        { id: '1', title: 'TypeScript Basics' },
        { id: '2', title: 'Angular Components & Modules' },
        { id: '3', title: 'Services & Dependency Injection' },
        { id: '4', title: 'RxJS & Observables' },
        { id: '5', title: 'Routing & Guards' },
        { id: '6', title: 'Testing (Jasmine/Karma)' }
      ],
      'Vue.js': [
        { id: '1', title: 'Vue 3 Basics',     subtitle: 'Composition API, Options API' },
        { id: '2', title: 'Vue Router' },
        { id: '3', title: 'Pinia (State)' },
        { id: '4', title: 'Nuxt.js (SSR)' },
        { id: '5', title: 'Testing & Deploy' }
      ],
      'Svelte': [
        { id: '1', title: 'Svelte Basics' },
        { id: '2', title: 'Reactivity & Stores' },
        { id: '3', title: 'SvelteKit (Routing/SSR)' },
        { id: '4', title: 'Deploy & Optimize' }
      ]
    },

    database: {
      PostgreSQL: [
        { id: '1', title: 'Relational Basics',   subtitle: 'Tables, Keys, Normalization' },
        { id: '2', title: 'SQL Queries',          subtitle: 'SELECT, JOIN, Aggregates' },
        { id: '3', title: 'Indexes & Performance' },
        { id: '4', title: 'Transactions & ACID' },
        { id: '5', title: 'Advanced: JSON, Window Functions' }
      ],
      MySQL: [
        { id: '1', title: 'MySQL Basics' },
        { id: '2', title: 'SQL & Stored Procedures' },
        { id: '3', title: 'Replication & Scaling' },
        { id: '4', title: 'Backup & Security' }
      ],
      MongoDB: [
        { id: '1', title: 'NoSQL Concepts' },
        { id: '2', title: 'CRUD Operations' },
        { id: '3', title: 'Aggregation Pipeline' },
        { id: '4', title: 'Indexes & Performance' },
        { id: '5', title: 'Replication & Sharding' }
      ],
      Redis: [
        { id: '1', title: 'Redis Data Types' },
        { id: '2', title: 'Caching Patterns' },
        { id: '3', title: 'Pub/Sub & Streams' },
        { id: '4', title: 'Redis Cluster' }
      ],
      'SQLite': [
        { id: '1', title: 'Embedded DB Concepts' },
        { id: '2', title: 'SQL Basics' },
        { id: '3', title: 'Use Cases & Limitations' }
      ]
    },

    mobile: {
      'React Native': [
        { id: '1', title: 'React Basics',        subtitle: 'Components, Hooks' },
        { id: '2', title: 'React Native Core',   subtitle: 'Views, StyleSheet, Navigation' },
        { id: '3', title: 'State Management' },
        { id: '4', title: 'Native APIs',         subtitle: 'Camera, Location, Notifications' },
        { id: '5', title: 'Testing & Publish',   subtitle: 'App Store / Google Play' }
      ],
      Flutter: [
        { id: '1', title: 'Dart Basics' },
        { id: '2', title: 'Flutter Widgets' },
        { id: '3', title: 'State: BLoC / Riverpod' },
        { id: '4', title: 'Animations & UI' },
        { id: '5', title: 'Firebase & APIs' },
        { id: '6', title: 'Publish to Stores' }
      ],
      'Swift (iOS)': [
        { id: '1', title: 'Swift Basics' },
        { id: '2', title: 'SwiftUI / UIKit' },
        { id: '3', title: 'Networking & CoreData' },
        { id: '4', title: 'App Store Publishing' }
      ],
      'Kotlin (Android)': [
        { id: '1', title: 'Kotlin Basics' },
        { id: '2', title: 'Android Jetpack' },
        { id: '3', title: 'MVVM & Room DB' },
        { id: '4', title: 'Retrofit & Coroutines' },
        { id: '5', title: 'Google Play Publishing' }
      ]
    },

    ai: {
      Python: [
        { id: '1', title: 'Python & Math',        subtitle: 'NumPy, Pandas, Linear Algebra' },
        { id: '2', title: 'Data Wrangling',        subtitle: 'EDA, Matplotlib, Seaborn' },
        { id: '3', title: 'ML Fundamentals',       subtitle: 'Scikit-learn, Regression, Classification' },
        { id: '4', title: 'Deep Learning',         subtitle: 'TensorFlow / PyTorch, CNNs, RNNs' },
        { id: '5', title: 'NLP',                   subtitle: 'Transformers, HuggingFace' },
        { id: '6', title: 'MLOps & Deploy',        subtitle: 'Docker, FastAPI, Cloud' }
      ],
      'LLM Engineering': [
        { id: '1', title: 'Prompt Engineering' },
        { id: '2', title: 'LangChain / LlamaIndex' },
        { id: '3', title: 'RAG & Vector DBs' },
        { id: '4', title: 'Fine-tuning Models' },
        { id: '5', title: 'Agents & Tool Use' }
      ],
      'Computer Vision': [
        { id: '1', title: 'Image Processing',      subtitle: 'OpenCV Basics' },
        { id: '2', title: 'CNNs & Feature Maps' },
        { id: '3', title: 'Object Detection',      subtitle: 'YOLO, Faster R-CNN' },
        { id: '4', title: 'Segmentation & GANs' }
      ]
    },

    game: {
      Unity: [
        { id: '1', title: 'C# Basics' },
        { id: '2', title: 'Unity Editor & Scene' },
        { id: '3', title: 'Physics & Collisions' },
        { id: '4', title: 'UI & Audio' },
        { id: '5', title: 'Animations & Shaders' },
        { id: '6', title: 'Build & Publish' }
      ],
      'Unreal Engine': [
        { id: '1', title: 'Blueprints Basics' },
        { id: '2', title: 'C++ in Unreal' },
        { id: '3', title: 'Level Design & Lighting' },
        { id: '4', title: 'AI & Gameplay Systems' },
        { id: '5', title: 'Optimization & Publishing' }
      ],
      Godot: [
        { id: '1', title: 'GDScript Basics' },
        { id: '2', title: 'Nodes & Scenes' },
        { id: '3', title: 'Physics & Tilemaps' },
        { id: '4', title: 'Shaders & Export' }
      ],
      'Pygame (Python)': [
        { id: '1', title: 'Python Basics' },
        { id: '2', title: 'Pygame Setup & Loop' },
        { id: '3', title: 'Sprites & Collision' },
        { id: '4', title: 'Sound & Publish' }
      ]
    },

    cybersecurity: {
      'Ethical Hacking': [
        { id: '1', title: 'Networking Basics',     subtitle: 'TCP/IP, DNS, HTTP' },
        { id: '2', title: 'Linux & Command Line' },
        { id: '3', title: 'Reconnaissance',        subtitle: 'OSINT, Nmap, Recon-ng' },
        { id: '4', title: 'Exploitation',          subtitle: 'Metasploit, Buffer Overflow' },
        { id: '5', title: 'Web Hacking',           subtitle: 'OWASP Top 10, Burp Suite' },
        { id: '6', title: 'CTF & Certifications',  subtitle: 'CEH, OSCP' }
      ],
      'Blue Team / Defense': [
        { id: '1', title: 'Security Fundamentals' },
        { id: '2', title: 'SIEM & Log Analysis' },
        { id: '3', title: 'Incident Response' },
        { id: '4', title: 'Threat Intelligence' },
        { id: '5', title: 'SOC Analyst Skills' }
      ],
      'Cryptography': [
        { id: '1', title: 'Math Foundations' },
        { id: '2', title: 'Symmetric Encryption',  subtitle: 'AES, DES' },
        { id: '3', title: 'Asymmetric Encryption', subtitle: 'RSA, ECC' },
        { id: '4', title: 'Hashing & Signatures' },
        { id: '5', title: 'PKI & TLS/SSL' }
      ],
      'Cloud Security': [
        { id: '1', title: 'Cloud Basics', subtitle: 'AWS/Azure/GCP' },
        { id: '2', title: 'IAM & Least Privilege' },
        { id: '3', title: 'Network Security Groups' },
        { id: '4', title: 'DevSecOps & Compliance' }
      ]
    },

    graphic: {
      'UI/UX Design': [
        { id: '1', title: 'Design Principles',    subtitle: 'Typography, Color, Layout' },
        { id: '2', title: 'Wireframing',          subtitle: 'Figma, Sketch' },
        { id: '3', title: 'Prototyping & Flow' },
        { id: '4', title: 'User Research & Testing' },
        { id: '5', title: 'Design Systems' }
      ],
      'Figma': [
        { id: '1', title: 'Figma Basics' },
        { id: '2', title: 'Auto Layout & Components' },
        { id: '3', title: 'Prototyping & Animations' },
        { id: '4', title: 'Design Tokens & Handoff' }
      ],
      'Adobe Illustrator': [
        { id: '1', title: 'Vector Basics' },
        { id: '2', title: 'Shapes & Pathfinder' },
        { id: '3', title: 'Typography & Logos' },
        { id: '4', title: 'Export & Print Ready' }
      ],
      'Adobe Photoshop': [
        { id: '1', title: 'Layers & Masks' },
        { id: '2', title: 'Retouching & Adjustments' },
        { id: '3', title: 'Compositing' },
        { id: '4', title: 'Web & Print Export' }
      ]
    }
  };

  canScrollLeft = false;
  canScrollRight = true;
  private onScrollerScroll = () => this.updateScrollButtons();

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateScrollButtons();
      if (this.scroller?.nativeElement) {
        this.scroller.nativeElement.addEventListener('scroll', this.onScrollerScroll, { passive: true });
      }
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.scroller?.nativeElement) {
      this.scroller.nativeElement.removeEventListener('scroll', this.onScrollerScroll);
    }
  }

  selectPath(card: CardDef) {
    if (this.selectedPath?.id === card.id) {
      this.selectedPath = null;
      this.selectedLang = null;
      this.languagesList = [];
      return;
    }

    this.selectedPath = card;
    const data = this.roadmapData[card.id];
    if (data) {
      this.languagesList = Object.keys(data);
      this.selectedLang = null;
    } else {
      this.languagesList = [];
      this.selectedLang = null;
    }
  }

  selectLang(lang: string) {
    this.selectedLang = lang;
  }

  get currentSteps(): Step[] {
    if (!this.selectedPath || !this.selectedLang) return [];
    return this.roadmapData[this.selectedPath.id]?.[this.selectedLang] ?? [];
  }

  next() {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 360);
  }

  prev() {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 360);
  }

  updateScrollButtons() {
    const el = this.scroller?.nativeElement;
    if (!el) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      return;
    }
    this.canScrollLeft = el.scrollLeft > 8;
    this.canScrollRight = (el.scrollWidth - el.clientWidth - el.scrollLeft) > 8;
  }

  @HostListener('window:resize')
  onResize() {
    setTimeout(() => this.updateScrollButtons(), 120);
  }
}
