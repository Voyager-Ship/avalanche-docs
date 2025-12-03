import { prisma } from "@/prisma/prisma";
import { ExtendedProfile, UserType } from "@/types/extended-profile";

/**
 * Servicio para obtener el perfil extendido de un usuario
 * @param id - ID del usuario
 * @returns Perfil completo del usuario con todos los campos
 */
export async function getExtendedProfile(id: string): Promise<ExtendedProfile | null> {
    // Obtener todos los campos del usuario
    // Nota: Los tipos de Prisma pueden estar desactualizados. Los campos existen en la BD.
    const user: any = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        return null;
    }

    // Parsear user_type de JSON a objeto, con valores por defecto si no existe
    const userType: UserType = user.user_type ? 
        (typeof user.user_type === 'string' ? JSON.parse(user.user_type) : user.user_type) : 
        {
            is_student: false,
            is_founder: false,
            is_employee: false,
            is_enthusiast: false,
        };

    // Mapear user_name a username para mantener consistencia con el frontend
    return {
        id: user.id,
        name: user.name,
        username: user.user_name || "",
        bio: user.bio,
        email: user.email,
        notification_email: user.notification_email,
        image: user.image,
        country: user.country || null,
        user_type: userType,
        github: user.github || null,
        wallet: user.wallet || null,
        socials: user.social_media || [],
        skills: user.skills || [],
        notifications: user.notifications,
        profile_privacy: user.profile_privacy,
        telegram_user: user.telegram_user || null,
    } as ExtendedProfile;
}

/**
 * Servicio para actualizar el perfil extendido de un usuario
 * @param id - ID del usuario
 * @param profileData - Datos parciales del perfil a actualizar
 * @returns Perfil actualizado
 */
export async function updateExtendedProfile(
    id: string, 
    profileData: Partial<ExtendedProfile>
): Promise<ExtendedProfile> {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Si no hay datos para actualizar, solo actualizar last_login
    if (Object.keys(profileData).length === 0) {
        await prisma.user.update({
            where: { id },
            data: {
                last_login: new Date(),
            }
        });
        
        const profile = await getExtendedProfile(id);
        if (!profile) {
            throw new Error("Failed to retrieve updated profile");
        }
        return profile;
    }

    // Mapear username a user_name y socials a social_media
    const { username, socials, user_type, ...restData } = profileData;
    
    const updateData: any = {
        ...restData,
        last_login: new Date(),
    };

    // Mapear campos del frontend a la BD
    if (username !== undefined) {
        updateData.user_name = username;
    }
    
    if (socials !== undefined) {
        updateData.social_media = socials;
    }

    // Convertir user_type a JSON para almacenar en la BD
    if (user_type !== undefined) {
        updateData.user_type = user_type;
    }

    await prisma.user.update({
        where: { id },
        data: updateData,
    });

    const updatedProfile = await getExtendedProfile(id);
    if (!updatedProfile) {
        throw new Error("Failed to retrieve updated profile");
    }
    
    return updatedProfile;
}

/**
 * Servicio para validar si un username está disponible
 * @param username - Username a validar
 * @param currentUserId - ID del usuario actual (opcional, para permitir el username actual del usuario)
 * @returns true si el username está disponible, false si ya está en uso
 */
export async function isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const existingUser = await prisma.user.findFirst({
        where: {
            user_name: username,
            ...(currentUserId && { id: { not: currentUserId } })
        }
    });

    return !existingUser;
}

