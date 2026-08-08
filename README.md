# THE BOYZ TikTok Archive

Statyczna strona przygotowana pod GitHub Pages. Wszystkie pięć kont TikTok jest wyświetlane w jednej galerii. Filmy są odtwarzane na stronie przez oficjalny TikTok Embed Player, a Google Drive służy wyłącznie jako link do pobrania kopii archiwalnej.

## Konta

- `istent_theboyz`
- `theboyz_officl`
- `jakeybaee2`
- `kebean.moon`
- `eric.sohn22`

## Automatyczna aktualizacja

Workflow `.github/workflows/update-tiktok.yml` uruchamia `scripts/update_tiktok_data.py` co 6 godzin i przy ręcznym `Run workflow`.

Źródło danych:
`https://docs.google.com/spreadsheets/d/1C0DP7DKN5QCO5GXdNDWYmvuK8RtGEkYp/edit`

Arkusz musi być udostępniony jako **Anyone with the link / Viewer**, aby GitHub Actions mógł pobrać eksport XLSX bez logowania.

### Rozpoznawane kolumny

Skrypt rozpoznaje polskie i angielskie warianty nagłówków. Podstawowy układ:

- `Data` — `YYMMDD` lub data Excela
- `Opis TikToka`
- `Hashtagi`
- `Członkowie`
- `Link TikTok` — wymagany; z niego automatycznie wykrywane jest konto i TikTok ID
- `Link Google Drive` — opcjonalny, ale wymagany do pokazania linku „Download from Google Drive”

Jeżeli w istniejącym `data.js` dany TikTok ma już link Drive, a w arkuszu pole Drive jest puste, synchronizacja zachowa dotychczasowy link.

Jeżeli arkusz jest jeszcze uzupełniany etapami, konta, których nie ma jeszcze w arkuszu, pozostają w `data.js`. Gdy w tabeli pojawi się choć jeden wpis danego konta, dane tego konta są od tej chwili synchronizowane z arkusza.

## TikTok embed

Strona korzysta z oficjalnego iframe:
`https://www.tiktok.com/player/v1/{TIKTOK_ID}`

Jeżeli TikTok zostanie usunięty, zablokowany albo nie będzie dostępny w danym regionie, osadzony odtwarzacz również może przestać działać. Kopia na Google Drive pozostaje wtedy niezależnym linkiem do pobrania, o ile plik Drive nadal istnieje i jest publicznie dostępny.

## GitHub Pages

Nie są wymagane żadne sekrety ani Google Drive API. Wystarczy włączyć GitHub Pages dla brancha zawierającego te pliki oraz pozostawić publiczny arkusz dostępny do odczytu.
