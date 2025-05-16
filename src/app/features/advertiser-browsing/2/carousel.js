document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.profile-gallery, .carousel-images').forEach(function (carousel) {
    const images = Array.from(carousel.querySelectorAll('img'));
    if (images.length < 2) return;
    let current = 0;
    function show(idx) {
      images.forEach((img, i) => (img.style.display = i === idx ? 'block' : 'none'));
    }
    show(current);
    // Optionally, add navigation if needed
  });
});
