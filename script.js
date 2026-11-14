document.addEventListener("DOMContentLoaded", function () {
  // ===== COUNTDOWN KE IBADAH JUMAT 20:00 WIB (DURASI 2 JAM) =====
  // Menggunakan Intl.DateTimeFormat untuk memastikan waktu selalu WIB (UTC+7 / Asia/Jakarta)
  // tanpa bergantung pada timezone perangkat pengguna
  function startCountdown() {
    const countdownTimerEl = document.getElementById("countdown-timer");
    const countdownMessageEl = document.getElementById("countdown-message");
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    // Ambil komponen waktu saat ini dalam timezone WIB (Asia/Jakarta)
    function getNowWIB() {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(now);

      const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
      return {
        year: get("year"),
        month: get("month"), // 1–12
        day: get("day"),
        hour: get("hour"), // 0–23
        minute: get("minute"),
        second: get("second"),
        // Buat Date object WIB (UTC+7)
        date: new Date(Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") - 7, get("minute"), get("second"))),
      };
    }

    // Hitung target Jumat 20:00 WIB berikutnya
    function getNextFriday20WIB() {
      const wib = getNowWIB();
      const now = wib.date;
      const dayOfWeek = new Date(Date.UTC(wib.year, wib.month - 1, wib.day)).getUTCDay(); // 0=Min..5=Jum

      const timeInMinutes = wib.hour * 60 + wib.minute;
      const IBADAH_END = 22 * 60; // 22:00

      let daysUntilFriday;
      if (dayOfWeek === 5) {
        // Hari ini Jumat — cek apakah ibadah sudah selesai (lewat 22:00)
        daysUntilFriday = timeInMinutes >= IBADAH_END ? 7 : 0;
      } else {
        daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        if (daysUntilFriday === 0) daysUntilFriday = 7;
      }

      // Buat target: tanggal + daysUntilFriday, jam 20:00 WIB = 13:00 UTC
      const target = new Date(Date.UTC(wib.year, wib.month - 1, wib.day + daysUntilFriday, 13, 0, 0));
      return target;
    }

    let targetDate = getNextFriday20WIB();
    let interval;

    function updateCountdown() {
      const wib = getNowWIB();
      const nowUTC = wib.date;

      const dayOfWeek = new Date(Date.UTC(wib.year, wib.month - 1, wib.day)).getUTCDay();
      const isFriday = dayOfWeek === 5;
      const timeInMinutes = wib.hour * 60 + wib.minute;

      const IBADAH_START = 20 * 60; // 20:00 WIB
      const IBADAH_END = 22 * 60; // 22:00 WIB

      // Sedang dalam jam ibadah (Jumat 20:00–22:00 WIB)
      if (isFriday && timeInMinutes >= IBADAH_START && timeInMinutes < IBADAH_END) {
        countdownTimerEl.classList.add("hidden");
        countdownMessageEl.classList.remove("hidden");
        countdownMessageEl.innerHTML = "🔔 <strong>IBADAH SEDANG BERLANGSUNG!</strong> 🔔<br>" + "<small>Jumat, 20:00 – 22:00 WIB</small><br>" + "<small>Tuhan Yesus Memberkati 🙏</small>";
        return;
      }

      // Ibadah sudah selesai (lewat 22:00 Jumat) → perbarui target ke Jumat depan
      if (isFriday && timeInMinutes >= IBADAH_END) {
        targetDate = getNextFriday20WIB();
      }

      // Tampilkan timer hitung mundur
      countdownTimerEl.classList.remove("hidden");
      countdownMessageEl.classList.add("hidden");

      let distance = targetDate - nowUTC;
      if (distance < 0) {
        targetDate = getNextFriday20WIB();
        distance = targetDate - nowUTC;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      updateNumber(daysEl, days);
      updateNumber(hoursEl, hours);
      updateNumber(minutesEl, minutes);
      updateNumber(secondsEl, seconds);
    }

    function updateNumber(el, value) {
      const formatted = String(value).padStart(2, "0");
      if (el.textContent !== formatted) {
        el.classList.add("updated");
        el.textContent = formatted;
        setTimeout(() => el.classList.remove("updated"), 300);
      }
    }

    // Jalankan update setiap detik
    if (interval) clearInterval(interval);
    interval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  startCountdown();

  // ===== TOGGLE PENGURUS =====
  window.togglePengurus = function () {
    const pengurusCard = document.querySelector(".pengurus-card");
    if (pengurusCard) {
      pengurusCard.classList.toggle("hidden");
      if (!pengurusCard.classList.contains("hidden")) {
        pengurusCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Tutup pengurus jika klik di luar
  document.addEventListener("click", (e) => {
    const pengurusCard = document.querySelector(".pengurus-card");
    const trigger = document.querySelector('[onclick="togglePengurus()"]');
    if (pengurusCard && !pengurusCard.classList.contains("hidden") && !e.target.closest(".pengurus-card") && !e.target.closest(trigger)) {
      pengurusCard.classList.add("hidden");
    }
  });

  // ===== FORM ATTENDANCE DENGAN PESAN YANG LEBIH BAIK =====
  const scriptURL = "https://script.google.com/macros/s/AKfycbzpHmShO7-HcGWQiCGP6w17SyA4QLjZx_tgShCCBThX5pcx6s7uNtpu72RQqlR0UY7vFw/exec";
  const form = document.getElementById("attendance-form");
  const messageEl = document.getElementById("attendance-message");
  const submitBtn = document.querySelector(".submit-btn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Ambil data nama untuk personalisasi pesan
      const namaInput = document.getElementById("nama");
      const nama = namaInput ? namaInput.value.trim() : "Bapak";

      // Tampilkan loading state pada tombol
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Mengirim...';
      submitBtn.disabled = true;

      // Kirim data ke Google Sheet
      fetch(scriptURL, { method: "POST", body: new FormData(form) })
        .then(() => {
          // Reset form
          form.reset();

          // Tampilkan pesan sukses dengan personalisasi
          if (messageEl) {
            messageEl.innerHTML = `
              <div class="success-message">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: #ffd700; margin-bottom: 10px; display: block;"></i>
                <strong>Terima kasih, ${nama}!</strong><br>
                Kehadiran Anda telah tercatat.<br>
                🙏 <strong>Tuhan Yesus Memberkati</strong> 🙏
              </div>
            `;
            messageEl.classList.remove("hidden");
            messageEl.style.color = "#f5e6b3";
            messageEl.style.background = "rgba(255, 215, 0, 0.1)";
            messageEl.style.borderRadius = "15px";
            messageEl.style.padding = "15px";
            messageEl.style.textAlign = "center";

            // Auto hide setelah 6 detik
            setTimeout(() => {
              messageEl.classList.add("hidden");
              messageEl.innerHTML = "";
            }, 6000);
          }
        })
        .catch((error) => {
          console.error("Error!", error);
          if (messageEl) {
            messageEl.innerHTML = `
              <div class="error-message">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #ff6b6b; margin-bottom: 10px; display: block;"></i>
                <strong>Mohon maaf, terjadi kesalahan!</strong><br>
                Silakan coba lagi beberapa saat.<br>
                🙏 Tuhan Yesus Memberkati
              </div>
            `;
            messageEl.classList.remove("hidden");
            messageEl.style.color = "#ffcc00";
            messageEl.style.background = "rgba(255, 0, 0, 0.1)";
            messageEl.style.borderRadius = "15px";
            messageEl.style.padding = "15px";
            messageEl.style.textAlign = "center";

            setTimeout(() => {
              messageEl.classList.add("hidden");
              messageEl.innerHTML = "";
            }, 5000);
          }
        })
        .finally(() => {
          // Kembalikan tombol ke keadaan semula
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  }

  // ===== ORNAMEN ANIMASI SALIB (VERSI RINGAN & MENARIK) =====
  // Dibangun sekali saja di waktu idle browser. Jumlah elemen disesuaikan
  // ukuran layar, tapi semua animasinya hanya pakai transform/opacity
  // (murah untuk GPU) sehingga aman dinyalakan di HP, tablet, maupun desktop.

  function buildCrossOrnament(particleCount) {
    const container = document.createElement("div");
    container.className = "cross-container";

    const cross = document.createElement("div");
    cross.className = "animated-cross";

    const verticalBar = document.createElement("div");
    verticalBar.className = "cross-vertical";

    const horizontalBar = document.createElement("div");
    horizontalBar.className = "cross-horizontal";

    const glow = document.createElement("div");
    glow.className = "cross-glow";

    const glowOuter = document.createElement("div");
    glowOuter.className = "cross-glow-outer";

    const particles = document.createElement("div");
    particles.className = "cross-particles";

    cross.appendChild(verticalBar);
    cross.appendChild(horizontalBar);
    cross.appendChild(glowOuter);
    cross.appendChild(glow);
    cross.appendChild(particles);
    container.appendChild(cross);

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "cross-particle";
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 55 + Math.random() * 30;
      particle.style.setProperty("--angle", angle);
      particle.style.setProperty("--radius", radius + "px");
      particle.style.animationDelay = i * 0.3 + "s";
      fragment.appendChild(particle);
    }
    particles.appendChild(fragment);

    document.body.appendChild(container);
  }

  function buildCrossRays(rayCount) {
    const raysContainer = document.createElement("div");
    raysContainer.className = "cross-rays";

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < rayCount; i++) {
      const ray = document.createElement("div");
      ray.className = "cross-ray";
      const angle = (i / rayCount) * 360;
      ray.style.setProperty("--ray-angle", angle + "deg");
      ray.style.animationDelay = i * 0.2 + "s";
      fragment.appendChild(ray);
    }
    raysContainer.appendChild(fragment);
    document.body.appendChild(raysContainer);
  }

  function buildBackgroundParticles(particleCount) {
    const container = document.createElement("div");
    container.className = "particles-container";

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle cross-particle-bg";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 25 + "s";
      particle.style.animationDuration = Math.random() * 15 + 20 + "s";
      const size = Math.random() * 4 + 1;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.background = Math.random() > 0.6 ? "#ffd700" : "#fff3b0";
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
    document.body.appendChild(container);
  }

  function setupOrnaments() {
    // Jumlah elemen dikecilkan di HP supaya tetap ringan, tapi tidak dimatikan total
    // — sebab animasinya sudah murah (transform/opacity saja).
    const isMobile = window.innerWidth < 768;
    const crossParticleCount = isMobile ? 5 : 8;
    const rayCount = isMobile ? 4 : 6;
    const bgParticleCount = isMobile ? 8 : 14;

    const run = () => {
      buildCrossOrnament(crossParticleCount);
      buildCrossRays(rayCount);
      buildBackgroundParticles(bgParticleCount);
    };

    // Gunakan waktu idle browser bila tersedia supaya tidak menghalangi render utama
    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 1000 });
    } else {
      setTimeout(run, 300);
    }
  }

  setupOrnaments();

  // Hemat baterai: hentikan animasi dekoratif saat tab tidak aktif/tersembunyi
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("tab-hidden", document.hidden);
  });
});
