# Модальные окна

## Подключение

Перед закрывающим тегом `</body>` вставьте следующий код

```html
<body>
    ...

    <!-- Подключение модуля модальных окон -->
    <script type="text/javascript" src="modules/modals/index.js"></script>
    <link rel="stylesheet" href="modules/modals/index.css">
</body>
```

## Использование

### Создание

Перед закрывающим тегом `</body>` вставьте код окна/окон

```html
<body>
    ...
    <!-- Модальные окна -->

    <!-- Первое окно -->
    <!-- id должен быть уникальным, нужен для вызова конкретного окна -->
    <div id="first" aria-hidden="true" class="modal fade">
        <!-- Обёртка окна, через CSS задаётся позиционирование и размеры окна -->
        <div class="modal-dialog">
            <!-- Обёртка контента окна, через CSS задаётся фон для всего окна, скругления краёв и т.д. -->
            <div class="modal-content">
                <!-- Шапка окна -->
                <div class="modal-header">
                    <button type="button" data-dismiss="modal" class="close"></button>
                    <h2 class="modal-title">Заголовок окна</h2>
                </div>
                <!-- Основной контенти окна (тело) -->
                <div class="modal-body">
                    <form class="form">
                        <div class="form__line">
                            <input type="text" name="user_name" placeholder="Ваше имя" class="form__input text_center _bordered">
                        </div>
                        <div class="form__line">
                            <input type="text" name="user_phone" placeholder="Ваш телефон" class="form__input text_center _bordered">
                        </div>
                        <div class="form__line">
                            <button type="submit" class="btn btn_lg btn_fill btn_blue form__btn">Оставить заявку</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>


</body>
```

### Вызов

Основы
* Модальное окно можно вызвать, только если вы создали его, выше описано как это сделать
* Клик по любому элементу (ссылка `<a>`, кнопка `<button>`, блок `div`, etc.) может вызвать окно только если
    - Элементу присвоен класс `js-modal-call`
    - У элемента есть data-атрибут `data-modal`, в значении которого, указан id модального окна, которое нужно вызвать

Несколько примеров вызова модального окна

```html
<body>
    ...
    <!-- Вызов кнопкой -->
    <button class="js-modal-call" data-modal="modal-button">Окно с id="modal-button"</button>
    <!-- Вызов ссылкой -->
    <a class="js-modal-call" data-modal="modal-link">Окно с id="modal-link"</a>
    <!-- Вызов блоком -->
    <div class="js-modal-call" data-modal="modal-block">Окно с id="modal-block"</div>
</body>
```

## Логика работы

Как работает скрипт?

1. Ищет кнопки/ссылки/элементы с классом `js-modal-call`
2. При клике на элемент с классом `js-modal-call` ищет у этого элемента data-атрибут `data-modal` и считывает его значение
3. Вызывает модальное окно с `id` соответствущим значению `data-modal` у нажатого элемента

## Автор

**Sergey Pankov**

* pankov.seryi@gmail.com
