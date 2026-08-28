import express from "express";
import { prisma } from "./db.ts";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod/v4";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(cors());
app.use(express.json());
const B2_ENDPOINT  = process.env.B2_ENDPOINT!
const B2_KEY_ID = process.env.B2_KEY_ID!
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY!
const B2_REGION = process.env.B2_REGION!
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

 const S3client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: B2_REGION,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true
});


function getUserId(req: express.Request): string | null {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

// validation schema

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  gender: z.enum(["Male", "Female", "Others"]),
  channelName: z.string().min(1),
});

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const uploadSchema = z.object({
  videoUrl: z.url(),
  thumbnail: z.url(),
  title: z.string(),
});

// user

app.post("/api/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.message,
    });
    return;
  }

  const { username, password, gender, channelName } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { username } });
  if (existing) {
    return res.status(409).json({
      error: "Username already taken",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashedPassword, gender, channelName },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return res.status(201).json({ token, userId: user.id });
});

app.post("/api/signin", async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.message,
    });
    return;
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({ where: { username } });

  if (!user) {
    return res.status(400).json({
      error: "User not found",
    });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({
      error: "wrong password",
    });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return res.status(201).json({ token, userId: user.id });
});

// videos

app.get("/api/videos", async (_req, res) => {
  const videos = await prisma.uploads.findMany({
    include: {
      user: { select: { id: true, channelName: true, profilePicture: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!videos) {
    return res.status(400).json({
      error: "No videos found",
    });
    return;
  }
  res.json(videos);
});

app.get("/api/videos/:id", async (req, res) => {
  const video = await prisma.uploads.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          channelName: true,
          profilePicture: true,
          subscriberCount: true,
        },
      },
    },
  });

  if (!video) {
    return res.status(400).json({
      error: "No videos found",
    });
    return;
  }
  res.json(video);
});

app.post("/api/videos", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const parsed = uploadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.message,
    });
    return;
  }

  const video = await prisma.uploads.create({
    data: { ...parsed.data, userId },
  });

  res.status(200).json(video);
});

app.get("/api/getPresignedUrl", async (req,res) => {

const videopath = "videos/" + Math.random() + ".mp4"
const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: videopath,
    ContentType: "videos/mp4",
  });

  // URL expires in 15 minutes (900 seconds)
  const presignedUrl = await getSignedUrl(S3client, command, { expiresIn: 900 });
  
  return res.json({
    putUrl: presignedUrl,
    videoUrl: "https://" + B2_BUCKET_NAME + "." + B2_ENDPOINT +  "/" + videopath
  })
})

app.get("/api/channels/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      channelName: true,
      username: true,
      banner: true,
      profilePicture: true,
      subscriberCount: true,
      description: true,
      uploads: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) {
    return res.status(400).json({
      error: "Channel not found",
    });
    return;
  }

  res.json(user);
});

app.put("/api/channel", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const { channelName, profilePicture, description, banner } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(channelName !== undefined && { channelName }),
      ...(profilePicture !== undefined && { profilePicture }),
      ...(description !== undefined && { description }),
      ...(banner !== undefined && { banner }),
    },
    select: {
      id: true,
      channelName: true,
      profilePicture: true,
      banner: true,
      description: true,
    },
  });

  res.json(user);
});

app.get("/channel/:username", async (req, res)=> {
  const username = req.params.username
  const channelDetails = await prisma.user.findFirst({
    where: {
      username: username
    },
    select: {
      username: true,
      banner: true,
      subscriberCount: true,
      profilePicture: true,
      id: true
    }
  })

  if(!channelDetails) {return res.status(411).json({
      error: "A channel with this name do not exist",
    });
    return ;
  }

  const uploads = await prisma.uploads.findMany({
    where: {
      userId: channelDetails.id
    }
  })

  res.json({
    uploads, channelDetails
  })
})

app.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
})

// create signup signin getOne getFeed uploadOne routes
