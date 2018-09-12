# Обработчик URL

## Подключение

Перед закрывающим тегом `</body>` вставьте следующий код

```html
<body>
    ...

    <!-- Подключение модуля обработки URL параметров -->
    <script type="text/javascript" src="modules/urlhandler/index.js"></script>
</body>
```

## Использование

Модуль обработки URL параметров возвращает два метода

* `set()` принимает массив названий нужных параметров и считывает их записывая в объект
* `get()` возвращает объект с URL параметрами и их значениями. Если URL содержит UTM метки и они были запрошены при вызове метода `set()`, то метод вовзращает объект URL параметров содержащий объект UTM запрошенных меток.

##### Пример возвращаемого значения

```javascript
{
  partner: 'Example',
  utm: {
    utm_source: 'example',
    utm_medium: 'example',
    utm_campaign: 'example',
    utm_term: 'example'
  }
}
```


## Автор

**Sergey Pankov**

* pankov.seryi@gmail.com
