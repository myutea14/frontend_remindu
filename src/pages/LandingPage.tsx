import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-remindu.png';
import heroImage from '../assets/hero-section.png';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-custom shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 shrink-0">
            <img src={logo} alt="remind.u logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>remind.u</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Masuk</Link>
          <Link to="/register" className="px-3 py-2 md:px-5 md:py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all whitespace-nowrap">Daftar Gratis</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between px-8 lg:px-24 py-20 gap-12 bg-gradient-to-br from-[#E3FDFA] to-white relative overflow-hidden">
        <div className="flex-1 flex flex-col items-start z-10">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-widest mb-6">
            Mitra Academic Wellness Anda
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight mb-6">
            Ubah Stres Menjadi <span className="text-primary">Sukses</span> bersama remind.u
          </h1>
          <p className="text-lg text-on-surface-variant mb-10 leading-relaxed max-w-xl">
            Jadikan sesi belajarmu seperti game, hubungkan Bot WhatsApp AI proaktif, dan aktifkan Extreme Accountability Mode untuk menaklukkan semua tenggat waktumu.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl shadow-level-2 hover:shadow-level-3 hover:-translate-y-1 transition-all text-center">
              Mulai - Gratis
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white text-primary border-2 border-primary text-lg font-bold rounded-2xl hover:bg-primary/5 transition-all text-center">
              Lihat Cara Kerjanya
            </a>
          </div>
        </div>
        <div className="flex-1 relative z-10 flex justify-center" style={{ perspective: '1000px' }}>
          {/* Decorative Glow Behind Image */}
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 z-0"></div>
          
          {/* Stylized Hero Graphic */}
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center transition-all duration-700 ease-out hover:[transform:rotateX(5deg)_rotateY(-10deg)_scale(1.05)]">
             
             <div className="relative w-full h-full z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(7,101,89,0.2)] ring-4 ring-white/80 bg-white/20">
               <img src={heroImage} alt="Hero Graphic" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
             </div>
             
             <div className="absolute -top-2 -right-2 md:-top-6 md:-right-6 w-20 h-20 bg-white/80 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center shadow-2xl z-50 animate-[bounce_3s_infinite]" style={{ transform: 'rotate(12deg)' }}>
               <span className="material-symbols-outlined text-primary text-4xl drop-shadow-sm">workspace_premium</span>
             </div>
             
             <div className="absolute -bottom-2 -left-2 md:-bottom-6 md:-left-6 w-16 h-16 bg-white/80 backdrop-blur-md border border-white/60 rounded-[1.5rem] flex items-center justify-center shadow-2xl z-50 animate-[bounce_3s_infinite_500ms]" style={{ transform: 'rotate(-6deg)' }}>
               <span className="material-symbols-outlined text-secondary text-3xl drop-shadow-sm">chat</span>
             </div>
          </div>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 lg:px-24 bg-white">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-on-surface mb-4">Kuasai Tenggat Waktumu</h2>
          <p className="text-on-surface-variant text-lg">Fitur-fitur luar biasa yang dirancang untuk menjaga fokus dan motivasimu setiap hari.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-border-custom shadow-sm hover:shadow-level-2 transition-shadow group">
            <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#25D366] transition-colors">
              <span className="material-symbols-outlined text-[#25D366] text-3xl group-hover:text-white transition-colors">smart_toy</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Bot WA Proaktif</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Chat secara natural dengan asisten AI kami via WhatsApp. Ketik "STATUS" untuk melihat tugas, atau "SELESAI 1" untuk menyelesaikan tugas dengan mudah.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-border-custom shadow-sm hover:shadow-level-2 transition-shadow group">
            <div className="w-14 h-14 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FFD700] transition-colors">
              <span className="material-symbols-outlined text-[#FFD700] text-3xl group-hover:text-white transition-colors">military_tech</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Gamifikasi Mendalam</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Dapatkan XP dari menyelesaikan tugas dan menjaga streak. Naik level untuk membuka lencana dan membangun profil akademik yang keren.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-border-custom shadow-sm hover:shadow-level-2 transition-shadow group">
            <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-error transition-colors">
              <span className="material-symbols-outlined text-error text-3xl group-hover:text-white transition-colors">alarm_on</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Extreme Accountability</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Masuk "Zona Merah" (&lt;24 jam)? Bot kami akan secara agresif mengingatkanmu setiap 30 menit sampai tugas benar-benar selesai.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-8 border border-border-custom shadow-sm hover:shadow-level-2 transition-shadow group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white transition-colors">diversity_3</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Komunitas Kolaboratif</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Bentuk grup belajar, bagikan tugas dengan mudah, dan saling memotivasi lewat progres bersama dan chat real-time.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-8 lg:px-24 bg-surface/50 border-y border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-on-surface mb-4">Cara Kerjanya</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">
           <div className="flex-1 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-white rounded-full shadow-level-1 flex items-center justify-center mb-6 text-primary border-2 border-primary/20">
               <span className="text-2xl font-black">1</span>
             </div>
             <h4 className="text-lg font-bold text-on-surface mb-2">Daftar</h4>
             <p className="text-sm text-on-surface-variant">Buat akun gratismu sekarang juga.</p>
           </div>
           <div className="hidden md:block w-16 h-0.5 bg-border-custom"></div>
           <div className="flex-1 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-white rounded-full shadow-level-1 flex items-center justify-center mb-6 text-primary border-2 border-primary/20">
               <span className="text-2xl font-black">2</span>
             </div>
             <h4 className="text-lg font-bold text-on-surface mb-2">Hubungkan WhatsApp</h4>
             <p className="text-sm text-on-surface-variant">Tautkan nomormu dengan aman via OTP.</p>
           </div>
           <div className="hidden md:block w-16 h-0.5 bg-border-custom"></div>
           <div className="flex-1 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-primary rounded-full shadow-level-2 flex items-center justify-center mb-6 text-white border-2 border-primary">
               <span className="text-2xl font-black">3</span>
             </div>
             <h4 className="text-lg font-bold text-on-surface mb-2">Taklukkan Tugas & Naik Level</h4>
             <p className="text-sm text-on-surface-variant">Dapatkan XP dan lencana untuk setiap tugas yang selesai.</p>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 lg:px-24 bg-white">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-surface/30 p-8 rounded-3xl border border-border-custom">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">NM</div>
                  <div>
                    <p className="font-bold text-on-surface">Nurul Mutmainnah Musfi</p>
                    <p className="text-xs text-on-surface-variant">Mahasiswa</p>
                  </div>
               </div>
               <p className="text-on-surface italic text-lg leading-relaxed">"Mode Extreme Accountability mengurangi kecemasan saya terhadap tugas hingga 90%. Saya tidak lagi menunda-nunda karena bot-nya tidak akan membiarkan saya bersantai!"</p>
            </div>
            <div className="bg-surface/30 p-8 rounded-3xl border border-border-custom">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center text-[#FFD700] font-bold">NI</div>
                  <div>
                    <p className="font-bold text-on-surface">Nurul Ilmi</p>
                    <p className="text-xs text-on-surface-variant">Mahasiswa</p>
                  </div>
               </div>
               <p className="text-on-surface italic text-lg leading-relaxed">"Berkat sistem gamifikasi, saya merasa seperti bermain game setiap kali menyelesaikan tugas. Ini sangat memotivasi saya untuk terus produktif setiap hari!"</p>
            </div>
            
            <div className="bg-surface/30 p-8 rounded-3xl border border-border-custom">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF69B4]/20 rounded-full flex items-center justify-center text-[#FF69B4] font-bold">NA</div>
                  <div>
                    <p className="font-bold text-on-surface">Nur Afni Ramadhani</p>
                    <p className="text-xs text-on-surface-variant">Mahasiswa</p>
                  </div>
               </div>
               <p className="text-on-surface italic text-lg leading-relaxed">"Sangat membantu saat kerja kelompok! Semua anggota jadi tahu tanggung jawab masing-masing, dan tidak ada lagi yang bisa ngeles saat tugas belum selesai."</p>
            </div>

            <div className="bg-surface/30 p-8 rounded-3xl border border-border-custom">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#4CAF50]/20 rounded-full flex items-center justify-center text-[#4CAF50] font-bold">MG</div>
                  <div>
                    <p className="font-bold text-on-surface">Maghfirah</p>
                    <p className="text-xs text-on-surface-variant">Mahasiswa</p>
                  </div>
               </div>
               <p className="text-on-surface italic text-lg leading-relaxed">"Pengingat Zona Merah sangat efektif! Notifikasi via WhatsApp membuat saya tidak pernah lagi melewatkan deadline yang krusial."</p>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-8 bg-primary text-white text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-8">Siap Menaklukkan Tenggat Waktumu?</h2>
        <Link to="/register" className="inline-block px-10 py-5 bg-white text-primary text-xl font-bold rounded-2xl shadow-level-2 hover:shadow-level-3 hover:-translate-y-1 transition-all">
          Gabung Sekarang
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border-custom pt-12">
        <div className="px-8 lg:px-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          {/* Cara Pembayaran */}
          <div>
            <h4 className="text-sm font-extrabold text-on-surface mb-6 uppercase tracking-wider">Cara Pembayaran</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 text-center font-black text-primary text-xl italic">BCA</div>
                 <div className="text-xs">
                   <p className="font-bold text-on-surface text-sm">1234 5678 9012</p>
                   <p className="text-on-surface-variant">a.n remind.u</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 text-center font-black text-primary text-xl italic">BRI</div>
                 <div className="text-xs">
                   <p className="font-bold text-on-surface text-sm">9876 5432 1098</p>
                   <p className="text-on-surface-variant">a.n remind.u</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Kontak Kami */}
          <div>
            <h4 className="text-sm font-extrabold text-on-surface mb-6 uppercase tracking-wider">Kontak Kami</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <span className="text-on-surface font-semibold">081918487102</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                </div>
                <span className="text-on-surface font-semibold">081918487102</span>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <h4 className="text-sm font-extrabold text-on-surface mb-6 uppercase tracking-wider">Alamat</h4>
            <p className="text-sm text-on-surface font-medium leading-relaxed mb-6">
              Jl. Pendidikan No. 1, Kota Pelajar,<br/>
              Kec. Inovasi, Provinsi Ilmu<br/>
              90221
            </p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="font-bold text-[16px]">f</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="font-bold text-sm">in</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="font-bold text-sm">ig</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">flight</span>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-start md:justify-end">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <img src={logo} alt="remind.u logo" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-bold text-primary tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>remind.u</h1>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase text-center mt-1">Academic Wellness</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-primary py-4 px-8 lg:px-24 flex items-center justify-center text-sm text-white font-medium">
          <p>Copyright &copy; 2026 remind.u. All Right Reserved.</p>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a href="https://wa.me/6281918487102" target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-level-2 hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
        <a href="tel:081918487102" className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-level-2 hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-2xl">phone</span>
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
