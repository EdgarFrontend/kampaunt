# КамПаунт (Kampaunt) — Архитектура проекта

> **Последнее обновление:** 2026-09-20
> **Назначение:** Система управления производством краски — калькулятор компонентов, управление вакумацией, история процессов.
> **Язык интерфейса:** Русский (ru)

---

## 1. Стек технологий

| Категория | Технология | Версия |
|---|---|---|
| Frontend фреймворк | React | 19.2.8 |
| Сборщик | Vite | 8.3.0 |
| Язык | TypeScript | 6.0.2 |
| CSS | Vanilla CSS + CSS Modules (`.module.css`) | — |
| Шрифт | Google Fonts — **Manrope** (400–800) | — |
| Роутинг | Без react-router (SPA с ручной навигацией через `useState<Page>`) | — |
| Бэкенд API | Vercel Serverless Functions (Express для локальной разработки) | — |
| ORM / БД | Prisma 5.22.0 → PostgreSQL (Prisma Data Proxy) | — |
| Хостинг | Vercel | — |
| Линтер | oxlint | 1.81.0 |
| Тема | Light / Dark (CSS custom properties + `data-theme` атрибут) | — |

---

## 2. Структура директорий

```
Kampaunt/
├── .env                          # DATABASE_URL (Prisma Postgres)
├── index.html                    # Точка входа HTML (lang="ru"), инлайн-скрипт темы
├── package.json                  # Зависимости и скрипты
├── vite.config.ts                # Vite конфиг + прокси /api → kampaunt.vercel.app
├── vercel.json                   # Конфиг Vercel (maxDuration: 10 для api/*.ts)
├── local-api.ts                  # Express-сервер для локальной разработки API
├── tsconfig.json                 # Корневой TS конфиг
├── tsconfig.app.json             # TS конфиг для фронтенда (target: es2023, jsx: react-jsx)
├── tsconfig.node.json            # TS конфиг для node-окружения
├── .oxlintrc.json                # Конфиг линтера
│
├── prisma/
│   └── schema.prisma             # Схема БД (VacuumHistory, Configuration)
│
├── api/                          # Vercel Serverless Functions
│   ├── lib/
│   │   └── prisma.ts             # Singleton PrismaClient
│   ├── config.ts                 # GET/POST /api/config
│   ├── history.ts                # GET/POST /api/history
│   └── history/
│       └── [id].ts               # DELETE /api/history/:id
│
├── public/
│   ├── favicon.svg               # Иконка приложения
│   └── icons.svg                 # SVG-спрайт иконок
│
└── src/
    ├── main.tsx                  # Точка входа React (createRoot, StrictMode выключен)
    ├── App.tsx                   # Корневой компонент — Layout + роутинг страниц
    ├── index.css                 # Глобальные стили, дизайн-система, CSS custom properties
    │
    ├── types/
    │   └── index.ts              # Все типы/интерфейсы проекта
    │
    ├── utils/
    │   └── index.ts              # Утилиты: DEFAULT_RECIPE, calculateIngredients, format*
    │
    ├── hooks/
    │   ├── useConfig.ts          # Загрузка/сохранение конфигурации (API + localStorage fallback)
    │   ├── useRecipe.ts          # Устаревший хук рецепта (только localStorage)
    │   ├── useTheme.ts           # Тема: light/dark, localStorage + system preference
    │   ├── useVacuumSettings.ts  # Устаревший хук длительности вакумации (только localStorage)
    │   └── useVacuumation.ts     # Основной хук вакумации: таймер, start/pause/resume/stop, история
    │
    ├── providers/                # Пустая директория (зарезервировано)
    ├── store/                    # Пустая директория (зарезервировано)
    │
    ├── assets/
    │   ├── hero.png              # Hero-изображение
    │   └── vite.svg              # SVG-лого Vite
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx       # Боковая навигация (4 пункта)
    │   │   ├── Sidebar.module.css
    │   │   ├── Header.tsx        # Шапка: заголовок, статус вакумации, переключатель темы
    │   │   ├── Header.module.css
    │   │   └── Layout.module.css # Grid-layout: sidebar + main
    │   │
    │   ├── calculator/
    │   │   ├── IngredientsTable.tsx      # Таблица компонентов краски
    │   │   └── IngredientsTable.module.css
    │   │
    │   ├── vacuum/
    │   │   ├── VacuumTimer.tsx           # Круговой таймер вакумации (SVG ring)
    │   │   └── VacuumTimer.module.css
    │   │
    │   └── ui/
    │       ├── PageLoader.tsx            # Анимированный лоадер (SVG капля краски)
    │       └── PageLoader.module.css
    │
    └── app/
        └── pages/
            ├── Dashboard/
            │   ├── Dashboard.tsx         # Главная: объём, ингредиенты, вакумация
            │   └── Dashboard.module.css
            ├── Calculator/
            │   ├── Calculator.tsx        # Калькулятор компонентов краски
            │   └── Calculator.module.css
            ├── Configuration/
            │   ├── Configuration.tsx      # Настройка рецепта и длительности вакумации
            │   └── Configuration.module.css
            └── History/
                ├── History.tsx           # История процессов + отчёт по производству
                └── History.module.css
```

