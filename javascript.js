// // Card animation script
// const cards = document.querySelectorAll('.product-card');

// function isInViewport(el) {
//   const rect = el.getBoundingClientRect();
//   return rect.top <= (window.innerHeight || document.documentElement.clientHeight) - 100;
// }

// function animateCards() {
//   cards.forEach(card => {
//     if (isInViewport(card)) {
//       card.classList.add('animate');
//     }
//   });
// }

// window.addEventListener('scroll', animateCards);
// window.addEventListener('load', animateCards);


// // Modal script
// // Get the elements for the modal
// const lungiModal = document.getElementById('lungiModal');
// const lungiCard = document.getElementById('lungis-card');
// const closeBtn = document.querySelector('.close-button');

// // When the lungi card is clicked, show the modal
// lungiCard.onclick = function() {
//   lungiModal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// closeBtn.onclick = function() {
//   lungiModal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal content, close it
// window.onclick = function(event) {
//   if (event.target == lungiModal) {
//     lungiModal.style.display = "none";
//   }
// }