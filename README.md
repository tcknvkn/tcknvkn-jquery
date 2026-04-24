# @tcknvkn/jquery

`@tcknvkn/jquery`, jQuery tabanlı projelerde **TCKN (TC Kimlik Numarası)** ve **VKN (Vergi Kimlik Numarası)** doğrulama işlemleri için hazırlanmış hafif bir eklenti ve çekirdek doğrulama kütüphanesidir.

## Öne çıkan özellikler

- Tekil TCKN doğrulama
- Toplu TCKN doğrulama
- Tekil VKN doğrulama
- Toplu VKN doğrulama
- jQuery plugin API (`tcknValidate`, `vknValidate`)
- Girdideki rakam dışı karakterleri otomatik temizleme

## Kurulum

```bash
npm install @tcknvkn/jquery
```

## Kullanım

```javascript
const $ = require('jquery');
const attach = require('@tcknvkn/jquery');

attach($);

$('#tckn').val('10000000146').tcknValidate();
$('#vkn').val('1000036109').vknValidate();

console.log($('#tckn').data('tcknResult'));
console.log($('#vkn').data('vknResult'));
```

## Çekirdek API

- `validateTckn(input)`
- `validateMultipleTckn(inputs)`
- `validateVkn(input)`
- `validateMultipleVkn(inputs)`

## Test

```bash
npm install --include=dev
npm test
```

## İlgili bağlantılar

- Kütüphaneler merkezi: https://www.tcknvkn.com/kutuphaneler
- jQuery kütüphane sayfası: https://www.tcknvkn.com/kutuphaneler/jquery
- https://www.tcknvkn.com/tc-uret
- https://www.tcknvkn.com/tc-no-uret
- https://www.tcknvkn.com/tc-uretici
- https://tcknvkn.com/tckn-uret
- https://www.tcknvkn.com/vergi-no-uret
- https://www.tcknvkn.com/vergi-no-uretici
- https://tcknvkn.com/vkn-uret

## Lisans

MIT
