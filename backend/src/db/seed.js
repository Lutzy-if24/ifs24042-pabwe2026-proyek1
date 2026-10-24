const bcrypt = require('bcrypt');
const config = require('../config');

// Semua konten ditulis dengan String.raw supaya backslash LaTeX (\frac, \cdot, dll.) tidak rusak.
// Soal-soal di bawah dibuat sendiri; label OSN/KSN berarti "bergaya/setingkat", bukan salinan soal resmi.

const topics = [
  { name: 'Aljabar', slug: 'aljabar', description: 'Manipulasi aljabar, persamaan, fungsi, barisan, dan ketaksamaan.' },
  { name: 'Geometri', slug: 'geometri', description: 'Segitiga, lingkaran, poligon, luas, dan teorema-teorema dasar geometri bidang.' },
  { name: 'Teori Bilangan', slug: 'teori-bilangan', description: 'Keterbagian, faktorisasi prima, kongruensi, dan persamaan diophantine.' },
  { name: 'Kombinatorika', slug: 'kombinatorika', description: 'Pencacahan, permutasi, kombinasi, dan prinsip sarang merpati.' },
];

const levels = ['Mudah', 'Sedang', 'Sulit'];

const competitions = [
  { name: 'OSN', full_name: 'Olimpiade Sains Nasional' },
  { name: 'KSN', full_name: 'Kompetisi Sains Nasional' },
];

const materials = [
  {
    topic: 'aljabar',
    title: 'Identitas dan Faktorisasi Aljabar',
    content: String.raw`# Identitas dan Faktorisasi Aljabar

Banyak soal aljabar olimpiade selesai setelah bentuknya **dimanipulasi** sampai strukturnya terlihat. Identitas berikut wajib dikuasai.

## Identitas dasar

$$(a+b)^2 = a^2 + 2ab + b^2$$

$$a^2 - b^2 = (a-b)(a+b)$$

$$a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)$$

## Rumus Vieta

Jika $x_1, x_2$ adalah akar dari $ax^2 + bx + c = 0$, maka

$$x_1 + x_2 = -\frac{b}{a}, \qquad x_1 x_2 = \frac{c}{a}.$$

## Ketaksamaan AM-GM

Untuk bilangan real $a, b \ge 0$ berlaku

$$\frac{a+b}{2} \ge \sqrt{ab},$$

dengan kesamaan jika dan hanya jika $a = b$.

## Trik yang sering dipakai

- **Substitusi**: ganti bentuk yang berulang dengan variabel baru, misalnya $t = x + \frac{1}{x}$.
- **Teleskoping**: uraikan suku menjadi selisih, contohnya $\frac{1}{k(k+1)} = \frac{1}{k} - \frac{1}{k+1}$, sehingga

$$\sum_{k=1}^{n} \frac{1}{k(k+1)} = 1 - \frac{1}{n+1}.$$

- **Persamaan fungsi**: substitusikan nilai atau bentuk khusus, lalu bentuk sistem persamaan.
`,
  },
  {
    topic: 'geometri',
    title: 'Teorema Dasar Geometri Bidang',
    content: String.raw`# Teorema Dasar Geometri Bidang

## Segitiga

Teorema Pythagoras pada segitiga siku-siku dengan sisi miring $c$:

$$a^2 + b^2 = c^2$$

Rumus Heron dengan $s = \frac{a+b+c}{2}$:

$$L = \sqrt{s(s-a)(s-b)(s-c)}$$

## Lingkaran dalam dan lingkaran luar

- Jari-jari lingkaran dalam: $r = \dfrac{L}{s}$
- Jari-jari lingkaran luar: $R = \dfrac{abc}{4L}$

## Poligon

Banyak diagonal pada poligon cembung bersisi $n$:

$$\frac{n(n-3)}{2}$$

## Segiempat tali busur

Segiempat $ABCD$ disebut segiempat tali busur jika keempat titik sudutnya terletak pada satu lingkaran. Sifatnya:

- Jumlah sudut yang berhadapan adalah $180^\circ$.
- **Teorema Ptolemy**: hasil kali diagonal sama dengan jumlah hasil kali sisi yang berhadapan,

$$AC \cdot BD = AB \cdot CD + AD \cdot BC.$$
`,
  },
  {
    topic: 'teori-bilangan',
    title: 'Keterbagian dan Kongruensi',
    content: String.raw`# Keterbagian dan Kongruensi

## Keterbagian

Kita tulis $a \mid b$ jika ada bilangan bulat $k$ sehingga $b = ka$. Jika $a \mid b$ dan $a \mid c$, maka $a \mid (bx + cy)$ untuk sembarang bilangan bulat $x, y$.

## Banyak faktor positif

Jika $n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k}$ adalah faktorisasi prima, maka banyak faktor positif $n$ adalah

$$(e_1 + 1)(e_2 + 1)\cdots(e_k + 1).$$

## Kongruensi

Kita tulis $a \equiv b \pmod{m}$ jika $m \mid (a - b)$. Sifat penting:

- $a \equiv b$ dan $c \equiv d$ berakibat $a + c \equiv b + d$ dan $ac \equiv bd \pmod{m}$.
- $a \equiv b$ berakibat $a^n \equiv b^n \pmod{m}$.

## Strategi

- Untuk mencari sisa pembagian bilangan berpangkat, cari pangkat yang memberi sisa $1$ lalu manfaatkan siklusnya.
- Untuk persamaan bulat, faktorkan, misalnya $xy - 6x - 6y = 0$ menjadi $(x-6)(y-6) = 36$.
- Pada pembuktian keterbagian, uraikan bentuk menjadi hasil kali faktor lalu periksa setiap sisa yang mungkin.
`,
  },
  {
    topic: 'kombinatorika',
    title: 'Prinsip Dasar Pencacahan',
    content: String.raw`# Prinsip Dasar Pencacahan

## Aturan penjumlahan dan perkalian

- **Penjumlahan**: jika kejadian A dapat terjadi dengan $m$ cara dan B dengan $n$ cara, dan keduanya tidak dapat terjadi bersamaan, maka "A atau B" dapat terjadi dengan $m + n$ cara.
- **Perkalian**: jika ada $m$ cara untuk langkah pertama dan $n$ cara untuk langkah kedua, maka ada $m \cdot n$ cara untuk keduanya berurutan.

## Permutasi dan kombinasi

$$P(n, r) = \frac{n!}{(n-r)!}, \qquad C(n, r) = \binom{n}{r} = \frac{n!}{r!\,(n-r)!}$$

Permutasi dari $n$ objek dengan pengulangan $n_1, n_2, \dots, n_k$:

$$\frac{n!}{n_1!\, n_2! \cdots n_k!}$$

## Stars and bars

Banyak solusi bilangan bulat tak negatif dari $x_1 + x_2 + \cdots + x_k = n$ adalah

$$\binom{n + k - 1}{k - 1}.$$

## Prinsip sarang merpati

Jika $n + 1$ objek ditempatkan ke dalam $n$ kotak, maka ada kotak yang berisi paling sedikit dua objek. Kunci penerapannya adalah menentukan apa yang menjadi "kotak".
`,
  },
];

