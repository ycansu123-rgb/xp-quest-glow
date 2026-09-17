# XP Journey

iClup XP – Gamification & Motion Design Prompt

Mevcut iClup XP ekranının tasarım dilini ve layout yapısını koruyarak ekranı çok daha hareketli, eğlenceli, premium ve oyun dünyasından ilham alan bir deneyime dönüştür.

Temel hedef

Bu çalışma bir redesign değildir.

Mevcut UI yapısını bozma.

Kartların, butonların, görevlerin ve XP sisteminin mevcut yerleşimini koru.

Ana odak motion design, micro-interaction, reward feedback ve gamification olsun.

Kullanıcı ekrana girdiğinde “statik bir sadakat programı” değil, canlı bir oyun progression ekranı hissi almalı.

Duolingo, Clash Royale, Brawl Stars, Fortnite Battle Pass ve modern casual/mobile game reward sistemlerindeki ödül, ilerleme, achievement ve celebration hissinden ilham al.

Ancak iClup'ın mevcut premium görsel dilini koru; çocuk oyunu görünümüne dönüşmesin.

Bu aşamada animasyon sayısını kısıtlama. Mümkün olduğunca fazla farklı animasyon ve micro-interaction uygula. Ben daha sonra beğendiklerimi seçip sadeleştireceğim.

1. SAYFA AÇILIŞI

Sayfa açıldığında tüm elementler aynı anda görünmesin.

Kademeli bir game UI entrance sequence oluştur.

Örnek:

Header fade + slide

XP alanı scale/fade ile gelsin

XP progress bar dolmaya başlasın

Reward node'ları sırayla aktif olsun

Görev başlığı gelsin

Görev kartları 60–100 ms stagger ile aşağıdan yukarı gelsin

Kartlarda:

subtle spring

overshoot

opacity

translateY

kombinasyonları kullanılabilir.

Sayfa ilk açılışı yaklaşık 800–1400 ms içerisinde tamamlanmalı.

2. XP PROGRESS BAR

Ekranın en önemli oyun elementi XP progression alanıdır.

Bu alanı mümkün olduğunca canlı hale getir.

Sayfa açıldığında progress bar:

0 → mevcut XP seviyesine doğru animasyonla dolsun.

Düz linear hareket kullanma.

ease-out / spring / game-like easing kullan.

Progress çizgisinin üzerinde çok hafif:

moving gradient

shimmer

glow trail

energy flow

efekti olsun.

XP ilerledikçe çizginin içinden enerji akıyormuş hissi ver.

3. XP NODE'LARI

250 XP, 350 XP, 450 XP gibi checkpoint'leri oyunlardaki level node mantığında ele al.

Aktif node:

hafif pulse

glow

breathing animation

scale 1 → 1.08 → 1

yapabilir.

Kazanılmış node:

kısa sparkle

check bounce

ring animation

gösterebilir.

Kilitli node'larda:

çok hafif lock breathing

hover/tap sırasında shake

kilit çevresinde küçük ışık hareketi

kullan.

4. MEVCUT XP NOKTASI

Kullanıcının mevcut XP noktasını özellikle vurgula.

Örneğin 450 XP aktifse:

Node çevresinde:

pulse ring

soft glow

küçük particle

rotating highlight

oluştur.

Bu nokta kullanıcının:

“Şu anda buradasın.”

hissini vermeli.

5. REWARD PATH

Reward kartlarını düz bir carousel gibi değil, oyundaki ödül yolu gibi hissettir.

Kullanıcı horizontal scroll yaptığında kartlarda hafif:

parallax

scale

depth

shadow

perspective

değişimi olabilir.

Ortadaki aktif kart biraz büyüsün.

Yan kartlar hafif küçülsün.

Örnek:

Center:

scale(1)

Sides:

scale(.94)

6. HEDİYE İKONLARI

Hediye ikonları tamamen statik kalmasın.

Idle durumda çok hafif:

float

wiggle

bounce

shine

animasyonları olabilir.

Ancak hepsi aynı anda hareket etmesin.

Animasyonlara random delay ver.

Örneğin:

Gift 1 → 0 ms
Gift 2 → 900 ms
Gift 3 → 1700 ms

Böylece ekran mekanik değil, organik ve yaşayan hissettirsin.

7. KİLİTLER

Turuncu kilit ikonlarını oyunlardaki unlock sistemleri gibi tasarla.

Idle:

çok hafif breathing.

Tap:

shake → bounce → return

Kilit açıldığında kullanılabilecek animasyonu da hazırla:

Lock shake

Lock rotate

Lock opens

Glow burst

Reward card unlock

Confetti / particles

8. ÖDÜL KARTLARI

