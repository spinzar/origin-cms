<?php

    // converts foo_bar & FooBar -> Foo Bar
    function awesome_case($string) {
        if (strpos($string, '_') !== false) {
            return ucwords(str_replace("_", " ", $string));
        }
        else {
            return ucwords(trim(preg_replace('/(?<!\ )[A-Z]/', ' $0', $string)));
        }
    }

    // generates a new random password
    function generate_password($length = null, $only_numbers = null) {
        if ($only_numbers) {
            $alphabet = "0123456789";
        }
        else {
            $alphabet = "abcdefghijklmnopqrstuwxyz_ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789@#$.";
        }

        $pass = array(); //remember to declare $pass as an array
        $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
        $length = $length ? $length : 10;
        for ($i = 0; $i < $length; $i++) {
            $n = rand(0, $alphaLength);
            $pass[] = $alphabet[$n];
        }

        return implode($pass); //turn the array into a string
    }

    // show var dump output to web
    function web_dump($var) {
        ob_start();
        var_dump($var);
        $output = ob_get_clean();

        // Add formatting
        $output = preg_replace("/\]\=\>\n(\s+)/m", "] => ", $output);

        $output = '<pre style="background: #FFFEEF; color: #000; border: 1px dashed #888; padding: 10px; margin: 10px 0; text-align: left;">'.$output.'</pre>';

        echo $output;
        exit();
    }

    // get translation text
    function _t($text) {
        $lang = auth()->user()->language;
        App::setLocale($lang);
        $lang_text = trans($lang . '.' . $text);

        if (strpos($lang_text, $lang . '.') !== false) {
            return $text;
        }
        else {
            return $lang_text;
        }
    }

    // convert hours to minutes
    function h2m($hours) { 
        $minutes = 0;

        if (strpos($hours, ':') !== false) {
            // Split hours and minutes. 
            list($hours, $minutes) = explode(':', $hours);
        }

        return $hours * 60 + $minutes;
    }

    // convert time to human readable format
    function human_readable($time) {
        $time = explode(":", $time);
        $hours = $time[0];
        $minutes = $time[1];
        $seconds = $time[2];

        $duration = '';

        if ((int) $hours) {
            $duration .= (int) $hours . ' hrs';
        }
        if ((int) $minutes) {
            $duration .= ' ' . (int) $minutes . ' mins';
        }
        if ((int) $seconds) {
            $duration .= ' ' . (int) $seconds . ' sec';
        }

        return $duration;
    }

    function insert_into_object($obj, $key, $value, $after) {
        $new_object = array();

        foreach((array) $obj as $k => $v) {
            $new_object[$k] = $v;

            if ($after == $k){
                $new_object[$key] = $value;
            }
        }

        $new_object = (object) $new_object;
        return $new_object;
    }

    function validateIndianMobileNumber($mobile_no) {
        if (preg_match('/^[789]\d{9}$/', $mobile_no, $matches)) {
            return true;
        }
        else {
            return false;
        }
    }

    function getAppName() {
        $composer = json_decode(file_get_contents(base_path().'/composer.json'), true);

        foreach ((array) data_get($composer, 'autoload.psr-4') as $namespace => $path)
        {
            foreach ((array) $path as $pathChoice)
            {
                if (realpath(app_path()) == realpath(base_path().'/'.$pathChoice)) return substr($namespace, 0, -1);
            }
        }

        throw new RuntimeException("Unable to detect application namespace.");
    }

    function spell_numbers($number) {
        $number = (string) $number;
        $len = strlen($number) - 1;
        $words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        $spelling = '';

        for ($x=0; $x<=$len; $x++) {
            $spelling .= $words[$number[$x]];
        }

        $spelling = trim($spelling);
        return $spelling;
    }

?>