const problems = [
  // ===== ALJABAR =====
  {
    title: 'Jumlah Kuadrat dan Kebalikannya',
    topic: 'aljabar', level: 'Mudah', competition: null,
    tags: ['manipulasi aljabar', 'kuadrat'],
    statement: String.raw`Jika $x$ adalah bilangan real tak nol yang memenuhi $x + \dfrac{1}{x} = 3$, tentukan nilai $x^2 + \dfrac{1}{x^2}$.`,
    solution: String.raw`Kuadratkan kedua ruas persamaan:

$$\left(x + \frac{1}{x}\right)^2 = x^2 + 2 + \frac{1}{x^2} = 9.$$

Maka $x^2 + \dfrac{1}{x^2} = 9 - 2 = 7$.

**Jawaban: $7$.**`,
  },
  {
    title: 'Selisih Dua Bilangan',
    topic: 'aljabar', level: 'Mudah', competition: null,
    tags: ['selisih kuadrat'],
    statement: String.raw`Bilangan real $x$ dan $y$ memenuhi $x + y = 20$ dan $x^2 - y^2 = 120$. Tentukan nilai $x - y$.`,
    solution: String.raw`Gunakan selisih kuadrat: $x^2 - y^2 = (x+y)(x-y)$.

Substitusi nilai yang diketahui: $20(x - y) = 120$, sehingga $x - y = 6$.

**Jawaban: $6$.**`,
  },
  {
    title: 'Persamaan Kuadrat dengan Nilai Mutlak',
    topic: 'aljabar', level: 'Sedang', competition: 'OSN',
    tags: ['nilai mutlak', 'persamaan kuadrat'],
    statement: String.raw`Tentukan jumlah kuadrat dari semua solusi real persamaan $x^2 - 5|x| + 6 = 0$.`,
    solution: String.raw`Karena $x^2 = |x|^2$, misalkan $t = |x| \ge 0$. Persamaan menjadi

$$t^2 - 5t + 6 = 0 \iff (t-2)(t-3) = 0,$$

sehingga $t = 2$ atau $t = 3$. Maka $x \in \{-3, -2, 2, 3\}$.

Jumlah kuadratnya: $9 + 4 + 4 + 9 = 26$.

**Jawaban: $26$.**`,
  },
  {
    title: 'Persamaan Fungsional Linear',
    topic: 'aljabar', level: 'Sedang', competition: 'KSN',
    tags: ['persamaan fungsi', 'substitusi'],
    statement: String.raw`Fungsi $f : \mathbb{R} \to \mathbb{R}$ memenuhi $f(x) + 2f(1-x) = x$ untuk setiap bilangan real $x$. Tentukan $f(x)$.`,
    solution: String.raw`Substitusikan $x \to 1 - x$ pada persamaan awal:

$$f(1-x) + 2f(x) = 1 - x. \quad (2)$$

Persamaan awal kita sebut (1): $f(x) + 2f(1-x) = x$.

Kalikan (2) dengan $2$: $4f(x) + 2f(1-x) = 2 - 2x$. Kurangkan (1) dari hasil ini:

$$3f(x) = 2 - 3x \implies f(x) = \frac{2}{3} - x.$$

**Verifikasi.** $f(1-x) = x - \frac{1}{3}$, sehingga $f(x) + 2f(1-x) = \frac{2}{3} - x + 2x - \frac{2}{3} = x$. Cocok.

**Jawaban: $f(x) = \dfrac{2}{3} - x$.**`,
  },
  {
    title: 'Barisan Rasional yang Selalu Bulat',
    topic: 'aljabar', level: 'Sulit', competition: 'OSN',
    tags: ['barisan', 'relasi rekurensi', 'pembuktian'],
    statement: String.raw`Barisan $a_1, a_2, a_3, \dots$ didefinisikan oleh $a_1 = 1$, $a_2 = 2$, dan

$$a_{n+2} = \frac{a_{n+1}^2 + 1}{a_n} \quad \text{untuk } n \ge 1.$$

**(a)** Buktikan bahwa $a_{n+2} = 3a_{n+1} - a_n$ untuk setiap $n \ge 1$.

**(b)** Simpulkan bahwa semua suku barisan adalah bilangan bulat, lalu tentukan $a_6$.`,
    solution: String.raw`Dengan induksi mudah terlihat semua suku positif, sehingga pembagian oleh $a_n$ selalu sah.

**(a)** Dari definisi, untuk $n \ge 1$:

$$a_n a_{n+2} = a_{n+1}^2 + 1. \quad (1)$$

Untuk $n \ge 2$ berlaku juga

$$a_{n-1} a_{n+1} = a_n^2 + 1. \quad (2)$$

Kurangkan (2) dari (1):

$$a_n a_{n+2} - a_{n-1} a_{n+1} = a_{n+1}^2 - a_n^2.$$

Pindahkan suku-sukunya:

$$a_n (a_{n+2} + a_n) = a_{n+1} (a_{n+1} + a_{n-1}),$$

atau

$$\frac{a_{n+2} + a_n}{a_{n+1}} = \frac{a_{n+1} + a_{n-1}}{a_n} \quad (n \ge 2).$$

Jadi nilai $\dfrac{a_{n+2} + a_n}{a_{n+1}}$ tidak bergantung pada $n$. Untuk $n = 1$: $a_3 = \dfrac{2^2 + 1}{1} = 5$, sehingga nilainya $\dfrac{5 + 1}{2} = 3$. Maka

$$a_{n+2} = 3a_{n+1} - a_n.$$

**(b)** Karena $a_1, a_2$ bulat dan $a_{n+2} = 3a_{n+1} - a_n$, induksi langsung menunjukkan semua suku bulat. Suku-sukunya: $1, 2, 5, 13, 34, 89, \dots$

Cek dengan definisi awal: $a_6 = \dfrac{34^2 + 1}{13} = \dfrac{1157}{13} = 89$.

**Jawaban: $a_6 = 89$.**`,
  },

  // ===== GEOMETRI =====
  {
    title: 'Jari-jari Lingkaran Dalam Segitiga Siku-siku',
    topic: 'geometri', level: 'Mudah', competition: null,
    tags: ['lingkaran dalam', 'segitiga siku-siku'],
    statement: String.raw`Sebuah segitiga siku-siku memiliki panjang kaki $6$ cm dan $8$ cm. Tentukan jari-jari lingkaran dalamnya.`,
    solution: String.raw`Sisi miring $= \sqrt{6^2 + 8^2} = 10$ cm.

Luas $L = \frac{1}{2} \cdot 6 \cdot 8 = 24$ cm$^2$, dan setengah keliling $s = \frac{6 + 8 + 10}{2} = 12$ cm.

Jari-jari lingkaran dalam $r = \dfrac{L}{s} = \dfrac{24}{12} = 2$ cm.

**Jawaban: $2$ cm.**`,
  },
  {
    title: 'Banyak Diagonal Segi-12',
    topic: 'geometri', level: 'Mudah', competition: null,
    tags: ['poligon', 'diagonal'],
    statement: String.raw`Tentukan banyaknya diagonal pada poligon cembung dengan $12$ sisi.`,
    solution: String.raw`Setiap pasangan titik sudut menghasilkan satu ruas garis, yaitu $\binom{12}{2} = 66$ ruas. Dari jumlah itu, $12$ ruas adalah sisi poligon, sehingga banyak diagonal $= 66 - 12 = 54$.

Dengan rumus: $\dfrac{n(n-3)}{2} = \dfrac{12 \cdot 9}{2} = 54$.

**Jawaban: $54$.**`,
  },
  {
    title: 'Jarak Titik ke Diagonal Persegi Panjang',
    topic: 'geometri', level: 'Sedang', competition: 'KSN',
    tags: ['luas', 'jarak titik ke garis', 'persegi panjang'],
    statement: String.raw`Pada persegi panjang $ABCD$ dengan $AB = 8$ dan $BC = 6$, tentukan jarak titik $A$ ke diagonal $BD$.`,
    solution: String.raw`Diagonal $BD = \sqrt{8^2 + 6^2} = 10$.

Segitiga $ABD$ siku-siku di $A$ dengan $AB = 8$ dan $AD = 6$, sehingga luasnya $\frac{1}{2} \cdot 8 \cdot 6 = 24$.

Luas yang sama dapat dihitung dengan alas $BD$ dan tinggi $h$ (jarak $A$ ke $BD$):

$$\frac{1}{2} \cdot 10 \cdot h = 24 \implies h = \frac{48}{10} = 4{,}8.$$

**Jawaban: $4{,}8$.**`,
  },
  {
    title: 'Luas dan Lingkaran Luar Segitiga 13-14-15',
    topic: 'geometri', level: 'Sedang', competition: 'OSN',
    tags: ['rumus heron', 'lingkaran luar'],
    statement: String.raw`Segitiga $ABC$ memiliki $AB = 13$, $BC = 14$, dan $CA = 15$. Tentukan luas segitiga tersebut dan jari-jari lingkaran luarnya.`,
    solution: String.raw`Setengah keliling $s = \dfrac{13 + 14 + 15}{2} = 21$.

Rumus Heron:

$$L = \sqrt{21 \cdot 8 \cdot 7 \cdot 6} = \sqrt{7056} = 84.$$

Jari-jari lingkaran luar:

$$R = \frac{abc}{4L} = \frac{13 \cdot 14 \cdot 15}{4 \cdot 84} = \frac{2730}{336} = \frac{65}{8}.$$

**Jawaban: luas $= 84$ dan $R = \dfrac{65}{8}$.**`,
  },
  {
    title: 'Titik pada Busur Segitiga Sama Sisi',
    topic: 'geometri', level: 'Sulit', competition: 'OSN',
    tags: ['teorema ptolemy', 'segiempat tali busur'],
    statement: String.raw`Segitiga sama sisi $ABC$ terletak di dalam sebuah lingkaran (semua titik sudutnya pada lingkaran). Titik $P$ terletak pada busur $BC$ yang tidak memuat $A$. Buktikan bahwa

$$PA = PB + PC.$$`,
    solution: String.raw`Karena $P$ berada pada busur $BC$ yang tidak memuat $A$, titik-titik $A, B, P, C$ berurutan pada lingkaran, sehingga $ABPC$ adalah segiempat tali busur dengan diagonal $AP$ dan $BC$.

Teorema Ptolemy memberikan

$$AP \cdot BC = AB \cdot PC + AC \cdot BP.$$

Karena segitiga $ABC$ sama sisi, $AB = BC = CA$. Bagi kedua ruas dengan panjang sisi tersebut:

$$AP = PC + BP.$$

Terbukti: $PA = PB + PC$. $\blacksquare$`,
  },

  // ===== TEORI BILANGAN =====
  {
    title: 'Sisa Pembagian 2^100 oleh 7',
    topic: 'teori-bilangan', level: 'Mudah', competition: null,
    tags: ['kongruensi', 'sisa pembagian'],
    statement: String.raw`Tentukan sisa pembagian $2^{100}$ oleh $7$.`,
    solution: String.raw`Perhatikan $2^3 = 8 \equiv 1 \pmod 7$.

Karena $100 = 3 \cdot 33 + 1$,

$$2^{100} = (2^3)^{33} \cdot 2 \equiv 1^{33} \cdot 2 = 2 \pmod 7.$$

**Jawaban: $2$.**`,
  },
  {
    title: 'Banyaknya Faktor Positif 360',
    topic: 'teori-bilangan', level: 'Mudah', competition: null,
    tags: ['faktorisasi prima', 'banyak faktor'],
    statement: String.raw`Berapa banyak faktor positif dari $360$?`,
    solution: String.raw`Faktorisasi prima: $360 = 2^3 \cdot 3^2 \cdot 5$.

Banyak faktor positifnya $(3+1)(2+1)(1+1) = 4 \cdot 3 \cdot 2 = 24$.

**Jawaban: $24$.**`,
  },
  {
    title: 'Kelipatan 30 pada n^5 - n',
    topic: 'teori-bilangan', level: 'Sedang', competition: 'KSN',
    tags: ['keterbagian', 'faktorisasi', 'kongruensi'],
    statement: String.raw`Buktikan bahwa untuk setiap bilangan bulat $n$, bilangan $n^5 - n$ habis dibagi $30$.`,
    solution: String.raw`Faktorkan:

$$n^5 - n = n(n^4 - 1) = (n-1)\,n\,(n+1)(n^2+1).$$

Karena $30 = 2 \cdot 3 \cdot 5$ dengan faktor-faktor yang saling prima, cukup tunjukkan bentuk itu habis dibagi $2$, $3$, dan $5$.

- **Habis dibagi $2$ dan $3$:** $(n-1)\,n\,(n+1)$ adalah tiga bilangan bulat berurutan, sehingga memuat kelipatan $2$ dan kelipatan $3$.
- **Habis dibagi $5$:** periksa $n$ modulo $5$.
  - $n \equiv 0$: faktor $n$ habis dibagi $5$.
  - $n \equiv 1$: faktor $n - 1$ habis dibagi $5$.
  - $n \equiv 4$: faktor $n + 1$ habis dibagi $5$.
  - $n \equiv 2$: $n^2 + 1 \equiv 5 \equiv 0$.
  - $n \equiv 3$: $n^2 + 1 \equiv 10 \equiv 0$.

Jadi $n^5 - n$ habis dibagi $2$, $3$, dan $5$, sehingga habis dibagi $30$. $\blacksquare$`,
  },
  {
    title: 'Pembagi n + 3 pada n^2 + 9',
    topic: 'teori-bilangan', level: 'Sedang', competition: 'OSN',
    tags: ['keterbagian', 'faktor'],
    statement: String.raw`Tentukan semua bilangan bulat positif $n$ sehingga $n + 3$ membagi $n^2 + 9$.`,
    solution: String.raw`Tulis $n^2 + 9 = (n+3)(n-3) + 18$. Karena $n + 3$ membagi $(n+3)(n-3)$, maka syaratnya setara dengan

$$n + 3 \mid 18.$$

Pembagi positif $18$ adalah $1, 2, 3, 6, 9, 18$. Karena $n \ge 1$, kita butuh $n + 3 \ge 4$, sehingga $n + 3 \in \{6, 9, 18\}$ dan $n \in \{3, 6, 15\}$.

**Verifikasi.** $\frac{18}{6} = 3$, $\frac{45}{9} = 5$, $\frac{234}{18} = 13$. Semuanya bulat.

**Jawaban: $n = 3, 6, 15$.**`,
  },
  {
    title: 'Pasangan Bilangan Bulat untuk 1/x + 1/y = 1/6',
    topic: 'teori-bilangan', level: 'Sulit', competition: 'OSN',
    tags: ['persamaan diophantine', 'faktorisasi'],
    statement: String.raw`Tentukan banyaknya pasangan terurut bilangan bulat positif $(x, y)$ yang memenuhi

$$\frac{1}{x} + \frac{1}{y} = \frac{1}{6}.$$`,
    solution: String.raw`Kalikan kedua ruas dengan $6xy$: $6y + 6x = xy$, yaitu $xy - 6x - 6y = 0$. Tambahkan $36$ pada kedua ruas:

$$(x - 6)(y - 6) = 36.$$

**Kedua faktor harus positif.** Hasil kalinya $36 > 0$, jadi kedua faktor positif atau kedua negatif. Jika keduanya negatif, maka $x - 6 \in \{-5, \dots, -1\}$ (karena $x \ge 1$), sehingga $y - 6 = \dfrac{36}{x-6} \le -\dfrac{36}{5} < -7$ dan $y < 0$, yang tidak mungkin.

Jadi $x - 6$ adalah pembagi positif $36$: $1, 2, 3, 4, 6, 9, 12, 18, 36$. Masing-masing menentukan satu nilai $y$, misalnya $x = 7$ memberi $y = 42$, dan $\frac{1}{7} + \frac{1}{42} = \frac{1}{6}$.

**Jawaban: $9$ pasangan.**`,
  },

  // ===== KOMBINATORIKA =====
  {
    title: 'Memilih Pengurus Kelas',
    topic: 'kombinatorika', level: 'Mudah', competition: null,
    tags: ['permutasi', 'aturan perkalian'],
    statement: String.raw`Dari $8$ siswa akan dipilih seorang ketua, seorang sekretaris, dan seorang bendahara, dengan syarat tidak ada yang merangkap jabatan. Berapa banyak susunan pengurus yang mungkin?`,
    solution: String.raw`Ketua dipilih dari $8$ siswa, sekretaris dari $7$ siswa sisanya, dan bendahara dari $6$ siswa sisanya.

$$8 \cdot 7 \cdot 6 = 336.$$

**Jawaban: $336$.**`,
  },
  {
    title: 'Bilangan Genap Tiga Angka Berbeda',
    topic: 'kombinatorika', level: 'Mudah', competition: null,
    tags: ['aturan perkalian', 'bilangan genap'],
    statement: String.raw`Dari angka $1, 2, 3, 4, 5$ akan dibentuk bilangan tiga angka dengan angka-angka yang berbeda. Berapa banyak bilangan genap yang dapat dibentuk?`,
    solution: String.raw`Bilangan genap harus berakhiran $2$ atau $4$, sehingga ada $2$ pilihan untuk angka satuan.

Setelah satuan dipilih, tersisa $4$ angka untuk posisi ratusan, lalu $3$ angka untuk posisi puluhan.

$$2 \cdot 4 \cdot 3 = 24.$$

**Jawaban: $24$.**`,
  },
  {
    title: 'Permutasi Huruf MATEMATIKA',
    topic: 'kombinatorika', level: 'Sedang', competition: 'KSN',
    tags: ['permutasi berulang'],
    statement: String.raw`Berapa banyak susunan berbeda yang dapat dibentuk dari semua huruf pada kata MATEMATIKA?`,
    solution: String.raw`Kata MATEMATIKA terdiri dari $10$ huruf dengan pengulangan: M muncul $2$ kali, A muncul $3$ kali, T muncul $2$ kali, sedangkan E, I, dan K masing-masing $1$ kali.

$$\frac{10!}{2!\,3!\,2!} = \frac{3\,628\,800}{24} = 151\,200.$$

**Jawaban: $151\,200$.**`,
  },
  {
    title: 'Solusi Bulat dengan Batas Bawah',
    topic: 'kombinatorika', level: 'Sedang', competition: 'OSN',
    tags: ['stars and bars', 'kombinasi'],
    statement: String.raw`Tentukan banyaknya tripel bilangan bulat $(x, y, z)$ yang memenuhi $x + y + z = 12$ dengan $x \ge 1$, $y \ge 2$, dan $z \ge 3$.`,
    solution: String.raw`Misalkan $x = a + 1$, $y = b + 2$, $z = c + 3$ dengan $a, b, c \ge 0$. Persamaan menjadi

$$a + b + c = 12 - 6 = 6.$$

Dengan metode stars and bars, banyak solusi bulat tak negatif adalah

$$\binom{6 + 2}{2} = \binom{8}{2} = 28.$$

**Jawaban: $28$.**`,
  },
  {
    title: 'Dua Bilangan yang Saling Membagi',
    topic: 'kombinatorika', level: 'Sulit', competition: 'OSN',
    tags: ['prinsip sarang merpati', 'keterbagian'],
    statement: String.raw`Dari bilangan-bilangan $1, 2, 3, \dots, 20$ dipilih sebelas bilangan yang berbeda. Buktikan bahwa di antara bilangan terpilih terdapat dua bilangan sehingga yang satu membagi yang lain.`,
    solution: String.raw`Setiap bilangan bulat positif dapat ditulis tunggal sebagai $2^k \cdot m$ dengan $m$ ganjil dan $k \ge 0$.

Pada himpunan $\{1, 2, \dots, 20\}$, nilai $m$ yang mungkin adalah bilangan ganjil $1, 3, 5, \dots, 19$, yaitu tepat $10$ nilai. Anggap kesepuluh nilai $m$ ini sebagai **kotak**.

Sebelas bilangan terpilih ditempatkan ke kotak sesuai nilai $m$-nya. Menurut prinsip sarang merpati, ada dua bilangan di kotak yang sama, misalnya $2^{k_1} m$ dan $2^{k_2} m$ dengan $k_1 < k_2$. Maka

$$2^{k_1} m \mid 2^{k_2} m,$$

sehingga bilangan yang lebih kecil membagi bilangan yang lebih besar. $\blacksquare$`,
  },
];