“Bedava Kahve”, “Mama Kodu”, “Opet Ultra Temiz” vb. kartlara ayrı micro-interaction ekle.

Tap sırasında:

scale down 0.96

spring back 1.02

return 1

Kart seçildiğinde border veya glow kısa süre hareket edebilir.

Aktif kartın arkasında çok hafif animated aura kullanılabilir.

9. 30 GÜN KALDI

“30 Gün Kaldı” alanına çok hafif canlılık ekle.

Saat/calendar ikonunda:

tick

tiny rotation

subtle pulse

kullanılabilir.

Ancak sürekli dikkat çekmesin.

10. “iCLUP NEDİR?” BUTONU

Buton hover/tap sırasında:

scale

highlight sweep

tiny bounce

yapsın.

Buton üzerinden çok hafif bir shine sweep periyodik olarak geçebilir.

11. iCLUP ++ STATÜ KARTI

“iClup ++ statüsü ve ayrıcalıkları” kartı premium bir unlock alanı gibi hissettirsin.

Kart idle durumda çok hafif:

gradient movement

glow

shimmer

gösterebilir.

Gift icon:

hafif floating animation yapabilir.

Kart tap edildiğinde:

scale(.98) → scale(1.01) → scale(1)

spring interaction uygula.

12. GÖREVLERİNİ TAMAMLA

Başlığın yanındaki:

8 Aktif Görev

alanı kullanıcı ekrana geldiğinde:

0 → 8

count-up animasyonu ile gelebilir.

“Tümü” butonuna:

arrow movement

underline reveal

tiny slide

micro-interaction ekle.

13. GÖREV KARTLARI

Her görev kartı ayrı bir game quest card gibi davranmalı.

Kartlara:

hover/touch lift

shadow expansion

scale

spring

icon animation

ekle.

Tap:

scale(.98)

Release:

spring → 1

14. GÖREV İKONLARI

Her görev ikonunun kendine özel animasyonu olsun.

Yükleme

Wallet / money icon:

coin pop

tiny bounce

sparkle

Kampanya

Gift icon:

gift shake

ribbon bounce

sparkle

iPuan

QR / scan icon:

scan line

glow

pulse

CarrefourSA

Cart icon:

tiny horizontal movement

wheel motion

bounce

Oyun

Gamepad:

joystick wiggle

button press

tiny vibration

15. XP KAZANIM METİNLERİ

+150 XP

+120 XP

+500 XP

gibi alanlar statik görünmesin.

Çok hafif:

glow

pulse

number bounce

uygula.

Özellikle görev tamamlandığında XP değeri:

scale(1 → 1.3 → 1)

yapabilir.

16. CTA BUTONLARI

Ekrandaki tüm CTA butonlarına ayrı interaction ekle.

Örneğin:

“Yükleme Yap”

Tap:

scale(.95)

Release:

spring(1.05) → 1

Sonrasında küçük highlight sweep.

“Kampanyaları Gör”

Butonun içindeki gradient çok hafif hareket edebilir.

“iPuan ile Harca”

Turuncu glow pulse kullanılabilir.

“Alışveriş Yap”

Tiny cart-like horizontal movement kullanılabilir.

“Oyna”

Diğerlerinden daha eğlenceli olabilir:

bounce

pulse

shine

gamepad vibration

CTA'lar aynı animasyonu kullanmak zorunda değil.

Her CTA kendi aksiyonuna uygun karakter taşısın.

17. PROGRESS BAR'LAR

Görev kartlarındaki progress bar'lar sayfa açıldığında:

0 → current progress

animasyonuyla dolsun.

Progress bar ucunda küçük bir glowing head olabilir.

Bar dolarken glow ilerlesin.

18. “380/500 TL”

Progress değerleri animasyon sırasında count-up yapabilir.

Örneğin:

0 → 380

veya daha hızlı şekilde mevcut değere gelsin.

Bunu demo olarak uygula.

19. 1. HARCAMA / 2. HARCAMA / 3. HARCAMA

Bu alanı mini quest progression sistemine dönüştür.

Tamamlanan adım:

pop → check → glow

Aktif adım:

pulse.

Gelecek adımlar:

daha düşük opacity.

Kullanıcı bir aşamayı tamamladığında progress bir sonraki adıma enerji akışı şeklinde ilerleyebilir.

20. GÖREV TAMAMLAMA ANİMASYONU

Demo amacıyla görev kartlarından birine Complete Quest interaction ekle.

Görev tamamlandığında:

Kart kısa pulse yapar

Progress %100 olur

Checkmark bounce eder

+150 XP yukarı doğru float eder

Küçük particle burst oluşur

XP progress bar'a doğru enerji/XP hareket eder

Ana XP bar artar

Bu animasyon oyun hissinin en önemli bölümlerinden biri olsun.

