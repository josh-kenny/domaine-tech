/**
 * Product Card JavaScript
 * Handles color swatches, image updates, and add to cart functionality
 */

// Declare jQuery and theme variables if they are not already defined
if (typeof jQuery === "undefined") {
    var jQuery = window.jQuery // Try to get it from the window object
    if (typeof jQuery === "undefined") {
        console.warn("jQuery is not defined. Some features may not work correctly.")
    }
}

if (typeof theme === "undefined") {
    var theme = window.theme || {} // Try to get it from the window object, or initialize as an empty object
    if (typeof theme === "undefined") {
        console.warn("theme is not defined. Some features may not work correctly.")
    }
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initProductCards()
})

/**
 * Initialize all product cards on the page
 */
function initProductCards() {
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
        const colorSwatches = card.querySelector(".js-product-card-color-swatches")
        if (colorSwatches) {
            initColorSwatches(colorSwatches)
        }

        // Initialize add to cart buttons
        initAddToCartButtons(card)
    })
}

/**
 * Initialize color swatches for a product card
 * @param {HTMLElement} swatchContainer - The container for color swatches
 */
function initColorSwatches(swatchContainer) {
    const productCard = swatchContainer.closest(".product-card")
    const primaryImage = productCard.querySelector(".primary-image")
    const secondaryImage = productCard.querySelector(".secondary-image")
    const saleBadge = productCard.querySelector(".js-sale-badge")
    const priceElement = productCard.querySelector(".js-price")
    const compareAtPriceElement = productCard.querySelector(".js-compare-at-price")
    const addToCartButton = productCard.querySelector(".js-add-to-cart")
    const outOfStockButton = productCard.querySelector(".js-out-of-stock")

    swatchContainer.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.addEventListener("change", function () {
            updateProductCard(
                this,
                primaryImage,
                secondaryImage,
                saleBadge,
                priceElement,
                compareAtPriceElement,
                addToCartButton,
                outOfStockButton,
            )
        })
    })

    // Initialize with the default selected color
    const defaultSwatch = swatchContainer.querySelector(".color-swatch:checked")
    if (defaultSwatch) {
        updateProductCard(
            defaultSwatch,
            primaryImage,
            secondaryImage,
            saleBadge,
            priceElement,
            compareAtPriceElement,
            addToCartButton,
            outOfStockButton,
        )
    }
}

/**
 * Initialize add to cart buttons
 * @param {HTMLElement} productCard - The product card element
 */
function initAddToCartButtons(productCard) {
    const addToCartButton = productCard.querySelector(".js-add-to-cart")

    if (addToCartButton) {
        addToCartButton.addEventListener("click", function () {
            const variantId = this.dataset.variantId
            addToCart(variantId, 1)
        })
    }
}

/**
 * Add item to cart and update cart icon
 * @param {string} variantId - The variant ID to add
 * @param {number} quantity - The quantity to add
 */
function addToCart(variantId, quantity) {
    // Show loading state
    const addToCartButton = document.querySelector(`.js-add-to-cart[data-variant-id="${variantId}"]`)
    if (addToCartButton) {
        const originalText = addToCartButton.textContent
        addToCartButton.textContent = "Adding..."
        addToCartButton.disabled = true

        // Add to cart using Shopify AJAX API
        fetch("/cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: variantId,
                quantity: quantity,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Successfully added to cart:", data)
                addToCartButton.textContent = "Added!"

                // Try multiple methods to update the cart icon
                updateCartIconMultipleApproaches()

                setTimeout(() => {
                    addToCartButton.textContent = originalText
                    addToCartButton.disabled = false
                }, 2000)
            })
            .catch((error) => {
                console.error("Error adding to cart:", error)
                addToCartButton.textContent = "Error"
                setTimeout(() => {
                    addToCartButton.textContent = originalText
                    addToCartButton.disabled = false
                }, 2000)
            })
    }
}

/**
 * Try multiple approaches to update the cart icon
 */
function updateCartIconMultipleApproaches() {
    console.log("Attempting to update cart icon using multiple approaches")

    // Approach 1: Use Shopify's cart.js endpoint
    fetch("/cart.js")
        .then((response) => response.json())
        .then((cart) => {
            console.log("Cart data:", cart)
            const itemCount = cart.item_count

            // Try to update using direct DOM manipulation
            updateCartCountInDOM(itemCount)

            // Try to update using Shopify events
            dispatchShopifyEvents(cart)
        })
        .catch((error) => {
            console.error("Error fetching cart data:", error)
        })

    // Approach 2: Use Shopify's sections API to refresh the header
    refreshHeaderSection()
}

