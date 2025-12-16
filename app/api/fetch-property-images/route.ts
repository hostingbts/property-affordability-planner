  import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    new URL(url);

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Set a timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Parse HTML to find images
    const images: string[] = [];

    // Look for Open Graph image
    const ogImageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );
    if (ogImageMatch && ogImageMatch[1]) {
      images.push(ogImageMatch[1]);
    }

    // Look for Twitter card image
    const twitterImageMatch = html.match(
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
    );
    if (twitterImageMatch && twitterImageMatch[1]) {
      images.push(twitterImageMatch[1]);
    }

    // Look for meta image tag
    const metaImageMatch = html.match(
      /<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i
    );
    if (metaImageMatch && metaImageMatch[1]) {
      images.push(metaImageMatch[1]);
    }

    // Look for large images in img tags (prioritize larger images)
    const imgMatches = html.matchAll(
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    );
    for (const match of imgMatches) {
      const imgSrc = match[1];
      if (imgSrc && !imgSrc.startsWith("data:")) {
        // Convert relative URLs to absolute
        try {
          const imgUrl = new URL(imgSrc, url).href;
          // Filter out very small images (likely icons) and common non-property images
          if (
            !imgUrl.includes("logo") &&
            !imgUrl.includes("icon") &&
            !imgUrl.includes("avatar") &&
            !imgUrl.includes("favicon")
          ) {
            images.push(imgUrl);
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }

    // Remove duplicates and filter valid images
    const uniqueImages = Array.from(new Set(images));
    const validImages = uniqueImages.filter((img) => {
      const lowerImg = img.toLowerCase();
      // Include images that look like property photos
      return (
        lowerImg.endsWith(".jpg") ||
        lowerImg.endsWith(".jpeg") ||
        lowerImg.endsWith(".png") ||
        lowerImg.endsWith(".webp") ||
        lowerImg.includes("image") ||
        lowerImg.includes("photo") ||
        lowerImg.includes("property") ||
        lowerImg.includes("listing") ||
        lowerImg.includes("real-estate")
      );
    });

    // If no valid images found, return all unique images (user can filter manually)
    const allImages = validImages.length > 0 ? validImages : uniqueImages;

    // Extract price information
    let price: number | null = null;

    // Look for price in meta tags
    const pricePatterns = [
      /<meta\s+property=["']og:price:amount["']\s+content=["']([^"']+)["']/i,
      /<meta\s+name=["']price["']\s+content=["']([^"']+)["']/i,
      /<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i,
      /<meta\s+itemprop=["']price["']\s+content=["']([^"']+)["']/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const extractedPrice = parseFloat(match[1].replace(/[^\d.]/g, ""));
        if (!isNaN(extractedPrice) && extractedPrice > 0) {
          price = extractedPrice;
          break;
        }
      }
    }

    // Look for JSON-LD structured data
    if (!price) {
      const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let jsonLdMatch;
      while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
        const match = jsonLdMatch;
        try {
          const jsonData = JSON.parse(match[1]);
          const findPrice = (obj: any): number | null => {
            if (typeof obj === "object" && obj !== null) {
              if (obj.price || obj.offers?.price || obj.aggregateRating?.price) {
                const p = obj.price || obj.offers?.price || obj.aggregateRating?.price;
                const numPrice = typeof p === "number" ? p : parseFloat(String(p).replace(/[^\d.]/g, ""));
                if (!isNaN(numPrice) && numPrice > 0) return numPrice;
              }
              for (const key in obj) {
                const result = findPrice(obj[key]);
                if (result) return result;
              }
            }
            return null;
          };
          const foundPrice = findPrice(jsonData);
          if (foundPrice) {
            price = foundPrice;
            break;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    // Look for common price patterns in text (e.g., $250,000, €300,000, etc.)
    if (!price) {
      const priceTextPatterns = [
        /\$[\s]*([\d,]+(?:\.\d{2})?)\s*(?:thousand|k|million|m)?/gi,
        /€[\s]*([\d,]+(?:\.\d{2})?)\s*(?:thousand|k|million|m)?/gi,
        /£[\s]*([\d,]+(?:\.\d{2})?)\s*(?:thousand|k|million|m)?/gi,
        /(?:price|cost|listed|asking)[\s:]*[\$€£]?[\s]*([\d,]+(?:\.\d{2})?)/gi,
      ];

      for (const pattern of priceTextPatterns) {
        const matches = html.matchAll(pattern);
        const prices: number[] = [];
        for (const match of matches) {
          const numStr = match[1].replace(/,/g, "");
          const num = parseFloat(numStr);
          if (!isNaN(num) && num > 1000 && num < 100000000) {
            // Reasonable price range
            prices.push(num);
          }
        }
        if (prices.length > 0) {
          // Take the most common or largest reasonable price
          prices.sort((a, b) => b - a);
          price = prices[0];
          break;
        }
      }
    }

    return NextResponse.json({
      imageUrl: allImages[0] || null, // Keep for backward compatibility
      images: allImages, // Return all images
      price: price, // Extracted price
    });
  } catch (error: any) {
    console.error("Error fetching property images:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch images",
        imageUrl: null,
      },
      { status: 500 }
    );
  }
}

