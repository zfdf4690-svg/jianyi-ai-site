// 公共脚本：入场动画观察器 + Swiper 初始化（无 Swiper 元素的页面自动跳过）
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('show');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

if (window.Swiper && document.querySelector('.industries-swiper')) {
  const swiper = new Swiper('.industries-swiper', {
    loop: true,
    centeredSlides: true,
    speed: 700,
    spaceBetween: 20,
    slidesPerView: 1.15,
    autoplay: { delay: 2800, disableOnInteraction: false },
    breakpoints: {
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 3 }
    },
    pagination: {
      el: '.industries-pagination',
      clickable: true
    }
  });

  // 点击卡片居中：直接定位到被点卡片在 slides 中的真实下标
  // 不做 activeIndex+steps 运算（loop 克隆下两个排序不一致会越界到空白轨道）
  swiper.on('tap', (sw, e) => {
    const slide = e.target.closest('.swiper-slide');
    if (!slide) return;
    const active = sw.slides[sw.activeIndex];
    if (!active || slide === active) return;
    const idx = sw.slides.indexOf(slide);
    if (idx >= 0 && idx !== sw.activeIndex) sw.slideTo(idx, 700);
  });
}
