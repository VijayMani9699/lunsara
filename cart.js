// This function will run when the page is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

/**
 * Updates the cart count badge in the header.
 * It gets the cart from localStorage and displays its length.
 */
function updateCartBadge() {
    // Get the cart array from localStorage. If it doesn't exist, default to an empty array [].
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        // The count is simply the number of items in the array.
        cartCountElement.innerText = cart.length;
    }
}

/**
 * Adds a product to the cart array in localStorage.
 * @param {string} name - The name of the product.
 * @param {number} price - The price of the product.
 * @param {string} image - The source URL of the product image.
 */
function addToCart(name, price, image) {
    // Get the current cart or create a new empty one.
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create a new product object to add to the cart.
    const product = {
        name: name,
        price: price,
        image: image
    };
    
    // Add the new product to the array.
    cart.push(product);
    
    // Save the updated cart array back to localStorage.
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the visual cart count badge.
    updateCartBadge();
    
    // Optional: Give the user some feedback.
    alert(`'${name}' has been added to your cart!`);
}

/**
 * A placeholder function for the "Buy Now" button.
 */
function buyNow() {
    alert('Proceeding to checkout!');
    // In a real application, this would redirect to a checkout page.
}