21. XP FLY ANIMATION

Görev tamamlandığında XP'nin sadece yazı olarak görünmesini istemiyorum.

Örneğin:

+150 XP

görev kartından çıkarak küçük glowing particle/orb şeklinde üstteki XP bar'a doğru uçsun.

XP bar'a ulaştığında:

impact flash

progress increase

node pulse

oluşsun.

Bu interaction özellikle güçlü olsun.

22. LEVEL-UP / REWARD UNLOCK

Demo için bir reward unlock animasyonu oluştur.

XP checkpoint geçildiğinde:

screen glow

reward node pulse

gift bounce

lock opens

card flips/reveals

sparkle/confetti

“Ödül Açıldı!” feedback

kullan.

Bu animasyon mobil oyunlardaki achievement celebration kalitesinde olsun.

23. CONFETTI VE PARTICLES

Confetti'yi sürekli kullanma.

Sadece:

görev tamamlandığında

reward unlock olduğunda

level/checkpoint geçildiğinde

kullan.

Küçük başarı:

micro particles.

Büyük başarı:

confetti + glow + burst.

24. SCROLL DAVRANIŞI

Scroll sırasında ekran tamamen düz hareket etmesin.

Çok hafif:

card depth

parallax

header compression

background movement

eklenebilir.

Ancak scroll performansını bozma.

25. HAPTIC FEEDBACK

Mobil uygulamada uygulanabilecek noktaları motion demo içerisinde belirt.

Özellikle:

CTA tap → light haptic

quest complete → medium haptic

reward unlock → success haptic

locked reward → warning/light haptic

level-up → stronger success haptic

26. IDLE ANIMATIONS

Ekran kullanıcı hiçbir şey yapmadığında tamamen donmuş görünmesin.

Ancak bütün elementleri aynı anda oynatma.

Örneğin farklı zamanlarda:

gift float

XP glow

CTA shine

icon wiggle

reward sparkle

çalışabilir.

Animasyonların başlangıç zamanlarını dağıt.

Ekran yaşıyor hissi vermeli.

27. EASTER EGG

Demo için küçük bir easter egg oluştur.

Örneğin kullanıcı XP alanına birkaç kez hızlı tap ederse:

mini confetti

XP karakterleri bounce

küçük “Nice!” feedback

gibi eğlenceli bir interaction göster.

Ana kullanıcı deneyimini etkilemesin.

28. ANİMASYON LAB / DEMO MODE

Bu çalışma seçim yapabilmem için hazırlanıyor.

Bu nedenle mümkünse sayfaya sadece development/demo amaçlı küçük bir “Motion Lab” kontrol paneli ekle.

Buradan şu efektleri tek tek açıp kapatabileyim:

Entrance animations

XP bar animation

XP glow

XP particles

Reward card animations

Gift idle animations

Lock animations

CTA animations

Quest card animations

Progress animations

XP fly animation

Quest complete celebration

Reward unlock

Confetti

Parallax

Idle animations

Ayrıca mümkünse:

Motion Level

Off / Minimal / Balanced / Playful / Crazy

seçenekleri olsun.

Ben animasyonları deneyip hangilerinin kalacağına daha sonra karar vereceğim.

29. PERFORMANS

Animasyon çok olacak ancak performans kesinlikle bozulmamalı.

Mümkün olduğunca:

transform

opacity

GPU-friendly animation

kullan.

Layout thrashing yaratma.

Scroll sırasında ağır particle efektleri çalıştırma.

60 FPS hedefle.

prefers-reduced-motion desteği ekle.

30. EN ÖNEMLİ KURAL

Bu ekranın hissi:

Bankacılık / sadakat programı ekranı ❌

Premium mobil oyun progression ekranı ✅

olmalı.

Ancak kullanıcı arayüzünün kullanılabilirliğini bozma.

Animasyonlar üç seviyede düşünülmeli:

Micro Interaction
Buton, ikon, kart, progress gibi küçük geri bildirimler.

Ambient Motion
Ekranın canlı kalmasını sağlayan düşük yoğunluklu sürekli hareketler.

Celebration Motion
XP kazanma, görev tamamlama, reward unlock ve level-up gibi önemli anlarda güçlü animasyonlar.

Özellikle XP kazanma → XP'nin bara uçması → barın ilerlemesi → checkpoint'in açılması → reward celebration zincirini ekranın “wow moment”ı haline getir.

Amaç şu anda sadeleştirmek değil.

Mümkün olduğunca yaratıcı alternatif üret ve ekranda göster. Ben daha sonra istemediklerimi kaldıracağım.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://xp-quest-glow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/69927349-f9a2-4cd4-8d08-0fbcbb1da009).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
