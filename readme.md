# Vefforritun 2, 2021, hópverkefni 1 - Teitur, Ástráður og Vigdís

Til þess að keyra verkefnið þarf að vera til .env skrá. Upplýsingarnar sem þarf í þá skrá er að finna í .env.example. Þegar allt er til reiðu skal keyra `npm run setup`. Sú keyrsla setur gögn í gagnagrunnin og gerir þér kleift að keyra verkefnið með `npm run start`.

Þegar sú keyrsla er komin er hægt að notast við tól eins og Postman. Tveir notendur eru nú þegar settir upp
```json
{
  "name": "notAdmin",
  "email": "example@example.com",
  "password": "1234567890",
}
{
  "name": "admin",
  "email": "admin@admin.com",
  "password": "1234567890",
}
```
:

### Sjónvarpsþættir

* `/tv`
  * `GET` skilar síðum af sjónvarpsþáttum með grunnupplýsingum
  * `POST` býr til nýjan sjónvarpsþátt, aðeins ef notandi er stjórnandi
* `/tv/:id`
  * `GET` skilar stöku sjónvarpsþáttum með grunnupplýsingum, meðal einkunn sjónvarpsþáttar, fjölda einkunna sem hafa verið skráðar fyrir sjónvarpsþátt, fylki af tegundum sjónvarpsþáttar (genres), fylki af seasons, rating notanda, staða notanda
  * `PATCH`, uppfærir sjónvarpsþátt, reit fyrir reit, aðeins ef notandi er stjórnandi
  * `DELETE`, eyðir sjónvarpsþátt, aðeins ef notandi er stjórnandi
* `/tv/:id/season/`
  * `GET` skilar fylki af öllum seasons fyrir sjónvarpsþátt
  * `POST` býr til nýtt í season í sjónvarpþætti, aðeins ef notandi er stjórnandi
* `/tv/:id/season/:id`
  * `GET` skilar stöku season fyrir þátt með grunnupplýsingum, fylki af þáttum
  * `DELETE`, eyðir season, aðeins ef notandi er stjórnandi
* `/tv/:id/season/:id/episode/`
  * `POST` býr til nýjan þátt í season, aðeins ef notandi er stjórnandi
* `/tv/:id/season/:id/episode/:id`
  * `GET` skilar upplýsingum um þátt
  * `DELETE`, eyðir þætti, aðeins ef notandi er stjórnandi
* `/genres`
  * `GET` skilar síðu af tegundum (genres)
  * `POST` býr til tegund, aðeins ef notandi er stjórnandi

### Notendur

* `/users/`
  * `GET` skilar síðu af notendum, aðeins ef notandi sem framkvæmir er stjórnandi
* `/users/:id`
  * `GET` skilar notanda, aðeins ef notandi sem framkvæmir er stjórnandi
  * `PATCH` breytir hvort notandi sé stjórnandi eða ekki, aðeins ef notandi sem framkvæmir er stjórnandi og er ekki að breyta sér sjálfum
* `/users/register`
  * `POST` staðfestir og býr til notanda. Skilar auðkenni og netfangi. Notandi sem búinn er til skal aldrei vera stjórnandi
* `/users/login`
  * `POST` með netfangi og lykilorði skilar token ef gögn rétt
* `/users/me`
  * `GET` skilar upplýsingum um notanda sem á token, auðkenni og netfangi, aðeins ef notandi innskráður
  * `PATCH` uppfærir netfang, lykilorð eða bæði ef gögn rétt, aðeins ef notandi innskráður

Aldrei skal skila eða sýna hash fyrir lykilorð.

### Sjónvarpsþættir og notendur

* `/tv/:id/rate`
  * `POST`, skráir einkunn innskráðs notanda á sjónvarpsþætti, aðeins fyrir innskráða notendur
  * `PATCH`, uppfærir einkunn innskráðs notanda á sjónvarpsþætti
  * `DELETE`, eyðir einkunn innskráðs notanda á sjónvarpsþætti
* `/tv/:id/state`
  * `POST`, skráir stöðu innskráðs notanda á sjónvarpsþætti, aðeins fyrir innskráða notendur
  * `PATCH`, uppfærir stöðu innskráðs notanda á sjónvarpsþætti
  * `DELETE`, eyðir stöðu innskráðs notanda á sjónvarpsþætti
* `/tv/:id`
  * Ef notandi er innskráður skal sýna einkunn og stöðu viðkomandi á sjónvarpsþætti.## Skil

Á Canvas eru skilgreindir 40 hópar (People > Hópverkefni 1) sem hópur þarf að skrá sig í. Fyrsti nemandi sem skráir sig er sjálfgefið hópstjóri.

Hópstjóri skilar fyrir hönd hóps á Canvas, í seinasta lagi fyrir lok dags sunnudaginn 21. mars 2021.

Skilaboð skulu innihalda slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo ([sjá leiðbeiningar](https://docs.github.com/en/free-pro-team@latest/github/setting-up-and-managing-your-github-user-account/inviting-collaborators-to-a-personal-repository)) ásamt slóð á verkefnið keyrandi á Heroku. Notendanöfn þeirra eru:

* `jonnigs`
* `mimiqkz`
* `Steinalicious`
* `zurgur`

Athugið að skilum fyrir verkefni lokar kl. 23:59 sunnudaginn 21. mars 2021.

> Útgáfa 0.1