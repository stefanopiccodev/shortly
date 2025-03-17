import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import shortid from "shortid";
import { urlSchema } from "../utils/validator";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

export const shortenUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url, slug } = req.body;

    // Validate URL
    urlSchema.parse({ url });

    // If slug is provided, ensure it's unique
    let customSlug = slug || shortid.generate();
    const existingSlug = await prisma.shortURL.findUnique({ where: { slug: customSlug } });

    if (existingSlug) {
      res.status(400).json({ error: "Slug already exists. Choose another one." });
      return;
    }

    // Create Short URL
    const newUrl = await prisma.shortURL.create({
      data: {
        slug: customSlug,
        original: url,
        userId: req.user?.id || null,
      },
      select: {
        id: true,
        original: true,
        slug: true,
        visits: true,
        createdAt: true
      }
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:4000"; // Fallback for safety
    res.status(201).json({
      id: newUrl.id,
      original: newUrl.original,
      shortUrl: `${baseUrl}/${newUrl.slug}`,
      slug: newUrl.slug,
      visits: newUrl.visits,
      createdAt: newUrl.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid URL" });
  }
};

export const redirectToOriginal = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const urlEntry = await prisma.shortURL.findUnique({ where: { slug } });

  if (!urlEntry) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  await prisma.shortURL.update({
    where: { slug },
    data: { visits: { increment: 1 } },
  });

  res.redirect(urlEntry.original);
};

export const getUserUrls = async (req: AuthRequest, res: Response) => {
  try {
    const urls = await prisma.shortURL.findMany({
      where: {
        userId: req.user?.id
      },
      select: {
        id: true,
        original: true,
        slug: true,
        visits: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      shortUrl: `${baseUrl}/${url.slug}`
    }));

    res.json(urlsWithShortUrl);
  } catch (error) {
    console.error('Error fetching user URLs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteShortUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const urlEntry = await prisma.shortURL.findUnique({
      where: { id },
    });

    if (!urlEntry || urlEntry.userId !== userId) {
      res.status(404).json({ error: "URL not found or unauthorized" });
      return;
    }

    await prisma.shortURL.delete({
      where: { id },
    });

    res.status(200).json({ message: "URL deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete URL" });
  }
};
