<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $number = $_POST["number"];
    echo convertirNumeroALetras($number);
}

function convertirNumeroALetras(number) {
    const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['cien', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (number < 10) {
        return unidades[number];
    } else if (number < 20) {
        return especiales[number - 11];
    } else if (number < 100) {
        const decena = Math.floor(number / 10);
        const unidad = number % 10;
        if (unidad === 0) {
            return decenas[decena - 1];
        } else {
            return `${decenas[decena - 1]} y ${unidades[unidad]}`;
        }
    } else if (number < 1000) {
        const centena = Math.floor(number / 100);
        const decena = Math.floor((number % 100) / 10);
        const unidad = number % 10;
        if (decena === 0 && unidad === 0) {
            return centenas[centena - 1];
        } else if (decena === 0 && unidad !== 0) {
            return `${centenas[centena - 1]} ${unidades[unidad]}`;
        } else if (decena === 1 && unidad === 0) {
            return `${centenas[centena - 1]} ${decenas[decena - 1]}`;
        } else if (decena === 1 && unidad !== 0) {
            return `${centenas[centena - 1]} ${especiales[unidad - 1]}`;
        } else {
            return `${centenas[centena - 1]} ${decenas[decena - 1]} y ${unidades[unidad]}`;
        }
    } else if (number < 1000000) {
        const millar = Math.floor(number / 1000);
        const centena = Math.floor((number % 1000) / 100);
        const decena = Math.floor((number % 100) / 10);
        const unidad = number % 10;
        if (centena === 0 && decena === 0 && unidad === 0) {
            return `${convertirNumeroALetras(millar)} mil`;
        } else {
            return `${convertirNumeroALetras(millar)} mil ${convertirNumeroALetras(number % 1000)}`;
        }
    } else {
        return 'Número no soportado';
    }
}


?>
