# Команды сборки (Gulp)

Краткий обзор основных команд проекта (то, что находится в ```gulpfile.js```)

---

## Основные команды

### Разработка

```bash
gulp
```

Запускает dev-режим:
- Twig → HTML
- SCSS → CSS
- сборка JS
- генерация SVG-спрайта
- локальный сервер
- автопересборка при изменениях

---

### Production-сборка

```bash
gulp build
```

Собирает готовую версию сайта в папку:

```
build/
```

Эту папку нужно загружать на хостинг.

---

## Генерация HTML

```bash
gulp twig
gulp twig-blog
gulp twig-articles
```

Компилируют Twig-шаблоны в HTML:

- `layout/*.twig` → `source/*.html`
- `layout/blog/**` → `source/blog`
- `layout/articles/**` → `source/articles`

⚠ HTML в `source/` не редактируется вручную.

---

## Стили

```bash
gulp scss
```

SCSS → `assets/css/style.min.css`

```bash
gulp css
```

Подключает сторонние стили (normalize, animate) в проект.

---

## Скрипты

```bash
gulp libs
```

Собирает `libs.min.js`

```bash
gulp script
```

Минифицирует пользовательские JS → `js/min`

---

## SVG-иконки

```bash
gulp icons-twig
```

Объединяет `assets/images/icons/*.svg` в Twig-спрайт:

```
layout/partials/_icons.twig
```

Используется для вставки иконок через `<use>`.

---

## Автопересборка

```bash
gulp watch
```

Следит за изменениями:
- SCSS
- Twig
- JS
- SVG-иконки