---

## 3. Архитектура приложения

### 3.1 Навигация (ручная, без роутера)

Навигация реализована через `useState<Page>` в `App.tsx`. Тип `Page`:
```ts
type Page = 'dashboard' | 'calculator' | 'configuration' | 'history';
```

Sidebar содержит 4 пункта навигации. Переключение страниц — условный рендеринг в `App.tsx`.
**Нет react-router** — `react-router-dom` установлен в зависимостях, но **не используется**.

### 3.2 Иерархия компонентов

```
App
├── Sidebar (навигация, лого, профиль оператора)
├── Header (заголовок страницы, статус вакумации, тема)
└── [Страница]
    ├── Dashboard
    │   ├── Volume Card (ввод литров + пресеты 4/10/16)
    │   ├── Ingredients Card → IngredientsTable
    │   ├── Vacuum Card → VacuumTimer
    │   ├── Color Selection Modal
    │   └── Stop Confirmation Modal
    ├── Calculator → IngredientsTable
    ├── Configuration (редактирование рецепта + длительности)
    └── History (таблица + отчёт по производству + delete modal)
```

### 3.3 Управление состоянием

**Нет Redux/Zustand/Context** — всё на `useState` + кастомных хуках в `App.tsx`:

| Состояние | Хук/Источник | Персистентность |
|---|---|---|
| Текущая страница | `useState<Page>` | Нет |
| Тема (light/dark) | `useTheme()` | `localStorage` + system preference |
| Рецепт + длительность | `useConfig()` | API (`/api/config`) + localStorage fallback |
| Объём (литры) | `useState + localStorage` | `localStorage` (`kampaunt_liters`) |
| Вакумация (таймер) | `useVacuumation()` | `localStorage` (`kampaunt_vacuum`) |
| История процессов | `useVacuumation()` → fetch | API (`/api/history`) |

### 3.4 Ключи localStorage

| Ключ | Назначение |
|---|---|
| `kampaunt_theme` | Тема: `'light'` / `'dark'` |
| `kampaunt_liters` | Текущий объём в литрах |
| `kampaunt_vacuum` | Состояние вакумации (JSON `VacuumationState`) |
| `kampaunt_recipe` | Рецепт (fallback, используется `useConfig`) |
| `kampaunt_vacuum_duration` | Длительность (fallback) |

---

## 4. Типы данных

### 4.1 Основные типы (`src/types/index.ts`)

```ts
type Unit = 'кг' | 'г';

interface Component {
  id: string;       // 'ppkh', 'dinf', 'antioxidant', 'cykt', 'oil', 'dye'
  name: string;     // Название на русском
  amountPerLiter: number;  // Норма расхода на 1 литр
  unit: Unit;
}

interface Recipe {
  components: Component[];
}

interface PaintColor {
  name: string;     // Название цвета
  hex?: string;     // HEX-код (#FFFFFF)
}

type VacuumationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

interface VacuumationState {
  status: VacuumationStatus;
  startTime: number | null;
  endTime: number | null;
  pausedRemaining: number | null;
  durationMinutes: number;
  color: PaintColor | null;
  volumeLiters: number;
}

interface HistoryEntry {
  id: string;
  date: string;          // "19.09.2026"
  createdAt: string;     // "19.09.2026 12:30"
  startTime: string;
  endTime: string;
  durationMinutes: number;
  actualSeconds: number;  // Фактическое время без пауз
  volumeLiters: number;
  color: PaintColor | null;
  status: 'completed' | 'stopped';
}
```

