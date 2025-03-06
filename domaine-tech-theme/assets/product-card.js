document.addEventListener("DOMContentLoaded", () => {
    initProductCards()
})

function initProductCards() {
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
        const colorSwatches = card.querySelector(".js-product-card-color-swatches")
        if (colorSwatches) {
            initColorSwatches(colorSwatches)
        }
    })
}

function initColorSwatches(swatchContainer) {
    const productCard = swatchContainer.closest(".product-card")
    const productId = productCard.dataset.productId
    const productHandle = productCard.dataset.productHandle
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

function updateProductCard(swatch, primaryImage, secondaryImage, saleBadge, priceElement, compareAtPriceElement) {
    const variantImage = swatch.dataset.variantImage
    const isOnSale = swatch.dataset.variantOnSale === "true"
    const variantPrice = swatch.dataset.variantPrice
    const variantComparePrice = swatch.dataset.variantComparePrice

    // Update primary image
    if (variantImage && primaryImage) {
        updateImageSources(primaryImage, variantImage)
    }

    // Update secondary image
    if (secondaryImage) {
        const secondaryImageUrl = variantImage.replace(/\.([^.]+)$/, "-secondary.$1")
        updateImageSources(secondaryImage, secondaryImageUrl)
    }

    // Update sale badge
    if (saleBadge) {
        saleBadge.classList.toggle("hidden", !isOnSale)
    }

    // Update prices
    if (priceElement) {
        priceElement.textContent = variantPrice
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

function updateImageSources(img, baseUrl) {
    // Update src
    img.src = baseUrl

    // Update srcset
    const srcset = generateSrcSet(baseUrl)
    img.srcset = srcset
}

function generateSrcSet(baseUrl) {
    const widths = [165, 360, 533, 720, 940, 1066]
    return widths
        .map((width) => {
            const url = baseUrl.replace(/(_\d+x)?\.([^.]+)$/, `_${width}x.$2`)
            return `${url} ${width}w`
        })
        .join(", ")
}

