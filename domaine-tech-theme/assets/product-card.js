document.addEventListener("DOMContentLoaded", () => {
    initColorSwatches()
})

function initColorSwatches() {
    console.log("Initializing color swatches")
    document.querySelectorAll(".js-product-card-color-swatches").forEach((container) => {
        const productCard = container.closest(".group")
        if (!productCard) {
            console.log("Product card not found")
            return
        }

        const primaryImage = productCard.querySelector(".primary-image")
        const secondaryImage = productCard.querySelector(".secondary-image")
        const saleBadge = productCard.querySelector(".js-sale-badge")
        const priceContainer = productCard.querySelector(".js-price-container")
        const price = priceContainer.querySelector(".js-price")
        const compareAtPrice = priceContainer.querySelector(".js-compare-at-price")

        console.log("Primary Image:", primaryImage)
        console.log("Secondary Image:", secondaryImage)

        container.querySelectorAll(".color-swatch").forEach((swatch) => {
            swatch.addEventListener("change", function () {
                updateProductCard(this, primaryImage, secondaryImage, saleBadge, price, compareAtPrice)
            })
        })

        // Initialize with the default selected color
        const defaultSelectedSwatch = container.querySelector(".color-swatch:checked")
        if (defaultSelectedSwatch) {
            console.log("Default swatch found:", defaultSelectedSwatch.value)
            updateProductCard(defaultSelectedSwatch, primaryImage, secondaryImage, saleBadge, price, compareAtPrice)
        } else {
            console.log("No default swatch found")
        }
    })
}

function updateProductCard(swatch, primaryImage, secondaryImage, saleBadge, price, compareAtPrice) {
    console.log("Updating product card for swatch:", swatch.value)
    const variantImageUrl = swatch.getAttribute("data-variant-image")
    const isOnSale = swatch.getAttribute("data-variant-on-sale") === "true"
    const variantPrice = swatch.getAttribute("data-variant-price")
    const variantComparePrice = swatch.getAttribute("data-variant-compare-price")

    console.log("Variant Image URL:", variantImageUrl)
    console.log("Is on sale:", isOnSale)
    console.log("Variant Price:", variantPrice)
    console.log("Variant Compare Price:", variantComparePrice)

    if (variantImageUrl && primaryImage) {
        updateImageSources(primaryImage, variantImageUrl)
        console.log("Updated primary image")
    } else {
        console.log("Missing variant image URL or primary image element")
    }

    // Update secondary image
    if (secondaryImage) {
        const secondaryImageUrl = variantImageUrl.replace(/\.([^.]+)$/, "-secondary.$1")
        updateImageSources(secondaryImage, secondaryImageUrl)
        console.log("Updated secondary image with:", secondaryImageUrl)
    }

    // Update sale badge
    if (saleBadge) {
        saleBadge.classList.toggle("hidden", !isOnSale)
        console.log("Updated sale badge visibility")
    }

    // Update prices
    if (price) {
        price.textContent = variantPrice
        console.log("Updated price")
    }

    if (compareAtPrice) {
        if (isOnSale && variantComparePrice) {
            compareAtPrice.textContent = variantComparePrice
            compareAtPrice.classList.remove("hidden")
        } else {
            compareAtPrice.textContent = ""
            compareAtPrice.classList.add("hidden")
        }
        console.log("Updated compare at price")
    }
}

function updateImageSources(img, baseUrl) {
    console.log("Updating image sources for:", img.className)
    // Update src
    img.src = baseUrl
    console.log("New src:", img.src)

    // Update srcset
    const srcset = generateSrcSet(baseUrl)
    img.srcset = srcset
    console.log("New srcset:", img.srcset)
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