### 4.2 Рецепт по умолчанию (DEFAULT_RECIPE)

| ID | Компонент | На 1 л | Единица |
|---|---|---|---|
| `ppkh` | ППХ | 0.5 | кг |
| `dinf` | Динф | 0.5 | кг |
| `antioxidant` | Антиоксидант(Порох) | 10 | г |
| `cykt` | Цинк | 15 | г |
| `oil` | Масло | 10 | г |
| `dye` | Краситель | 20 | г |

---

## 5. API Эндпоинты

Все API — Vercel Serverless Functions. Локально — Express-прокси (`local-api.ts`, порт 3000).

### 5.1 `GET /api/config`
Возвращает все ключи конфигурации из таблицы `Configuration` (JSON-encoded values).

### 5.2 `POST /api/config`
```json
{ "key": "recipe", "value": { ... } }
```
Upsert ключа конфигурации.

### 5.3 `GET /api/history`
Возвращает все записи `VacuumHistory`, отсортированные по `createdAtTs DESC`.
Маппинг: `colorName`/`colorHex` → объект `{ name, hex }`.

### 5.4 `POST /api/history`
Создаёт запись в `VacuumHistory`.

### 5.5 `DELETE /api/history/:id`
Удаляет запись по ID.

---

## 6. Схема базы данных (Prisma)

```prisma
model VacuumHistory {
  id              String   @id @default(cuid())
  date            String
  createdAt       String
  startTime       String
  endTime         String
  durationMinutes Int
  actualSeconds   Int
  volumeLiters    Float
  colorName       String?
  colorHex        String?
  status          String   // "completed" | "stopped"
  createdAtTs     DateTime @default(now())
}

model Configuration {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   // JSON encoded
  updatedAt DateTime @updatedAt
}
```

**БД:** PostgreSQL через Prisma Data Proxy (`pooled.db.prisma.io`).

---

## 7. Дизайн-система

### 7.1 CSS Custom Properties

Все стили определены через CSS custom properties в `src/index.css`. Две темы: `light` (по умолчанию) и `dark` (через `[data-theme='dark']`).

**Ключевые переменные:**
- Цвета: `--bg`, `--surface`, `--text-primary/secondary/tertiary`, `--border`, `--accent`, `--success`, `--warning`, `--danger`
- Тени: `--shadow-xs/sm/md/lg`
- Радиусы: `--radius-sm(8px)/md(12px)/lg(16px)/xl(20px)/full(9999px)`
- Layout: `--sidebar-width: 240px`, `--header-height: 64px`
- Переходы: `--transition: 150ms ease`, `--transition-md: 200ms ease`

### 7.2 Глобальные CSS-классы

| Класс | Назначение |
|---|---|
| `.btn`, `.btn-primary/secondary/ghost/danger` | Кнопки |
| `.btn-lg`, `.btn-sm`, `.btn-icon` | Размеры кнопок |
| `.card` | Карточки (surface + border + shadow) |
| `.input`, `.input-lg`, `.input-error` | Поля ввода |
| `.badge`, `.badge-idle/running/completed` | Статус-бейджи |
| `.label` | Лейблы для полей ввода |
| `.error-text` | Текст ошибки |
| `.pulse-dot` | Анимированная точка пульсации |
| `.fade-in-up` | Анимация появления |

### 7.3 CSS Modules

Каждый компонент имеет свой `.module.css` файл. Используется `import styles from './Component.module.css'` и `styles['class-name']`.

---

## 8. Скрипты запуска

| Команда | Описание |
|---|---|
| `npm run dev` | `concurrently "vite" "tsx local-api.ts"` — запуск Vite + Express API |
| `npm run build` | `tsc -b && vite build` — сборка |
| `npm run preview` | `vite preview` — превью сборки |
| `npm run lint` | `oxlint` — линтинг |
| `postinstall` | `prisma generate` — генерация Prisma Client |

---

## 9. Ключевая бизнес-логика

### 9.1 Калькулятор компонентов
**Формула:** `количество = amountPerLiter × liters`
- Функция `calculateIngredients()` в `src/utils/index.ts`
- Пресеты объёмов на Dashboard: **4, 10, 16** литров

### 9.2 Вакумация (Vacuum Process)
Полный жизненный цикл в `useVacuumation()`:

