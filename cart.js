// This function should run on every page to ensure the badge is always up-to-date.
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

/**
 * Updates the cart count badge in the header.
 * It gets the total quantity of items from localStorage.
 */
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    
    // The count is the sum of quantities, not just the number of array entries.
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountElement) {
        cartCountElement.innerText = totalItems;
        // Show badge only if there are items in the cart.
        if (totalItems > 0) {
            cartCountElement.style.display = 'flex';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

/**
 * Adds a product to the cart. If the product already exists, it increases the quantity.
 * @param {string} name - The name of the product.
 * @param {number} price - The price of the product.
 * @param {string} image - The source URL of the product image.
 */
function addToCart(name, price, image) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart.
    const existingProductIndex = cart.findIndex(item => item.name === name);

    if (existingProductIndex > -1) {
        // If it exists, just increase the quantity.
        cart[existingProductIndex].quantity += 1;
    } else {
        // If it doesn't exist, add it as a new item with quantity 1.
        const product = { name, price, image, quantity: 1 };
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    alert(`'${name}' has been added to your cart!`);
}
