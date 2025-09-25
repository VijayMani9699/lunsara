// This function should run on every page to ensure the badge is always up-to-date.
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadUserCart();
});

/**
 * Updates the cart count badge in the header.
 * It gets the total quantity of items from user-specific cart storage.
 */
function updateCartBadge() {
    const cart = getUserCart();
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
    const cart = getUserCart();

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

    saveUserCart(cart);
    updateCartBadge();
    alert(`'${name}' has been added to your cart!`);
}

/**
 * Gets the current user's cart from localStorage
 * @returns {Array} User's cart items
 */
function getUserCart() {
    if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
        const currentUser = auth.getCurrentUser();
        const userCartKey = `cart_${currentUser.id}`;
        return JSON.parse(localStorage.getItem(userCartKey)) || [];
    } else {
        // Fallback to general cart for non-logged-in users
        return JSON.parse(localStorage.getItem('cart')) || [];
    }
}

/**
 * Saves the cart to localStorage for the current user
 * @param {Array} cart - Cart items to save
 */
function saveUserCart(cart) {
    if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
        const currentUser = auth.getCurrentUser();
        const userCartKey = `cart_${currentUser.id}`;
        localStorage.setItem(userCartKey, JSON.stringify(cart));
    } else {
        // Fallback to general cart for non-logged-in users
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

/**
 * Loads user cart data (for pages that need to display cart contents)
 */
function loadUserCart() {
    // This function can be used by cart.html and other pages that need to display cart contents
    const cart = getUserCart();
    return cart;
}
