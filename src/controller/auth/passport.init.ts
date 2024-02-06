import passport from "passport";
import { prisma } from "../../prisma/prisma.service";
import { excludeFields } from "../../util/helper";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { User as UserModelType } from "@prisma/client";

passport.serializeUser(function (user: Express.User, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id: number, done) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return done(null, excludeFields(user, ["password", "remember_token"]));
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new LocalStrategy(async function (
    username: string,
    password: string,
    done: Function
  ) {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: username,
        },
      });

      if (!user || !bcrypt.compareSync(password, user.password))
        return done(true, false);

      return done(null, excludeFields(user, ["password"]));
    } catch (error) {
      done(error);
    }
  })
);

export default passport;
