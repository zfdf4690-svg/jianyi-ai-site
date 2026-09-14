// 公共脚本：入场动画观察器 + Swiper 初始化（无 Swiper 元素的页面自动跳过）
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('show');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

if (window.Swiper && document.querySelector('.industries-swiper')) {
  new Swiper('.industries-swiper', {
    loop: true,
    centeredSlides: true,
    slideToClickedSlide: true,
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
}
