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

        console.log("Primary Image:", primaryImage)
        console.log("Secondary Image:", secondaryImage)

        container.querySelectorAll(".color-swatch").forEach((swatch) => {
            swatch.addEventListener("change", function () {
                updateImagesFromSwatch(this, primaryImage, secondaryImage)
            })
        })

        // Initialize with the default selected color
        const defaultSelectedSwatch = container.querySelector(".color-swatch:checked")
        if (defaultSelectedSwatch) {
            console.log("Default swatch found:", defaultSelectedSwatch.value)
            updateImagesFromSwatch(defaultSelectedSwatch, primaryImage, secondaryImage)
        } else {
            console.log("No default swatch found")
        }
    })
}

function updateImagesFromSwatch(swatch, primaryImage, secondaryImage) {
    console.log("Updating images for swatch:", swatch.value)
    const variantImageUrl = swatch.getAttribute("data-variant-image")

    console.log("Variant Image URL:", variantImageUrl)

    if (variantImageUrl && primaryImage) {
        updateImageSources(primaryImage, variantImageUrl)
        console.log("Updated primary image")

        // Generate secondary image URL
        const secondaryImageUrl = variantImageUrl.replace(/\.([^.]+)$/, "-secondary.$1")
        updateImageSources(secondaryImage, secondaryImageUrl)
        console.log("Updated secondary image with:", secondaryImageUrl)
    } else {
        console.log("Missing variant image URL or primary image element")
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

