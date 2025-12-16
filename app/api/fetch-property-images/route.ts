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

    // Remove duplicates and return the first valid image
    const uniqueImages = Array.from(new Set(images));
    const validImage = uniqueImages.find((img) => {
      const lowerImg = img.toLowerCase();
      return (
        lowerImg.endsWith(".jpg") ||
        lowerImg.endsWith(".jpeg") ||
        lowerImg.endsWith(".png") ||
        lowerImg.endsWith(".webp") ||
        lowerImg.includes("image") ||
        lowerImg.includes("photo")
      );
    });

    return NextResponse.json({
      imageUrl: validImage || uniqueImages[0] || null,
      allImages: uniqueImages.slice(0, 5), // Return up to 5 images for debugging
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

