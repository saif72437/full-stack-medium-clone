import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Bindings } from "hono/types";
import { decode, sign, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@saif72437/medium-app-types";

type Binding = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

type Variable = {
  userId: string;
};

export const blogRouter = new Hono<{
  Bindings: Binding;
  Variables: Variable;
}>();

// auth middleware
blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
    const user = (await verify(authHeader, c.env.JWT_SECRET)) as { id: string };
    if (user && user.id) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({
        message: "You are not logged in",
      });
    }
  } catch (error) {
    c.status(403);
    return c.json({
      message: "You are not logged in",
    });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const authorId = c.get("userId");

  const dbUrl = c.env.DATABASE_URL;

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });

    if (!blog) {
      c.status(411);
      return c.json({
        mssg: "something went wrong",
      });
    }

    c.status(200);
    return c.json({
      mssg: "blog created Successfully",
      blogId: blog.id,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "something went wrong",
      error,
    });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();

  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const dbUrl = c.env.DATABASE_URL;
  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.blog.update({
      where: {
        authorId: Number(authorId),
        id: Number(body.id),
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    if (!blog) {
      c.status(411);
      return c.json({
        mssg: "something went wrong",
      });
    }

    c.status(200);
    return c.json({
      mssg: "blog updated Successfully",
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "something went wrong",
      error,
    });
  }
});
blogRouter.get("/bulk", async (c) => {
  const dbUrl = c.env.DATABASE_URL;

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());
  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id:true,
        title:true,
        content:true,
        author:{
          select:{
            username: true,
            name: true
          }
        }
      }
    });

    if (!blogs) {
      c.status(411);
      return c.json({
        mssg: "something went wrong",
      });
    }

    c.status(200);
    return c.json({
      blogs,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "something went wrong",
      error,
    });
  }
});
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const dbUrl = c.env.DATABASE_URL;
  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: Number(id),
        
      },
      select:{
        id: true,
        title: true,
        content: true,
        author :{
          select:{
            name: true,
            username: true,
          }
        }
      }
    });

    if (!blog) {
      c.status(411);
      return c.json({
        mssg: "something went wrong",
      });
    }

    c.status(200);
    return c.json({
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "something went wrong",
      error,
    });
  }
});