/**
 * Update cart count in the DOM by trying various selectors
 * @param {number} itemCount - The number of items in the cart
 */
function updateCartCountInDOM(itemCount) {
    console.log("Attempting to update cart count in DOM:", itemCount)

    // Try common cart count selectors
    const cartCountSelectors = [
        ".cart-count-bubble",
        ".cart-count",
        ".site-header__cart-count",
        ".cart-link__bubble-num",
        ".header__cart-count",
        ".js-cart-count",
        "#CartCount",
        "#CartBubble",
        "[data-cart-count]",
        ".cart-count-number",
        ".cart-item-count",
        ".cart__count",
        ".cart-count-wrapper span",
        ".cart-count-wrapper",
        ".header__cart-count",
        ".header-cart-count",
        ".header-bar__cart-count",
        ".site-header-cart-count",
        ".site-header__cart-indicator",
    ]

    let updated = false

    // Try each selector
    for (const selector of cartCountSelectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
            elements.forEach((el) => {
                console.log("Found element with selector", selector, el)

                // Update data attribute if present
                if (el.hasAttribute("data-cart-count")) {
                    el.setAttribute("data-cart-count", itemCount)
                    updated = true
                }

                // Check if this is a cart-count-bubble with the standard Shopify structure
                if (el.classList.contains("cart-count-bubble")) {
                    const ariaHiddenSpan = el.querySelector('span[aria-hidden="true"]')
                    const visuallyHiddenSpan = el.querySelector(".visually-hidden")

                    if (ariaHiddenSpan) {
                        ariaHiddenSpan.textContent = itemCount
                        updated = true
                    } else if (
                        el.childNodes.length === 0 ||
                        (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE)
                    ) {
                        // If it doesn't have the spans but is a simple text node
                        el.textContent = itemCount
                        updated = true
                    }

                    if (visuallyHiddenSpan) {
                        visuallyHiddenSpan.textContent = `${itemCount} items`
                        updated = true
                    }

                    // Toggle visibility based on count
                    if (itemCount === 0) {
                        el.classList.add("hidden")
                        el.setAttribute("aria-hidden", "true")
                    } else {
                        el.classList.remove("hidden")
                        el.setAttribute("aria-hidden", "false")
                    }
                } else {
                    // For other elements, just update the text content
                    if (
                        el.childNodes.length === 0 ||
                        (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE)
                    ) {
                        el.textContent = itemCount
                        updated = true
                    } else {
                        // Look for child elements that might contain the count
                        el.querySelectorAll("span, div").forEach((child) => {
                            if (/^\s*\d+\s*$/.test(child.textContent)) {
                                child.textContent = itemCount
                                updated = true
                            }
                        })
                    }

                    // Toggle visibility based on count
                    if (itemCount === 0) {
                        el.classList.add("hidden")
                        el.setAttribute("aria-hidden", "true")
                    } else {
                        el.classList.remove("hidden")
                        el.setAttribute("aria-hidden", "false")
                    }
                }

                // Check if this element has a parent that might be hidden when empty
                let parent = el.parentElement
                while (parent && parent.tagName !== "BODY") {
                    if (parent.classList.contains("hide") || parent.classList.contains("hidden")) {
                        if (itemCount > 0) {
                            parent.classList.remove("hide", "hidden")
                            parent.setAttribute("aria-hidden", "false")
                        }
                    }
                    parent = parent.parentElement
                }
            })
        }
    }

    // If we couldn't find a cart count element with the common selectors,
    // try a more aggressive approach
    if (!updated) {
        console.log("No cart count element found with common selectors, trying aggressive approach")

        // Look for cart links
        const cartLinks = document.querySelectorAll('a[href="/cart"], a[href*="/cart"]')
        cartLinks.forEach((link) => {
            console.log("Found cart link:", link)

            // Look for elements inside the cart link that might be the count
            link.querySelectorAll("span, div").forEach((el) => {
                if (/^\s*\d+\s*$/.test(el.textContent)) {
                    console.log("Found potential count element inside cart link:", el)
                    el.textContent = itemCount
                    if (itemCount === 0) {
                        el.classList.add("hidden")
                    } else {
                        el.classList.remove("hidden")
                    }
                    updated = true
                }
            })

            // If no count element found inside, check if there's a count in a sibling element
            if (!updated) {
                const siblings = Array.from(link.parentNode.children)
                siblings.forEach((sibling) => {
                    if (sibling !== link && /^\s*\d+\s*$/.test(sibling.textContent)) {
                        console.log("Found potential count element as sibling to cart link:", sibling)
                        sibling.textContent = itemCount
                        if (itemCount === 0) {
                            sibling.classList.add("hidden")
                        } else {
                            sibling.classList.remove("hidden")
                        }
                        updated = true
                    }
                })
            }

            // If still no count element found, we might need to create one
            if (!updated && itemCount > 0) {
                // Check if there's a bubble element that might be hidden
                const bubbleElements = link.querySelectorAll(".cart-count-bubble, .cart-bubble, .cart-count")
                if (bubbleElements.length > 0) {
                    bubbleElements.forEach((bubble) => {
                        bubble.classList.remove("hidden")
                        bubble.setAttribute("aria-hidden", "false")

                        // If the bubble doesn't have the standard Shopify structure, update it
                        const ariaHiddenSpan = bubble.querySelector('span[aria-hidden="true"]')
                        const visuallyHiddenSpan = bubble.querySelector(".visually-hidden")

                        if (!ariaHiddenSpan && !visuallyHiddenSpan) {
                            // Clear existing content
                            bubble.innerHTML = ""

                            // Add the standard Shopify structure
                            const ariaHiddenSpan = document.createElement("span")
                            ariaHiddenSpan.setAttribute("aria-hidden", "true")
                            ariaHiddenSpan.textContent = itemCount

                            const visuallyHiddenSpan = document.createElement("span")
                            visuallyHiddenSpan.className = "visually-hidden"
                            visuallyHiddenSpan.textContent = `${itemCount} items`

                            bubble.appendChild(ariaHiddenSpan)
                            bubble.appendChild(visuallyHiddenSpan)
                        } else {
                            // Update existing spans
                            if (ariaHiddenSpan) {
                                ariaHiddenSpan.textContent = itemCount
                            }
                            if (visuallyHiddenSpan) {
                                visuallyHiddenSpan.textContent = `${itemCount} items`
                            }
                        }

                        updated = true
                    })
                } else {
                    // No bubble found, we need to create one with the standard Shopify structure
                    console.log("No cart count bubble found, creating one with standard Shopify structure")

                    // Create the bubble with the standard Shopify structure
                    const bubble = document.createElement("div")
                    bubble.className = "cart-count-bubble"

                    const ariaHiddenSpan = document.createElement("span")
                    ariaHiddenSpan.setAttribute("aria-hidden", "true")
                    ariaHiddenSpan.textContent = itemCount

                    const visuallyHiddenSpan = document.createElement("span")
                    visuallyHiddenSpan.className = "visually-hidden"
                    visuallyHiddenSpan.textContent = `${itemCount} items`

                    bubble.appendChild(ariaHiddenSpan)
                    bubble.appendChild(visuallyHiddenSpan)

                    // Append the bubble to the link
                    link.appendChild(bubble)
                    updated = true
                }
            }
        })
    }

    // If we still haven't updated anything and the cart has items, try to find the cart icon and add a count
    if (!updated && itemCount > 0) {
        console.log("No cart count element found, looking for cart icon to add count")

        // Look for elements that might be the cart icon
        const cartIcons = document.querySelectorAll(
            '.cart-icon, .icon-cart, .header__cart-icon, [data-icon="cart"], [aria-label*="cart" i], [title*="cart" i]',
        )
        cartIcons.forEach((icon) => {
            console.log("Found potential cart icon:", icon)

            // Check if the icon already has a count element
            const existingCount = icon.querySelector(".cart-count-bubble, .cart-count")
            if (existingCount) {
                // Update existing count element
                const ariaHiddenSpan = existingCount.querySelector('span[aria-hidden="true"]')
                const visuallyHiddenSpan = existingCount.querySelector(".visually-hidden")

                if (ariaHiddenSpan) {
                    ariaHiddenSpan.textContent = itemCount
                } else if (
                    existingCount.childNodes.length === 0 ||
                    (existingCount.childNodes.length === 1 && existingCount.childNodes[0].nodeType === Node.TEXT_NODE)
                ) {
                    existingCount.textContent = itemCount
                }

                if (visuallyHiddenSpan) {
                    visuallyHiddenSpan.textContent = `${itemCount} items`
                }

                existingCount.classList.remove("hidden")
                updated = true
            } else {
                // Create a new count element with the standard Shopify structure
                const countElement = document.createElement("div")
                countElement.className = "cart-count-bubble"

                const ariaHiddenSpan = document.createElement("span")
                ariaHiddenSpan.setAttribute("aria-hidden", "true")
                ariaHiddenSpan.textContent = itemCount

                const visuallyHiddenSpan = document.createElement("span")
                visuallyHiddenSpan.className = "visually-hidden"
                visuallyHiddenSpan.textContent = `${itemCount} items`

                countElement.appendChild(ariaHiddenSpan)
                countElement.appendChild(visuallyHiddenSpan)

                // Append the count element to the icon's parent
                icon.parentElement.appendChild(countElement)
                updated = true
            }
        })
    }

    // Last resort: try to force a page refresh of the header
    if (!updated) {
        console.log("Could not update cart count in DOM, will try to refresh header section")
        refreshHeaderSection()
    }

    console.log("Cart count update successful:", updated)
    return updated
}

