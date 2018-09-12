# Объект настроек

## Подключение

Модуль настроек необходимо распологать **выше остальных модулей**, что бы они могли считать параметры, возвращаемые модулем настроек.

Перед закрывающим тегом `</body>`, но **выше остальных модулей** вставьте следующий код

```html
<body>
...
    <!-- Настройки -->
    <script type="text/javascript">
      // Создаём объект настроек
      var config = {
        tag: 'example',
        product: [
            'product_example',
            'product2_example',
            'etc'
        ],
        responder: 'example',
        final_url: 'http://example.com',
        default_utm: {
					utm_source: 'default',
					utm_medium: 'default',
					utm_term: 'default',
					utm_content: 'default',
					utm_campaign: 'default'
				}
      };
    </script>
</script>
```

Итоговое подключение со всеми модулями выглядит так

```html
<body>
...
    <!-- Модули -->
    <!-- Настройки -->
    <script type="text/javascript">
      // Создаём объект настроек
      var config = {
        tag: 'example',
        product: [
            'product_example',
            'product2_example',
            'etc'
        ],
        responder: 'example',
        final_url: 'http://example.com'
      };
    </script>
    <!-- Обработчик UTM меток -->
    <script type="text/javascript" src="modules/utmhandler/index.js"></script>
    <!-- Обработчик форм -->
    <script type="text/javascript" src="modules/formhandler/index.js"></script>
    <link rel="stylesheet" href="modules/formhandler/index.css">
    <!-- Модальные окна -->
    <script type="text/javascript" src="modules/modals/index.js"></script>
    <link rel="stylesheet" href="modules/modals/index.css">
    <!--/ Модули /-->
</script>
```

**Внимание!** Необходимо соблюдать порядок подключения модулей, т.к. каждый последующий модуль использует данные возвращаемые предыдущими.

## Использование

Модуль настроект не возвращает методов.

## Автор

**Sergey Pankov**

* pankov.seryi@gmail.com
* https://vk.com/id84656898
* https://twitter.com/pankovseryi
* https://github.com/pankovseryi