```
idle → [start] → running → [pause] → paused → [resume] → running → [complete] → completed
                    ↓                                          ↓
                 [stop]                                     [stop]
                    ↓                                          ↓
                 stopped                                   stopped
```

- **Таймер:** `setInterval(tick, 500)` — обновление каждые 500мс
- **Persistence:** Состояние сохраняется в `localStorage` — таймер продолжается после перезагрузки
- **При завершении/остановке:** Создаётся запись в истории (оптимистичный UI + POST /api/history)
- **Круговой прогресс:** SVG ring (radius=90, circumference=2πr)

### 9.3 Конфигурация
- Рецепт и длительность загружаются из API при старте (`useConfig`)
- Fallback на localStorage если API недоступен
- Сохранение: upsert в `Configuration` таблицу через POST /api/config
- Пресеты длительности: **30, 45, 60, 90, 120** минут

### 9.4 История
- Загружается лениво при переходе на страницу History (`onLoad` → GET /api/history)
- Отчёт по производству: группировка по цвету, подсчёт общего объёма
- Удаление: оптимистичный UI + DELETE /api/history/:id
- Подтверждение удаления через модальное окно

### 9.5 Цвета краски
Предустановки при запуске вакумации:
| Цвет | HEX |
|---|---|
| Белый | #FFFFFF |
| Чёрный | #111827 |
| Красный | #EF4444 |
| Оранжевый | #F97316 |
| Жёлтый | #fae829 |
| Зелёный | #22C55E |
| Синий | #3B82F6 |
| Фиолетовый | #A855F7 |

Также доступен ручной ввод названия и HEX-кода.

---

## 10. Layout и адаптивность

- **Desktop:** Sidebar (240px) + Main content
- **Mobile (≤768px):** Sidebar скрыт, открывается overlay по клику на burger-меню в Header
- Layout: `display: flex`, sidebar фиксирован, main `flex: 1`
- Content padding: 24px (desktop) / 16px (mobile)

---

## 11. Особенности и нюансы

### 11.1 Тема
- Inline-скрипт в `index.html` ставит `data-theme` ДО загрузки React (предотвращение FOUC)
- Приоритет: localStorage → system preference → light

### 11.2 StrictMode
- **Выключен** в `main.tsx` (закомментирован)

### 11.3 Устаревшие хуки
- `useRecipe.ts` — устарел, заменён на `useConfig.ts`
- `useVacuumSettings.ts` — устарел, заменён на `useConfig.ts`
- Оба используют только localStorage, не синхронизированы с API

### 11.4 Пустые директории
- `src/providers/` — пустая (зарезервировано под React Context)
- `src/store/` — пустая (зарезервировано под state management)

### 11.5 Зависимость react-router-dom
- Установлена в `package.json`, но **не используется** нигде в коде
- Навигация реализована вручную через `useState<Page>`

### 11.6 Vite прокси
- В dev-режиме `/api/*` проксируется на `https://kampaunt.vercel.app`
- Для локального API используется Express на порту 3000

### 11.7 Fullscreen-режимы
- Dashboard: калькулятор и вакумация могут разворачиваться в fullscreen overlay
- Calculator: таблица может разворачиваться в fullscreen

### 11.8 Модальные окна
- Выбор цвета перед запуском вакумации
- Подтверждение остановки вакумации
- Подтверждение удаления записи из истории

---

## 12. Зависимости

### Runtime
| Пакет | Версия |
|---|---|
| react | ^19.2.8 |
| react-dom | ^19.2.8 |
| react-router-dom | ^7.18.4 (не используется) |
| @prisma/client | 5.22.0 |
| @prisma/config | ^7.10.0 |

### Dev
| Пакет | Версия |
|---|---|
| vite | ^8.3.0 |
| @vitejs/plugin-react | ^6.1.1 |
| typescript | ~6.0.2 |
| prisma | 5.22.0 |
| express | ^5.2.1 |
| tsx | ^4.23.13 |
| concurrently | ^10.0.5 |
| dotenv | ^18.0.1 |
| @vercel/node | ^13.0.1 |
| oxlint | ^1.81.0 |

---

## 13. Деплой

- **Платформа:** Vercel
- **Frontend:** Vite build → static files
- **API:** `api/` директория → Vercel Serverless Functions (max duration: 10s)
- **БД:** Prisma Data Proxy → PostgreSQL (pooled.db.prisma.io)
- **URL:** https://kampaunt.vercel.app
