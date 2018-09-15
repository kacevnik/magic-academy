<?php

    $db = mysqli_connect('mysql100.1gb.ru', 'gb_magic_wsms', 'aceacz6ztyu', 'gb_magic_wsms');
    if(!$db){
        echo "Ошибка: Невозможно установить соединение с MySQL." . PHP_EOL;
        echo "Код ошибки errno: " . mysqli_connect_errno() . PHP_EOL;
        echo "Текст ошибки error: " . mysqli_connect_error() . PHP_EOL;
    }
    mysqli_query($db, "SET NAMES 'utf8'");         //Установка кодировки данных из базы.

    /* FUNCTIONS */

    function getPhone($phone, $charts){
        $phone = trim($phone);
        $phone = str_replace($charts, "", $phone);
        $phone_array = str_split($phone);
        if($phone_array[0] == 8){
            $phone_text = "7";
            for ($i=0; $i < count($phone_array); $i++) { 
                if($i == 0){continue;}
                $phone_text.=$phone_array[$i];
            }
            return (int)$phone_text;
        }else{
            return (int)$phone;
        }
    }


    if($_POST['phone']){$phone   = htmlspecialchars($_POST['phone']);}
    if($_POST['name']){$name     = htmlspecialchars($_POST['name']);}
    if($_POST['email']){$email   = htmlspecialchars($_POST['email']);}

    if($phone){
        $phone = getPhone($phone, array("+", " ", "-", "(", ")", ".", ","));
    }

    if(filter_var($email, FILTER_VALIDATE_EMAIL) !== false){

    }else{
        unset($email);
    }


    if($email && $name && $phone){

        $time = time();

        $count = mysqli_query($db, "SELECT id FROM sms_users WHERE user_phone = '$phone' AND type='0'");
        if(mysqli_num_rows($count)== 0){
            $add = mysqli_query($db, "INSERT INTO sms_users (user_name, user_email, user_phone, unix_add) VALUES ('$name','$email','$phone','$time')");
            if($add){
                echo "Пользователь ". $name . " (". $email." ".$phone.") добавлен";
            }else{
                echo "Ошибка добавления данных в БД";
            }
        }else{
            echo "Такой Пользователь уже есть в Базе";
        }
    }else{
        echo "Ошибка проверки данных";
    }


?>