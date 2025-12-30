import { prisma } from "@/prisma/prisma";
import { Account, Profile, User } from "next-auth";

export async function upsertUser(user: User, account: Account | null, profile: Profile | undefined) {
  if (!user.email) {
    throw new Error("El usuario debe tener un email válido");
  }

  
  return await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email: user.email ?? "" },
    });

    const updatedAuthMode = existingUser?.authentication_mode?.includes(account?.provider ?? "")
      ? existingUser.authentication_mode
      : `${existingUser?.authentication_mode ?? ""},${account?.provider}`.replace(/^,/, "");

    // Prepare GitHub URL if authenticating with GitHub
    const githubUrl = account?.provider === "github" && (profile as any)?.html_url
      ? (profile as any).html_url
      : existingUser?.github ?? "";

    if (existingUser) {
      // Update existing user
      return await tx.user.update({
        where: { email: user.email ?? "" },
        data: {
          name: user.name || "",
          image: existingUser.image || user.image || "",
          authentication_mode: updatedAuthMode,
          last_login: new Date(),
          user_name: (profile as any)?.login ?? "",
          // Update github field only if authenticating with GitHub and field is empty
          ...(account?.provider === "github" && !existingUser.github && { github: githubUrl }),
        },
      });
    } else {
      // Create new user
      return await tx.user.create({
        data: {
          email: user.email,
          notification_email: user.email,
          name: user.name || "",
          image: user.image || "",
          authentication_mode: account?.provider ?? "",
          last_login: new Date(),
          user_name: (profile as any)?.login ?? "",
          notifications: null,
          // Set github field if authenticating with GitHub
          ...(account?.provider === "github" && { github: githubUrl }),
        },
      });
    }
  });
}