/**
 * Dispatch Shopify events that the theme might be listening for
 * @param {Object} cart - The cart object from Shopify
 */
function dispatchShopifyEvents(cart) {
    console.log("Dispatching Shopify events")

    // Try different event approaches that Shopify themes might use

    // Approach 1: jQuery events if jQuery is available
    if (typeof jQuery !== "undefined") {
        console.log("jQuery available, triggering cart events")
        jQuery(document).trigger("cart:updated", [cart])
        jQuery(document).trigger("cart.requestComplete", [{ cart: cart }])
        jQuery("body").trigger("afterCartLoad.ajaxCart", [cart])
    }

    // Approach 2: Custom events
    try {
        // Cart updated event
        const cartUpdatedEvent = new CustomEvent("cart:updated", { detail: { cart: cart } })
        document.dispatchEvent(cartUpdatedEvent)

        // Shopify theme events
        const cartRequestCompleteEvent = new CustomEvent("cart.requestComplete", { detail: { cart: cart } })
        document.dispatchEvent(cartRequestCompleteEvent)

        // Ajax cart events
        const ajaxCartLoadedEvent = new CustomEvent("afterCartLoad.ajaxCart", { detail: { cart: cart } })
        document.body.dispatchEvent(ajaxCartLoadedEvent)

        console.log("Custom events dispatched")
    } catch (error) {
        console.error("Error dispatching custom events:", error)
    }

    // Approach 3: Try to access theme's cart object directly
    try {
        if (typeof theme !== "undefined" && theme.cart) {
            console.log("Theme cart object found, attempting to update")
            if (typeof theme.cart.updateCount === "function") {
                theme.cart.updateCount(cart.item_count)
            }
            if (typeof theme.cart.updateCartCount === "function") {
                theme.cart.updateCartCount(cart.item_count)
            }
            if (typeof theme.cart.updateCartTotal === "function") {
                theme.cart.updateCartTotal(cart.total_price)
            }
        }
    } catch (error) {
        console.error("Error updating theme cart object:", error)
    }
}

