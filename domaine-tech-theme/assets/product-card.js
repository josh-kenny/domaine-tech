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

function fetchAndApplyColorHexValues() {
    const colorSwatchContainers = document.querySelectorAll(".js-product-card-color-swatches")

    colorSwatchContainers.forEach((container) => {
        const productHandle = container.dataset.productHandle
        console.log("Fetching data for product:", productHandle)

        fetch(`/products/${productHandle}.js`)
            .then((response) => response.json())
            .then((productData) => {
                console.log("Product data:", productData)

                const colorOption = productData.options.find(
                    (option) => option.name.toLowerCase().includes("color") || option.name.toLowerCase().includes("colour"),
                )

                console.log("Color option:", colorOption)

                if (colorOption) {
                    const colorSwatches = container.querySelectorAll(".js-color-swatch")
                    colorSwatches.forEach((swatch) => {
                        const colorValue = swatch.dataset.colorValue
                        console.log("Processing color value:", colorValue)

                        const variant = productData.variants.find((v) => v.options.includes(colorValue))

                        console.log("Matching variant:", variant)

                        if (variant) {
                            // Try different ways to get the color value
                            let colorHex = variant.option_values?.find((ov) => ov.name === colorValue)?.presentation
                            if (!colorHex) {
                                colorHex = variant.option_values?.find(
                                    (ov) => ov.name.toLowerCase() === colorValue.toLowerCase(),
                                )?.value
                            }
                            if (!colorHex) {
                                colorHex = variant.options.find((o) => o.toLowerCase() === colorValue.toLowerCase())
                            }

                            console.log("Color hex found:", colorHex)

                            if (colorHex) {
                                swatch.style.backgroundColor = colorHex
                                console.log("Applied color:", colorHex, "to swatch:", colorValue)
                            } else {
                                console.log("No color hex found for:", colorValue)
                            }
                        } else {
                            console.log("No matching variant found for color:", colorValue)
                        }
                    })
                } else {
                    console.log("No color option found for product:", productHandle)
                }
            })
            .catch((error) => console.error("Error fetching product data:", error))
    })
}

