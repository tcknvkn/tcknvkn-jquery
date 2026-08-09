# golden-dataset.json

Bu dosya **elle duzenlenmez.** Kanonik kaynagi ayri bir repodur:

> https://github.com/tcknvkn/spec — surum `spec-v1.0.0`

Buradaki kopya, CI'daki `golden-dataset` isi tarafindan SHA-256 ile
kanonik surume karsi dogrulanir. Dosyayi degistirirseniz build kirilir.

```
sha256 = e472cca15d825160877053da1e6e7078e8c1c18ef32fa25f5abb100bef217df9
```

## Neden kopya?

Ayni algoritmanin 19 dilde ayri implementasyonu var. Her repo kendi testini
kendi koduna gore yazarsa hepsi kendi hatasiyla yesil kalir. Ortak dataset
soruyu "bu implementasyon dogru mu"dan "ortak sozlesmeye uyuyor mu"ya cevirir.

## Degisiklik gerekiyorsa

1. `tcknvkn/spec` reposunda vakayi ekleyin, dataset'i yeniden uretin, yeni
   surum etiketleyin.
2. Bu repodaki kopyayi ve `.github/workflows/ci.yml` icindeki
   `GOLDEN_SHA256` degerini birlikte guncelleyin.