/**
 * Refresh the header section using Shopify's Section Rendering API
 */
function refreshHeaderSection() {
    console.log("Attempting to refresh header section")

    // Try to find the header section ID
    const headerSectionIds = [
        "header",
        "header-section",
        "shopify-section-header",
        "shopify-section-header-sticky",
        "shopify-section-announcement-bar",
        "announcement-bar",
    ]

    let headerSectionId = null

    // Find the header section element
    for (const id of headerSectionIds) {
        const element = document.getElementById(id)
        if (element) {
            console.log("Found header section with ID:", id)
            headerSectionId = id
            break
        }

        // Try with shopify-section- prefix
        const shopifyElement = document.getElementById(`shopify-section-${id}`)
        if (shopifyElement) {
            console.log("Found header section with ID:", `shopify-section-${id}`)
            headerSectionId = `shopify-section-${id}`
            break
        }
    }

    // If we found a header section, refresh it
    if (headerSectionId) {
        console.log("Refreshing header section:", headerSectionId)

        // Use Shopify's Section Rendering API to refresh the header
        fetch(`?section_id=${headerSectionId.replace("shopify-section-", "")}`)
            .then((response) => response.text())
            .then((html) => {
                console.log("Received updated header HTML")

                // Create a temporary element to parse the HTML
                const tempElement = document.createElement("div")
                tempElement.innerHTML = html

                // Find the header content
                const newHeaderContent = tempElement.firstElementChild

                if (newHeaderContent) {
                    // Replace the current header content
                    const currentHeader = document.getElementById(headerSectionId)
                    if (currentHeader) {
                        // Just update the cart count elements to avoid flickering the whole header
                        const newCartCounts = newHeaderContent.querySelectorAll(
                            ".cart-count-bubble, .cart-count, [data-cart-count]",
                        )
                        const currentCartCounts = currentHeader.querySelectorAll(
                            ".cart-count-bubble, .cart-count, [data-cart-count]",
                        )

                        if (newCartCounts.length > 0 && currentCartCounts.length > 0) {
                            console.log("Updating cart count elements")
                            for (let i = 0; i < Math.min(newCartCounts.length, currentCartCounts.length); i++) {
                                currentCartCounts[i].innerHTML = newCartCounts[i].innerHTML
                            }
                        } else {
                            console.log("No matching cart count elements found, replacing entire header")
                            currentHeader.innerHTML = newHeaderContent.innerHTML
                        }

                        console.log("Header section refreshed")
                    } else {
                        console.error("Could not find current header element to update")
                    }
                } else {
                    console.error("Could not parse new header content")
                }
            })
            .catch((error) => {
                console.error("Error refreshing header section:", error)
            })
    } else {
        console.log("Could not find header section ID, trying fallback approach")

        // Fallback: Try to refresh the cart icon directly
        fetch("/?section_id=cart-icon")
            .then((response) => response.text())
            .then((html) => {
                console.log("Received cart icon HTML")
                // Implementation would depend on the theme structure
            })
            .catch((error) => {
                console.error("Error refreshing cart icon:", error)
            })
    }
}

