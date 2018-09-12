# Обработчик форм

## Подключение

Перед закрывающим тегом `</body>` вставьте следующий код

```html
<body>
	...

	<!-- Подключение модуля обработки форм -->
	<script type="text/javascript" src="modules/formhandler/index.js"></script>
	<link rel="stylesheet" href="modules/formhandler/index.css">
</body>
```

## Использование

**К форме, которую необходимо обрабатывать**

Добавить класс `js-form`

```html
<body>
	...

	<!-- Форма, которую нужно обработать -->
	<form class="js-form">
		...
	</form>

	...
</body>
```

Добавить кнопку отправки с атрибутом `type="submit"`

```html
<body>
	...

	<!-- Форма, которую нужно обработать -->
	<form class="js-form">
		...

		<button type="submit">Отправить</button>
	</form>

	<!-- Или -->
	
	<!-- Форма, которую нужно обработать -->
	<form class="js-form">
		...

		<input type="submit" value="Отправить">
	</form>

	...
</body>
```

## Настройка

### Инициализация обработчика

В конце файла `formhandler/index.js` добавить вызов модуля с передачей параметров:
* `form не обязателен` {String} селектор (tag, id, class), который ищет обработчик
* `handler обязателен` {String} путь к php скрипту, который принимает запросы обработчика

```js
// Пример инициализации обработчика
FormHandler({
  handler: './handler/form_sender.php',
});
```

По умолчанию обработчик инициализируется со следующими параметрами

```js
FormHandler({
  form: '.js-form',
  handler: './handler/form_sender.php',
});
```


## Автор

**Sergey Pankov**

* pankov.seryi@gmail.com
