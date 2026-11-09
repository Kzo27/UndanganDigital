import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowDown, CalendarDays, Clock3, MapPin, Menu, X, Heart, Music2, Camera, Send, Copy, Check } from "lucide-react";
import { invitation as data } from "./data";
import wayang from "./assets/wayang.svg";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);

function Ornament({ className = "" }) {
  return <div className={`ornament ${className}`} aria-hidden="true"><span>✦</span><i /><span>❖</span><i /><span>✦</span></div>;
}

// Nama penerima dari URL: /kenzzcode  atau  ?to=kenzzcode
function guestFromUrl() {
  const path = decodeURIComponent(location.pathname.split("/").filter(Boolean)[0] || "").replace(/[-_+]/g, " ");
  const query = new URLSearchParams(location.search).get("to") || "";
  return (query || path).trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function App() {
  const [opened, setOpened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBg, setActiveBg] = useState("cover");
  void activeBg;
  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [guest] = useState(guestFromUrl);
  const [guestName, setGuestName] = useState(guest);
  const [attendance, setAttendance] = useState("Hadir");
  const [message, setMessage] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [copied, setCopied] = useState("");
  const [wishes, setWishes] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.85 });
    let rafId;
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(el, { y: 42, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.05, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
      });
      gsap.utils.toArray(".section-photo").forEach((el) => {
        const section = el.closest("section");
        gsap.fromTo(el, { yPercent: -6, scale: 1.08 }, {
          yPercent: 6, scale: 1.14, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
        });
      });
      gsap.utils.toArray(".wayang-parallax").forEach((el) => {
        gsap.to(el, { yPercent: Number(el.dataset.speed || -18), ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.4 }
        });
      });
      // tumpang tindih 3D: section baru datang dari depan, section lama mundur
      const sections = gsap.utils.toArray(".section-screen");
      sections.forEach((el, i) => {
        if (i > 0) gsap.fromTo(el,
          { scale: 0.86, opacity: 0, yPercent: 6 },
          { scale: 1, opacity: 1, yPercent: 0, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 15%", scrub: 1 } });
        if (i < sections.length - 1) gsap.fromTo(el,
          { scale: 1, filter: "brightness(1)" },
          { scale: 0.9, filter: "brightness(.5)", ease: "none",
            scrollTrigger: { trigger: sections[i + 1], start: "top bottom", end: "top 15%", scrub: 1 } });
      });
    });
    return () => ctx.revert();
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const compute = () => {
      const root = document.documentElement;
      root.style.setProperty("--doc-height", `${root.scrollHeight}px`);
      ScrollTrigger.refresh();
    };
    compute();
    window.addEventListener("resize", compute);
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".wayang-parallax").forEach((el) => {
        gsap.to(el, { yPercent: Number(el.dataset.speed || -18), ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.4 }
        });
      });
    });
    return () => { window.removeEventListener("resize", compute); ctx.revert(); };
  }, [opened]);

  useEffect(() => {
    const target = new Date(data.dateISO).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setCountdown({
        days: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    try {
      if (musicOn) { audioRef.current.pause(); setMusicOn(false); }
      else { await audioRef.current.play(); setMusicOn(true); }
    } catch { setMusicOn(false); }
  };

  const submitRSVP = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setWishes((w) => [{ id: Date.now(), name: guestName.trim(), attendance, message: message.trim() }, ...w]);
    setMessage("");
  };

  const copyNumber = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: number });
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(number);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <>
      {opened && (
        <div className="wayang-stack" aria-hidden="true">
          <img className="wayang-parallax wayang-left" data-speed="-26" src={wayang} alt="" />
          <img className="wayang-parallax wayang-right" data-speed="-44" src={wayang} alt="" />
        </div>
      )}

      <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_946c7b0f8a.mp3?filename=javanese-gamelan-ambient-124008.mp3" />

      {!opened ? (
        <main className="cover-screen" data-bg="cover">
          <div className="cover-grain" />
          <nav className="topbar">
            <a className="brand" href="#home"><span className="brand-mark">❖</span> Pawiwahan</a>
            <span className="nav-note">A CINEMATIC WEDDING INVITATION</span>
          </nav>
          <div className="cover-content">
            <div className="wayang-stage">
              <div className="wayang-silhouette left">꧁</div>
              <div className="gunungan"><span>❖</span><b>꧁</b><i>✦</i></div>
              <div className="wayang-silhouette right">꧂</div>
            </div>
            <p className="eyebrow reveal">THE WEDDING OF</p>
            <h1 className="cover-names reveal">{data.partnerOne}<span>&</span>{data.partnerTwo}</h1>
            <Ornament />
            <p className="cover-quote reveal">{data.shortQuote}</p>
            {guest && (
              <div className="guest-block">
                <p className="guest-label">KEPADA</p>
                <p className="guest-name">{guest}</p>
              </div>
            )}
            <button className="gold-button open-button" onClick={() => setOpened(true)}>Buka Undangan <ArrowDown size={16} /></button>
            <p className="scroll-hint">SCROLL TO EXPLORE</p>
          </div>
          <div className="cover-footer">DENGAN PENUH RASA SYUKUR DAN KEBAHAGIAAN</div>
        </main>
      ) : (
        <>
          <header className="site-header">
            <a className="brand" onClick={() => scrollTo("home")}><span className="brand-mark">❖</span> Pawiwahan</a>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka menu">{menuOpen ? <X /> : <Menu />}</button>
            <nav className={menuOpen ? "nav-links open" : "nav-links"}>
              {[["home","Home"],["couple","Mempelai"],["event","Acara"],["gallery","Galeri"],["rsvp","RSVP"]].map(([id,label]) =>
                <button key={id} onClick={() => scrollTo(id)}>{label}</button>
              )}
            </nav>
            <button className={`music-button ${musicOn ? "playing" : ""}`} onClick={toggleMusic} aria-label="Musik"><Music2 size={17} /></button>
          </header>

          <main>
            <section id="home" className="hero section-screen" data-bg="cover">
              <div className="section-photo" style={{ backgroundImage: `url("${data.backgrounds.cover}")` }} aria-hidden="true" />
              <div className="hero-frame">
                <p className="eyebrow reveal">UNDANGAN PERNIKAHAN</p>
                <div className="hero-gunungan parallax">❖</div>
                <h1 className="hero-title reveal">{data.partnerOne}<span>&</span>{data.partnerTwo}</h1>
                <Ornament />
                <p className="hero-date reveal">{data.dateLabel}</p>
                <button className="text-link" onClick={() => scrollTo("couple")}>MENGENAL KAMI <ArrowDown size={14} /></button>
              </div>
              <div className="side-caption">JAWA • TRADISI • CINTA</div>
            </section>

            <section id="couple" className="couple section-screen" data-bg="couple">
              <div className="section-photo" style={{ backgroundImage: `url("${data.backgrounds.couple}")` }} aria-hidden="true" />
              <div className="section-inner couple-inner">
                <p className="eyebrow reveal">DENGAN MEMOHON RAHMAT TUHAN</p>
                <h2 className="section-title reveal">Dua Hati, <em>Satu Janji</em></h2>
                <p className="section-copy reveal">Dengan penuh rasa syukur kepada Allah SWT dan penuh sukacita, kami mengundang Bpk/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.</p>
                <div className="couple-names">
                  <article className="name-card reveal"><div className="portrait portrait-one">✦</div><h3>{data.partnerOne}</h3><p>Putra kedua dari Bapak Lukman & Ibu Mufakhomah</p></article>
                  <div className="ampersand reveal">&</div>
                  <article className="name-card reveal"><div className="portrait portrait-two">✦</div><h3>{data.partnerTwo}</h3><p>Putri pertama dari Bapak Moh. Samudi & Ibu Rohmah</p></article>
                </div>
              </div>
            </section>

            <section id="event" className="event section-screen" data-bg="event">
              <div className="section-photo" style={{ backgroundImage: `url("${data.backgrounds.event}")` }} aria-hidden="true" />
              <div className="section-inner">
                <p className="eyebrow reveal">CATAT TANGGALNYA</p>
                <h2 className="section-title reveal">Rangkaian <em>Acara</em></h2>
                <div className="event-grid">
                  <article className="event-card reveal"><div className="event-icon"><Heart /></div><p className="eyebrow">AKAD NIKAH</p><h3>{data.dateLabel}</h3><p><Clock3 size={15} /> {data.akadTime}</p></article>
                  <article className="event-card reveal"><div className="event-icon"><Camera /></div><p className="eyebrow">RESEPSI</p><h3>{data.dateLabel}</h3><p><Clock3 size={15} /> {data.receptionTime}</p></article>
                </div>
                <div className="location-card reveal"><MapPin /><div><strong>{data.venue}</strong><span>{data.address}</span></div><a className="gold-button small" href={data.mapsUrl} target="_blank" rel="noreferrer">Buka Maps</a></div>
                <div className="countdown reveal"><p className="eyebrow">MENUJU HARI BAHAGIA</p><div className="count-grid">{Object.entries(countdown).map(([unit,value]) => <div key={unit}><strong>{value}</strong><span>{unit}</span></div>)}</div></div>
              </div>
            </section>

            <section id="gallery" className="gallery section-screen" data-bg="gallery">
              <div className="section-photo" style={{ backgroundImage: `url("${data.backgrounds.gallery}")` }} aria-hidden="true" />
              <div className="section-inner">
                <p className="eyebrow reveal">CERITA DALAM BINGKAI</p>
                <h2 className="section-title reveal">Galeri <em>Kenangan</em></h2>
                <div className="gallery-grid">{data.gallery.map((src,i) => <figure className="gallery-item reveal" key={src}><img src={src} alt={`Foto kenangan ${i+1}`} loading="lazy" /><figcaption>MEMORI 0{i+1}</figcaption></figure>)}</div>
              </div>
            </section>

            <section id="rsvp" className="rsvp section-screen" data-bg="closing">
              <div className="section-photo" style={{ backgroundImage: `url("${data.backgrounds.closing}")` }} aria-hidden="true" />
              <div className="section-inner rsvp-inner">
                <div className="closing-gunungan">❖</div>
                <p className="eyebrow reveal">KAMI MENANTIKAN KEHADIRAN ANDA</p>
                <h2 className="section-title reveal">Konfirmasi <em>Kehadiran</em></h2>
                <p className="section-copy reveal">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir serta memberikan doa restu.</p>
                <form className="rsvp-form reveal" onSubmit={submitRSVP}>
                  <label>Nama lengkap<input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Masukkan nama Anda" required /></label>
                  <label>Konfirmasi kehadiran<select value={attendance} onChange={e=>setAttendance(e.target.value)}><option>Hadir</option><option>Maaf, belum bisa hadir</option></select></label>
                  <label>Ucapan dan doa<textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tuliskan doa terbaik..." rows="3" /></label>
                  <button className="gold-button submit-button" type="submit">Kirim Konfirmasi <Send size={15} /></button>
                </form>
                <div className="wishes-wrap" aria-live="polite">
                  {wishes.length > 0 && (
                    <>
                      <p className="eyebrow wishes-head">UCAPAN & DOA</p>
                      <div className="wishes-list">
                        {wishes.map((w) => (
                          <article className="wish-card" key={w.id}>
                            <header>
                              <div>
                                <strong className="wish-name">{w.name}</strong>
                                <span className={`wish-status ${w.attendance === "Hadir" ? "is-present" : "is-absent"}`}>{w.attendance}</span>
                              </div>
                              <time className="wish-time">{new Date(w.id).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</time>
                            </header>
                            {w.message && <p className="wish-message">{w.message}</p>}
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <Ornament />
                <div className="bank-card reveal">
                  <p className="eyebrow">TANDA KASIH</p>
                  <h3 className="bank-title">Nomor <em>Rekening</em></h3>
                  <p className="bank-copy">Doa restu Anda adalah hadiah terindah. Bagi yang ingin memberi tanda kasih, dapat melalui:</p>
                  <div className="bank-list">
                    {data.banks.map((b) => (
                      <div className="bank-row" key={b.number}>
                        <span className="bank-name">{b.bank}</span>
                        <strong className="bank-number">{b.number}</strong>
                        <span className="bank-holder">a.n. {b.holder}</span>
                        <button className="copy-button" onClick={() => copyNumber(b.number)} aria-label={`Salin nomor ${b.bank}`}>
                          {copied === b.number ? <Check size={14} /> : <Copy size={14} />}
                          {copied === b.number ? "Tersalin" : "Salin"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <h2 className="thanks reveal">Matur Nuwun</h2>
                <p className="thanks-copy">Atas doa, restu, dan kehadiran Anda.</p>
                <p className="copyright">© {new Date().getFullYear()} {data.partnerOne} & {data.partnerTwo}</p>
              </div>
            </section>
          </main>
          <button className="floating-music" onClick={toggleMusic}><Music2 size={17} /> {musicOn ? "Musik aktif" : "Putar musik"}</button>
        </>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);