/**
 * Update product card based on selected variant
 * @param {HTMLElement} swatch - The selected color swatch
 * @param {HTMLElement} primaryImage - The primary product image
 * @param {HTMLElement} secondaryImage - The secondary (hover) product image
 * @param {HTMLElement} saleBadge - The sale badge element
 * @param {HTMLElement} priceElement - The price element
 * @param {HTMLElement} compareAtPriceElement - The compare-at price element
 * @param {HTMLElement} addToCartButton - The add to cart button
 * @param {HTMLElement} outOfStockButton - The out of stock button
 */
function updateProductCard(
    swatch,
    primaryImage,
    secondaryImage,
    saleBadge,
    priceElement,
    compareAtPriceElement,
    addToCartButton,
    outOfStockButton,
) {
    const variantImage = swatch.dataset.variantImage
    const isOnSale = swatch.dataset.variantOnSale === "true"
    const variantPrice = swatch.dataset.variantPrice
    const variantComparePrice = swatch.dataset.variantComparePrice
    const variantId = swatch.dataset.variantId
    const isAvailable = swatch.dataset.variantAvailable === "true"

    // Update images
    if (variantImage) {
        if (primaryImage) updateImageSources(primaryImage, variantImage)
        if (secondaryImage) {
            const secondaryImageUrl = variantImage.replace(/\.([^.]+)$/, "-secondary.$1")
            updateImageSources(secondaryImage, secondaryImageUrl)
        }
    }

    // Update sale badge visibility
    if (saleBadge) saleBadge.classList.toggle("hidden", !isOnSale)

    // Update prices
    if (priceElement) {
        priceElement.textContent = variantPrice
        priceElement.classList.toggle("text-cardSalePrice", isOnSale)
        priceElement.classList.toggle("text-cardBrand", !isOnSale)
    }

    if (compareAtPriceElement) {
        if (isOnSale && variantComparePrice) {
            compareAtPriceElement.textContent = variantComparePrice
            compareAtPriceElement.classList.remove("hidden")
        } else {
            compareAtPriceElement.textContent = ""
            compareAtPriceElement.classList.add("hidden")
        }
    }

    // Update add to cart button
    if (addToCartButton && outOfStockButton) {
        if (isAvailable) {
            addToCartButton.classList.remove("hidden")
            outOfStockButton.classList.add("hidden")
            addToCartButton.dataset.variantId = variantId
        } else {
            addToCartButton.classList.add("hidden")
            outOfStockButton.classList.remove("hidden")
        }
    }
}

/**
 * Update image sources for responsive images
 * @param {HTMLImageElement} img - The image element to update
 * @param {string} baseUrl - The base URL for the image
 */
function updateImageSources(img, baseUrl) {
    img.src = baseUrl
    img.srcset = generateSrcSet(baseUrl)
}

/**
 * Generate srcset attribute for responsive images
 * @param {string} baseUrl - The base URL for the image
 * @returns {string} The srcset attribute value
 */
function generateSrcSet(baseUrl) {
    const widths = [165, 360, 533, 720, 940, 1066]
    return widths
        .map((width) => {
            const url = baseUrl.replace(/(_\d+x)?\.([^.]+)$/, `_${width}x.$2`)
            return `${url} ${width}w`
        })
        .join(", ")
}

/**
 * Format money value according to the store's currency format
 * @param {number} cents - The amount in cents
 * @returns {string} Formatted money string
 */
function formatMoney(cents) {
    if (typeof cents === "string") {
        cents = cents.replace(".", "")
    }

    const value = Number.parseInt(cents || 0, 10)
    const money = value / 100

    // You can customize this based on your store's currency format
    return "$" + money.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
}

