// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initProductCards()
})

// Initialize all product cards on the page
function initProductCards() {
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
        const colorSwatches = card.querySelector(".js-product-card-color-swatches")
        if (colorSwatches) {
            initColorSwatches(colorSwatches)
        }
    })
}

// Initialize color swatches for a single product card
function initColorSwatches(swatchContainer) {
    const productCard = swatchContainer.closest(".product-card")
    const primaryImage = productCard.querySelector(".primary-image")
    const secondaryImage = productCard.querySelector(".secondary-image")
    const saleBadge = productCard.querySelector(".js-sale-badge")
    const priceElement = productCard.querySelector(".js-price")
    const compareAtPriceElement = productCard.querySelector(".js-compare-at-price")

    swatchContainer.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.addEventListener("change", function () {
            updateProductCard(this, primaryImage, secondaryImage, saleBadge, priceElement, compareAtPriceElement)
        })
    })

    // Initialize with the default selected color
    const defaultSwatch = swatchContainer.querySelector(".color-swatch:checked")
    if (defaultSwatch) {
        updateProductCard(defaultSwatch, primaryImage, secondaryImage, saleBadge, priceElement, compareAtPriceElement)
    }
}

// Update product card information based on selected variant
function updateProductCard(swatch, primaryImage, secondaryImage, saleBadge, priceElement, compareAtPriceElement) {
    const variantImage = swatch.dataset.variantImage
    const isOnSale = swatch.dataset.variantOnSale === "true"
    const variantPrice = swatch.dataset.variantPrice
    const variantComparePrice = swatch.dataset.variantComparePrice

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
}

// Update image sources for responsive images
function updateImageSources(img, baseUrl) {
    img.src = baseUrl
    img.srcset = generateSrcSet(baseUrl)
}

// Generate srcset for responsive images
function generateSrcSet(baseUrl) {
    const widths = [165, 360, 533, 720, 940, 1066]
    return widths
        .map((width) => {
            const url = baseUrl.replace(/(_\d+x)?\.([^.]+)$/, `_${width}x.$2`)
            return `${url} ${width}w`
        })
        .join(", ")
}

// Fetch and apply color hex values for swatches
function fetchAndApplyColorHexValues() {
    document.querySelectorAll(".js-product-card-color-swatches").forEach((container) => {
        const productHandle = container.dataset.productHandle

        fetch(`/products/${productHandle}.js`)
            .then((response) => response.json())
            .then((productData) => {
                const colorOption = productData.options.find(
                    (option) => option.name.toLowerCase().includes("color") || option.name.toLowerCase().includes("colour")
                )

                if (colorOption) {
                    container.querySelectorAll(".js-color-swatch").forEach((swatch) => {
                        const colorValue = swatch.dataset.colorValue
                        const variant = productData.variants.find((v) => v.options.includes(colorValue))

                        if (variant) {
                            let colorHex = variant.option_values?.find((ov) => ov.name === colorValue)?.presentation
                                || variant.option_values?.find((ov) => ov.name.toLowerCase() === colorValue.toLowerCase())?.value
                                || variant.options.find((o) => o.toLowerCase() === colorValue.toLowerCase())

                            if (colorHex) swatch.style.backgroundColor = colorHex
                        }
                    })
                }
            })
            .catch((error) => console.error("Error fetching product data:", error))
    })
}

// Call the function to fetch and apply color hex values
fetchAndApplyColorHexValues()