import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Bindings } from "hono/types";
import { decode, sign, verify } from "hono/jwt";
import { signinInput, signupInput } from "@saif72437/medium-app-types";

type Binding = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};


export const userRouter = new Hono<{ Bindings: Binding }>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const {success} = signupInput.safeParse(body)

  if(!success){
    c.status(400);
		return c.json({ error: "invalid input" });
  }
  const dbUrl = c.env.DATABASE_URL;

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());

  try {
    const User = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
    });

    const token = await sign(
      {
        id: User.id,
      },
      c.env.JWT_SECRET
    );

    c.status(200);
    return c.json({
      mssg: "Signed Up Successfully",
      token: token,
      name: User.name
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "Something wen wrong",
      error: error,
    });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();

  const {success} = signinInput.safeParse(body)
   if(!success){
    c.status(400);
		return c.json({ error: "invalid input" });
  }
  
  const dbUrl = c.env.DATABASE_URL;

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  }).$extends(withAccelerate());

  try {
    const User = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });

    if (!User) {
      c.status(411);
      return c.json({
        mssg: "Unauthorized User",
      });
    }

    const token = await sign(
      {
        id: User.id,
      },
      c.env.JWT_SECRET
    );

    c.status(200);
    return c.json({
      mssg: "Signed In Successfully",
      token: token,
      name: User.name
    });
  } catch (error) {
    c.status(411);
    return c.json({
      mssg: "Something went wrong",
      error: error,
    });
  }
});