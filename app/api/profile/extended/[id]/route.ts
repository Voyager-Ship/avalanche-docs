import { NextRequest, NextResponse } from 'next/server';
import { 
  getExtendedProfile, 
  updateExtendedProfile,
  ProfileValidationError
} from '@/server/services/profile/profile.service';
import { UpdateExtendedProfileData } from '@/types/extended-profile';
import { withAuth } from '@/lib/protectedRoute';

/**
 * GET /api/profile/extended/[id]
 * Obtiene el perfil extendido de un usuario
 */
export const GET = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo pueda acceder a su propio perfil
    // Comentar esta validación si quieres permitir ver perfiles de otros usuarios
    const isOwnProfile = session.user.id === id;
    if (!isOwnProfile) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own profile.' },
        { status: 403 }
      );
    }

    const profile = await getExtendedProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/profile/extended/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/profile/extended/[id]
 * update extended profile
 */
export const PUT = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    // verify that the user can only update their own profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile.' },
        { status: 403 }
      );
    }

    const newProfileData = (await req.json()) as UpdateExtendedProfileData;

    // El servicio ahora maneja todas las validaciones de negocio
    const updatedProfile = await updateExtendedProfile(id, newProfileData);

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in PUT /api/profile/extended/[id]:', error);
    
    // Manejar errores de validación con el código de estado apropiado
    if (error instanceof ProfileValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Manejar otros errores
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