// Mengisi database. Dipanggil oleh init.js hanya jika database kosong.
function seed(db) {
  const run = db.transaction(() => {
    const insTopic = db.prepare('INSERT INTO topics (name, slug, description) VALUES (?, ?, ?)');
    topics.forEach((t) => insTopic.run(t.name, t.slug, t.description));

    const insLevel = db.prepare('INSERT INTO levels (name, sort_order) VALUES (?, ?)');
    levels.forEach((name, i) => insLevel.run(name, i + 1));

    const insComp = db.prepare('INSERT INTO competitions (name, full_name) VALUES (?, ?)');
    competitions.forEach((c) => insComp.run(c.name, c.full_name));

    const idMap = (sql) => Object.fromEntries(db.prepare(sql).all().map((r) => [r.k, r.id]));
    const topicId = idMap('SELECT slug AS k, id FROM topics');
    const levelId = idMap('SELECT name AS k, id FROM levels');
    const compId = idMap('SELECT name AS k, id FROM competitions');

    const insMaterial = db.prepare(
      'INSERT INTO materials (topic_id, title, content_md, sort_order) VALUES (?, ?, ?, ?)'
    );
    materials.forEach((m, i) => insMaterial.run(topicId[m.topic], m.title, m.content, i + 1));

    const insProblem = db.prepare(
      'INSERT INTO problems (title, statement_md, topic_id, level_id, competition_id) VALUES (?, ?, ?, ?, ?)'
    );
    const insSolution = db.prepare('INSERT INTO solutions (problem_id, content_md) VALUES (?, ?)');
    const insTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const link = db.prepare('INSERT INTO problem_tags (problem_id, tag_id) VALUES (?, ?)');

    problems.forEach((p) => {
      const info = insProblem.run(
        p.title, p.statement, topicId[p.topic], levelId[p.level],
        p.competition ? compId[p.competition] : null
      );
      const pid = info.lastInsertRowid;
      insSolution.run(pid, p.solution);
      p.tags.forEach((name) => {
        insTag.run(name);
        link.run(pid, getTag.get(name).id);
      });
    });

    // Akun admin awal (ganti password lewat env sebelum deploy)
    db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      config.admin.username,
      config.admin.email,
      bcrypt.hashSync(config.admin.password, config.bcryptRounds),
      'admin'
    );
  });

  run();
}

module.exports = { seed };

// Bisa dijalankan langsung: npm run seed
if (require.main === module) {
  const { initDatabase } = require('./init');
  const seeded = initDatabase();
  console.log(seeded ? 'Seed selesai.' : 'Database sudah berisi data, seed dilewati.');
}
